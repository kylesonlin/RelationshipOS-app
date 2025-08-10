import { NextRequest, NextResponse } from 'next/server';
import { authService, RegisterData } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json();
    
    // Validate required fields
    if (!body.email || !body.password || !body.firstName || !body.lastName || !body.organizationName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Register user
    const { user, organization, token } = await authService.register(body);

    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organizationId,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      },
      organization: {
        id: organization.id,
        name: organization.name,
        domain: organization.domain,
        subscriptionStatus: organization.subscriptionStatus,
        subscriptionTier: organization.subscriptionTier,
        trialEndsAt: organization.trialEndsAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    
    // Handle specific error cases
    if (errorMessage.includes('duplicate key') || errorMessage.includes('already exists')) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 