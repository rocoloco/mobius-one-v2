import { NextRequest, NextResponse } from 'next/server';
import { AuthService, generateDeviceFingerprint } from '@/lib/services/auth';
import { z } from 'zod';
import { cookies } from 'next/headers';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signInSchema.parse(body);

    const context = {
      ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      deviceFingerprint: generateDeviceFingerprint(request),
    };

    const result = await AuthService.signIn(
      validatedData.email,
      validatedData.password,
      context
    );

    // Set secure session cookie
    const cookieStore = cookies();
    cookieStore.set('session_token', result.session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Sign in successful',
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.profile.firstName,
        lastName: result.profile.lastName,
        role: result.profile.role,
        lastLoginAt: result.profile.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('Sign in error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Sign in failed' },
      { status: 401 }
    );
  }
}