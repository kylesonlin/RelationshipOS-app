import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, requireAuth, requirePermission } from '@/lib/auth';
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
    requirePermission(authSession.user, 'read');

    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');
    const provider = searchParams.get('provider') || 'google';

    // For demo purposes, return mock calendar events
    // In production, this would retrieve stored tokens and fetch actual events
    const mockEvents = await generateMockCalendarEvents(timeMin, timeMax, provider);

    return NextResponse.json({
      success: true,
      provider,
      events: mockEvents,
      timestamp: new Date().toISOString(),
      metadata: {
        totalEvents: mockEvents.length,
        upcomingEvents: mockEvents.filter(e => new Date(e.startTime) > new Date()).length,
        timeRange: {
          start: timeMin || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Calendar events error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch calendar events',
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
    requirePermission(authSession.user, 'read');

    const { eventId, generateContext } = await request.json();

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    if (generateContext) {
      // Generate AI-powered meeting context
      const meetingContext = await calendarService.generateMeetingContext(
        eventId,
        authSession.organization.id
      );

      return NextResponse.json({
        success: true,
        eventId,
        context: meetingContext,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Invalid request. Specify generateContext=true to get meeting context.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Calendar context generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate meeting context',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

// Mock calendar events generator for demo purposes
async function generateMockCalendarEvents(timeMin?: string | null, timeMax?: string | null, provider = 'google') {
  const startDate = timeMin ? new Date(timeMin) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const endDate = timeMax ? new Date(timeMax) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const mockEvents = [
    {
      id: 'event_001',
      title: 'Product Strategy Discussion',
      description: 'Q1 2024 product roadmap and AI integration planning',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
      location: 'Conference Room A',
      attendees: [
        {
          email: 'sarah.chen@stripe.com',
          name: 'Sarah Chen',
          responseStatus: 'accepted' as const,
          organizer: false,
          optional: false
        },
        {
          email: 'demo@relationshipos.com',
          name: 'Demo User',
          responseStatus: 'accepted' as const,
          organizer: true,
          optional: false
        }
      ],
      organizerId: 'demo@relationshipos.com',
      calendarId: 'primary',
      recurring: false,
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      status: 'confirmed' as const,
      visibility: 'public' as const,
      source: provider as 'google' | 'outlook'
    },
    {
      id: 'event_002',
      title: 'One-on-One with David Rodriguez',
      description: 'Monthly sync on enterprise partnerships',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // Tomorrow + 30min
      location: 'Virtual',
      attendees: [
        {
          email: 'david.rodriguez@salesforce.com',
          name: 'David Rodriguez',
          responseStatus: 'accepted' as const,
          organizer: false,
          optional: false
        },
        {
          email: 'demo@relationshipos.com',
          name: 'Demo User',
          responseStatus: 'accepted' as const,
          organizer: true,
          optional: false
        }
      ],
      organizerId: 'demo@relationshipos.com',
      calendarId: 'primary',
      recurring: true,
      meetingUrl: 'https://salesforce.zoom.us/j/123456789',
      status: 'confirmed' as const,
      visibility: 'public' as const,
      source: provider as 'google' | 'outlook'
    },
    {
      id: 'event_003',
      title: 'RelationshipOS Demo - Jennifer Park',
      description: 'Showcasing AI relationship intelligence for OpenAI partnership',
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(), // + 45min
      location: 'Virtual',
      attendees: [
        {
          email: 'jennifer.park@openai.com',
          name: 'Jennifer Park',
          responseStatus: 'tentative' as const,
          organizer: false,
          optional: false
        },
        {
          email: 'demo@relationshipos.com',
          name: 'Demo User',
          responseStatus: 'accepted' as const,
          organizer: true,
          optional: false
        }
      ],
      organizerId: 'demo@relationshipos.com',
      calendarId: 'primary',
      recurring: false,
      meetingUrl: 'https://meet.google.com/xyz-abcd-efg',
      status: 'tentative' as const,
      visibility: 'public' as const,
      source: provider as 'google' | 'outlook'
    },
    {
      id: 'event_004',
      title: 'Weekly Team Standup',
      description: 'RelationshipOS development progress and blockers',
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // + 30min
      location: 'Virtual',
      attendees: [
        {
          email: 'team@relationshipos.com',
          name: 'RelationshipOS Team',
          responseStatus: 'accepted' as const,
          organizer: false,
          optional: false
        },
        {
          email: 'demo@relationshipos.com',
          name: 'Demo User',
          responseStatus: 'accepted' as const,
          organizer: true,
          optional: false
        }
      ],
      organizerId: 'demo@relationshipos.com',
      calendarId: 'primary',
      recurring: true,
      meetingUrl: 'https://meet.google.com/team-standup',
      status: 'confirmed' as const,
      visibility: 'public' as const,
      source: provider as 'google' | 'outlook'
    },
    {
      id: 'event_005',
      title: 'Customer Discovery Call - TechCorp',
      description: 'Understanding enterprise relationship management needs',
      startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // + 1hour
      location: 'Virtual',
      attendees: [
        {
          email: 'cto@techcorp.com',
          name: 'Alex Thompson',
          responseStatus: 'accepted' as const,
          organizer: false,
          optional: false
        },
        {
          email: 'head-of-sales@techcorp.com',
          name: 'Maria Garcia',
          responseStatus: 'accepted' as const,
          organizer: false,
          optional: false
        },
        {
          email: 'demo@relationshipos.com',
          name: 'Demo User',
          responseStatus: 'accepted' as const,
          organizer: true,
          optional: false
        }
      ],
      organizerId: 'demo@relationshipos.com',
      calendarId: 'primary',
      recurring: false,
      meetingUrl: 'https://zoom.us/j/enterprise-demo',
      status: 'confirmed' as const,
      visibility: 'private' as const,
      source: provider as 'google' | 'outlook'
    }
  ];

  // Filter events by date range
  return mockEvents.filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate >= startDate && eventDate <= endDate;
  });
} 