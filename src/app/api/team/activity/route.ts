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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const activityTypes = searchParams.get('activityTypes')?.split(',');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const since = searchParams.get('since');

    // Get team activity
    const activities = await teamSharingService.getTeamActivity(
      authSession.organization.id,
      {
        userId: userId || undefined,
        activityTypes: activityTypes as any,
        limit,
        since: since || undefined
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        activities,
        total: activities.length,
        filters: {
          userId,
          activityTypes,
          limit,
          since
        }
      }
    });

  } catch (error) {
    console.error('Team activity API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch team activity',
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

    const body = await request.json();
    const { activityType, entityType, entityId, description, metadata } = body;

    // Validate required fields
    if (!activityType || !entityType || !entityId || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: activityType, entityType, entityId, description' },
        { status: 400 }
      );
    }

    // Record team activity
    const activity = await teamSharingService.recordTeamActivity({
      organizationId: authSession.organization.id,
      userId: authSession.user.id,
      activityType,
      entityType,
      entityId,
      description,
      metadata: metadata || {}
    });

    return NextResponse.json({
      success: true,
      data: activity,
      message: 'Team activity recorded successfully'
    });

  } catch (error) {
    console.error('Record team activity error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to record team activity',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
} 