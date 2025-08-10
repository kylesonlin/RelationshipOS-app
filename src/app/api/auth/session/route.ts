import { NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import { cookies } from 'next/headers';

// Get current user session
export async function GET() {
  try {
    const session = await authService.getCurrentSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        organizationId: session.user.organizationId,
        role: session.user.role,
        isEmailVerified: session.user.isEmailVerified,
        lastLoginAt: session.user.lastLoginAt
      },
      organization: {
        id: session.organization.id,
        name: session.organization.name,
        domain: session.organization.domain,
        subscriptionStatus: session.organization.subscriptionStatus,
        subscriptionTier: session.organization.subscriptionTier,
        trialEndsAt: session.organization.trialEndsAt
      },
      expiresAt: session.expiresAt
    });

  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}

// Logout user
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
} 