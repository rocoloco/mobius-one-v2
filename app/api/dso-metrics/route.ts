import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dsoMetrics, invoices, customers } from '@/lib/schema/collections';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get the most recent DSO metric
    const [currentMetric] = await db
      .select()
      .from(dsoMetrics)
      .orderBy(sql`${dsoMetrics.calculatedAt} DESC`)
      .limit(1);

    // If no metrics exist, calculate from current data
    if (!currentMetric) {
      const calculatedDso = await calculateCurrentDSO();
      return NextResponse.json(calculatedDso);
    }

    // Get previous metric for comparison
    const [previousMetric] = await db
      .select()
      .from(dsoMetrics)
      .where(sql`${dsoMetrics.calculatedAt} < ${currentMetric.calculatedAt}`)
      .orderBy(sql`${dsoMetrics.calculatedAt} DESC`)
      .limit(1);

    const response = {
      current: Number(currentMetric.currentDso),
      previous: previousMetric ? Number(previousMetric.currentDso) : Number(currentMetric.currentDso),
      improvement: currentMetric.improvement ? Number(currentMetric.improvement) : 0,
      workingCapital: Number(currentMetric.workingCapitalImpact || 0),
      totalOutstanding: Number(currentMetric.totalOutstanding || 0),
      invoiceCount: currentMetric.invoiceCount || 0,
      calculatedAt: currentMetric.calculatedAt,
      target: 35 // Target DSO - could be configurable
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching DSO metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DSO metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const calculatedDso = await calculateCurrentDSO();
    
    // Insert new DSO metric
    const [newMetric] = await db
      .insert(dsoMetrics)
      .values({
        currentDso: calculatedDso.current.toString(),
        previousDso: calculatedDso.previous?.toString(),
        improvement: calculatedDso.improvement?.toString(),
        totalOutstanding: calculatedDso.totalOutstanding.toString(),
        workingCapitalImpact: calculatedDso.workingCapital.toString(),
        invoiceCount: calculatedDso.invoiceCount
      })
      .returning();

    return NextResponse.json(newMetric);
  } catch (error) {
    console.error('Error calculating DSO metrics:', error);
    return NextResponse.json(
      { error: 'Failed to calculate DSO metrics' },
      { status: 500 }
    );
  }
}

async function calculateCurrentDSO() {
  // Get outstanding invoices
  const outstandingInvoices = await db
    .select({
      amount: invoices.amount,
      daysOverdue: invoices.daysOverdue,
      dueDate: invoices.dueDate,
      createdAt: invoices.createdAt
    })
    .from(invoices)
    .where(sql`${invoices.status} IN ('pending', 'overdue')`);

  // Calculate total outstanding
  const totalOutstanding = outstandingInvoices.reduce(
    (sum, inv) => sum + Number(inv.amount),
    0
  );

  // Calculate weighted average days outstanding
  let totalWeightedDays = 0;
  let totalAmount = 0;

  for (const invoice of outstandingInvoices) {
    const daysOutstanding = invoice.daysOverdue || 0;
    const amount = Number(invoice.amount);
    
    totalWeightedDays += daysOutstanding * amount;
    totalAmount += amount;
  }

  const currentDso = totalAmount > 0 ? totalWeightedDays / totalAmount : 0;

  // Get previous DSO for comparison
  const [previousMetric] = await db
    .select()
    .from(dsoMetrics)
    .orderBy(sql`${dsoMetrics.calculatedAt} DESC`)
    .limit(1);

  const previousDso = previousMetric ? Number(previousMetric.currentDso) : null;
  const improvement = previousDso ? previousDso - currentDso : 0;

  // Calculate working capital impact (improvement * average daily revenue)
  // Simplified calculation - in real implementation, this would be more sophisticated
  const avgDailyRevenue = totalOutstanding / 30; // Rough estimate
  const workingCapital = improvement * avgDailyRevenue;

  return {
    current: Math.round(currentDso),
    previous: previousDso ? Math.round(previousDso) : null,
    improvement: Math.round(improvement),
    totalOutstanding: Math.round(totalOutstanding),
    workingCapital: Math.round(workingCapital),
    invoiceCount: outstandingInvoices.length,
    target: 35
  };
}