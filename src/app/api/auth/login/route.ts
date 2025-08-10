import { NextRequest, NextResponse } from 'next/server';
import { authService, LoginCredentials } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json();
    
    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const { user, organization, token } = await authService.login(body);

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
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt
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
    console.error('Login error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    
    // Always return generic error message for security
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }
} 