import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { userProfiles, userSessions, oauthProviders, type NewUserProfile, type NewUserSession, type NewOAuthProvider } from '@/lib/schema/auth';
import { logSecurityEvent, generateDeviceFingerprint } from '@/lib/services/auth';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?error=missing_code`
      );
    }

    // Exchange code for session
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError || !sessionData.user) {
      console.error('OAuth callback error:', sessionError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?error=oauth_failed`
      );
    }

    const user = sessionData.user;
    const context = {
      ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      deviceFingerprint: generateDeviceFingerprint(request),
    };

    // Check if user profile exists
    let [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, user.id));

    // Create profile if it doesn't exist
    if (!profile) {
      const providerData = user.user_metadata;
      const profileData: NewUserProfile = {
        userId: user.id,
        email: user.email!,
        firstName: providerData.full_name?.split(' ')[0] || providerData.given_name,
        lastName: providerData.full_name?.split(' ').slice(1).join(' ') || providerData.family_name,
        avatarUrl: providerData.avatar_url || providerData.picture,
        emailVerified: user.email_confirmed_at ? true : false,
        isActive: true,
      };

      [profile] = await db.insert(userProfiles).values(profileData).returning();
    }

    // Check if user is active
    if (!profile.isActive || profile.isBlocked) {
      await logSecurityEvent({
        userId: user.id,
        eventType: 'oauth_blocked',
        eventData: { provider: 'google', reason: 'account_disabled' },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        riskScore: 'high',
        actionTaken: 'blocked',
      });

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?error=account_disabled`
      );
    }

    // Store OAuth provider info
    const provider = user.app_metadata.provider || 'google';
    const providerId = user.app_metadata.provider_id || user.id;

    // Check if OAuth provider record exists
    const existingProvider = await db
      .select()
      .from(oauthProviders)
      .where(eq(oauthProviders.userId, user.id))
      .limit(1);

    if (existingProvider.length === 0) {
      const oauthData: NewOAuthProvider = {
        userId: user.id,
        provider,
        providerId,
        providerData: user.user_metadata,
      };

      await db.insert(oauthProviders).values(oauthData);
    } else {
      // Update last used
      await db
        .update(oauthProviders)
        .set({ lastUsedAt: new Date() })
        .where(eq(oauthProviders.userId, user.id));
    }

    // Create session
    const sessionData_: NewUserSession = {
      userId: user.id,
      sessionToken: randomUUID(),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      deviceFingerprint: context.deviceFingerprint,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      isSecure: true,
      isSameSite: true,
    };

    const [session] = await db.insert(userSessions).values(sessionData_).returning();

    // Update user profile
    await db
      .update(userProfiles)
      .set({
        lastLoginAt: new Date(),
        lastLoginIp: context.ipAddress,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, user.id));

    // Log successful OAuth login
    await logSecurityEvent({
      userId: user.id,
      eventType: 'oauth_success',
      eventData: { provider, email: user.email },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      riskScore: 'low',
      actionTaken: 'allowed',
    });

    // Set secure session cookie
    const cookieStore = cookies();
    cookieStore.set('session_token', session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    // Redirect to dashboard
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?error=oauth_failed`
    );
  }
}