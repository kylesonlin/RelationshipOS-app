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

    // Get team members
    const teamMembers = await teamSharingService.getTeamMembers(authSession.organization.id);

    return NextResponse.json({
      success: true,
      data: {
        members: teamMembers,
        total: teamMembers.length,
        organization: authSession.organization.name
      }
    });

  } catch (error) {
    console.error('Team members API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch team members',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication and admin permissions
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const authSession = requireAuth(session);
    requirePermission(authSession.user, 'admin');

    const body = await request.json();
    const { userId, permissions } = body;

    if (!userId || !permissions) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, permissions' },
        { status: 400 }
      );
    }

    // Update team member permissions
    const updatedMember = await teamSharingService.updateTeamMemberPermissions(
      authSession.organization.id,
      userId,
      permissions
    );

    return NextResponse.json({
      success: true,
      data: updatedMember,
      message: 'Team member permissions updated successfully'
    });

  } catch (error) {
    console.error('Update team member permissions error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update team member permissions',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
} 