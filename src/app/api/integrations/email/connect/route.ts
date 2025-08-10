import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, requireAuth } from '@/lib/auth';
import { emailService } from '@/lib/email';

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
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'gmail';

    if (!['gmail', 'outlook'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be "gmail" or "outlook"' },
        { status: 400 }
      );
    }

    let authUrl: string;

    if (provider === 'gmail') {
      authUrl = await emailService.connectGmail(authSession.user.id);
    } else {
      authUrl = await emailService.connectOutlook(authSession.user.id);
    }

    return NextResponse.json({
      success: true,
      provider,
      authUrl,
      message: `${provider === 'gmail' ? 'Gmail' : 'Outlook'} authorization URL generated`,
      expiresIn: 600 // 10 minutes
    });

  } catch (error) {
    console.error('Email connect error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate email connection',
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
    const { provider, reconnect } = await request.json();

    if (!['gmail', 'outlook'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be "gmail" or "outlook"' },
        { status: 400 }
      );
    }

    if (reconnect) {
      // Handle email reconnection flow
      let authUrl: string;

      if (provider === 'gmail') {
        authUrl = await emailService.connectGmail(authSession.user.id);
      } else {
        authUrl = await emailService.connectOutlook(authSession.user.id);
      }

      return NextResponse.json({
        success: true,
        provider,
        authUrl,
        message: `${provider === 'gmail' ? 'Gmail' : 'Outlook'} reconnection URL generated`,
        type: 'reconnect'
      });
    }

    return NextResponse.json(
      { error: 'Invalid request. Use GET to initiate connection or POST with reconnect=true.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Email connect POST error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process email connection request',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
} 