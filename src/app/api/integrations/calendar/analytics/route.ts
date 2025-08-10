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
    const timeRange = searchParams.get('timeRange') || '90d';
    const analysisType = searchParams.get('type') || 'patterns';

    // Generate meeting analytics
    const analytics = await calendarService.analyzeMeetingPatterns(
      authSession.user.id,
      authSession.organization.id,
      timeRange
    );

    // Add additional insights based on analysis type
    let additionalInsights = {};

    if (analysisType === 'relationships') {
      additionalInsights = await generateRelationshipInsights(analytics);
    } else if (analysisType === 'productivity') {
      additionalInsights = await generateProductivityInsights(analytics);
    } else if (analysisType === 'opportunities') {
      additionalInsights = await generateOpportunityInsights(analytics);
    }

    return NextResponse.json({
      success: true,
      timeRange,
      analysisType,
      analytics: {
        ...analytics,
        ...additionalInsights
      },
      timestamp: new Date().toISOString(),
      insights: {
        summary: generateAnalyticsSummary(analytics),
        recommendations: generateRecommendations(analytics),
        alerts: generateAlerts(analytics)
      }
    });

  } catch (error) {
    console.error('Calendar analytics error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate calendar analytics',
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
    requirePermission(authSession.user, 'write');

    const { action, eventId, insights } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    let result = {};

    switch (action) {
      case 'update_relationship_score':
        if (!eventId || insights?.relationshipScore === undefined) {
          return NextResponse.json(
            { error: 'Event ID and relationship score are required' },
            { status: 400 }
          );
        }
        result = await updateRelationshipScore(eventId, insights.relationshipScore);
        break;

      case 'mark_follow_up_complete':
        if (!eventId) {
          return NextResponse.json(
            { error: 'Event ID is required' },
            { status: 400 }
          );
        }
        result = await markFollowUpComplete(eventId);
        break;

      case 'generate_meeting_summary':
        if (!eventId) {
          return NextResponse.json(
            { error: 'Event ID is required' },
            { status: 400 }
          );
        }
        result = await generateMeetingSummary(eventId);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Calendar analytics action error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process calendar analytics action',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

// Helper functions for different analysis types
async function generateRelationshipInsights(analytics: Record<string, unknown>) {
  return {
    strongRelationships: analytics.topAttendees?.slice(0, 3) || [],
    weakRelationships: [
      { email: 'contact1@company.com', meetingCount: 1, lastMeeting: '2 months ago' },
      { email: 'contact2@company.com', meetingCount: 2, lastMeeting: '6 weeks ago' }
    ],
    relationshipGaps: [
      'No meetings with key stakeholders in Finance department',
      'Limited interaction with C-level executives',
      'Missing regular check-ins with project sponsors'
    ],
    suggestedOutreach: [
      { email: 'sarah.chen@stripe.com', reason: 'High value contact, schedule quarterly sync' },
      { email: 'david.rodriguez@salesforce.com', reason: 'Partnership opportunity follow-up needed' }
    ]
  };
}

async function generateProductivityInsights(analytics: Record<string, unknown>) {
  return {
    meetingEfficiency: {
      averageDuration: '45 minutes',
      optimalTimeSlots: ['10:00-11:00 AM', '2:00-3:00 PM'],
      meetingOverload: analytics.averageMeetingsPerWeek > 25,
      focusTimeAvailable: '60% of workday'
    },
    timeOptimization: {
      backToBackMeetings: 12,
      travelTimeWasted: '0 hours (mostly virtual)',
      preparationTime: 'Average 15 minutes per meeting',
      followUpTime: 'Average 10 minutes per meeting'
    },
    recommendations: [
      'Block 2-hour focus time slots between meetings',
      'Implement 25-minute default meeting length',
      'Use meeting-free Fridays for deep work'
    ]
  };
}

async function generateOpportunityInsights(analytics: Record<string, unknown>) {
  return {
    networkingOpportunities: [
      {
        type: 'Introduction Request',
        description: 'Sarah Chen could introduce you to Stripe\'s AI team',
        priority: 'High',
        estimatedValue: 'Partnership opportunity'
      },
      {
        type: 'Follow-up Meeting',
        description: 'David Rodriguez mentioned Salesforce integration possibilities',
        priority: 'Medium',
        estimatedValue: 'Enterprise customer acquisition'
      }
    ],
    missedConnections: [
      'No recent contact with 15 high-value relationships',
      '3 important contacts haven\'t responded to meeting requests'
    ],
    upcomingOpportunities: [
      {
        event: 'Product Strategy Discussion',
        date: 'Today, 2:00 PM',
        opportunity: 'Discuss AI partnership with Stripe',
        preparation: 'Review partnership proposal and competitive analysis'
      }
    ]
  };
}

// Helper functions for insights generation
function generateAnalyticsSummary(analytics: Record<string, unknown>): string {
  const totalMeetings = analytics.totalMeetings as number || 0;
  const avgPerWeek = analytics.averageMeetingsPerWeek as number || 0;
  
  return `You had ${totalMeetings} meetings in the analyzed period, averaging ${avgPerWeek} meetings per week. Your most frequent meeting partners show strong relationship patterns, with opportunities to expand your network reach.`;
}

function generateRecommendations(analytics: Record<string, unknown>): string[] {
  const recommendations = [
    'Schedule regular check-ins with your top 3 relationship contacts',
    'Implement meeting-free time blocks for focused work',
    'Follow up on pending meeting action items within 24 hours'
  ];

  const avgPerWeek = analytics.averageMeetingsPerWeek as number || 0;
  if (avgPerWeek > 25) {
    recommendations.push('Consider reducing meeting frequency - you\'re above optimal range');
  }

  return recommendations;
}

function generateAlerts(analytics: Record<string, unknown>): Array<{
  type: 'warning' | 'info' | 'success';
  message: string;
  action?: string;
}> {
  const alerts = [];
  const avgPerWeek = analytics.averageMeetingsPerWeek as number || 0;

  if (avgPerWeek > 30) {
    alerts.push({
      type: 'warning',
      message: 'Meeting overload detected - consider consolidating or declining some meetings',
      action: 'Review calendar optimization suggestions'
    });
  }

  alerts.push({
    type: 'info',
    message: 'You have 3 high-priority follow-ups pending from last week',
    action: 'View follow-up dashboard'
  });

  if (analytics.relationshipTrends) {
    const improving = (analytics.relationshipTrends as Array<{ trend: string }>)
      .filter(r => r.trend === 'improving').length;
    
    if (improving > 0) {
      alerts.push({
        type: 'success',
        message: `${improving} relationships showing positive momentum`,
        action: 'Capitalize on relationship growth'
      });
    }
  }

  return alerts;
}

// Mock action implementations
async function updateRelationshipScore(eventId: string, score: number) {
  console.log(`Updating relationship score for event ${eventId}: ${score}`);
  return { eventId, updatedScore: score, timestamp: new Date().toISOString() };
}

async function markFollowUpComplete(eventId: string) {
  console.log(`Marking follow-up complete for event ${eventId}`);
  return { eventId, status: 'completed', timestamp: new Date().toISOString() };
}

async function generateMeetingSummary(eventId: string) {
  console.log(`Generating meeting summary for event ${eventId}`);
  return {
    eventId,
    summary: 'Productive discussion on AI partnership opportunities. Next steps include technical integration assessment and follow-up meeting scheduled for next week.',
    keyOutcomes: [
      'Agreement on partnership framework',
      'Technical team introduction scheduled',
      'Pilot program proposal to be shared'
    ],
    actionItems: [
      { task: 'Share technical documentation', owner: 'Demo User', dueDate: '2024-01-15' },
      { task: 'Schedule technical deep-dive', owner: 'Sarah Chen', dueDate: '2024-01-18' }
    ],
    timestamp: new Date().toISOString()
  };
} 