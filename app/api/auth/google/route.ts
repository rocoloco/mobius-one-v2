import { NextRequest, NextResponse } from 'next/server';
import { AuthService, generateDeviceFingerprint } from '@/lib/services/auth';

export async function GET(request: NextRequest) {
  try {
    const context = {
      ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      deviceFingerprint: generateDeviceFingerprint(request),
    };

    const result = await AuthService.signInWithGoogle(context);

    // Redirect to Google OAuth
    return NextResponse.redirect(result.url);
  } catch (error) {
    console.error('Google OAuth error:', error);
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?error=oauth_failed`
    );
  }
}