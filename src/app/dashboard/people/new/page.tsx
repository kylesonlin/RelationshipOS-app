import { redirect } from 'next/navigation';
import { getServerSession, requireAuth } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import PersonForm from '@/components/people/person-form';

export default async function NewPersonPage() {
  // Check authentication
  const session = await getServerSession();
  if (!session) {
    redirect('/auth/login');
  }

  const authSession = requireAuth(session);
  const { user, organization } = authSession;

  return (
    <DashboardLayout user={user} organization={organization}>
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-900">Add New Person</h1>
          <p className="text-gray-600 mt-2">
            Add a new contact to your professional relationship network
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
            <p className="text-sm text-gray-600 mt-1">
              Enter the details for your new professional contact
            </p>
          </div>
          
          <div className="p-6">
            <PersonForm 
              mode="create"
              organizationId={organization.id}
              onSuccess="/dashboard/people"
              onCancel="/dashboard/people"
            />
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Quick Tips for Better Relationship Management
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <strong>• Complete Profile:</strong> More details help Oracle provide better insights
            </div>
            <div>
              <strong>• Relationship Strength:</strong> Rate 1-10 based on your connection depth
            </div>
            <div>
              <strong>• Tags:</strong> Use consistent tags for easy filtering and grouping
            </div>
            <div>
              <strong>• Notes:</strong> Include context about how you met and key details
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 