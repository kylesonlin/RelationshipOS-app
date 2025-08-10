import { redirect, notFound } from 'next/navigation';
import { getServerSession, requireAuth } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import MeetingPrep from '@/components/calendar/meeting-prep';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function MeetingPrepPage({ params }: PageProps) {
  // Check authentication
  const session = await getServerSession();
  if (!session) {
    redirect('/auth/login');
  }

  const authSession = requireAuth(session);
  const { user, organization } = authSession;

  // Mock meeting validation - in production this would check if meeting exists
  const validMeetingIds = ['event_001', 'event_002', 'event_003'];
  if (!validMeetingIds.includes(params.id)) {
    notFound();
  }

  // Mock meeting data for context
  const meetingTitles: Record<string, string> = {
    'event_001': 'Product Strategy Discussion',
    'event_002': 'One-on-One with David Rodriguez',
    'event_003': 'RelationshipOS Demo - Jennifer Park'
  };

  const meetingTitle = meetingTitles[params.id] || 'Meeting Preparation';

  return (
    <DashboardLayout user={user} organization={organization}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/dashboard/calendar"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Calendar
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meeting Preparation</h1>
              <p className="text-gray-600 mt-1">
                AI-powered context and relationship intelligence for {meetingTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Meeting Preparation Component */}
        <MeetingPrep 
          eventId={params.id}
          onContextLoaded={(context) => {
            console.log('Meeting context loaded:', context);
          }}
        />

        {/* Additional Resources */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Oracle Intelligence</h4>
              <p className="text-sm text-gray-600 mb-3">
                Get deeper relationship insights from Oracle
              </p>
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Ask Oracle →
              </Link>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">People Profiles</h4>
              <p className="text-sm text-gray-600 mb-3">
                Review detailed attendee relationship data
              </p>
              <Link
                href="/dashboard/people"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View People →
              </Link>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Calendar Analytics</h4>
              <p className="text-sm text-gray-600 mb-3">
                Analyze meeting patterns and relationship trends
              </p>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View Analytics →
              </button>
            </div>
          </div>
        </div>

        {/* AI Preparation Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 AI Meeting Preparation Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <strong>• Review Context:</strong> Use the AI-generated insights to understand relationship dynamics
            </div>
            <div>
              <strong>• Check Talking Points:</strong> Prioritize topics based on attendee interests and history
            </div>
            <div>
              <strong>• Prepare Questions:</strong> Ask about mutual connections and shared interests
            </div>
            <div>
              <strong>• Set Outcomes:</strong> Define clear objectives based on AI recommendations
            </div>
            <div>
              <strong>• Plan Follow-up:</strong> Note the suggested post-meeting actions
            </div>
            <div>
              <strong>• Update Records:</strong> Document outcomes to improve future AI insights
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 