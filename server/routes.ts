import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { litellmService } from "./services/litellm";
import { salesforceService } from "./services/salesforce";
import { netsuiteService } from "./services/netsuite";
import { insertMessageSchema, insertConversationSchema } from "@shared/schema";

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

  // Get conversations for user
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversationsByUserId(1); // Default user
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching conversations" });
    }
  });

  // Create new conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const result = insertConversationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid conversation data" });
      }

      const conversation = await storage.createConversation({
        userId: 1, // Default user
        title: result.data.title
      });

      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Error creating conversation" });
    }
  });

  // Get messages for conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getMessagesByConversationId(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  // Send message and get AI response
  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const result = insertMessageSchema.safeParse({
        ...req.body,
        conversationId,
        role: 'user'
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid message data" });
      }

      // Create user message
      const userMessage = await storage.createMessage(result.data);

      // Get conversation history
      const messages = await storage.getMessagesByConversationId(conversationId);
      const conversationHistory = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      // Determine if we need system data
      let systemData = null;
      const messageText = result.data.content.toLowerCase();
      
      if (messageText.includes('salesforce') || messageText.includes('opportunity') || messageText.includes('pipeline')) {
        try {
          systemData = await salesforceService.getTopOpportunities(5);
        } catch (error) {
          console.error('Error fetching Salesforce data:', error);
        }
      } else if (messageText.includes('netsuite') || messageText.includes('revenue') || messageText.includes('financial')) {
        try {
          systemData = await netsuiteService.getRevenueData();
        } catch (error) {
          console.error('Error fetching NetSuite data:', error);
        }
      }

      // Generate AI response
      const aiResponse = await litellmService.generateContextualResponse(
        result.data.content,
        conversationHistory.slice(-10), // Last 10 messages for context
        systemData
      );

      // Create AI message
      const aiMessage = await storage.createMessage({
        conversationId,
        content: aiResponse.content,
        role: 'assistant',
        systemSource: aiResponse.systemSource || null,
        metadata: systemData ? JSON.stringify(systemData) : null
      });

      // Update conversation timestamp
      await storage.updateConversation(conversationId, {
        updatedAt: new Date()
      });

      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error('Error processing message:', error);
      res.status(500).json({ message: "Error processing message" });
    }
  });

  // Get system connections status
  app.get("/api/systems", async (req, res) => {
    try {
      const connections = await storage.getSystemConnectionsByUserId(1); // Default user
      
      // If no connections exist, create default ones
      if (connections.length === 0) {
        await storage.createSystemConnection({
          userId: 1,
          systemType: 'salesforce',
          isConnected: true,
          connectionData: JSON.stringify({ status: 'connected' })
        });
        
        await storage.createSystemConnection({
          userId: 1,
          systemType: 'netsuite',
          isConnected: true,
          connectionData: JSON.stringify({ status: 'connected' })
        });

        const newConnections = await storage.getSystemConnectionsByUserId(1);
        return res.json(newConnections);
      }

      res.json(connections);
    } catch (error) {
      res.status(500).json({ message: "Error fetching system connections" });
    }
  });

  // Test Salesforce connection
  app.get("/api/salesforce/test", async (req, res) => {
    try {
      const opportunities = await salesforceService.getTopOpportunities(3);
      res.json({ status: 'connected', data: opportunities });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to connect to Salesforce' });
    }
  });

  // Test NetSuite connection
  app.get("/api/netsuite/test", async (req, res) => {
    try {
      const revenueData = await netsuiteService.getRevenueData();
      res.json({ status: 'connected', data: revenueData });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to connect to NetSuite' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
