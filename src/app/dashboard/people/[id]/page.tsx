import { redirect, notFound } from 'next/navigation';
import { getServerSession, requireAuth } from '@/lib/auth';
import { databaseService, getFullName, getPersonDisplayTitle, formatRelationshipStrength } from '@/lib/database';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import PersonDetailView from '@/components/people/person-detail-view';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function PersonDetailPage({ params }: PageProps) {
  // Check authentication
  const session = await getServerSession();
  if (!session) {
    redirect('/auth/login');
  }

  const authSession = requireAuth(session);
  const { user, organization } = authSession;

  try {
    // Fetch person with relationships
    const person = await databaseService.getPerson(params.id, organization.id);
    
    if (!person) {
      notFound();
    }

    // Fetch relationships for this person
    const relationships = await databaseService.getPersonRelationships(
      params.id, 
      organization.id
    );

    return (
      <DashboardLayout user={user} organization={organization}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <a
                href="/dashboard/people"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to People
              </a>
            </div>
            
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-3xl font-medium">
                    {person.firstName.charAt(0)}{person.lastName.charAt(0)}
                  </span>
                </div>
                
                {/* Basic Info */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {getFullName(person)}
                  </h1>
                  <p className="text-xl text-gray-600 mt-1">
                    {getPersonDisplayTitle(person)}
                  </p>
                  {person.location && (
                    <p className="text-gray-500 mt-1">📍 {person.location}</p>
                  )}
                  
                  {/* Relationship Strength */}
                  <div className="flex items-center mt-3">
                    <span className="text-sm text-gray-500 mr-2">Relationship Strength:</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((person.relationshipStrength || 0) / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatRelationshipStrength(person.relationshipStrength || 0)} ({person.relationshipStrength || 0}/10)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <a
                  href={`/dashboard/people/${params.id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  ✏️ Edit
                </a>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  💬 Ask Oracle
                </button>
              </div>
            </div>
          </div>

          {/* Person Detail Content */}
          <PersonDetailView 
            person={person} 
            relationships={relationships}
            organizationId={organization.id}
          />
        </div>
      </DashboardLayout>
    );

  } catch (error) {
    console.error('Person detail page error:', error);
    
    return (
      <DashboardLayout user={user} organization={organization}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Person
          </h1>
          <p className="text-gray-600 mb-8">
            There was an issue loading this person&apos;s details. Please try again.
          </p>
          <a
            href="/dashboard/people"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to People
          </a>
        </div>
      </DashboardLayout>
    );
  }
} 