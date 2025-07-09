import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Customers table - synced from Salesforce/NetSuite
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").notNull().unique(), // Salesforce/NetSuite ID
  name: text("name").notNull(),
  accountHealth: text("account_health"), // good, at-risk, churning
  lastActivityDate: timestamp("last_activity_date"),
  totalRevenue: numeric("total_revenue", { precision: 12, scale: 2 }),
  paymentHistory: jsonb("payment_history"), // Historical payment patterns
  source: text("source").notNull(), // 'salesforce' or 'netsuite'
  syncedAt: timestamp("synced_at").defaultNow().notNull(),
});

// Invoices table - synced from NetSuite
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  status: text("status").notNull(), // 'pending', 'overdue', 'paid', 'partial'
  daysOverdue: integer("days_overdue").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  syncedAt: timestamp("synced_at").defaultNow().notNull(),
});

// Collection recommendations from AI
export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  customerId: integer("customer_id").references(() => customers.id),
  strategy: text("strategy").notNull(), // 'gentle_reminder', 'urgent_notice', 'personal_outreach'
  confidenceScore: integer("confidence_score").notNull(), // 0-100
  riskAssessment: text("risk_assessment"), // Analysis of relationship risk
  draftContent: text("draft_content").notNull(), // AI-generated email/message
  reasoning: text("reasoning").notNull(), // Why this approach was chosen
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: text("status").default('pending').notNull(), // 'pending', 'approved', 'rejected', 'executed'
});

// Human approvals and actions
export const approvals = pgTable("approvals", {
  id: serial("id").primaryKey(),
  recommendationId: integer("recommendation_id").references(() => recommendations.id),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(), // 'approved', 'rejected', 'modified'
  modifiedContent: text("modified_content"), // If human edited the draft
  approvedAt: timestamp("approved_at").defaultNow().notNull(),
  executedAt: timestamp("executed_at"),
  outcome: text("outcome"), // 'sent', 'failed', 'customer_responded'
});

// Collection outcomes tracking
export const collectionOutcomes = pgTable("collection_outcomes", {
  id: serial("id").primaryKey(),
  recommendationId: integer("recommendation_id").references(() => recommendations.id),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  paymentReceived: boolean("payment_received").default(false),
  daysToPayment: integer("days_to_payment"),
  customerResponse: text("customer_response"), // positive, negative, none
  amountCollected: numeric("amount_collected", { precision: 12, scale: 2 }),
  collectedAt: timestamp("collected_at"),
  impactNotes: text("impact_notes"),
});

// DSO (Days Sales Outstanding) tracking
export const dsoMetrics = pgTable("dso_metrics", {
  id: serial("id").primaryKey(),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  currentDso: numeric("current_dso", { precision: 6, scale: 2 }).notNull(),
  previousDso: numeric("previous_dso", { precision: 6, scale: 2 }),
  improvement: numeric("improvement", { precision: 6, scale: 2 }),
  totalOutstanding: numeric("total_outstanding", { precision: 12, scale: 2 }),
  workingCapitalImpact: numeric("working_capital_impact", { precision: 12, scale: 2 }),
  invoiceCount: integer("invoice_count"),
});

// Configuration for collection rules
export const collectionConfig = pgTable("collection_config", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  firstReminderDays: integer("first_reminder_days").default(30),
  secondReminderDays: integer("second_reminder_days").default(45),
  escalationDays: integer("escalation_days").default(60),
  emailTemplates: jsonb("email_templates"),
  autoApproveThreshold: integer("auto_approve_threshold").default(90), // Confidence score
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Create insert schemas
export const insertCustomerSchema = createInsertSchema(customers);
export const insertInvoiceSchema = createInsertSchema(invoices);
export const insertRecommendationSchema = createInsertSchema(recommendations);
export const insertApprovalSchema = createInsertSchema(approvals);
export const insertCollectionOutcomeSchema = createInsertSchema(collectionOutcomes);
export const insertDsoMetricSchema = createInsertSchema(dsoMetrics);
export const insertCollectionConfigSchema = createInsertSchema(collectionConfig);

// Types
export type Customer = typeof customers.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Recommendation = typeof recommendations.$inferSelect;
export type Approval = typeof approvals.$inferSelect;
export type CollectionOutcome = typeof collectionOutcomes.$inferSelect;
export type DsoMetric = typeof dsoMetrics.$inferSelect;
export type CollectionConfig = typeof collectionConfig.$inferSelect;