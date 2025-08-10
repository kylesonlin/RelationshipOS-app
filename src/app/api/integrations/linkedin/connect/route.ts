import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, requireAuth } from '@/lib/auth';
import { linkedinService } from '@/lib/linkedin';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const authSession = requireAuth(session);

    // Generate secure state parameter for OAuth
    const state = randomBytes(32).toString('hex');
    
    // Store state in session or database for validation
    // For demo purposes, we'll include user context in state
    const stateData = {
      userId: authSession.user.id,
      organizationId: authSession.organization.id,
      timestamp: Date.now(),
      random: state
    };

    // Generate LinkedIn authorization URL
    const authUrl = linkedinService.generateAuthUrl(
      Buffer.from(JSON.stringify(stateData)).toString('base64')
    );

    return NextResponse.json({
      success: true,
      authUrl,
      message: 'LinkedIn authorization URL generated',
      expiresIn: 600 // 10 minutes
    });

  } catch (error) {
    console.error('LinkedIn connect error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate LinkedIn connection',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const authSession = requireAuth(session);
    const { reconnect } = await request.json();

    if (reconnect) {
      // Handle LinkedIn reconnection flow
      // This would check if tokens exist and are valid
      const state = randomBytes(32).toString('hex');
      const stateData = {
        userId: authSession.user.id,
        organizationId: authSession.organization.id,
        timestamp: Date.now(),
        reconnect: true,
        random: state
      };

      const authUrl = linkedinService.generateAuthUrl(
        Buffer.from(JSON.stringify(stateData)).toString('base64')
      );

      return NextResponse.json({
        success: true,
        authUrl,
        message: 'LinkedIn reconnection URL generated',
        type: 'reconnect'
      });
    }

    return NextResponse.json(
      { error: 'Invalid request. Use GET to initiate connection.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('LinkedIn connect POST error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process LinkedIn connection request',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
} 