import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collectionOutcomes, recommendations, customers, invoices } from '@/lib/schema/collections';
import { eq, sql, desc, and, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const strategy = searchParams.get('strategy');
    const customerHealth = searchParams.get('customerHealth');
    
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Build base query
    let query = db
      .select({
        totalOutcomes: sql<number>`COUNT(*)`,
        successfulCollections: sql<number>`COUNT(CASE WHEN ${collectionOutcomes.paymentReceived} = true THEN 1 END)`,
        totalAmountTargeted: sql<number>`SUM(${invoices.amount}::numeric)`,
        totalAmountCollected: sql<number>`SUM(CASE WHEN ${collectionOutcomes.paymentReceived} = true THEN ${collectionOutcomes.amountCollected}::numeric ELSE 0 END)`,
        averageDaysToPayment: sql<number>`AVG(CASE WHEN ${collectionOutcomes.paymentReceived} = true THEN ${collectionOutcomes.daysToPayment} END)`,
        averageConfidenceScore: sql<number>`AVG(${recommendations.confidenceScore})`
      })
      .from(collectionOutcomes)
      .innerJoin(recommendations, eq(collectionOutcomes.recommendationId, recommendations.id))
      .innerJoin(invoices, eq(collectionOutcomes.invoiceId, invoices.id))
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(gte(collectionOutcomes.collectedAt, dateThreshold));

    // Apply filters
    const conditions: any[] = [gte(collectionOutcomes.collectedAt, dateThreshold)];
    
    if (strategy) {
      conditions.push(eq(recommendations.strategy, strategy));
    }
    
    if (customerHealth) {
      conditions.push(eq(customers.accountHealth, customerHealth));
    }

    if (conditions.length > 1) {
      query = query.where(and(...conditions));
    }

    const [analytics] = await query;

    // Get strategy breakdown
    const strategyBreakdown = await db
      .select({
        strategy: recommendations.strategy,
        count: sql<number>`COUNT(*)`,
        successRate: sql<number>`COUNT(CASE WHEN ${collectionOutcomes.paymentReceived} = true THEN 1 END) * 100.0 / COUNT(*)`,
        avgDaysToPayment: sql<number>`AVG(CASE WHEN ${collectionOutcomes.paymentReceived} = true THEN ${collectionOutcomes.daysToPayment} END)`
      })
      .from(collectionOutcomes)
      .innerJoin(recommendations, eq(collectionOutcomes.recommendationId, recommendations.id))
      .where(gte(collectionOutcomes.collectedAt, dateThreshold))
      .groupBy(recommendations.strategy)
      .orderBy(desc(sql`success_rate`));

    // Get confidence score vs success rate correlation
    const confidenceAnalysis = await db
      .select({
        confidenceRange: sql<string>`
          CASE 
            WHEN ${recommendations.confidenceScore} >= 90 THEN 'High (90%+)'
            WHEN ${recommendations.confidenceScore} >= 70 THEN 'Medium (70-89%)'
            ELSE 'Low (<70%)'
          END
        `,
        count: sql<number>`COUNT(*)`,
        successRate: sql<number>`COUNT(CASE WHEN ${collectionOutcomes.paymentReceived} = true THEN 1 END) * 100.0 / COUNT(*)`,
        avgDaysToPayment: sql<number>`AVG(CASE WHEN ${collectionOutcomes.paymentReceived} = true THEN ${collectionOutcomes.daysToPayment} END)`
      })
      .from(collectionOutcomes)
      .innerJoin(recommendations, eq(collectionOutcomes.recommendationId, recommendations.id))
      .where(gte(collectionOutcomes.collectedAt, dateThreshold))
      .groupBy(sql`confidence_range`)
      .orderBy(desc(sql`success_rate`));

    // Get customer health impact
    const customerHealthAnalysis = await db
      .select({
        accountHealth: customers.accountHealth,
        count: sql<number>`COUNT(*)`,
        successRate: sql<number>`COUNT(CASE WHEN ${collectionOutcomes.paymentReceived} = true THEN 1 END) * 100.0 / COUNT(*)`,
        avgDaysToPayment: sql<number>`AVG(CASE WHEN ${collectionOutcomes.paymentReceived} = true THEN ${collectionOutcomes.daysToPayment} END)`
      })
      .from(collectionOutcomes)
      .innerJoin(invoices, eq(collectionOutcomes.invoiceId, invoices.id))
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(gte(collectionOutcomes.collectedAt, dateThreshold))
      .groupBy(customers.accountHealth)
      .orderBy(desc(sql`success_rate`));

    // Get time-based trends (daily success rates)
    const dailyTrends = await db
      .select({
        date: sql<string>`DATE(${collectionOutcomes.collectedAt})`,
        totalOutcomes: sql<number>`COUNT(*)`,
        successfulCollections: sql<number>`COUNT(CASE WHEN ${collectionOutcomes.paymentReceived} = true THEN 1 END)`,
        amountCollected: sql<number>`SUM(CASE WHEN ${collectionOutcomes.paymentReceived} = true THEN ${collectionOutcomes.amountCollected}::numeric ELSE 0 END)`
      })
      .from(collectionOutcomes)
      .where(gte(collectionOutcomes.collectedAt, dateThreshold))
      .groupBy(sql`DATE(${collectionOutcomes.collectedAt})`)
      .orderBy(sql`DATE(${collectionOutcomes.collectedAt})`);

    // Calculate key metrics
    const successRate = analytics.totalOutcomes > 0 
      ? (analytics.successfulCollections / analytics.totalOutcomes) * 100 
      : 0;

    const collectionRate = analytics.totalAmountTargeted > 0
      ? (Number(analytics.totalAmountCollected) / Number(analytics.totalAmountTargeted)) * 100
      : 0;

    return NextResponse.json({
      summary: {
        totalOutcomes: analytics.totalOutcomes,
        successfulCollections: analytics.successfulCollections,
        successRate: Math.round(successRate),
        totalAmountTargeted: Number(analytics.totalAmountTargeted || 0),
        totalAmountCollected: Number(analytics.totalAmountCollected || 0),
        collectionRate: Math.round(collectionRate),
        averageDaysToPayment: Math.round(Number(analytics.averageDaysToPayment || 0)),
        averageConfidenceScore: Math.round(Number(analytics.averageConfidenceScore || 0))
      },
      strategyBreakdown: strategyBreakdown.map(item => ({
        strategy: item.strategy,
        count: item.count,
        successRate: Math.round(Number(item.successRate || 0)),
        avgDaysToPayment: Math.round(Number(item.avgDaysToPayment || 0))
      })),
      confidenceAnalysis: confidenceAnalysis.map(item => ({
        range: item.confidenceRange,
        count: item.count,
        successRate: Math.round(Number(item.successRate || 0)),
        avgDaysToPayment: Math.round(Number(item.avgDaysToPayment || 0))
      })),
      customerHealthAnalysis: customerHealthAnalysis.map(item => ({
        accountHealth: item.accountHealth,
        count: item.count,
        successRate: Math.round(Number(item.successRate || 0)),
        avgDaysToPayment: Math.round(Number(item.avgDaysToPayment || 0))
      })),
      dailyTrends: dailyTrends.map(item => ({
        date: item.date,
        totalOutcomes: item.totalOutcomes,
        successfulCollections: item.successfulCollections,
        successRate: item.totalOutcomes > 0 ? Math.round((item.successfulCollections / item.totalOutcomes) * 100) : 0,
        amountCollected: Number(item.amountCollected || 0)
      }))
    });
  } catch (error) {
    console.error('Error fetching collection outcome analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection outcome analytics' },
      { status: 500 }
    );
  }
}