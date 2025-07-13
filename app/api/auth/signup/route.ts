import { NextRequest, NextResponse } from 'next/server';
import { AuthService, generateDeviceFingerprint } from '@/lib/services/auth';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signUpSchema.parse(body);

    const context = {
      ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };

    const result = await AuthService.signUp(
      validatedData.email,
      validatedData.password,
      {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        companyId: validatedData.companyId,
        ...context,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.profile.firstName,
        lastName: result.profile.lastName,
      },
    });
  } catch (error) {
    console.error('Sign up error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Sign up failed' },
      { status: 400 }
    );
  }
}