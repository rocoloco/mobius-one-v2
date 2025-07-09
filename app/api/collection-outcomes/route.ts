import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collectionOutcomes, customers, invoices, recommendations } from '@/lib/schema/collections';
import { eq, sql, desc, and, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const days = parseInt(searchParams.get('days') || '30');
    const paymentStatus = searchParams.get('paymentStatus'); // 'paid' or 'pending'

    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Build query conditions
    let whereConditions = gte(collectionOutcomes.collectedAt, dateThreshold);
    
    if (paymentStatus === 'paid') {
      whereConditions = and(whereConditions, eq(collectionOutcomes.paymentReceived, true));
    } else if (paymentStatus === 'pending') {
      whereConditions = and(whereConditions, eq(collectionOutcomes.paymentReceived, false));
    }

    // Get collection outcomes with related data
    const outcomesList = await db
      .select({
        id: collectionOutcomes.id,
        paymentReceived: collectionOutcomes.paymentReceived,
        daysToPayment: collectionOutcomes.daysToPayment,
        customerResponse: collectionOutcomes.customerResponse,
        amountCollected: collectionOutcomes.amountCollected,
        collectedAt: collectionOutcomes.collectedAt,
        impactNotes: collectionOutcomes.impactNotes,
        customer: {
          id: customers.id,
          name: customers.name,
          accountHealth: customers.accountHealth
        },
        invoice: {
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          amount: invoices.amount,
          daysOverdue: invoices.daysOverdue
        },
        recommendation: {
          id: recommendations.id,
          strategy: recommendations.strategy,
          confidenceScore: recommendations.confidenceScore
        }
      })
      .from(collectionOutcomes)
      .innerJoin(customers, eq(collectionOutcomes.invoiceId, invoices.id))
      .innerJoin(invoices, eq(invoices.customerId, customers.id))
      .leftJoin(recommendations, eq(collectionOutcomes.recommendationId, recommendations.id))
      .where(whereConditions)
      .orderBy(desc(collectionOutcomes.collectedAt))
      .limit(limit);

    // Format the response
    const formattedOutcomes = outcomesList.map(outcome => ({
      id: outcome.id,
      customer: outcome.customer.name,
      customerId: outcome.customer.id,
      accountHealth: outcome.customer.accountHealth,
      invoice: outcome.invoice.invoiceNumber,
      invoiceId: outcome.invoice.id,
      originalAmount: Number(outcome.invoice.amount),
      amountCollected: Number(outcome.amountCollected || 0),
      paymentReceived: outcome.paymentReceived,
      daysToPayment: outcome.daysToPayment,
      customerResponse: outcome.customerResponse,
      collectedAt: outcome.collectedAt,
      impactNotes: outcome.impactNotes,
      recommendation: outcome.recommendation ? {
        id: outcome.recommendation.id,
        strategy: outcome.recommendation.strategy,
        confidence: outcome.recommendation.confidenceScore
      } : null
    }));

    return NextResponse.json(formattedOutcomes);
  } catch (error) {
    console.error('Error fetching collection outcomes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection outcomes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      recommendationId,
      invoiceId,
      paymentReceived,
      daysToPayment,
      customerResponse,
      amountCollected,
      impactNotes
    } = body;

    // Create new collection outcome
    const [newOutcome] = await db
      .insert(collectionOutcomes)
      .values({
        recommendationId,
        invoiceId,
        paymentReceived,
        daysToPayment,
        customerResponse,
        amountCollected: amountCollected?.toString(),
        impactNotes,
        collectedAt: new Date()
      })
      .returning();

    // If payment was received, update invoice status
    if (paymentReceived) {
      await db
        .update(invoices)
        .set({ 
          status: 'paid',
          paidDate: new Date()
        })
        .where(eq(invoices.id, invoiceId));
    }

    return NextResponse.json(newOutcome);
  } catch (error) {
    console.error('Error creating collection outcome:', error);
    return NextResponse.json(
      { error: 'Failed to create collection outcome' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    // Update collection outcome
    const [updatedOutcome] = await db
      .update(collectionOutcomes)
      .set({
        ...updateData,
        ...(updateData.amountCollected && { 
          amountCollected: updateData.amountCollected.toString() 
        })
      })
      .where(eq(collectionOutcomes.id, id))
      .returning();

    if (!updatedOutcome) {
      return NextResponse.json(
        { error: 'Collection outcome not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedOutcome);
  } catch (error) {
    console.error('Error updating collection outcome:', error);
    return NextResponse.json(
      { error: 'Failed to update collection outcome' },
      { status: 500 }
    );
  }
}

// GET analytics endpoint for collection outcomes
export async function getAnalytics(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Get success metrics
    const successMetrics = await db
      .select({
        totalOutcomes: sql<number>`COUNT(*)`,
        successfulCollections: sql<number>`COUNT(CASE WHEN ${collectionOutcomes.paymentReceived} = true THEN 1 END)`,
        totalCollected: sql<number>`SUM(CASE WHEN ${collectionOutcomes.paymentReceived} = true THEN ${collectionOutcomes.amountCollected}::numeric ELSE 0 END)`,
        averageDaysToPayment: sql<number>`AVG(CASE WHEN ${collectionOutcomes.paymentReceived} = true THEN ${collectionOutcomes.daysToPayment} END)`
      })
      .from(collectionOutcomes)
      .where(gte(collectionOutcomes.collectedAt, dateThreshold));

    const metrics = successMetrics[0];
    const successRate = metrics.totalOutcomes > 0 
      ? (metrics.successfulCollections / metrics.totalOutcomes) * 100 
      : 0;

    return NextResponse.json({
      totalOutcomes: metrics.totalOutcomes,
      successfulCollections: metrics.successfulCollections,
      successRate: Math.round(successRate),
      totalCollected: Number(metrics.totalCollected || 0),
      averageDaysToPayment: Math.round(Number(metrics.averageDaysToPayment || 0))
    });
  } catch (error) {
    console.error('Error fetching collection analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection analytics' },
      { status: 500 }
    );
  }
}