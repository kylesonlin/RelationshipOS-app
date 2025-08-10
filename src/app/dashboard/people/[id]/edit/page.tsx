import { redirect, notFound } from 'next/navigation';
import { getServerSession, requireAuth } from '@/lib/auth';
import { databaseService, getFullName } from '@/lib/database';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import PersonForm from '@/components/people/person-form';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditPersonPage({ params }: PageProps) {
  // Check authentication
  const session = await getServerSession();
  if (!session) {
    redirect('/auth/login');
  }

  const authSession = requireAuth(session);
  const { user, organization } = authSession;

  try {
    // Fetch person data
    const person = await databaseService.getPerson(params.id, organization.id);
    
    if (!person) {
      notFound();
    }

    return (
      <DashboardLayout user={user} organization={organization}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <a
                href={`/dashboard/people/${params.id}`}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to {getFullName(person)}
              </a>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit {getFullName(person)}
            </h1>
            <p className="text-gray-600 mt-2">
              Update contact information and relationship details
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
              <p className="text-sm text-gray-600 mt-1">
                Update the details for this professional contact
              </p>
            </div>
            
            <div className="p-6">
              <PersonForm 
                mode="edit"
                person={person}
                organizationId={organization.id}
                onSuccess={`/dashboard/people/${params.id}`}
                onCancel={`/dashboard/people/${params.id}`}
              />
            </div>
          </div>

          {/* Tips for Editing */}
          <div className="mt-8 bg-amber-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-3">
              💡 Tips for Updating Contacts
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-amber-800">
              <div>
                <strong>• Keep it Current:</strong> Update job titles and companies when they change
              </div>
              <div>
                <strong>• Relationship Strength:</strong> Adjust based on recent interactions
              </div>
              <div>
                <strong>• Add Context:</strong> Include notes about recent conversations
              </div>
              <div>
                <strong>• Update Interactions:</strong> Record when you last connected
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );

  } catch (error) {
    console.error('Edit person page error:', error);
    
    return (
      <DashboardLayout user={user} organization={organization}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Person
          </h1>
          <p className="text-gray-600 mb-8">
            There was an issue loading this person&apos;s details for editing.
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