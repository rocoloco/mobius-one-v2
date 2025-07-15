import { Router } from 'express';
import { Customer, Invoice } from '@shared/schema';
import { scoringService } from '../services/scoringService';
import { routingService } from '../services/routing-service';
import { recommendationService } from '../services/recommendation-service';

const router = Router();

/**
 * POST /api/collections/analyze
 * Analyze a customer/invoice and generate collection recommendation
 */
router.post('/analyze', async (req, res) => {
  try {
    const { customer, invoice } = req.body as {
      customer: Customer;
      invoice: Invoice;
    };

    // Validate input
    if (!customer || !invoice) {
      return res.status(400).json({
        error: 'Missing required fields: customer and invoice'
      });
    }

    // Step 1: Calculate relationship score
    const scoreResult = scoringService.calculateRelationshipScore(customer, invoice);

    // Step 2: Determine AI routing
    const routingContext = {
      customer,
      invoice,
      relationshipScore: scoreResult.score,
      riskLevel: scoreResult.riskLevel,
      confidence: scoreResult.confidence
    };

    const routingDecision = routingService.routeCollectionRequest(routingContext);

    // Step 3: Generate recommendation
    const recommendation = await recommendationService.generateRecommendation(
      routingContext,
      routingDecision
    );

    // Step 4: Return complete analysis
    res.json({
      success: true,
      analysis: {
        scoring: scoreResult,
        routing: routingDecision,
        recommendation,
        summary: {
          score: scoreResult.score,
          riskLevel: scoreResult.riskLevel,
          aiModel: routingDecision.aiModel,
          action: recommendation.recommendedAction,
          confidence: recommendation.confidence,
          approvalRequired: recommendation.approvalRequired,
          estimatedCost: routingDecision.estimatedCost,
          estimatedReviewTime: routingDecision.estimatedReviewTime
        }
      }
    });

  } catch (error) {
    console.error('Collection analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze collection scenario',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/collections/batch-analyze
 * Analyze multiple overdue invoices at once
 */
router.post('/batch-analyze', async (req, res) => {
  try {
    const { scenarios } = req.body as {
      scenarios: { customer: Customer; invoice: Invoice }[];
    };

    if (!scenarios || !Array.isArray(scenarios)) {
      return res.status(400).json({
        error: 'Missing required field: scenarios array'
      });
    }

    const results = [];
    let totalCost = 0;
    let totalReviewTime = 0;

    for (const scenario of scenarios) {
      try {
        // Process each scenario
        const scoreResult = scoringService.calculateRelationshipScore(
          scenario.customer, 
          scenario.invoice
        );

        const routingContext = {
          customer: scenario.customer,
          invoice: scenario.invoice,
          relationshipScore: scoreResult.score,
          riskLevel: scoreResult.riskLevel,
          confidence: scoreResult.confidence
        };

        const routingDecision = routingService.routeCollectionRequest(routingContext);
        const recommendation = await recommendationService.generateRecommendation(
          routingContext,
          routingDecision
        );

        totalCost += routingDecision.estimatedCost;
        totalReviewTime += routingDecision.estimatedReviewTime;

        results.push({
          customerId: scenario.customer.id,
          invoiceId: scenario.invoice.id,
          analysis: {
            scoring: scoreResult,
            routing: routingDecision,
            recommendation
          }
        });

      } catch (scenarioError) {
        results.push({
          customerId: scenario.customer.id,
          invoiceId: scenario.invoice.id,
          error: scenarioError instanceof Error ? scenarioError.message : 'Analysis failed'
        });
      }
    }

    // Batch summary
    const summary = {
      totalScenarios: scenarios.length,
      successfulAnalyses: results.filter(r => !r.error).length,
      failedAnalyses: results.filter(r => r.error).length,
      totalEstimatedCost: Math.round(totalCost * 100) / 100,
      totalEstimatedReviewTime: Math.round(totalReviewTime * 10) / 10,
      riskDistribution: this.calculateRiskDistribution(results),
      modelUsageDistribution: this.calculateModelDistribution(results)
    };

    res.json({
      success: true,
      results,
      summary
    });

  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({
      error: 'Failed to perform batch analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/collections/overdue
 * Get all overdue invoices that need collection action
 */
router.get('/overdue', async (req, res) => {
  try {
    // In a real implementation, this would query your database
    // For now, we'll return a simulated response

    const overdueInvoices = await this.getOverdueInvoices();

    res.json({
      success: true,
      count: overdueInvoices.length,
      invoices: overdueInvoices,
      summary: {
        totalAmount: overdueInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        averageDaysOverdue: this.calculateAverageDaysOverdue(overdueInvoices),
        riskDistribution: this.calculateOverdueRiskDistribution(overdueInvoices)
      }
    });

  } catch (error) {
    console.error('Overdue invoices error:', error);
    res.status(500).json({
      error: 'Failed to retrieve overdue invoices',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/collections/approve
 * Approve and execute a collection recommendation
 */
router.post('/approve', async (req, res) => {
  try {
    const { recommendationId, approved, modifications } = req.body;

    if (!recommendationId) {
      return res.status(400).json({
        error: 'Missing required field: recommendationId'
      });
    }

    // In a real implementation, this would:
    // 1. Retrieve the recommendation from database
    // 2. Apply any modifications
    // 3. Execute the collection action (send email, create task, etc.)
    // 4. Track the outcome

    const result = {
      recommendationId,
      approved,
      executedAt: new Date().toISOString(),
      status: approved ? 'executed' : 'rejected',
      modifications: modifications || null
    };

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({
      error: 'Failed to process approval',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/collections/dashboard
 * Get collections dashboard data
 */
router.get('/dashboard', async (req, res) => {
  try {
    // In a real implementation, this would aggregate data from your database
    const dashboardData = {
      overview: {
        totalOverdue: 47,
        totalOverdueAmount: 892450,
        averageDSO: 42,
        collectionEfficiency: 0.73
      },
      riskDistribution: {
        low: 18,
        medium: 21,
        high: 8
      },
      aiModelUsage: {
        'gpt-4o-mini': 32,
        'claude-3.5-sonnet': 12,
        'claude-opus-4': 3
      },
      recentActivity: [
        {
          type: 'recommendation_generated',
          customerId: 'cust_123',
          aiModel: 'claude-3.5-sonnet',
          confidence: 87,
          timestamp: new Date().toISOString()
        }
      ],
      performance: {
        averageRecommendationAccuracy: 0.84,
        humanApprovalRate: 0.91,
        averageTimeToApproval: 2.3, // minutes
        successfulCollections: 0.68
      }
    };

    res.json({
      success: true,
      dashboard: dashboardData
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      error: 'Failed to load dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper methods (in a real implementation, these would be in a service class)

function calculateRiskDistribution(results: any[]): any {
  const successful = results.filter(r => !r.error);
  const distribution = { low: 0, medium: 0, high: 0 };

  successful.forEach(result => {
    const risk = result.analysis?.scoring?.riskLevel;
    if (risk && distribution.hasOwnProperty(risk)) {
      distribution[risk as keyof typeof distribution]++;
    }
  });

  return distribution;
}

function calculateModelDistribution(results: any[]): any {
  const successful = results.filter(r => !r.error);
  const distribution: Record<string, number> = {};

  successful.forEach(result => {
    const model = result.analysis?.routing?.aiModel;
    if (model) {
      distribution[model] = (distribution[model] || 0) + 1;
    }
  });

  return distribution;
}

async function getOverdueInvoices(): Promise<any[]> {
  // In a real implementation, this would query your database
  // For now, return simulated data
  return [
    {
      id: 'inv_001',
      customerId: 'cust_001',
      invoiceNumber: 'INV-2024-001',
      totalAmount: 15000,
      daysOverdue: 35,
      riskLevel: 'medium'
    }
  ];
}

function calculateAverageDaysOverdue(invoices: any[]): number {
  if (invoices.length === 0) return 0;
  const total = invoices.reduce((sum, inv) => sum + (inv.daysOverdue || 0), 0);
  return Math.round(total / invoices.length);
}

function calculateOverdueRiskDistribution(invoices: any[]): any {
  const distribution = { low: 0, medium: 0, high: 0 };
  invoices.forEach(inv => {
    if (inv.riskLevel && distribution.hasOwnProperty(inv.riskLevel)) {
      distribution[inv.riskLevel as keyof typeof distribution]++;
    }
  });
  return distribution;
}

export default router;