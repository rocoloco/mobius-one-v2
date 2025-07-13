import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: 'No active session' },
        { status: 400 }
      );
    }

    const context = {
      ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };

    await AuthService.signOut(sessionToken, context);

    // Clear session cookie
    cookieStore.delete('session_token');

    return NextResponse.json({
      success: true,
      message: 'Sign out successful',
    });
  } catch (error) {
    console.error('Sign out error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Sign out failed' },
      { status: 500 }
    );
  }
}