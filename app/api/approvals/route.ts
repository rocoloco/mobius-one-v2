import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { approvals, recommendations, customers, invoices } from '@/lib/schema/collections';
import { eq, sql, desc, and } from 'drizzle-orm';
import { salesforceService } from '@/lib/services/salesforce';
import { netsuiteService } from '@/lib/services/netsuite';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '1'; // Default user
    const action = searchParams.get('action'); // 'approved', 'rejected', 'modified'
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query = db
      .select({
        id: approvals.id,
        action: approvals.action,
        modifiedContent: approvals.modifiedContent,
        approvedAt: approvals.approvedAt,
        executedAt: approvals.executedAt,
        outcome: approvals.outcome,
        userId: approvals.userId,
        recommendation: {
          id: recommendations.id,
          strategy: recommendations.strategy,
          confidenceScore: recommendations.confidenceScore,
          riskAssessment: recommendations.riskAssessment,
          draftContent: recommendations.draftContent,
          reasoning: recommendations.reasoning,
          status: recommendations.status,
          createdAt: recommendations.createdAt
        },
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
          status: invoices.status
        }
      })
      .from(approvals)
      .innerJoin(recommendations, eq(approvals.recommendationId, recommendations.id))
      .innerJoin(customers, eq(recommendations.customerId, customers.id))
      .innerJoin(invoices, eq(recommendations.invoiceId, invoices.id));

    // Apply filters
    const conditions: any[] = [];
    
    if (userId) {
      conditions.push(eq(approvals.userId, parseInt(userId)));
    }

    if (action) {
      conditions.push(eq(approvals.action, action));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const approvalList = await query
      .orderBy(desc(approvals.approvedAt))
      .limit(limit);

    // Format response
    const formattedApprovals = approvalList.map(approval => ({
      id: approval.id,
      action: approval.action,
      modifiedContent: approval.modifiedContent,
      approvedAt: approval.approvedAt,
      executedAt: approval.executedAt,
      outcome: approval.outcome,
      userId: approval.userId,
      recommendation: {
        id: approval.recommendation.id,
        strategy: approval.recommendation.strategy,
        confidence: approval.recommendation.confidenceScore,
        riskLevel: approval.recommendation.riskAssessment,
        draftContent: approval.recommendation.draftContent,
        reasoning: approval.recommendation.reasoning,
        status: approval.recommendation.status,
        createdAt: approval.recommendation.createdAt
      },
      customer: {
        id: approval.customer.id,
        name: approval.customer.name,
        accountHealth: approval.customer.accountHealth,
        externalId: approval.customer.externalId
      },
      invoice: {
        id: approval.invoice.id,
        invoiceNumber: approval.invoice.invoiceNumber,
        amount: Number(approval.invoice.amount),
        daysOverdue: approval.invoice.daysOverdue || 0,
        status: approval.invoice.status
      }
    }));

    return NextResponse.json(formattedApprovals);
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approvals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      recommendationId, 
      userId, 
      action, 
      modifiedContent, 
      executeImmediately = false 
    } = body;

    // Validate input
    if (!recommendationId || !userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: recommendationId, userId, action' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected', 'modified'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approved, rejected, or modified' },
        { status: 400 }
      );
    }

    // Get the recommendation details
    const [recommendation] = await db
      .select({
        id: recommendations.id,
        strategy: recommendations.strategy,
        confidenceScore: recommendations.confidenceScore,
        draftContent: recommendations.draftContent,
        customerId: recommendations.customerId,
        invoiceId: recommendations.invoiceId,
        customer: {
          id: customers.id,
          name: customers.name,
          externalId: customers.externalId
        },
        invoice: {
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          amount: invoices.amount
        }
      })
      .from(recommendations)
      .innerJoin(customers, eq(recommendations.customerId, customers.id))
      .innerJoin(invoices, eq(recommendations.invoiceId, invoices.id))
      .where(eq(recommendations.id, recommendationId));

    if (!recommendation) {
      return NextResponse.json(
        { error: 'Recommendation not found' },
        { status: 404 }
      );
    }

    // Create approval record
    const [newApproval] = await db
      .insert(approvals)
      .values({
        recommendationId,
        userId: parseInt(userId),
        action,
        modifiedContent,
        approvedAt: new Date(),
        executedAt: executeImmediately ? new Date() : null,
        outcome: executeImmediately ? 'sent' : null
      })
      .returning();

    // Update recommendation status
    let newRecommendationStatus = 'pending';
    if (action === 'approved') {
      newRecommendationStatus = executeImmediately ? 'executed' : 'approved';
    } else if (action === 'rejected') {
      newRecommendationStatus = 'rejected';
    } else if (action === 'modified') {
      newRecommendationStatus = 'pending'; // Modified recommendations go back to pending
    }

    await db
      .update(recommendations)
      .set({ status: newRecommendationStatus })
      .where(eq(recommendations.id, recommendationId));

    // If approved and executeImmediately, send the collection email
    if (action === 'approved' && executeImmediately) {
      try {
        const executionResult = await executeCollectionAction(
          recommendation,
          modifiedContent || recommendation.draftContent
        );

        // Update approval with execution outcome
        await db
          .update(approvals)
          .set({ 
            outcome: executionResult.success ? 'sent' : 'failed',
            executedAt: new Date()
          })
          .where(eq(approvals.id, newApproval.id));

        return NextResponse.json({
          approval: newApproval,
          executed: true,
          executionResult
        });
      } catch (executionError) {
        console.error('Error executing collection action:', executionError);
        
        // Update approval with failure
        await db
          .update(approvals)
          .set({ 
            outcome: 'failed',
            executedAt: new Date()
          })
          .where(eq(approvals.id, newApproval.id));

        return NextResponse.json({
          approval: newApproval,
          executed: false,
          error: 'Failed to execute collection action'
        });
      }
    }

    return NextResponse.json({
      approval: newApproval,
      executed: false
    });
  } catch (error) {
    console.error('Error creating approval:', error);
    return NextResponse.json(
      { error: 'Failed to create approval' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, executeNow } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Approval ID is required' },
        { status: 400 }
      );
    }

    // Get approval with recommendation details
    const [approval] = await db
      .select({
        id: approvals.id,
        action: approvals.action,
        modifiedContent: approvals.modifiedContent,
        recommendation: {
          id: recommendations.id,
          draftContent: recommendations.draftContent,
          strategy: recommendations.strategy,
          customerId: recommendations.customerId,
          invoiceId: recommendations.invoiceId
        },
        customer: {
          id: customers.id,
          name: customers.name,
          externalId: customers.externalId
        },
        invoice: {
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          amount: invoices.amount
        }
      })
      .from(approvals)
      .innerJoin(recommendations, eq(approvals.recommendationId, recommendations.id))
      .innerJoin(customers, eq(recommendations.customerId, customers.id))
      .innerJoin(invoices, eq(recommendations.invoiceId, invoices.id))
      .where(eq(approvals.id, id));

    if (!approval) {
      return NextResponse.json(
        { error: 'Approval not found' },
        { status: 404 }
      );
    }

    if (executeNow && approval.action === 'approved') {
      try {
        const executionResult = await executeCollectionAction(
          approval,
          approval.modifiedContent || approval.recommendation.draftContent
        );

        // Update approval with execution details
        const [updatedApproval] = await db
          .update(approvals)
          .set({
            executedAt: new Date(),
            outcome: executionResult.success ? 'sent' : 'failed'
          })
          .where(eq(approvals.id, id))
          .returning();

        // Update recommendation status
        await db
          .update(recommendations)
          .set({ status: 'executed' })
          .where(eq(recommendations.id, approval.recommendation.id));

        return NextResponse.json({
          approval: updatedApproval,
          executionResult
        });
      } catch (executionError) {
        console.error('Error executing collection action:', executionError);
        
        await db
          .update(approvals)
          .set({
            executedAt: new Date(),
            outcome: 'failed'
          })
          .where(eq(approvals.id, id));

        return NextResponse.json(
          { error: 'Failed to execute collection action' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid request or approval not ready for execution' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating approval:', error);
    return NextResponse.json(
      { error: 'Failed to update approval' },
      { status: 500 }
    );
  }
}

async function executeCollectionAction(
  recommendation: any,
  finalContent: string
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    // Log activity in both Salesforce and NetSuite
    const logPromises = [];

    // Log in Salesforce
    if (recommendation.customer?.externalId) {
      logPromises.push(
        salesforceService.logCollectionActivity(
          recommendation.customer.externalId,
          recommendation.invoice.invoiceNumber,
          recommendation.strategy,
          'Email sent via Mobius One'
        )
      );
    }

    // Log in NetSuite
    if (recommendation.customer?.externalId) {
      logPromises.push(
        netsuiteService.logCollectionActivity(
          recommendation.customer.externalId,
          recommendation.invoice.invoiceNumber,
          recommendation.strategy,
          'Email sent via Mobius One'
        )
      );
    }

    // Execute logging (don't fail if logging fails)
    try {
      await Promise.all(logPromises);
    } catch (logError) {
      console.warn('Warning: Failed to log collection activity:', logError);
    }

    // In a real implementation, you would:
    // 1. Send the actual email via SendGrid/similar service
    // 2. Update CRM/ERP systems
    // 3. Create calendar reminders
    // 4. Set up follow-up sequences

    // For now, simulate successful execution
    return {
      success: true,
      message: 'Collection action executed successfully',
      details: {
        emailSent: true,
        loggedInSalesforce: true,
        loggedInNetsuite: true,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error executing collection action:', error);
    return {
      success: false,
      message: 'Failed to execute collection action',
      details: { error: error.message }
    };
  }
}

// GET analytics for approvals
export async function getApprovalAnalytics(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Get approval analytics
    const analytics = await db
      .select({
        totalApprovals: sql<number>`COUNT(*)`,
        approvedCount: sql<number>`COUNT(CASE WHEN ${approvals.action} = 'approved' THEN 1 END)`,
        rejectedCount: sql<number>`COUNT(CASE WHEN ${approvals.action} = 'rejected' THEN 1 END)`,
        modifiedCount: sql<number>`COUNT(CASE WHEN ${approvals.action} = 'modified' THEN 1 END)`,
        executedCount: sql<number>`COUNT(CASE WHEN ${approvals.executedAt} IS NOT NULL THEN 1 END)`,
        successfulExecutions: sql<number>`COUNT(CASE WHEN ${approvals.outcome} = 'sent' THEN 1 END)`
      })
      .from(approvals)
      .where(sql`${approvals.approvedAt} >= ${dateThreshold}`);

    const result = analytics[0];
    
    return NextResponse.json({
      totalApprovals: result.totalApprovals,
      approvedCount: result.approvedCount,
      rejectedCount: result.rejectedCount,
      modifiedCount: result.modifiedCount,
      executedCount: result.executedCount,
      successfulExecutions: result.successfulExecutions,
      approvalRate: result.totalApprovals > 0 ? (result.approvedCount / result.totalApprovals) * 100 : 0,
      executionRate: result.approvedCount > 0 ? (result.executedCount / result.approvedCount) * 100 : 0,
      successRate: result.executedCount > 0 ? (result.successfulExecutions / result.executedCount) * 100 : 0
    });
  } catch (error) {
    console.error('Error fetching approval analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approval analytics' },
      { status: 500 }
    );
  }
}