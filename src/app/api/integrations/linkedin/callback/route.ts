import { NextRequest, NextResponse } from 'next/server';
import { linkedinService } from '@/lib/linkedin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('LinkedIn OAuth error:', error);
      const errorDescription = searchParams.get('error_description') || 'LinkedIn authorization failed';
      
      return NextResponse.redirect(
        new URL(`/dashboard?linkedin_error=${encodeURIComponent(errorDescription)}`, request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard?linkedin_error=Invalid authorization response', request.url)
      );
    }

    // Decode and validate state
    let stateData: { userId: string; organizationId: string; timestamp: number };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (parseError) {
      console.error('Invalid state parameter:', parseError);
      return NextResponse.redirect(
        new URL('/dashboard?linkedin_error=Invalid state parameter', request.url)
      );
    }

    // Validate state timestamp (10 minute expiry)
    const stateAge = Date.now() - stateData.timestamp;
    if (stateAge > 600000) { // 10 minutes
      return NextResponse.redirect(
        new URL('/dashboard?linkedin_error=Authorization expired', request.url)
      );
    }

    // Exchange code for access tokens
    const tokens = await linkedinService.exchangeCodeForTokens(code, state);

    // Get LinkedIn profile data
    const linkedinProfile = await linkedinService.getProfile(tokens.accessToken);

    // Get LinkedIn connections (first batch)
    const connections = await linkedinService.getConnections(tokens.accessToken, 0, 100);

    // Sync data with RelationshipOS database
    const syncResults = await linkedinService.syncConnectionData(
      stateData.organizationId,
      stateData.userId,
      tokens.accessToken
    );

    // Store LinkedIn integration tokens (in production, encrypt these)
    // For demo purposes, we'll just log the sync results
    console.log('LinkedIn sync completed:', {
      profile: `${linkedinProfile.firstName} ${linkedinProfile.lastName}`,
      connections: connections.length,
      syncResults
    });

    // TODO: Store tokens securely in database
    // await storeLinkedInTokens(stateData.userId, tokens);

    // Redirect to dashboard with success message
    const successParams = new URLSearchParams({
      linkedin_connected: 'true',
      connections_synced: connections.length.toString(),
      profile_name: `${linkedinProfile.firstName} ${linkedinProfile.lastName}`
    });

    return NextResponse.redirect(
      new URL(`/dashboard?${successParams.toString()}`, request.url)
    );

  } catch (error) {
    console.error('LinkedIn callback error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.redirect(
      new URL(`/dashboard?linkedin_error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}

// Helper function to validate LinkedIn webhook signatures (for future use)
export async function POST(request: NextRequest) {
  try {
    // This would handle LinkedIn webhook notifications for real-time updates
    // Currently not implemented as it requires webhook setup
    
    const webhookData: Record<string, unknown> = await request.json();
    console.log('LinkedIn webhook received:', webhookData);

    // Validate webhook signature
    const signature = request.headers.get('linkedin-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 400 }
      );
    }

    // Process different webhook event types
    switch (webhookData.eventType) {
      case 'CONNECTION_ADDED':
        await handleConnectionAdded(webhookData);
        break;
      case 'PROFILE_UPDATED':
        await handleProfileUpdated(webhookData);
        break;
      case 'JOB_CHANGED':
        await handleJobChanged(webhookData);
        break;
      default:
        console.log('Unknown LinkedIn webhook event:', webhookData.eventType);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('LinkedIn webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Webhook event handlers (placeholder implementations)
async function handleConnectionAdded(webhookData: Record<string, unknown>) {
  console.log('New LinkedIn connection:', webhookData);
  // TODO: Update database with new connection
}

async function handleProfileUpdated(webhookData: Record<string, unknown>) {
  console.log('LinkedIn profile updated:', webhookData);
  // TODO: Update stored profile data
}

async function handleJobChanged(webhookData: Record<string, unknown>) {
  console.log('LinkedIn job change detected:', webhookData);
  // TODO: Trigger relationship intelligence update
  // TODO: Send Oracle notification about opportunity
} 