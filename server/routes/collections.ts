import { Router } from 'express';
import { storage } from '../storage';
import { scoringService } from '../services/scoringService';
import { routingService } from '../services/routing-service';
import { recommendationService } from '../services/recommendation-service';

const router = Router();

/**
 * GET /api/collections/overdue-invoices  
 * Get demo overdue invoices for testing
 */
router.get('/overdue-invoices', async (req, res) => {
  try {
    // Mock customer data for proper scoring
    const mockCustomers = [
      {
        id: 1,
        name: 'Acme Corp',
        contactName: 'Sarah Johnson',
        email: 'finance@acme.com',
        relationshipScore: 0,
        createdAt: new Date('2023-01-15'),
        averagePaymentDays: 35,
        totalOverdueAmount: 15750
      },
      {
        id: 2,
        name: 'TechFlow Solutions',
        contactName: 'Michael Chen',
        email: 'accounting@techflow.com',
        relationshipScore: 0,
        createdAt: new Date('2023-03-20'),
        averagePaymentDays: 28,
        totalOverdueAmount: 8500
      },
      {
        id: 3,
        name: 'StartupXYZ',
        contactName: 'David Park',
        email: 'finance@startupxyz.com',
        relationshipScore: 0,
        createdAt: new Date('2023-08-10'),
        averagePaymentDays: 55,
        totalOverdueAmount: 22000
      }
    ];
    
    // Mock invoice data
    const mockInvoices = [
      {
        id: 1,
        customerId: 1,
        invoiceNumber: 'INV-2024-001',
        totalAmount: 15750,
        dueDate: new Date('2024-11-28'),
        daysPastDue: 45,
        approvalStatus: 'pending'
      },
      {
        id: 2,
        customerId: 2,
        invoiceNumber: 'INV-2024-002',
        totalAmount: 8500,
        dueDate: new Date('2024-12-11'),
        daysPastDue: 30,
        approvalStatus: 'pending'
      },
      {
        id: 3,
        customerId: 3,
        invoiceNumber: 'INV-2024-003',
        totalAmount: 22000,
        dueDate: new Date('2024-11-11'),
        daysPastDue: 65,
        approvalStatus: 'pending'
      }
    ];
    
    // Calculate proper scores using the scoring service
    const demoInvoices = mockInvoices.map(invoice => {
      const customer = mockCustomers.find(c => c.id === invoice.customerId);
      if (customer) {
        const scoreResult = scoringService.calculateRelationshipScore(customer as any, invoice as any);
        return {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          customer: customer.name,
          contactName: customer.contactName,
          amount: invoice.totalAmount,
          daysPastDue: invoice.daysPastDue,
          relationshipScore: scoreResult.score,
          aiRecommendation: scoreResult.recommendation,
          recommendationConfidence: scoreResult.confidence,
          approvalStatus: invoice.approvalStatus,
          riskLevel: scoreResult.riskLevel,
          customerId: invoice.customerId
        };
      }
      return invoice;
    });

    res.json(demoInvoices);
  } catch (error) {
    console.error('Demo invoices error:', error);
    res.status(500).json({ error: 'Failed to load demo invoices' });
  }
});

/**
 * POST /api/collections/analyze
 * Analyze invoice with AI recommendations
 */
router.post('/analyze', async (req, res) => {
  try {
    const { customer, invoice } = req.body;
    
    // Run analysis through the services
    const scoring = scoringService.calculateRelationshipScore(customer, invoice);
    const routing = routingService.routeCollectionRequest({
      customer,
      invoice,
      relationshipScore: scoring.score,
      riskLevel: scoring.riskLevel,
      confidence: scoring.confidence
    });
    
    const recommendation = await recommendationService.generateRecommendation(
      {
        customer,
        invoice,
        relationshipScore: scoring.score,
        riskLevel: scoring.riskLevel,
        confidence: scoring.confidence
      },
      routing
    );
    
    res.json({
      analysis: {
        scoring,
        routing,
        recommendation
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze invoice' });
  }
});

/**
 * GET /api/collections/metrics
 * Get collection metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const userId = 1; // Default user for demo
    const latestMetric = await storage.getLatestDsoMetric(userId);
    
    const metrics = {
      currentDso: latestMetric?.currentDso || 42,
      targetDso: 38,
      workingCapitalFreed: latestMetric?.workingCapitalFreed || 127000,
      totalOverdue: 342000,
      pendingActions: 12,
      approvalRate: latestMetric?.approvalRate || 94,
      relationshipScore: latestMetric?.relationshipScore || 87
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

/**
 * POST /api/collections/approve/:invoiceId
 * Approve single collection action
 */
router.post('/approve/:invoiceId', async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.invoiceId);
    
    console.log(`Approving collection action for invoice ${invoiceId}`);
    
    const mockAction = {
      id: Date.now(),
      invoiceId,
      actionType: 'reminder',
      strategy: 'gentle',
      emailContent: 'AI-generated reminder content based on relationship score',
      sentAt: new Date(),
      responseReceived: false,
      relationshipImpact: 0,
      userId: 1
    };
    
    console.log(`Mock approval created for invoice ${invoiceId}`);
    
    res.json({ 
      message: "Collection action approved successfully", 
      action: mockAction,
      invoiceId,
      status: 'approved',
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Error approving collection action:", error);
    res.status(500).json({ 
      message: "Error approving collection action",
      error: error.message 
    });
  }
});

/**
 * POST /api/collections/bulk-approve
 * Bulk approve collection actions
 */
router.post('/bulk-approve', async (req, res) => {
  try {
    const { invoiceIds } = req.body;
    
    console.log(`Bulk approving collection actions for invoices:`, invoiceIds);
    
    const approvedActions = [];
    
    for (const invoiceId of invoiceIds) {
      try {
        const mockAction = {
          id: Date.now() + invoiceId,
          invoiceId,
          actionType: 'reminder',
          strategy: 'gentle',
          emailContent: 'AI-generated reminder content based on relationship score',
          sentAt: new Date(),
          responseReceived: false,
          relationshipImpact: 0,
          userId: 1
        };
        
        console.log(`Mock bulk approval created for invoice ${invoiceId}`);
        approvedActions.push({ invoiceId, action: mockAction });
      } catch (error) {
        console.error(`Error approving invoice ${invoiceId}:`, error);
      }
    }
    
    res.json({ 
      message: `${invoiceIds.length} collection actions approved successfully`, 
      approvedActions,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Bulk approval error:', error);
    res.status(500).json({ 
      message: "Error bulk approving collection actions",
      error: error.message 
    });
  }
});

export default router;