// Calendar Integration Service for RelationshipOS
// Google Calendar and Microsoft Outlook integration for meeting intelligence

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees: CalendarAttendee[];
  organizerId: string;
  calendarId: string;
  recurring: boolean;
  meetingUrl?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  visibility: 'public' | 'private' | 'confidential';
  source: 'google' | 'outlook';
}

interface CalendarAttendee {
  email: string;
  name?: string;
  responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  organizer?: boolean;
  optional?: boolean;
}

interface MeetingContext {
  eventId: string;
  title: string;
  attendees: CalendarAttendee[];
  relationshipHistory: RelationshipHistory[];
  meetingPrep: {
    keyTopics: string[];
    lastInteractions: string[];
    mutualConnections: string[];
    companyUpdates: string[];
    suggestedTalkingPoints: string[];
  };
  aiInsights: {
    meetingImportance: number; // 1-10
    relationshipHealth: Record<string, number>;
    recommendedOutcomes: string[];
    followUpSuggestions: string[];
  };
}

interface RelationshipHistory {
  attendeeEmail: string;
  lastMeeting?: {
    date: string;
    title: string;
    outcome?: string;
  };
  totalMeetings: number;
  avgMeetingFrequency: string;
  relationshipTrend: 'improving' | 'stable' | 'declining';
}

interface CalendarIntegration {
  provider: 'google' | 'outlook';
  connected: boolean;
  connectedAt?: string;
  email: string;
  calendars: CalendarInfo[];
  lastSyncAt?: string;
  syncStatus: 'healthy' | 'warning' | 'error';
  permissions: string[];
}

interface CalendarInfo {
  id: string;
  name: string;
  primary: boolean;
  accessRole: string;
  timeZone: string;
  description?: string;
}

interface CalendarTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
}

export class CalendarService {
  private static instance: CalendarService;

  static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  // Google Calendar Integration
  async connectGoogleCalendar(userId: string): Promise<string> {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events.readonly'
    ];

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/calendar/google/callback`,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64')
    })}`;

