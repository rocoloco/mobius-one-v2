    import { Router } from 'express';
    import { storage } from '../storage';
    import { scoringService } from '../services/scoringService';
    import { routingService } from '../services/routing-service';
    import { recommendationService } from '../services/recommendation-service';
    import { AIService } from '../services/aiService';

    const router = Router();

    // Create strategic demo scenarios instead of random data
    const createDemoScenarios = () => {
      return [
        // LOW RISK SCENARIOS (Score 70+) - GPT-4o Mini, friendly tone
        {
          id: 1,
          customer: 'Acme Corporation',
          contactName: 'Sarah Johnson',
          totalAmount: 45000,
          daysPastDue: 12,
          relationshipScore: 85,
          invoiceNumber: 'INV-2024-1247',
          expectedRisk: 'low'
        },
        {
          id: 2,
          customer: 'TechStart Solutions',
          contactName: 'Mike Chen',
          totalAmount: 8500,
          daysPastDue: 8,
          relationshipScore: 78,
          invoiceNumber: 'INV-2024-1203',
          expectedRisk: 'low'
        },
        {
          id: 3,
          customer: 'Innovation Labs',
          contactName: 'Emma Wilson',
          totalAmount: 15000,
          daysPastDue: 18,
          relationshipScore: 72,
          invoiceNumber: 'INV-2024-1189',
          expectedRisk: 'low'
        },

        // MEDIUM RISK SCENARIOS (Score 40-69) - Claude 3.5 Sonnet, professional tone
        {
          id: 4,
          customer: 'GlobalTech Industries',
          contactName: 'Lisa Rodriguez',
          totalAmount: 32000,
          daysPastDue: 35,
          relationshipScore: 58,
          invoiceNumber: 'INV-2024-1156',
          expectedRisk: 'medium'
        },
        {
          id: 5,
          customer: 'Retail Plus LLC',
          contactName: 'David Park',
          totalAmount: 22000,
          daysPastDue: 42,
          relationshipScore: 52,
          invoiceNumber: 'INV-2024-1089',
          expectedRisk: 'medium'
        },
        {
          id: 6,
          customer: 'MidMarket Systems',
          contactName: 'Jennifer Walsh',
          totalAmount: 18500,
          daysPastDue: 28,
          relationshipScore: 48,
          invoiceNumber: 'INV-2024-1134',
          expectedRisk: 'medium'
        },
        {
          id: 7,
          customer: 'Business Dynamics',
          contactName: 'Robert Kim',
          totalAmount: 27000,
          daysPastDue: 38,
          relationshipScore: 45,
          invoiceNumber: 'INV-2024-1067',
          expectedRisk: 'medium'
        },

        // HIGH RISK SCENARIOS (Score <40) - Claude Opus, firm/urgent tone
        {
          id: 8,
          customer: 'Legacy Systems Inc',
          contactName: 'Patricia Brown',
          totalAmount: 75000,
          daysPastDue: 68,
          relationshipScore: 32,
          invoiceNumber: 'INV-2024-0945',
          expectedRisk: 'high'
        },
        {
          id: 9,
          customer: 'Budget Solutions Co',
          contactName: 'Mark Thompson',
          totalAmount: 12000,
          daysPastDue: 85,
          relationshipScore: 25,
          invoiceNumber: 'INV-2024-0823',
          expectedRisk: 'high'
        },
        {
          id: 10,
          customer: 'Problematic Corp',
          contactName: 'Sandra Davis',
          totalAmount: 95000,
          daysPastDue: 92,
          relationshipScore: 18,
          invoiceNumber: 'INV-2024-0756',
          expectedRisk: 'high'
        }
      ];
    };

    /**
     * GET /api/collections/overdue-invoices  
     * Get strategic demo overdue invoices that showcase AI routing
     */
    router.get('/overdue-invoices', async (req, res) => {
      try {
        // Use strategic demo scenarios instead of random generation
        const demoScenarios = createDemoScenarios();

        // Create corresponding customer data
        const mockCustomers = demoScenarios.map(scenario => ({
          id: scenario.id,
          name: scenario.customer,
          contactName: scenario.contactName,
          email: `finance@${scenario.customer.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          relationshipScore: scenario.relationshipScore,
          createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
          averagePaymentDays: Math.floor(Math.random() * 30) + 15, // 15-45 days
          totalOverdueAmount: scenario.totalAmount
        }));

        // Create invoice data with proper structure
        const mockInvoices = demoScenarios.map(scenario => ({
          id: scenario.id,
          customerId: scenario.id,
          invoiceNumber: scenario.invoiceNumber,
          totalAmount: scenario.totalAmount,
          dueDate: new Date(Date.now() - (scenario.daysPastDue * 24 * 60 * 60 * 1000)),
          daysPastDue: scenario.daysPastDue,
          approvalStatus: 'pending'
        }));

        // Calculate proper scores using the scoring service
        const demoInvoices = mockInvoices.map(invoice => {
          const customer = mockCustomers.find(c => c.id === invoice.customerId);
          const scenario = demoScenarios.find(s => s.id === invoice.id);

          if (customer && scenario) {
            // Use the scoring service to validate, but fall back to our strategic scores
            try {
              const scoreResult = scoringService.calculateRelationshipScore(customer as any, invoice as any);
              return {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                customer: customer.name,
                contactName: customer.contactName,
                amount: invoice.totalAmount,
                daysPastDue: invoice.daysPastDue,
                relationshipScore: scenario.relationshipScore, // Use strategic score
                aiRecommendation: scoreResult.recommendation || 'Analyzing...',
                recommendationConfidence: scoreResult.confidence || 75,
                approvalStatus: invoice.approvalStatus,
                riskLevel: scenario.expectedRisk, // Use strategic risk level
                customerId: invoice.customerId
              };
            } catch (error) {
              console.error('Scoring service error, using strategic values:', error);
              return {
                id: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                customer: customer.name,
                contactName: customer.contactName,
                amount: invoice.totalAmount,
                daysPastDue: invoice.daysPastDue,
                relationshipScore: scenario.relationshipScore,
                aiRecommendation: 'Analyzing...',
                recommendationConfidence: 75,
                approvalStatus: invoice.approvalStatus,
                riskLevel: scenario.expectedRisk,
                customerId: invoice.customerId
              };
            }
          }
          return invoice;
        });

        console.log(`Returning ${demoInvoices.length} strategic demo invoices with proper AI routing distribution`);
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