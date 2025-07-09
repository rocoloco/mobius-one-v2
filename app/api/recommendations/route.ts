import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { recommendations, customers, invoices } from '@/lib/schema/collections';
import { eq, sql } from 'drizzle-orm';
import { AIOrchestrator } from '@/lib/services/ai-orchestrator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get recommendations with customer and invoice data
    const recommendationList = await db
      .select({
        id: recommendations.id,
        strategy: recommendations.strategy,
        confidenceScore: recommendations.confidenceScore,
        riskAssessment: recommendations.riskAssessment,
        draftContent: recommendations.draftContent,
        reasoning: recommendations.reasoning,
        createdAt: recommendations.createdAt,
        status: recommendations.status,
        customer: {
          id: customers.id,
          name: customers.name,
          accountHealth: customers.accountHealth,
          externalId: customers.externalId
        },
        invoice: {
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          amount: invoices.amount,
          daysOverdue: invoices.daysOverdue,
          dueDate: invoices.dueDate,
          status: invoices.status
        }
      })
      .from(recommendations)
      .innerJoin(customers, eq(recommendations.customerId, customers.id))
      .innerJoin(invoices, eq(recommendations.invoiceId, invoices.id))
      .where(eq(recommendations.status, status))
      .orderBy(sql`${recommendations.createdAt} DESC`)
      .limit(limit);

    // Format the response
    const formattedRecommendations = recommendationList.map(rec => ({
      id: rec.id,
      customer: rec.customer.name,
      customerId: rec.customer.id,
      customerExternalId: rec.customer.externalId,
      accountHealth: rec.customer.accountHealth,
      invoice: rec.invoice.invoiceNumber,
      invoiceId: rec.invoice.id,
      amount: Number(rec.invoice.amount),
      daysOverdue: rec.invoice.daysOverdue || 0,
      dueDate: rec.invoice.dueDate,
      invoiceStatus: rec.invoice.status,
      strategy: rec.strategy,
      confidence: rec.confidenceScore,
      riskLevel: rec.riskAssessment,
      draftContent: rec.draftContent,
      reasoning: rec.reasoning,
      status: rec.status,
      createdAt: rec.createdAt
    }));

    return NextResponse.json(formattedRecommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, customerId, triggerNewAnalysis } = body;

    if (triggerNewAnalysis) {
      // Generate new AI recommendation
      const aiOrchestrator = new AIOrchestrator();
      
      // Get invoice and customer data
      const [invoiceData] = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, invoiceId));

      const [customerData] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, customerId));

      if (!invoiceData || !customerData) {
        return NextResponse.json(
          { error: 'Invoice or customer not found' },
          { status: 404 }
        );
      }

      // Get payment history (simplified - would be more complex in real implementation)
      const paymentHistory = customerData.paymentHistory || [];
      const accountHealth = { status: customerData.accountHealth };

      // Generate AI recommendation
      const aiRecommendation = await aiOrchestrator.analyzeCollectionOpportunity(
        invoiceData,
        customerData,
        paymentHistory,
        accountHealth
      );

      // Insert new recommendation
      const [newRecommendation] = await db
        .insert(recommendations)
        .values({
          invoiceId,
          customerId,
          strategy: aiRecommendation.strategy,
          confidenceScore: aiRecommendation.confidenceScore,
          riskAssessment: aiRecommendation.riskAssessment,
          draftContent: aiRecommendation.draftContent,
          reasoning: aiRecommendation.reasoning,
          status: 'pending'
        })
        .returning();

      return NextResponse.json(newRecommendation);
    }

    // If not triggering new analysis, return error
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error creating recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to create recommendation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, modifiedContent } = body;

    // Update recommendation status
    const [updatedRecommendation] = await db
      .update(recommendations)
      .set({ 
        status,
        ...(modifiedContent && { draftContent: modifiedContent })
      })
      .where(eq(recommendations.id, id))
      .returning();

    if (!updatedRecommendation) {
      return NextResponse.json(
        { error: 'Recommendation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedRecommendation);
  } catch (error) {
    console.error('Error updating recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to update recommendation' },
      { status: 500 }
    );
  }
}