import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/services/auth';

export async function GET(request: NextRequest) {
  try {
    const { valid, profile } = await validateRequest(request);

    if (!valid || !profile) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: profile.userId,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
        role: profile.role,
        companyId: profile.companyId,
        department: profile.department,
        jobTitle: profile.jobTitle,
        lastLoginAt: profile.lastLoginAt,
        emailVerified: profile.emailVerified,
        mfaEnabled: profile.mfaEnabled,
        isActive: profile.isActive,
        createdAt: profile.createdAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}