    return authUrl;
  }

  async exchangeGoogleCode(code: string, state: string): Promise<CalendarTokens> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/calendar/google/callback`,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        throw new Error(`Google OAuth error: ${response.status}`);
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        scope: data.scope
      };
    } catch (error) {
      console.error('Google Calendar token exchange error:', error);
      throw new Error('Failed to exchange Google Calendar authorization code');
    }
  }

  // Microsoft Outlook Integration
  async connectOutlookCalendar(userId: string): Promise<string> {
    const scopes = [
      'https://graph.microsoft.com/Calendars.Read',
      'https://graph.microsoft.com/Calendars.Read.Shared'
    ];

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      response_type: 'code',
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/calendar/outlook/callback`,
      scope: scopes.join(' '),
      response_mode: 'query',
      state: Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64')
    })}`;

    return authUrl;
  }

  async exchangeOutlookCode(code: string, state: string): Promise<CalendarTokens> {
    try {
      const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.OUTLOOK_CLIENT_ID || '',
          client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
          code,
          redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/calendar/outlook/callback`,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        throw new Error(`Outlook OAuth error: ${response.status}`);
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        scope: data.scope
      };
    } catch (error) {
      console.error('Outlook Calendar token exchange error:', error);
      throw new Error('Failed to exchange Outlook Calendar authorization code');
    }
  }

  // Calendar Data Retrieval
  async getGoogleCalendarEvents(accessToken: string, timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    try {
      const params = new URLSearchParams({
        timeMin: timeMin || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ahead
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '250'
      });

      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.items?.map(this.transformGoogleEvent) || [];
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      throw new Error('Failed to fetch Google Calendar events');
    }
  }

  async getOutlookCalendarEvents(accessToken: string, timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    try {
      const startTime = timeMin || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endTime = timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const response = await fetch(`https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${startTime}&endDateTime=${endTime}&$top=250&$orderby=start/dateTime`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Outlook Calendar API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.value?.map(this.transformOutlookEvent) || [];
    } catch (error) {
      console.error('Error fetching Outlook Calendar events:', error);
      throw new Error('Failed to fetch Outlook Calendar events');
    }
  }

  // Meeting Intelligence Generation
  async generateMeetingContext(eventId: string, organizationId: string): Promise<MeetingContext> {
    try {
      // In demo mode, return mock meeting context
      return this.generateMockMeetingContext(eventId);
    } catch (error) {
      console.error('Error generating meeting context:', error);
      throw new Error('Failed to generate meeting context');
    }
  }

  async analyzeMeetingPatterns(userId: string, organizationId: string, timeRange: string = '90d'): Promise<{
    totalMeetings: number;
    averageMeetingsPerWeek: number;
    topAttendees: Array<{ email: string; meetingCount: number; relationshipStrength: number }>;
    meetingTypes: Record<string, number>;
    timeDistribution: Record<string, number>;
    relationshipTrends: Array<{ attendee: string; trend: 'improving' | 'stable' | 'declining' }>;
  }> {
    // Demo implementation - would integrate with actual calendar data in production
    return {
      totalMeetings: Math.floor(Math.random() * 150) + 50,
      averageMeetingsPerWeek: Math.floor(Math.random() * 20) + 10,
      topAttendees: [
        { email: 'sarah.chen@stripe.com', meetingCount: 12, relationshipStrength: 9 },
        { email: 'david.rodriguez@salesforce.com', meetingCount: 8, relationshipStrength: 7 },
        { email: 'jennifer.park@openai.com', meetingCount: 6, relationshipStrength: 8 }
      ],
      meetingTypes: {
        'One-on-One': 45,
        'Team Meeting': 32,
        'Client Call': 28,
        'Interview': 15,
        'Conference': 8
      },
      timeDistribution: {
        'Morning (9-12)': 40,
        'Afternoon (12-17)': 55,
        'Evening (17-20)': 10
      },
      relationshipTrends: [
        { attendee: 'sarah.chen@stripe.com', trend: 'improving' },
        { attendee: 'david.rodriguez@salesforce.com', trend: 'stable' },
        { attendee: 'jennifer.park@openai.com', trend: 'improving' }
      ]
    };
  }

  // Utility Methods
  private transformGoogleEvent(event: Record<string, unknown>): CalendarEvent {
    const attendees = (event.attendees as Array<Record<string, unknown>> || []).map(attendee => ({
      email: attendee.email as string,
      name: attendee.displayName as string,
      responseStatus: (attendee.responseStatus as string) || 'needsAction',
      organizer: attendee.organizer as boolean || false,
      optional: attendee.optional as boolean || false
    }));

    return {
      id: event.id as string,
      title: event.summary as string || '(No title)',
      description: event.description as string,
      startTime: (event.start as Record<string, unknown>)?.dateTime as string || 
                 (event.start as Record<string, unknown>)?.date as string,
      endTime: (event.end as Record<string, unknown>)?.dateTime as string || 
               (event.end as Record<string, unknown>)?.date as string,
      location: event.location as string,
      attendees,
      organizerId: event.creator ? (event.creator as Record<string, unknown>).email as string : '',
      calendarId: 'primary',
      recurring: Boolean(event.recurringEventId),
      meetingUrl: event.hangoutLink as string || this.extractMeetingUrl(event.description as string),
      status: (event.status as string) === 'confirmed' ? 'confirmed' : 'tentative',
      visibility: (event.visibility as string) || 'public',
      source: 'google'
    };
  }

  private transformOutlookEvent(event: Record<string, unknown>): CalendarEvent {
    const attendees = (event.attendees as Array<Record<string, unknown>> || []).map(attendee => {
      const emailAddress = (attendee.emailAddress as Record<string, unknown>);
      return {
        email: emailAddress?.address as string,
        name: emailAddress?.name as string,
        responseStatus: (attendee.status as Record<string, unknown>)?.response as string || 'needsAction',
        organizer: attendee.type === 'required',
        optional: attendee.type === 'optional'
      };
    });

    return {
      id: event.id as string,
      title: event.subject as string || '(No title)',
      description: (event.body as Record<string, unknown>)?.content as string,
      startTime: (event.start as Record<string, unknown>)?.dateTime as string,
      endTime: (event.end as Record<string, unknown>)?.dateTime as string,
      location: (event.location as Record<string, unknown>)?.displayName as string,
      attendees,
      organizerId: (event.organizer as Record<string, unknown>)?.emailAddress ? 
                   ((event.organizer as Record<string, unknown>).emailAddress as Record<string, unknown>).address as string : '',
      calendarId: 'primary',
      recurring: Boolean(event.seriesMasterId),
      meetingUrl: (event.onlineMeeting as Record<string, unknown>)?.joinUrl as string || 
                  this.extractMeetingUrl((event.body as Record<string, unknown>)?.content as string),
      status: (event.responseStatus as Record<string, unknown>)?.response === 'accepted' ? 'confirmed' : 'tentative',
      visibility: event.sensitivity === 'private' ? 'private' : 'public',
      source: 'outlook'
    };
  }

  private extractMeetingUrl(content?: string): string | undefined {
    if (!content) return undefined;
    
    const zoomMatch = content.match(/https:\/\/[a-zA-Z0-9.-]+\.zoom\.us\/[^\s]+/);
    const teamsMatch = content.match(/https:\/\/teams\.microsoft\.com\/[^\s]+/);
    const meetMatch = content.match(/https:\/\/meet\.google\.com\/[^\s]+/);
    
    return zoomMatch?.[0] || teamsMatch?.[0] || meetMatch?.[0];
  }

  private generateMockMeetingContext(eventId: string): MeetingContext {
    const mockAttendees: CalendarAttendee[] = [
      {
        email: 'sarah.chen@stripe.com',
        name: 'Sarah Chen',
        responseStatus: 'accepted',
        organizer: false
      },
      {
        email: 'demo@relationshipos.com',
        name: 'Demo User',
        responseStatus: 'accepted',
        organizer: true
      }
    ];

    return {
      eventId,
      title: 'Product Strategy Discussion',
      attendees: mockAttendees,
      relationshipHistory: [
        {
          attendeeEmail: 'sarah.chen@stripe.com',
          lastMeeting: {
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'Q4 Planning Session',
            outcome: 'Agreed on AI integration roadmap'
          },
          totalMeetings: 12,
          avgMeetingFrequency: 'bi-weekly',
          relationshipTrend: 'improving'
        }
      ],
      meetingPrep: {
        keyTopics: ['AI Product Strategy', 'Partnership Opportunities', 'Q1 2024 Roadmap'],
        lastInteractions: ['Email exchange about partnership terms', 'LinkedIn connection approved'],
        mutualConnections: ['David Rodriguez (Salesforce)', 'Jennifer Park (OpenAI)'],
        companyUpdates: ['Stripe announces new AI payment features', 'Hiring VP of AI Products'],
        suggestedTalkingPoints: [
          'Follow up on partnership discussion from last meeting',
          'Discuss potential integration opportunities',
          'Share RelationshipOS AI capabilities demo',
          'Explore mutual customer success stories'
        ]
      },
      aiInsights: {
        meetingImportance: 9,
        relationshipHealth: {
          'sarah.chen@stripe.com': 8.5
        },
        recommendedOutcomes: [
          'Schedule technical integration deep-dive',
          'Introduce Sarah to engineering team',
          'Share product roadmap under NDA',
          'Set up monthly strategic sync'
        ],
        followUpSuggestions: [
          'Send meeting recap within 24 hours',
          'Share technical documentation',
          'Schedule follow-up within 2 weeks',
          'Connect on LinkedIn if not already connected'
        ]
      }
    };
  }
}

// Singleton instance
export const calendarService = CalendarService.getInstance();

// Utility functions for UI integration
export function formatMeetingTime(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  
  return `${dateFormatter.format(start)} ${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
}

export function getMeetingDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

export function getRelationshipHealthColor(health: number): string {
  if (health >= 8) return 'text-green-600';
  if (health >= 6) return 'text-yellow-600';
  return 'text-red-600';
}

export function isUpcomingMeeting(startTime: string): boolean {
  return new Date(startTime) > new Date();
} 