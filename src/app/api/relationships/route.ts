import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, requireAuth, requirePermission } from '@/lib/auth';
import { databaseService } from '@/lib/database';

// GET /api/relationships - Get relationships with filtering
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authSession = requireAuth(session);
    requirePermission(authSession.user, 'read');
    
    const { user, organization } = authSession;
    const { searchParams } = new URL(request.url);

    const personId = searchParams.get('person_id');
    const relationshipType = searchParams.get('type');
    const healthStatus = searchParams.get('health');
    const priority = searchParams.get('priority');
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'));
    const offset = parseInt(searchParams.get('offset') || '0');

    if (personId) {
      // Get relationships for specific person
      const relationships = await databaseService.getPersonRelationships(
        personId,
        organization.id
      );
      
      return NextResponse.json({
        success: true,
        data: relationships
      });
    } else {
      // TODO: Implement general relationship search
      // This would require extending databaseService with searchRelationships method
      return NextResponse.json({
        success: true,
        data: [],
        message: 'General relationship search not yet implemented'
      });
    }

  } catch (error) {
    console.error('GET /api/relationships error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch relationships',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, 
      { status: 500 }
    );
  }
}

// POST /api/relationships - Create new relationship
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authSession = requireAuth(session);
    requirePermission(authSession.user, 'write');
    
    const { user, organization } = authSession;

    // Parse request body
    const body = await request.json();
    const {
      personId,
      relationshipType = 'colleague',
      strengthScore = 5,
      healthStatus = 'stable',
      lastInteraction,
      interactionCount = 0,
      interactionTypes = [],
      contextNotes = '',
      priority = 'medium',
      followUpDate,
      followUpNotes,
      businessValue = 'unknown',
      collaborationHistory = {},
      meetingHistory = [],
      communicationHistory = []
    } = body;

    // Basic validation
    if (!personId) {
      return NextResponse.json(
        { error: 'personId is required' }, 
        { status: 400 }
      );
    }

    // Check if person exists
    const person = await databaseService.getPerson(personId, organization.id);
    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' }, 
        { status: 404 }
      );
    }

    // Create relationship
    const relationship = await databaseService.createRelationship(
      organization.id,
      user.id,
      {
        personId,
        relationshipType,
        strengthScore: Math.max(1, Math.min(10, strengthScore)),
        healthStatus,
        lastInteraction: lastInteraction || new Date().toISOString(),
        interactionCount: Math.max(0, interactionCount),
        interactionTypes: Array.isArray(interactionTypes) ? interactionTypes : [],
        contextNotes: contextNotes.trim(),
        priority,
        followUpDate,
        followUpNotes: followUpNotes?.trim(),
        businessValue,
        collaborationHistory,
        meetingHistory: Array.isArray(meetingHistory) ? meetingHistory : [],
        communicationHistory: Array.isArray(communicationHistory) ? communicationHistory : []
      }
    );

    return NextResponse.json({
      success: true,
      data: relationship
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/relationships error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create relationship',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, 
      { status: 500 }
    );
  }
}

// PUT /api/relationships - Bulk update relationships
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authSession = requireAuth(session);
    requirePermission(authSession.user, 'write');
    
    const { organization } = authSession;

    // Parse request body
    const body = await request.json();
    const { relationshipIds, updates } = body;

    if (!Array.isArray(relationshipIds) || relationshipIds.length === 0) {
      return NextResponse.json(
        { error: 'relationshipIds array is required' }, 
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'updates object is required' }, 
        { status: 400 }
      );
    }

    // Validate updates
    if (updates.strengthScore !== undefined) {
      updates.strengthScore = Math.max(1, Math.min(10, updates.strengthScore));
    }
    if (updates.interactionCount !== undefined) {
      updates.interactionCount = Math.max(0, updates.interactionCount);
    }
    if (updates.contextNotes !== undefined) {
      updates.contextNotes = updates.contextNotes.trim();
    }
    if (updates.followUpNotes !== undefined) {
      updates.followUpNotes = updates.followUpNotes.trim();
    }

    // TODO: Implement bulk relationship updates
    // This would require extending databaseService with updateRelationship method
    
    return NextResponse.json({
      success: true,
      data: [],
      message: 'Bulk relationship updates not yet implemented'
    });

  } catch (error) {
    console.error('PUT /api/relationships error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update relationships',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, 
      { status: 500 }
    );
  }
}

// DELETE /api/relationships - Bulk delete relationships
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authSession = requireAuth(session);
    requirePermission(authSession.user, 'write');
    
    const { organization } = authSession;

    // Parse request body
    const body = await request.json();
    const { relationshipIds } = body;

    if (!Array.isArray(relationshipIds) || relationshipIds.length === 0) {
      return NextResponse.json(
        { error: 'relationshipIds array is required' }, 
        { status: 400 }
      );
    }

    // TODO: Implement bulk relationship deletion
    // This would require extending databaseService with deleteRelationship method
    
    return NextResponse.json({
      success: true,
      data: [],
      message: 'Bulk relationship deletion not yet implemented'
    });

  } catch (error) {
    console.error('DELETE /api/relationships error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete relationships',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, 
      { status: 500 }
    );
  }
} 