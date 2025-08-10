import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, requireAuth, requirePermission } from '@/lib/auth';
import { databaseService } from '@/lib/database';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/people/[id] - Get specific person with relationships
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authSession = requireAuth(session);
    requirePermission(authSession.user, 'read');
    
    const { organization } = authSession;
    const { id: personId } = params;

    // Get person
    const person = await databaseService.getPerson(personId, organization.id);
    
    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' }, 
        { status: 404 }
      );
    }

    // Get relationships for this person
    const relationships = await databaseService.getPersonRelationships(
      personId, 
      organization.id
    );

    return NextResponse.json({
      success: true,
      data: {
        ...person,
        relationships
      }
    });

  } catch (error) {
    console.error(`GET /api/people/${params.id} error:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch person',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, 
      { status: 500 }
    );
  }
}

// PUT /api/people/[id] - Update specific person
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authSession = requireAuth(session);
    requirePermission(authSession.user, 'write');
    
    const { organization } = authSession;
    const { id: personId } = params;

    // Check if person exists
    const existingPerson = await databaseService.getPerson(personId, organization.id);
    if (!existingPerson) {
      return NextResponse.json(
        { error: 'Person not found' }, 
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const updates = { ...body };

    // Clean up string fields
    if (updates.firstName) updates.firstName = updates.firstName.trim();
    if (updates.lastName) updates.lastName = updates.lastName.trim();
    if (updates.email) updates.email = updates.email.trim();
    if (updates.phone) updates.phone = updates.phone.trim();
    if (updates.title) updates.title = updates.title.trim();
    if (updates.company) updates.company = updates.company.trim();
    if (updates.industry) updates.industry = updates.industry.toLowerCase();
    if (updates.department) updates.department = updates.department.trim();
    if (updates.linkedinUrl) updates.linkedinUrl = updates.linkedinUrl.trim();
    if (updates.twitterUrl) updates.twitterUrl = updates.twitterUrl.trim();
    if (updates.websiteUrl) updates.websiteUrl = updates.websiteUrl.trim();
    if (updates.location) updates.location = updates.location.trim();
    if (updates.notes) updates.notes = updates.notes.trim();
    
    // Process tags
    if (updates.tags && Array.isArray(updates.tags)) {
      updates.tags = updates.tags.map((tag: string) => tag.trim().toLowerCase());
    }
    
    // Process interests
    if (updates.interests && Array.isArray(updates.interests)) {
      updates.interests = updates.interests.map((interest: string) => interest.trim());
    }

    // Check for email conflicts (if email is being updated)
    if (updates.email && updates.email !== existingPerson.email) {
      const existingPeople = await databaseService.searchPeople(organization.id, {
        query: updates.email,
        limit: 1
      });
      
      const emailExists = existingPeople.data.some(person => 
        person.id !== personId && person.email?.toLowerCase() === updates.email.toLowerCase()
      );
      
      if (emailExists) {
        return NextResponse.json(
          { error: 'A person with this email already exists' }, 
          { status: 409 }
        );
      }
    }

    // Update person
    const updatedPerson = await databaseService.updatePerson(
      personId,
      organization.id,
      updates
    );

    return NextResponse.json({
      success: true,
      data: updatedPerson
    });

  } catch (error) {
    console.error(`PUT /api/people/${params.id} error:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to update person',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, 
      { status: 500 }
    );
  }
}

// DELETE /api/people/[id] - Delete specific person
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authSession = requireAuth(session);
    requirePermission(authSession.user, 'write');
    
    const { organization } = authSession;
    const { id: personId } = params;

    // Check if person exists
    const existingPerson = await databaseService.getPerson(personId, organization.id);
    if (!existingPerson) {
      return NextResponse.json(
        { error: 'Person not found' }, 
        { status: 404 }
      );
    }

    // Delete person (this will also delete related relationships)
    await databaseService.deletePerson(personId, organization.id);

    return NextResponse.json({
      success: true,
      message: 'Person deleted successfully'
    });

  } catch (error) {
    console.error(`DELETE /api/people/${params.id} error:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to delete person',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, 
      { status: 500 }
    );
  }
} 