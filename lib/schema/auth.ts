import { pgTable, text, timestamp, boolean, uuid, jsonb } from 'drizzle-orm/pg-core';

// User profiles table (extends Supabase auth.users)
export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(), // References auth.users.id
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatarUrl: text('avatar_url'),
  phoneNumber: text('phone_number'),
  
  // Role-based access control
  role: text('role').notNull().default('user'), // 'admin', 'manager', 'user'
  permissions: jsonb('permissions').default('{}'),
  
  // Company/organization info
  companyId: uuid('company_id'),
  department: text('department'),
  jobTitle: text('job_title'),
  
  // Security & compliance
  lastLoginAt: timestamp('last_login_at'),
  lastLoginIp: text('last_login_ip'),
  mfaEnabled: boolean('mfa_enabled').default(false),
  emailVerified: boolean('email_verified').default(false),
  
  // Account status
  isActive: boolean('is_active').default(true),
  isBlocked: boolean('is_blocked').default(false),
  blockReason: text('block_reason'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User sessions table for session management
export const userSessions = pgTable('user_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  sessionToken: text('session_token').notNull().unique(),
  
  // Session metadata
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  deviceFingerprint: text('device_fingerprint'),
  
  // Geographic info
  country: text('country'),
  city: text('city'),
  
  // Session status
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at').notNull(),
  
  // Security flags
  isSecure: boolean('is_secure').default(false), // HTTPS
  isSameSite: boolean('is_same_site').default(true),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  lastAccessedAt: timestamp('last_accessed_at').defaultNow(),
});

// Security events log for zero trust monitoring
export const securityEvents = pgTable('security_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  
  // Event details
  eventType: text('event_type').notNull(), // 'login', 'logout', 'password_change', 'suspicious_activity'
  eventData: jsonb('event_data').default('{}'),
  
  // Context
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  location: text('location'),
  
  // Risk assessment
  riskScore: text('risk_score').default('low'), // 'low', 'medium', 'high', 'critical'
  riskFactors: jsonb('risk_factors').default('[]'),
  
  // Action taken
  actionTaken: text('action_taken'), // 'allowed', 'blocked', 'requires_mfa'
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
});

// Companies/Organizations table
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  domain: text('domain'), // For email domain validation
  
  // Company settings
  settings: jsonb('settings').default('{}'),
  
  // Security policies
  mfaRequired: boolean('mfa_required').default(false),
  passwordPolicy: jsonb('password_policy').default('{}'),
  sessionTimeout: text('session_timeout').default('24h'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// OAuth providers table
export const oauthProviders = pgTable('oauth_providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  
  // Provider info
  provider: text('provider').notNull(), // 'google', 'github', 'microsoft'
  providerId: text('provider_id').notNull(), // External provider user ID
  
  // Provider data
  providerData: jsonb('provider_data').default('{}'),
  
  // Timestamps
  connectedAt: timestamp('connected_at').defaultNow(),
  lastUsedAt: timestamp('last_used_at'),
});

// Type exports for TypeScript
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type SecurityEvent = typeof securityEvents.$inferSelect;
export type NewSecurityEvent = typeof securityEvents.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type OAuthProvider = typeof oauthProviders.$inferSelect;
export type NewOAuthProvider = typeof oauthProviders.$inferInsert;