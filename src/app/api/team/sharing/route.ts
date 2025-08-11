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

    // Get shared relationships for the current user
    const sharedRelationships = await teamSharingService.getSharedRelationships(
      authSession.organization.id,
      authSession.user.id
    );

    return NextResponse.json({
      success: true,
      data: {
        sharedRelationships,
        total: sharedRelationships.length
      }
    });

  } catch (error) {
    console.error('Get shared relationships error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch shared relationships',
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
    const { personId, shareWith, shareType, permissions, shareReason, expiresAt } = body;

    // Validate required fields
    if (!personId || !shareWith || !shareType || !permissions) {
      return NextResponse.json(
        { error: 'Missing required fields: personId, shareWith, shareType, permissions' },
        { status: 400 }
      );
    }

    // Validate shareType
    if (!['individual', 'department', 'organization'].includes(shareType)) {
      return NextResponse.json(
        { error: 'Invalid shareType. Must be: individual, department, or organization' },
        { status: 400 }
      );
    }

    // Share the relationship
    const sharedRelationship = await teamSharingService.shareRelationship(
      authSession.organization.id,
      personId,
      authSession.user.id,
      {
        shareWith: Array.isArray(shareWith) ? shareWith : [shareWith],
        shareType,
        permissions,
        shareReason,
        expiresAt
      }
    );

    return NextResponse.json({
      success: true,
      data: sharedRelationship,
      message: 'Relationship shared successfully'
    });

  } catch (error) {
    console.error('Share relationship error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to share relationship',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json(
        { error: 'Missing shareId parameter' },
        { status: 400 }
      );
    }

    // Unshare the relationship
    await teamSharingService.unshareRelationship(shareId);

    return NextResponse.json({
      success: true,
      message: 'Relationship unshared successfully'
    });

  } catch (error) {
    console.error('Unshare relationship error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to unshare relationship',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
} 