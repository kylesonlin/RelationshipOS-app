import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, requireAuth, requirePermission } from '@/lib/auth';
import { teamSharingService } from '@/lib/team-sharing';

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

    // Get team insights
    const insights = await teamSharingService.generateTeamInsights(authSession.organization.id);

    // Get team analytics
    const analytics = await teamSharingService.getTeamRelationshipAnalytics(authSession.organization.id);

    return NextResponse.json({
      success: true,
      data: {
        insights,
        analytics,
        summary: {
          totalInsights: insights.length,
          highPriorityInsights: insights.filter(i => i.priority === 'high').length,
          newInsights: insights.filter(i => i.status === 'new').length,
          teamReachScore: analytics.teamReachScore
        }
      }
    });

  } catch (error) {
    console.error('Team insights API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch team insights',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { insightId, status } = body;

    // Validate required fields
    if (!insightId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: insightId, status' },
        { status: 400 }
      );
    }

    // Validate status
    if (!['new', 'reviewed', 'acted_upon', 'dismissed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: new, reviewed, acted_upon, or dismissed' },
        { status: 400 }
      );
    }

    // Update insight status
    await teamSharingService.updateInsightStatus(insightId, status);

    return NextResponse.json({
      success: true,
      message: `Insight status updated to: ${status}`
    });

  } catch (error) {
    console.error('Update insight status error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update insight status',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
} 