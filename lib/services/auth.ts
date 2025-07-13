import { createClient } from '@supabase/supabase-js';
import { db } from '../db';
import { userProfiles, userSessions, securityEvents, type UserProfile, type NewUserProfile, type NewUserSession, type NewSecurityEvent } from '../schema/auth';
import { eq, and, gt } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Device fingerprinting for zero trust
export function generateDeviceFingerprint(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  
  const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;
  return Buffer.from(fingerprint).toString('base64');
}

// Risk assessment for zero trust
export function assessRisk(context: {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  previousLogins?: any[];
}): { score: 'low' | 'medium' | 'high' | 'critical'; factors: string[] } {
  const factors: string[] = [];
  let score: 'low' | 'medium' | 'high' | 'critical' = 'low';

  // Check for suspicious patterns
  if (context.ipAddress) {
    // Check for known malicious IPs (in production, use a threat intelligence service)
    if (context.ipAddress.startsWith('127.')) {
      factors.push('localhost_access');
    }
  }

  if (context.userAgent) {
    // Check for suspicious user agents
    if (context.userAgent.includes('bot') || context.userAgent.includes('crawler')) {
      factors.push('suspicious_user_agent');
      score = 'high';
    }
  }

  // Check for unusual login patterns
  if (context.previousLogins && context.previousLogins.length > 0) {
    // Check for rapid login attempts
    const recentLogins = context.previousLogins.filter(
      login => new Date().getTime() - new Date(login.createdAt).getTime() < 5 * 60 * 1000
    );
    
    if (recentLogins.length > 5) {
      factors.push('rapid_login_attempts');
      score = 'critical';
    }
  }

  return { score, factors };
}

// Log security events
export async function logSecurityEvent(event: NewSecurityEvent) {
  try {
    await db.insert(securityEvents).values(event);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Authentication service class
export class AuthService {
  // Sign up with email/password
  static async signUp(email: string, password: string, metadata: {
    firstName?: string;
    lastName?: string;
    companyId?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: metadata.firstName,
            last_name: metadata.lastName,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Create user profile
      const profileData: NewUserProfile = {
        userId: authData.user.id,
        email: authData.user.email!,
        firstName: metadata.firstName,
        lastName: metadata.lastName,
        companyId: metadata.companyId,
        emailVerified: false,
        isActive: true,
      };

      const [profile] = await db.insert(userProfiles).values(profileData).returning();

      // Log security event
      await logSecurityEvent({
        userId: authData.user.id,
        eventType: 'signup',
        eventData: { email, method: 'email' },
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        riskScore: 'low',
        actionTaken: 'allowed',
      });

      return { user: authData.user, profile, session: authData.session };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // Sign in with email/password
  static async signIn(email: string, password: string, context: {
    ipAddress?: string;
    userAgent?: string;
    deviceFingerprint?: string;
  }) {
    try {
      // Assess risk before authentication
      const riskAssessment = assessRisk({
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      // Block if risk is critical
      if (riskAssessment.score === 'critical') {
        await logSecurityEvent({
          eventType: 'login_blocked',
          eventData: { email, reason: 'high_risk' },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          riskScore: riskAssessment.score,
          riskFactors: riskAssessment.factors,
          actionTaken: 'blocked',
        });
        throw new Error('Access denied due to security concerns');
      }

      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        await logSecurityEvent({
          eventType: 'login_failed',
          eventData: { email, error: authError.message },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          riskScore: riskAssessment.score,
          actionTaken: 'blocked',
        });
        throw authError;
      }

      if (!authData.user) throw new Error('Authentication failed');

      // Get user profile
      const [profile] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, authData.user.id));

      if (!profile) throw new Error('User profile not found');

      // Check if user is active
      if (!profile.isActive || profile.isBlocked) {
        await logSecurityEvent({
          userId: authData.user.id,
          eventType: 'login_blocked',
          eventData: { email, reason: 'account_disabled' },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          riskScore: 'high',
          actionTaken: 'blocked',
        });
        throw new Error('Account is disabled');
      }

      // Create session
      const sessionData: NewUserSession = {
        userId: authData.user.id,
        sessionToken: randomUUID(),
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        deviceFingerprint: context.deviceFingerprint,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isSecure: true,
        isSameSite: true,
      };

      const [session] = await db.insert(userSessions).values(sessionData).returning();

      // Update user profile
      await db
        .update(userProfiles)
        .set({
          lastLoginAt: new Date(),
          lastLoginIp: context.ipAddress,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, authData.user.id));

      // Log successful login
      await logSecurityEvent({
        userId: authData.user.id,
        eventType: 'login_success',
        eventData: { email, method: 'email' },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        riskScore: riskAssessment.score,
        actionTaken: 'allowed',
      });

      return { user: authData.user, profile, session, authSession: authData.session };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Google OAuth sign in
  static async signInWithGoogle(context: {
    ipAddress?: string;
    userAgent?: string;
    deviceFingerprint?: string;
  }) {
    try {
      // Assess risk
      const riskAssessment = assessRisk({
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      if (riskAssessment.score === 'critical') {
        await logSecurityEvent({
          eventType: 'oauth_blocked',
          eventData: { provider: 'google', reason: 'high_risk' },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          riskScore: riskAssessment.score,
          riskFactors: riskAssessment.factors,
          actionTaken: 'blocked',
        });
        throw new Error('Access denied due to security concerns');
      }

      // Initiate Google OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        await logSecurityEvent({
          eventType: 'oauth_failed',
          eventData: { provider: 'google', error: error.message },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          riskScore: riskAssessment.score,
          actionTaken: 'blocked',
        });
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  // Validate session
  static async validateSession(sessionToken: string, context: {
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      // Find session
      const [session] = await db
        .select()
        .from(userSessions)
        .where(
          and(
            eq(userSessions.sessionToken, sessionToken),
            eq(userSessions.isActive, true),
            gt(userSessions.expiresAt, new Date())
          )
        );

      if (!session) {
        await logSecurityEvent({
          eventType: 'session_invalid',
          eventData: { reason: 'not_found_or_expired' },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          riskScore: 'medium',
          actionTaken: 'blocked',
        });
        return null;
      }

      // Get user profile
      const [profile] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, session.userId));

      if (!profile || !profile.isActive || profile.isBlocked) {
        await logSecurityEvent({
          userId: session.userId,
          eventType: 'session_invalid',
          eventData: { reason: 'user_inactive' },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          riskScore: 'high',
          actionTaken: 'blocked',
        });
        return null;
      }

      // Update session last accessed
      await db
        .update(userSessions)
        .set({ lastAccessedAt: new Date() })
        .where(eq(userSessions.id, session.id));

      return { session, profile };
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  // Sign out
  static async signOut(sessionToken: string, context: {
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      // Deactivate session
      const [session] = await db
        .update(userSessions)
        .set({ isActive: false })
        .where(eq(userSessions.sessionToken, sessionToken))
        .returning();

      if (session) {
        await logSecurityEvent({
          userId: session.userId,
          eventType: 'logout',
          eventData: { method: 'manual' },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          riskScore: 'low',
          actionTaken: 'allowed',
        });
      }

      // Sign out from Supabase
      await supabase.auth.signOut();

      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    try {
      const [profile] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId));

      return profile;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }
}

// Middleware helper for zero trust validation
export async function validateRequest(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value;
  
  if (!sessionToken) {
    return { valid: false, user: null, profile: null };
  }

  const context = {
    ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  };

  const result = await AuthService.validateSession(sessionToken, context);
  
  if (!result) {
    return { valid: false, user: null, profile: null };
  }

  return { valid: true, user: result.session, profile: result.profile };
}