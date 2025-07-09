import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customers } from '@/lib/schema/collections';
import { eq, sql } from 'drizzle-orm';
import { salesforceService } from '@/lib/services/salesforce';
import { netsuiteService } from '@/lib/services/netsuite';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, forceSync } = body; // 'salesforce' or 'netsuite'

    let syncResults = {
      source,
      customersUpdated: 0,
      customersCreated: 0,
      errors: []
    };

    if (source === 'salesforce') {
      syncResults = await syncSalesforceCustomers(forceSync);
    } else if (source === 'netsuite') {
      syncResults = await syncNetsuiteCustomers(forceSync);
    } else {
      return NextResponse.json(
        { error: 'Invalid source. Must be "salesforce" or "netsuite"' },
        { status: 400 }
      );
    }

    return NextResponse.json(syncResults);
  } catch (error) {
    console.error('Error syncing customers:', error);
    return NextResponse.json(
      { error: 'Failed to sync customers' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = db.select().from(customers);

    // Apply filters
    if (source) {
      query = query.where(eq(customers.source, source));
    }

    if (search) {
      query = query.where(sql`${customers.name} ILIKE ${'%' + search + '%'}`);
    }

    const customerList = await query
      .orderBy(customers.name)
      .limit(limit);

    // Format response
    const formattedCustomers = customerList.map(customer => ({
      id: customer.id,
      externalId: customer.externalId,
      name: customer.name,
      accountHealth: customer.accountHealth,
      lastActivityDate: customer.lastActivityDate,
      totalRevenue: Number(customer.totalRevenue || 0),
      paymentHistory: customer.paymentHistory || [],
      source: customer.source,
      syncedAt: customer.syncedAt
    }));

    return NextResponse.json(formattedCustomers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

async function syncSalesforceCustomers(forceSync: boolean = false) {
  const results = {
    source: 'salesforce',
    customersUpdated: 0,
    customersCreated: 0,
    errors: []
  };

  try {
    // Get accounts from Salesforce
    const salesforceAccounts = await salesforceService.getAccounts();
    
    for (const account of salesforceAccounts) {
      try {
        // Check if customer exists
        const [existingCustomer] = await db
          .select()
          .from(customers)
          .where(eq(customers.externalId, account.Id));

        const customerData = {
          externalId: account.Id,
          name: account.Name,
          accountHealth: determineAccountHealth(account),
          lastActivityDate: account.LastActivityDate ? new Date(account.LastActivityDate) : null,
          totalRevenue: account.AnnualRevenue ? account.AnnualRevenue.toString() : '0',
          paymentHistory: await getSalesforcePaymentHistory(account.Id),
          source: 'salesforce',
          syncedAt: new Date()
        };

        if (existingCustomer) {
          // Update existing customer
          if (forceSync || shouldUpdateCustomer(existingCustomer, customerData)) {
            await db
              .update(customers)
              .set(customerData)
              .where(eq(customers.id, existingCustomer.id));
            results.customersUpdated++;
          }
        } else {
          // Create new customer
          await db
            .insert(customers)
            .values(customerData);
          results.customersCreated++;
        }
      } catch (error) {
        results.errors.push(`Error syncing customer ${account.Name}: ${error.message}`);
      }
    }
  } catch (error) {
    results.errors.push(`Error connecting to Salesforce: ${error.message}`);
  }

  return results;
}

async function syncNetsuiteCustomers(forceSync: boolean = false) {
  const results = {
    source: 'netsuite',
    customersUpdated: 0,
    customersCreated: 0,
    errors: []
  };

  try {
    // Get customers from NetSuite
    const netsuiteCustomers = await netsuiteService.getCustomers();
    
    for (const customer of netsuiteCustomers) {
      try {
        // Check if customer exists
        const [existingCustomer] = await db
          .select()
          .from(customers)
          .where(eq(customers.externalId, customer.internalId));

        const customerData = {
          externalId: customer.internalId,
          name: customer.companyName || customer.entityId,
          accountHealth: determineNetsuiteAccountHealth(customer),
          lastActivityDate: customer.lastModifiedDate ? new Date(customer.lastModifiedDate) : null,
          totalRevenue: customer.creditLimit ? customer.creditLimit.toString() : '0',
          paymentHistory: await getNetsuitePaymentHistory(customer.internalId),
          source: 'netsuite',
          syncedAt: new Date()
        };

        if (existingCustomer) {
          // Update existing customer
          if (forceSync || shouldUpdateCustomer(existingCustomer, customerData)) {
            await db
              .update(customers)
              .set(customerData)
              .where(eq(customers.id, existingCustomer.id));
            results.customersUpdated++;
          }
        } else {
          // Create new customer
          await db
            .insert(customers)
            .values(customerData);
          results.customersCreated++;
        }
      } catch (error) {
        results.errors.push(`Error syncing customer ${customer.companyName}: ${error.message}`);
      }
    }
  } catch (error) {
    results.errors.push(`Error connecting to NetSuite: ${error.message}`);
  }

  return results;
}

function determineAccountHealth(salesforceAccount: any): string {
  // Simplified health determination - would be more sophisticated in real implementation
  if (salesforceAccount.Type === 'Customer - Direct' && salesforceAccount.Rating === 'Hot') {
    return 'good';
  } else if (salesforceAccount.Rating === 'Warm') {
    return 'at-risk';
  } else if (salesforceAccount.Rating === 'Cold') {
    return 'churning';
  }
  return 'good'; // Default
}

function determineNetsuiteAccountHealth(netsuiteCustomer: any): string {
  // Simplified health determination based on NetSuite data
  if (netsuiteCustomer.stage === 'CUSTOMER' && netsuiteCustomer.creditHold === false) {
    return 'good';
  } else if (netsuiteCustomer.creditHold === true) {
    return 'at-risk';
  } else if (netsuiteCustomer.stage === 'LEAD' || netsuiteCustomer.stage === 'PROSPECT') {
    return 'churning';
  }
  return 'good'; // Default
}

async function getSalesforcePaymentHistory(accountId: string): Promise<any[]> {
  try {
    // Get payment history from Salesforce opportunities
    const opportunities = await salesforceService.getOpportunitiesByAccount(accountId);
    return opportunities
      .filter(opp => opp.IsClosed && opp.IsWon)
      .map(opp => ({
        amount: opp.Amount,
        date: opp.CloseDate,
        daysToPay: calculateDaysToPay(opp.CreatedDate, opp.CloseDate)
      }));
  } catch (error) {
    console.error('Error fetching Salesforce payment history:', error);
    return [];
  }
}

async function getNetsuitePaymentHistory(customerId: string): Promise<any[]> {
  try {
    // Get payment history from NetSuite invoices
    const invoices = await netsuiteService.getInvoicesByCustomer(customerId);
    return invoices
      .filter(inv => inv.status === 'paid')
      .map(inv => ({
        amount: inv.amount,
        date: inv.paidDate,
        daysToPay: calculateDaysToPay(inv.createdDate, inv.paidDate)
      }));
  } catch (error) {
    console.error('Error fetching NetSuite payment history:', error);
    return [];
  }
}

function shouldUpdateCustomer(existingCustomer: any, newData: any): boolean {
  // Check if customer data has changed significantly
  const lastSync = new Date(existingCustomer.syncedAt);
  const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
  
  // Update if more than 24 hours since last sync
  return hoursSinceSync > 24;
}

function calculateDaysToPay(createdDate: string, paidDate: string): number {
  const created = new Date(createdDate);
  const paid = new Date(paidDate);
  const diffTime = Math.abs(paid.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}