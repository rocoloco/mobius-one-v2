import type { Express } from "express";
import { createServer, type Server } from "http";
import helmet from "helmet";
import cors from "cors";
import session from "express-session";
import passport from "passport";
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
import { authenticateToken } from "./auth";
import authRoutes from "./routes/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Zero Trust Security Configuration
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:", "https:"],
        frameAncestors: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));

  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:5000', 'http://127.0.0.1:5000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Session configuration for OAuth
  app.use(session({
    secret: process.env.SESSION_SECRET || 'mobius-oauth-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Authentication routes (no auth required)
  app.use('/api/auth', authRoutes);

  // Create demo user if none exists
  app.get("/api/setup-demo", async (req, res) => {
    try {
      const existingUser = await storage.getUserByUsername("demo");
      if (!existingUser) {
        const { hashPassword } = await import("./auth");
        const passwordHash = await hashPassword("Demo123!");
        
        await storage.createUser({
          username: "demo",
          name: "Demo User",
          email: "demo@example.com",
          passwordHash,
          role: "user",
          companyName: "Demo Company",
          permissions: ["read", "write"],
          roles: ["user"]
        });
      }
      res.json({ message: "Demo user ready" });
    } catch (error) {
      console.error("Demo setup error:", error);
      res.status(500).json({ message: "Error setting up demo user" });
    }
  });

  // Get current user (protected route)
  app.get("/api/user", authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        role: user.role,
        permissions: user.permissions,
        roles: user.roles,
        lastActivity: user.lastActivity,
        riskScore: user.riskScore
      });
    } catch (error) {
      console.error("Error fetching user:", error);
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