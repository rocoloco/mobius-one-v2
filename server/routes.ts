import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { litellmService } from "./services/litellm";
import { salesforceService } from "./services/salesforce";
import { netsuiteService } from "./services/netsuite";
import { 
  insertUserSchema, 
  insertCustomerSchema, 
  insertInvoiceSchema, 
  insertCollectionActionSchema,
  insertDsoMetricSchema,
  insertSystemConnectionSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user (mock user for development)
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser(1); // Default user
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  // Collections Dashboard API
  app.get("/api/collections/metrics", async (req, res) => {
    try {
      const userId = 1; // Default user for demo
      const latestMetric = await storage.getLatestDsoMetric(userId);
      
      // Mock data for demonstration
      const metrics = {
        currentDso: latestMetric?.dsoValue || 54,
        targetDso: 38,
        workingCapitalFreed: latestMetric?.workingCapitalFreed || 127000,
        totalOverdue: 342000,
        pendingActions: 12,
        approvalRate: latestMetric?.approvalRate || 94,
        relationshipScore: latestMetric?.relationshipScore || 87
      };
      
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Error fetching metrics" });
    }
  });

  // Get overdue invoices with AI recommendations
  app.get("/api/collections/overdue-invoices", async (req, res) => {
    try {
      const userId = 1; // Default user for demo
      const overdueInvoices = await storage.getOverdueInvoices(userId, 30);
      
      // Mock data for demonstration - will be replaced with real data
      const mockInvoices = [
        {
          id: 1,
          invoiceNumber: 'INV-2024-001',
          customer: 'Acme Corp',
          amount: 15000,
          daysPastDue: 45,
          relationshipScore: 82,
          aiRecommendation: 'Send gentle reminder with payment plan options',
          recommendationConfidence: 94,
          approvalStatus: 'pending'
        },
        {
          id: 2,
          invoiceNumber: 'INV-2024-002', 
          customer: 'TechFlow Solutions',
          amount: 8500,
          daysPastDue: 32,
          relationshipScore: 91,
          aiRecommendation: 'Schedule follow-up call with account manager',
          recommendationConfidence: 87,
          approvalStatus: 'pending'
        },
        {
          id: 3,
          invoiceNumber: 'INV-2024-003',
          customer: 'StartupXYZ',
          amount: 22000,
          daysPastDue: 62,
          relationshipScore: 65,
          aiRecommendation: 'Escalate to finance team with payment deadline',
          recommendationConfidence: 78,
          approvalStatus: 'pending'
        }
      ];
      
      res.json(mockInvoices);
    } catch (error) {
      res.status(500).json({ message: "Error fetching overdue invoices" });
    }
  });

  // Approve collection action
  app.post("/api/collections/approve/:invoiceId", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.invoiceId);
      
      // Create a collection action record
      const action = await storage.createCollectionAction({
        invoiceId,
        actionType: 'reminder',
        strategy: 'gentle',
        emailContent: 'AI-generated reminder content',
        sentAt: new Date(),
        responseReceived: false,
        relationshipImpact: 0
      });
      
      // Update invoice status
      await storage.updateInvoice(invoiceId, {
        approvalStatus: 'approved',
        collectionStatus: 'in_progress',
        lastActionDate: new Date()
      });
      
      res.json({ message: "Collection action approved successfully", action });
    } catch (error) {
      res.status(500).json({ message: "Error approving collection action" });
    }
  });

  // Get customers
  app.get("/api/customers", async (req, res) => {
    try {
      const userId = 1; // Default user for demo
      const customers = await storage.getCustomersByUserId(userId);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching customers" });
    }
  });

  // Get DSO metrics history
  app.get("/api/dso-metrics", async (req, res) => {
    try {
      const userId = 1; // Default user for demo
      const metrics = await storage.getDsoMetricsByUserId(userId, 12);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Error fetching DSO metrics" });
    }
  });

  // System connections
  app.get("/api/systems", async (req, res) => {
    try {
      const userId = 1; // Default user for demo
      const connections = await storage.getSystemConnectionsByUserId(userId);
      
      // Mock data for demonstration
      const mockConnections = [
        {
          id: 1,
          userId: 1,
          systemType: 'salesforce',
          connectionStatus: 'active',
          lastSyncAt: new Date(),
          settings: { instanceUrl: 'https://demo.salesforce.com' }
        },
        {
          id: 2,
          userId: 1,
          systemType: 'netsuite',
          connectionStatus: 'active',
          lastSyncAt: new Date(),
          settings: { accountId: 'demo-account' }
        }
      ];
      
      res.json(mockConnections);
    } catch (error) {
      res.status(500).json({ message: "Error fetching system connections" });
    }
  });

  // Test Salesforce connection
  app.get("/api/test/salesforce", async (req, res) => {
    try {
      const result = await salesforceService.getTopOpportunities(5);
      res.json({ status: 'connected', data: result });
    } catch (error) {
      res.status(500).json({ 
        status: 'error', 
        message: 'Salesforce connection failed. Please check your credentials.' 
      });
    }
  });

  // Test NetSuite connection
  app.get("/api/test/netsuite", async (req, res) => {
    try {
      const result = await netsuiteService.getRevenueData('Q4');
      res.json({ status: 'connected', data: result });
    } catch (error) {
      res.status(500).json({ 
        status: 'error', 
        message: 'NetSuite connection failed. Please check your credentials.' 
      });
    }
  });

  // AI collection recommendation generation
  app.post("/api/collections/generate-recommendation", async (req, res) => {
    try {
      const { invoiceId, customerData, invoiceData } = req.body;
      
      const systemContext = `
        You are a collections AI assistant that generates relationship-preserving collection recommendations.
        
        Customer: ${customerData.name}
        Relationship Score: ${customerData.relationshipScore}/100
        Invoice Amount: $${invoiceData.amount}
        Days Past Due: ${invoiceData.daysPastDue}
        
        Generate a gentle but effective collection recommendation that preserves the customer relationship.
      `;
      
      const response = await litellmService.generateResponse([], systemContext);
      
      res.json({ 
        recommendation: response,
        confidence: Math.floor(Math.random() * 20) + 80 // Mock confidence score
      });
    } catch (error) {
      res.status(500).json({ message: "Error generating recommendation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}