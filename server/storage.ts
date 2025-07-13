import { 
  users, customers, invoices, collectionActions, dsoMetrics, systemConnections,
  sessions, auditLogs, securityAlerts,
  type User, type InsertUser, 
  type Customer, type InsertCustomer,
  type Invoice, type InsertInvoice,
  type CollectionAction, type InsertCollectionAction,
  type DsoMetric, type InsertDsoMetric,
  type SystemConnection, type InsertSystemConnection,
  type Session, type InsertSession,
  type AuditLog, type InsertAuditLog,
  type SecurityAlert, type InsertSecurityAlert
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Customers
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomersByUserId(userId: number): Promise<Customer[]>;
  getCustomerBySystemIds(userId: number, salesforceId?: string, netsuiteId?: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer | undefined>;

  // Invoices
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoicesByCustomerId(customerId: number): Promise<Invoice[]>;
  getOverdueInvoices(userId: number, minDaysPastDue?: number): Promise<Invoice[]>;
  getInvoicesByStatus(userId: number, status: string): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, updates: Partial<Invoice>): Promise<Invoice | undefined>;

  // Collection Actions
  getCollectionAction(id: number): Promise<CollectionAction | undefined>;
  getCollectionActionsByInvoiceId(invoiceId: number): Promise<CollectionAction[]>;
  getCollectionActionsByUserId(userId: number, limit?: number): Promise<CollectionAction[]>;
  createCollectionAction(action: InsertCollectionAction): Promise<CollectionAction>;
  updateCollectionAction(id: number, updates: Partial<CollectionAction>): Promise<CollectionAction | undefined>;

  // DSO Metrics
  getDsoMetric(id: number): Promise<DsoMetric | undefined>;
  getDsoMetricsByUserId(userId: number, limit?: number): Promise<DsoMetric[]>;
  getLatestDsoMetric(userId: number): Promise<DsoMetric | undefined>;
  createDsoMetric(metric: InsertDsoMetric): Promise<DsoMetric>;

  // System Connections
  getSystemConnection(userId: number, systemType: string): Promise<SystemConnection | undefined>;
  getSystemConnectionsByUserId(userId: number): Promise<SystemConnection[]>;
  createSystemConnection(connection: InsertSystemConnection): Promise<SystemConnection>;
  updateSystemConnection(id: number, updates: Partial<SystemConnection>): Promise<SystemConnection | undefined>;

  // Zero Trust Security Management
  // Sessions
  getSession(sessionId: string): Promise<Session | undefined>;
  getSessionsByUserId(userId: number): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined>;
  revokeSession(sessionId: string): Promise<void>;
  revokeAllUserSessions(userId: number): Promise<void>;
  
  // Audit Logs
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;
  getAuditLogsByUserId(userId: number, limit?: number): Promise<AuditLog[]>;
  getAuditLogsByAction(action: string, limit?: number): Promise<AuditLog[]>;
  
  // Security Alerts
  createSecurityAlert(alert: InsertSecurityAlert): Promise<SecurityAlert>;
  getSecurityAlertsByUserId(userId: number, resolved?: boolean): Promise<SecurityAlert[]>;
  resolveSecurityAlert(id: number): Promise<SecurityAlert | undefined>;
  
  // Enhanced User Management
  incrementFailedLoginAttempts(userId: number): Promise<void>;
  resetFailedLoginAttempts(userId: number): Promise<void>;
  lockAccount(userId: number, lockDuration: number): Promise<void>;
  unlockAccount(userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Customers
  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomersByUserId(userId: number): Promise<Customer[]> {
    return await db.select().from(customers).where(eq(customers.userId, userId));
  }

  async getCustomerBySystemIds(userId: number, salesforceId?: string, netsuiteId?: string): Promise<Customer | undefined> {
    let query = db.select().from(customers).where(eq(customers.userId, userId));
    
    if (salesforceId) {
      query = query.where(eq(customers.salesforceId, salesforceId));
    }
    
    if (netsuiteId) {
      query = query.where(eq(customers.netsuiteId, netsuiteId));
    }
    
    const [customer] = await query;
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async updateCustomer(id: number, updates: Partial<Customer>): Promise<Customer | undefined> {
    const [customer] = await db
      .update(customers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return customer || undefined;
  }

  // Invoices
  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async getInvoicesByCustomerId(customerId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.customerId, customerId));
  }

  async getOverdueInvoices(userId: number, minDaysPastDue = 30): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(
        and(
          eq(customers.userId, userId),
          gte(invoices.daysPastDue, minDaysPastDue),
          eq(invoices.status, "overdue")
        )
      );
  }

  async getInvoicesByStatus(userId: number, status: string): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(
        and(
          eq(customers.userId, userId),
          eq(invoices.status, status)
        )
      );
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db
      .insert(invoices)
      .values(insertInvoice)
      .returning();
    return invoice;
  }

  async updateInvoice(id: number, updates: Partial<Invoice>): Promise<Invoice | undefined> {
    const [invoice] = await db
      .update(invoices)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return invoice || undefined;
  }

  // Collection Actions
  async getCollectionAction(id: number): Promise<CollectionAction | undefined> {
    const [action] = await db.select().from(collectionActions).where(eq(collectionActions.id, id));
    return action || undefined;
  }

  async getCollectionActionsByInvoiceId(invoiceId: number): Promise<CollectionAction[]> {
    return await db
      .select()
      .from(collectionActions)
      .where(eq(collectionActions.invoiceId, invoiceId))
      .orderBy(desc(collectionActions.createdAt));
  }

  async getCollectionActionsByUserId(userId: number, limit = 50): Promise<CollectionAction[]> {
    return await db
      .select()
      .from(collectionActions)
      .innerJoin(invoices, eq(collectionActions.invoiceId, invoices.id))
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(eq(customers.userId, userId))
      .orderBy(desc(collectionActions.createdAt))
      .limit(limit);
  }

  async createCollectionAction(insertAction: InsertCollectionAction): Promise<CollectionAction> {
    const [action] = await db
      .insert(collectionActions)
      .values(insertAction)
      .returning();
    return action;
  }

  async updateCollectionAction(id: number, updates: Partial<CollectionAction>): Promise<CollectionAction | undefined> {
    const [action] = await db
      .update(collectionActions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(collectionActions.id, id))
      .returning();
    return action || undefined;
  }

  // DSO Metrics
  async getDsoMetric(id: number): Promise<DsoMetric | undefined> {
    const [metric] = await db.select().from(dsoMetrics).where(eq(dsoMetrics.id, id));
    return metric || undefined;
  }

  async getDsoMetricsByUserId(userId: number, limit = 12): Promise<DsoMetric[]> {
    return await db
      .select()
      .from(dsoMetrics)
      .where(eq(dsoMetrics.userId, userId))
      .orderBy(desc(dsoMetrics.createdAt))
      .limit(limit);
  }

  async getLatestDsoMetric(userId: number): Promise<DsoMetric | undefined> {
    const [metric] = await db
      .select()
      .from(dsoMetrics)
      .where(eq(dsoMetrics.userId, userId))
      .orderBy(desc(dsoMetrics.createdAt))
      .limit(1);
    return metric || undefined;
  }

  async createDsoMetric(insertMetric: InsertDsoMetric): Promise<DsoMetric> {
    const [metric] = await db
      .insert(dsoMetrics)
      .values(insertMetric)
      .returning();
    return metric;
  }

  // System Connections
  async getSystemConnection(userId: number, systemType: string): Promise<SystemConnection | undefined> {
    const [connection] = await db
      .select()
      .from(systemConnections)
      .where(
        and(
          eq(systemConnections.userId, userId),
          eq(systemConnections.systemType, systemType)
        )
      );
    return connection || undefined;
  }

  async getSystemConnectionsByUserId(userId: number): Promise<SystemConnection[]> {
    return await db.select().from(systemConnections).where(eq(systemConnections.userId, userId));
  }

  async createSystemConnection(insertConnection: InsertSystemConnection): Promise<SystemConnection> {
    const [connection] = await db
      .insert(systemConnections)
      .values(insertConnection)
      .returning();
    return connection;
  }

  async updateSystemConnection(id: number, updates: Partial<SystemConnection>): Promise<SystemConnection | undefined> {
    const [connection] = await db
      .update(systemConnections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(systemConnections.id, id))
      .returning();
    return connection || undefined;
  }

  // Zero Trust Security Implementation
  // Sessions
  async getSession(sessionId: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.sessionId, sessionId));
    return session || undefined;
  }

  async getSessionsByUserId(userId: number): Promise<Session[]> {
    return await db.select().from(sessions).where(eq(sessions.userId, userId));
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined> {
    const [session] = await db
      .update(sessions)
      .set(updates)
      .where(eq(sessions.id, id))
      .returning();
    return session || undefined;
  }

  async revokeSession(sessionId: string): Promise<void> {
    await db
      .update(sessions)
      .set({ isRevoked: true, revokedAt: new Date() })
      .where(eq(sessions.sessionId, sessionId));
  }

  async revokeAllUserSessions(userId: number): Promise<void> {
    await db
      .update(sessions)
      .set({ isRevoked: true, revokedAt: new Date() })
      .where(eq(sessions.userId, userId));
  }

  // Audit Logs
  async createAuditLog(insertAuditLog: InsertAuditLog): Promise<AuditLog> {
    const [auditLog] = await db
      .insert(auditLogs)
      .values(insertAuditLog)
      .returning();
    return auditLog;
  }

  async getAuditLogsByUserId(userId: number, limit = 100): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
  }

  async getAuditLogsByAction(action: string, limit = 100): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.action, action))
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
  }

  // Security Alerts
  async createSecurityAlert(insertAlert: InsertSecurityAlert): Promise<SecurityAlert> {
    const [alert] = await db
      .insert(securityAlerts)
      .values(insertAlert)
      .returning();
    return alert;
  }

  async getSecurityAlertsByUserId(userId: number, resolved?: boolean): Promise<SecurityAlert[]> {
    let query = db.select().from(securityAlerts).where(eq(securityAlerts.userId, userId));
    
    if (resolved !== undefined) {
      query = query.where(eq(securityAlerts.resolved, resolved));
    }
    
    return await query.orderBy(desc(securityAlerts.createdAt));
  }

  async resolveSecurityAlert(id: number): Promise<SecurityAlert | undefined> {
    const [alert] = await db
      .update(securityAlerts)
      .set({ resolved: true, resolvedAt: new Date() })
      .where(eq(securityAlerts.id, id))
      .returning();
    return alert || undefined;
  }

  // Enhanced User Management
  async incrementFailedLoginAttempts(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        failedLoginAttempts: sql`failed_login_attempts + 1`
      })
      .where(eq(users.id, userId));
  }

  async resetFailedLoginAttempts(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        failedLoginAttempts: 0
      })
      .where(eq(users.id, userId));
  }

  async lockAccount(userId: number, lockDuration: number): Promise<void> {
    const lockoutUntil = new Date(Date.now() + lockDuration * 60 * 1000);
    await db
      .update(users)
      .set({ 
        accountLocked: true,
        lockoutUntil
      })
      .where(eq(users.id, userId));
  }

  async unlockAccount(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        accountLocked: false,
        lockoutUntil: null,
        failedLoginAttempts: 0
      })
      .where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();