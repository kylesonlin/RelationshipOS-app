import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, requireAuth, requirePermission } from '@/lib/auth';
import { databaseService, type SearchFilters } from '@/lib/database';

// GET /api/people - Search and list people
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

    // Parse search parameters
    const filters: SearchFilters = {
      query: searchParams.get('q') || undefined,
      industry: searchParams.get('industry') || undefined,
      seniorityLevel: searchParams.get('seniority') || undefined,
      location: searchParams.get('location') || undefined,
      lastInteractionDays: searchParams.get('last_interaction') 
        ? parseInt(searchParams.get('last_interaction')!) 
        : undefined,
      tags: searchParams.get('tags') 
        ? searchParams.get('tags')!.split(',') 
        : undefined,
      relationshipStrength: {
        min: searchParams.get('strength_min') 
          ? parseInt(searchParams.get('strength_min')!) 
          : undefined,
        max: searchParams.get('strength_max') 
          ? parseInt(searchParams.get('strength_max')!) 
          : undefined,
      },
      limit: Math.min(100, parseInt(searchParams.get('limit') || '24')),
      offset: parseInt(searchParams.get('offset') || '0'),
      sortBy: (searchParams.get('sort') as any) || 'firstName',
      sortOrder: (searchParams.get('order') as 'asc' | 'desc') || 'asc',
    };

    // Search people
    const result = await databaseService.searchPeople(organization.id, filters);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        hasMore: result.hasMore
      }
    });

  } catch (error) {
    console.error('GET /api/people error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch people',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, 
      { status: 500 }
    );
  }
}

// POST /api/people - Create new person
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
      firstName,
      lastName,
      email,
      phone,
      title,
      company,
      industry,
      seniorityLevel,
      department,
      linkedinUrl,
      twitterUrl,
      websiteUrl,
      location,
      relationshipStrength,
      lastInteractionDate,
      interactionFrequency,
      communicationPreferences = {},
      notes,
      tags = [],
      personalityProfile = {},
      interests = [],
      mutualConnections = 0,
      influenceScore = 0
    } = body;

    // Basic validation
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' }, 
        { status: 400 }
      );
    }

    // Check if person with same email already exists
    if (email) {
      const existingPeople = await databaseService.searchPeople(organization.id, {
        query: email,
        limit: 1
      });
      
      const emailExists = existingPeople.data.some(person => 
        person.email?.toLowerCase() === email.toLowerCase()
      );
      
      if (emailExists) {
        return NextResponse.json(
          { error: 'A person with this email already exists' }, 
          { status: 409 }
        );
      }
    }

    // Create person
    const person = await databaseService.createPerson(
      organization.id,
      user.id,
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email?.trim(),
        phone: phone?.trim(),
        title: title?.trim(),
        company: company?.trim(),
        industry: industry?.toLowerCase(),
        seniorityLevel,
        department: department?.trim(),
        linkedinUrl: linkedinUrl?.trim(),
        twitterUrl: twitterUrl?.trim(),
        websiteUrl: websiteUrl?.trim(),
        location: location?.trim(),
        relationshipStrength: relationshipStrength || 5,
        lastInteractionDate,
        interactionFrequency,
        communicationPreferences,
        notes: notes?.trim(),
        tags: tags.map((tag: string) => tag.trim().toLowerCase()),
        personalityProfile,
        interests: interests.map((interest: string) => interest.trim()),
        mutualConnections,
        influenceScore
      }
    );

    return NextResponse.json({
      success: true,
      data: person
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/people error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create person',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, 
      { status: 500 }
    );
  }
}

// PUT /api/people - Bulk update people
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
    const { peopleIds, updates } = body;

    if (!Array.isArray(peopleIds) || peopleIds.length === 0) {
      return NextResponse.json(
        { error: 'peopleIds array is required' }, 
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'updates object is required' }, 
        { status: 400 }
      );
    }

    // Update each person
    const results = [];
    const errors = [];

    for (const personId of peopleIds) {
      try {
        const updatedPerson = await databaseService.updatePerson(
          personId,
          organization.id,
          updates
        );
        results.push(updatedPerson);
      } catch (error) {
        errors.push({
          personId,
          error: (error as Error).message
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('PUT /api/people error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update people',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, 
      { status: 500 }
    );
  }
}

// DELETE /api/people - Bulk delete people
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
    const { peopleIds } = body;

    if (!Array.isArray(peopleIds) || peopleIds.length === 0) {
      return NextResponse.json(
        { error: 'peopleIds array is required' }, 
        { status: 400 }
      );
    }

    // Delete each person
    const results = [];
    const errors = [];

    for (const personId of peopleIds) {
      try {
        await databaseService.deletePerson(personId, organization.id);
        results.push({ personId, deleted: true });
      } catch (error) {
        errors.push({
          personId,
          error: (error as Error).message
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('DELETE /api/people error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete people',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, 
      { status: 500 }
    );
  }
} 