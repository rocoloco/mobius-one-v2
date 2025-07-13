import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  decimal,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  name: text("name"),
  role: text("role").default("user"),
  initials: text("initials").notNull(),
  email: varchar("email", { length: 255 }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 100 }),
  permissions: text("permissions").array().default(["read", "write"]),
  roles: text("roles").array().default(["user"]),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  accountLocked: boolean("account_locked").default(false),
  lockoutUntil: timestamp("lockout_until"),
  lastActivity: timestamp("last_activity"),
  riskScore: integer("risk_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  salesforceId: varchar("salesforce_id", { length: 50 }),
  netsuiteId: varchar("netsuite_id", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  industry: varchar("industry", { length: 100 }),
  customerType: varchar("customer_type", { length: 50 }).default("standard"),
  lifetimeValue: decimal("lifetime_value", { precision: 12, scale: 2 }),
  relationshipScore: integer("relationship_score").default(50), // 0-100
  churnRisk: integer("churn_risk").default(0), // 0-100
  expansionOpportunity: integer("expansion_opportunity").default(0), // 0-100
  lastPaymentDate: timestamp("last_payment_date"),
  averagePaymentDays: integer("average_payment_days").default(30),
  totalOverdueAmount: decimal("total_overdue_amount", { precision: 12, scale: 2 }).default('0'),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  netsuiteId: varchar("netsuite_id", { length: 50 }),
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: varchar("status", { length: 50 }).default("open"), // open, paid, overdue
  daysPastDue: integer("days_past_due").default(0),
  collectionStatus: varchar("collection_status", { length: 50 }).default("pending"), // pending, in_progress, completed
  aiRecommendation: text("ai_recommendation"),
  recommendationConfidence: integer("recommendation_confidence"), // 0-100
  approvalStatus: varchar("approval_status", { length: 50 }).default("pending"), // pending, approved, rejected
  lastActionDate: timestamp("last_action_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const collectionActions = pgTable("collection_actions", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  actionType: varchar("action_type", { length: 50 }).notNull(), // reminder, escalation, call
  strategy: varchar("strategy", { length: 50 }).notNull(), // gentle, standard, urgent
  emailContent: text("email_content"),
  sentAt: timestamp("sent_at"),
  responseReceived: boolean("response_received").default(false),
  responseContent: text("response_content"),
  outcomeType: varchar("outcome_type", { length: 50 }), // payment, partial_payment, promise, no_response
  outcomeAmount: decimal("outcome_amount", { precision: 12, scale: 2 }),
  daysToPay: integer("days_to_pay"),
  relationshipImpact: integer("relationship_impact"), // -10 to +10
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dsoMetrics = pgTable("dso_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  dsoValue: decimal("dso_value", { precision: 8, scale: 2 }).notNull(),
  totalReceivables: decimal("total_receivables", { precision: 12, scale: 2 }).notNull(),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).notNull(),
  workingCapitalFreed: decimal("working_capital_freed", { precision: 12, scale: 2 }).default('0'),
  aiActionsCount: integer("ai_actions_count").default(0),
  approvalRate: decimal("approval_rate", { precision: 5, scale: 2 }).default('0'),
  relationshipScore: integer("relationship_score").default(100), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemConnections = pgTable("system_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  systemType: varchar("system_type", { length: 50 }).notNull(), // 'salesforce' or 'netsuite'
  connectionStatus: varchar("connection_status", { length: 20 }).default("active"),
  lastSyncAt: timestamp("last_sync_at"),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zero Trust Security Tables
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).unique().notNull(),
  userId: integer("user_id").references(() => users.id),
  deviceFingerprint: varchar("device_fingerprint", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  riskScore: integer("risk_score").default(0),
  mfaVerified: boolean("mfa_verified").default(false),
  lastActivity: timestamp("last_activity").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  isRevoked: boolean("is_revoked").default(false),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: varchar("session_id", { length: 255 }),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  riskScore: integer("risk_score"),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const securityAlerts = pgTable("security_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  alertType: varchar("alert_type", { length: 50 }).notNull(), // suspicious_login, high_risk, etc
  severity: varchar("severity", { length: 20 }).default("medium"), // low, medium, high, critical
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  initials: true,
  email: true,
  passwordHash: true,
  role: true,
  companyName: true,
  permissions: true,
  roles: true,
  failedLoginAttempts: true,
  accountLocked: true,
  riskScore: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  sessionId: true,
  userId: true,
  deviceFingerprint: true,
  ipAddress: true,
  userAgent: true,
  riskScore: true,
  mfaVerified: true,
  expiresAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).pick({
  userId: true,
  sessionId: true,
  action: true,
  resource: true,
  ipAddress: true,
  userAgent: true,
  riskScore: true,
  success: true,
  errorMessage: true,
  metadata: true,
});

export const insertSecurityAlertSchema = createInsertSchema(securityAlerts).pick({
  userId: true,
  alertType: true,
  severity: true,
  message: true,
  metadata: true,
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  userId: true,
  salesforceId: true,
  netsuiteId: true,
  name: true,
  email: true,
  phone: true,
  industry: true,
  customerType: true,
  lifetimeValue: true,
  relationshipScore: true,
  churnRisk: true,
  expansionOpportunity: true,
  lastPaymentDate: true,
  averagePaymentDays: true,
  totalOverdueAmount: true,
  settings: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  customerId: true,
  netsuiteId: true,
  invoiceNumber: true,
  amount: true,
  dueDate: true,
  status: true,
  daysPastDue: true,
  collectionStatus: true,
  aiRecommendation: true,
  recommendationConfidence: true,
  approvalStatus: true,
  lastActionDate: true,
});

export const insertCollectionActionSchema = createInsertSchema(collectionActions).pick({
  invoiceId: true,
  actionType: true,
  strategy: true,
  emailContent: true,
  sentAt: true,
  responseReceived: true,
  responseContent: true,
  outcomeType: true,
  outcomeAmount: true,
  daysToPay: true,
  relationshipImpact: true,
});

export const insertDsoMetricSchema = createInsertSchema(dsoMetrics).pick({
  userId: true,
  periodStart: true,
  periodEnd: true,
  dsoValue: true,
  totalReceivables: true,
  totalRevenue: true,
  workingCapitalFreed: true,
  aiActionsCount: true,
  approvalRate: true,
  relationshipScore: true,
});

export const insertSystemConnectionSchema = createInsertSchema(systemConnections).pick({
  userId: true,
  systemType: true,
  connectionStatus: true,
  lastSyncAt: true,
  settings: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertCollectionAction = z.infer<typeof insertCollectionActionSchema>;
export type CollectionAction = typeof collectionActions.$inferSelect;
export type InsertDsoMetric = z.infer<typeof insertDsoMetricSchema>;
export type DsoMetric = typeof dsoMetrics.$inferSelect;
export type InsertSystemConnection = z.infer<typeof insertSystemConnectionSchema>;
export type SystemConnection = typeof systemConnections.$inferSelect;

// Security table types
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertSecurityAlert = z.infer<typeof insertSecurityAlertSchema>;
export type SecurityAlert = typeof securityAlerts.$inferSelect;

// Security table types
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertSecurityAlert = z.infer<typeof insertSecurityAlertSchema>;
export type SecurityAlert = typeof securityAlerts.$inferSelect;