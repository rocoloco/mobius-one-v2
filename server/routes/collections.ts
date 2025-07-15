import { Router } from 'express';
import { storage } from '../storage';
import { scoringService } from '../services/scoringService';
import { routingService } from '../services/routing-service';
import { recommendationService } from '../services/recommendation-service';
import { AIService } from '../services/aiService';

const router = Router();

// Generate random invoices with varied risk profiles
const generateRandomInvoice = (id: number) => {
  const companies = ["TechFlow", "DataCorp", "CloudSys", "StartupABC", "MegaCorp", "SmallBiz"];
  const names = ["Sarah Johnson", "Michael Chen", "Lisa Wang", "David Park", "Emma Wilson"];
  
  // Generate varied risk profiles
  const riskType = Math.random();
  let amount, daysPastDue, relationshipScore;
  
  if (riskType < 0.4) { // 40% low risk
    amount = Math.floor(Math.random() * 20000) + 5000; // $5K-25K
    daysPastDue = Math.floor(Math.random() * 25) + 10; // 10-35 days
    relationshipScore = Math.floor(Math.random() * 30) + 70; // 70-100
  } else if (riskType < 0.7) { // 30% medium risk  
    amount = Math.floor(Math.random() * 75000) + 25000; // $25K-100K
    daysPastDue = Math.floor(Math.random() * 30) + 30; // 30-60 days
    relationshipScore = Math.floor(Math.random() * 30) + 40; // 40-70
  } else { // 30% high risk
    amount = Math.floor(Math.random() * 100000) + 50000; // $50K-150K
    daysPastDue = Math.floor(Math.random() * 40) + 60; // 60-100 days
    relationshipScore = Math.floor(Math.random() * 40) + 5; // 5-45
  }
  
  return {
    id,
    customer: companies[Math.floor(Math.random() * companies.length)],
    contactName: names[Math.floor(Math.random() * names.length)],
    totalAmount: amount,
    daysPastDue,
    relationshipScore,
    invoiceNumber: `INV-2024-${String(id).padStart(3, '0')}`
  };
};

/**
 * GET /api/collections/overdue-invoices  
 * Get demo overdue invoices for testing
 */
router.get('/overdue-invoices', async (req, res) => {
  try {
    // Generate 10 random invoices with varied risk profiles
    const randomInvoices = Array.from({ length: 10 }, (_, i) => generateRandomInvoice(i + 1));
    
    // Create corresponding customer data
    const mockCustomers = randomInvoices.map(invoice => ({
      id: invoice.id,
      name: invoice.customer,
      contactName: invoice.contactName,
      email: `finance@${invoice.customer.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      relationshipScore: invoice.relationshipScore,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
      averagePaymentDays: Math.floor(Math.random() * 30) + 15, // 15-45 days
      totalOverdueAmount: invoice.totalAmount
    }));
    
    // Create invoice data with proper structure
    const mockInvoices = randomInvoices.map(invoice => ({
      id: invoice.id,
      customerId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount,
      dueDate: new Date(Date.now() - (invoice.daysPastDue * 24 * 60 * 60 * 1000)),
      daysPastDue: invoice.daysPastDue,
      approvalStatus: 'pending'
    }));
    
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
    
    if (!customer || !invoice) {
      return res.status(400).json({ 
        error: 'Both customer and invoice data are required' 
      });
    }

    console.log('Analyzing invoice:', invoice.id, 'for customer:', customer.name);
    
    // Use the real AI service for analysis
    const result = await AIService.analyzeInvoice(customer, invoice);
    
    console.log('Analysis complete for invoice:', invoice.id);
    
    res.json(result);
  } catch (error) {
    console.error('AI Analysis failed:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
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