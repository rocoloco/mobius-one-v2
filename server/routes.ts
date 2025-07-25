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
import collectionsRoutes from "./routes/collections";
import { scoringService } from "./services/scoringService";

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
  
  // Collections routes
  app.use('/api/collections', collectionsRoutes);

  // Lead capture endpoint for demo completion (no auth required)
  app.post('/api/leads', async (req, res) => {
    try {
      const { email, arrRange, source, timestamp } = req.body;
      
      // Validate required fields
      if (!email || !arrRange || !source) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Store lead data (in production, this would go to CRM/database)
      const leadData = {
        id: Date.now().toString(),
        email,
        arrRange,
        source,
        timestamp,
        status: 'new'
      };
      
      console.log('New lead captured:', leadData);
      
      res.json({ success: true, leadId: leadData.id });
    } catch (error) {
      console.error('Lead capture error:', error);
      res.status(500).json({ error: 'Failed to capture lead' });
    }
  });

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