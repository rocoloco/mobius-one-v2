import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invoices, customers } from '@/lib/schema/collections';
import { eq, sql, desc, and, gte, lte } from 'drizzle-orm';
import { netsuiteService } from '@/lib/services/netsuite';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending', 'overdue', 'paid', 'partial'
    const customerId = searchParams.get('customerId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const daysOverdue = searchParams.get('daysOverdue');

    // Build query
    let query = db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        amount: invoices.amount,
        dueDate: invoices.dueDate,
        paidDate: invoices.paidDate,
        status: invoices.status,
        daysOverdue: invoices.daysOverdue,
        createdAt: invoices.createdAt,
        syncedAt: invoices.syncedAt,
        customer: {
          id: customers.id,
          name: customers.name,
          externalId: customers.externalId,
          accountHealth: customers.accountHealth,
          source: customers.source
        }
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id));

    // Apply filters
    const conditions: any[] = [];

    if (status) {
      conditions.push(eq(invoices.status, status));
    }

    if (customerId) {
      conditions.push(eq(invoices.customerId, parseInt(customerId)));
    }

    if (minAmount) {
      conditions.push(gte(invoices.amount, minAmount));
    }

    if (maxAmount) {
      conditions.push(lte(invoices.amount, maxAmount));
    }

    if (daysOverdue) {
      conditions.push(gte(invoices.daysOverdue, parseInt(daysOverdue)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const invoiceList = await query
      .orderBy(desc(invoices.createdAt))
      .limit(limit);

    // Format response
    const formattedInvoices = invoiceList.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: Number(invoice.amount),
      dueDate: invoice.dueDate,
      paidDate: invoice.paidDate,
      status: invoice.status,
      daysOverdue: invoice.daysOverdue || 0,
      createdAt: invoice.createdAt,
      syncedAt: invoice.syncedAt,
      customer: {
        id: invoice.customer.id,
        name: invoice.customer.name,
        externalId: invoice.customer.externalId,
        accountHealth: invoice.customer.accountHealth,
        source: invoice.customer.source
      }
    }));

    return NextResponse.json(formattedInvoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { syncFromNetsuite, createManual, invoiceData } = body;

    if (syncFromNetsuite) {
      // Sync invoices from NetSuite
      const syncResult = await syncInvoicesFromNetsuite();
      return NextResponse.json(syncResult);
    }

    if (createManual && invoiceData) {
      // Create manual invoice entry
      const [newInvoice] = await db
        .insert(invoices)
        .values({
          invoiceNumber: invoiceData.invoiceNumber,
          customerId: invoiceData.customerId,
          amount: invoiceData.amount.toString(),
          dueDate: new Date(invoiceData.dueDate),
          status: invoiceData.status || 'pending',
          daysOverdue: calculateDaysOverdue(invoiceData.dueDate),
          createdAt: new Date(),
          syncedAt: new Date()
        })
        .returning();

      return NextResponse.json(newInvoice);
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error creating/syncing invoices:', error);
    return NextResponse.json(
      { error: 'Failed to create/sync invoices' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, paidDate, amount, daysOverdue } = body;

    // Update invoice
    const updateData: any = {};
    
    if (status) updateData.status = status;
    if (paidDate) updateData.paidDate = new Date(paidDate);
    if (amount) updateData.amount = amount.toString();
    if (daysOverdue !== undefined) updateData.daysOverdue = daysOverdue;

    const [updatedInvoice] = await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id))
      .returning();

    if (!updatedInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

async function syncInvoicesFromNetsuite(): Promise<any> {
  const syncResult = {
    invoicesCreated: 0,
    invoicesUpdated: 0,
    errors: []
  };

  try {
    // Get overdue invoices from NetSuite
    const netsuiteInvoices = await netsuiteService.getOverdueInvoices(0); // All invoices
    
    for (const nsInvoice of netsuiteInvoices) {
      try {
        // Find corresponding customer
        const [customer] = await db
          .select()
          .from(customers)
          .where(eq(customers.externalId, nsInvoice.entity));

        if (!customer) {
          syncResult.errors.push(`Customer not found for invoice ${nsInvoice.tranId}`);
          continue;
        }

        // Check if invoice exists
        const [existingInvoice] = await db
          .select()
          .from(invoices)
          .where(eq(invoices.invoiceNumber, nsInvoice.tranId));

        const daysOverdue = calculateDaysOverdue(nsInvoice.dueDate);
        const status = determineInvoiceStatus(nsInvoice.status, daysOverdue);

        const invoiceData = {
          invoiceNumber: nsInvoice.tranId,
          customerId: customer.id,
          amount: nsInvoice.amount.toString(),
          dueDate: new Date(nsInvoice.dueDate),
          status,
          daysOverdue,
          createdAt: new Date(nsInvoice.createdDate),
          syncedAt: new Date()
        };

        if (existingInvoice) {
          // Update existing invoice
          await db
            .update(invoices)
            .set({
              amount: invoiceData.amount,
              status: invoiceData.status,
              daysOverdue: invoiceData.daysOverdue,
              syncedAt: invoiceData.syncedAt
            })
            .where(eq(invoices.id, existingInvoice.id));
          
          syncResult.invoicesUpdated++;
        } else {
          // Create new invoice
          await db
            .insert(invoices)
            .values(invoiceData);
          
          syncResult.invoicesCreated++;
        }
      } catch (error) {
        syncResult.errors.push(`Error syncing invoice ${nsInvoice.tranId}: ${error.message}`);
      }
    }
  } catch (error) {
    syncResult.errors.push(`Error connecting to NetSuite: ${error.message}`);
  }

  return syncResult;
}

function calculateDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

function determineInvoiceStatus(netsuiteStatus: string, daysOverdue: number): string {
  if (netsuiteStatus === 'Paid') return 'paid';
  if (netsuiteStatus === 'Partially Paid') return 'partial';
  if (daysOverdue > 0) return 'overdue';
  return 'pending';
}

// GET analytics for invoices
export async function getInvoiceAnalytics(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Get invoice analytics
    const analytics = await db
      .select({
        totalInvoices: sql<number>`COUNT(*)`,
        totalAmount: sql<number>`SUM(${invoices.amount}::numeric)`,
        overdueInvoices: sql<number>`COUNT(CASE WHEN ${invoices.status} = 'overdue' THEN 1 END)`,
        overdueAmount: sql<number>`SUM(CASE WHEN ${invoices.status} = 'overdue' THEN ${invoices.amount}::numeric ELSE 0 END)`,
        paidInvoices: sql<number>`COUNT(CASE WHEN ${invoices.status} = 'paid' THEN 1 END)`,
        paidAmount: sql<number>`SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.amount}::numeric ELSE 0 END)`,
        avgDaysOverdue: sql<number>`AVG(CASE WHEN ${invoices.daysOverdue} > 0 THEN ${invoices.daysOverdue} END)`
      })
      .from(invoices)
      .where(gte(invoices.createdAt, dateThreshold));

    const result = analytics[0];
    
    return NextResponse.json({
      totalInvoices: result.totalInvoices,
      totalAmount: Number(result.totalAmount || 0),
      overdueInvoices: result.overdueInvoices,
      overdueAmount: Number(result.overdueAmount || 0),
      paidInvoices: result.paidInvoices,
      paidAmount: Number(result.paidAmount || 0),
      collectionRate: result.totalInvoices > 0 ? (result.paidInvoices / result.totalInvoices) * 100 : 0,
      avgDaysOverdue: Math.round(Number(result.avgDaysOverdue || 0))
    });
  } catch (error) {
    console.error('Error fetching invoice analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice analytics' },
      { status: 500 }
    );
  }
}