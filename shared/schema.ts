import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  initials: text("initials").notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  systemSource: text("system_source"), // 'salesforce', 'netsuite', null
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemConnections = pgTable("system_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  systemType: text("system_type").notNull(), // 'salesforce' or 'netsuite'
  isConnected: boolean("is_connected").default(false).notNull(),
  lastSync: timestamp("last_sync"),
  connectionData: text("connection_data"), // JSON string for connection details
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
  initials: true,
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  userId: true,
  title: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  content: true,
  role: true,
  systemSource: true,
  metadata: true,
});

export const insertSystemConnectionSchema = createInsertSchema(systemConnections).pick({
  userId: true,
  systemType: true,
  isConnected: true,
  connectionData: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertSystemConnection = z.infer<typeof insertSystemConnectionSchema>;
export type SystemConnection = typeof systemConnections.$inferSelect;
