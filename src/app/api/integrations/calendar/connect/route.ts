import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, requireAuth } from '@/lib/auth';
import { calendarService } from '@/lib/calendar';

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
    const provider = searchParams.get('provider') || 'google';

    if (!['google', 'outlook'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be "google" or "outlook"' },
        { status: 400 }
      );
    }

    let authUrl: string;

    if (provider === 'google') {
      authUrl = await calendarService.connectGoogleCalendar(authSession.user.id);
    } else {
      authUrl = await calendarService.connectOutlookCalendar(authSession.user.id);
    }

    return NextResponse.json({
      success: true,
      provider,
      authUrl,
      message: `${provider === 'google' ? 'Google Calendar' : 'Outlook Calendar'} authorization URL generated`,
      expiresIn: 600 // 10 minutes
    });

  } catch (error) {
    console.error('Calendar connect error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate calendar connection',
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

    if (!['google', 'outlook'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be "google" or "outlook"' },
        { status: 400 }
      );
    }

    if (reconnect) {
      // Handle calendar reconnection flow
      let authUrl: string;

      if (provider === 'google') {
        authUrl = await calendarService.connectGoogleCalendar(authSession.user.id);
      } else {
        authUrl = await calendarService.connectOutlookCalendar(authSession.user.id);
      }

      return NextResponse.json({
        success: true,
        provider,
        authUrl,
        message: `${provider === 'google' ? 'Google Calendar' : 'Outlook Calendar'} reconnection URL generated`,
        type: 'reconnect'
      });
    }

    return NextResponse.json(
      { error: 'Invalid request. Use GET to initiate connection or POST with reconnect=true.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Calendar connect POST error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process calendar connection request',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
} 