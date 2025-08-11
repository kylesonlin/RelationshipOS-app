import { redirect } from 'next/navigation';
import { getServerSession, requireAuth } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import TeamMembersCard from '@/components/team/team-members-card';
import TeamInsightsCard from '@/components/team/team-insights-card';
import TeamActivityFeed from '@/components/team/team-activity-feed';
import SharedRelationshipsCard from '@/components/team/shared-relationships-card';
import { Users, Share2, TrendingUp, Activity, Target, Network } from 'lucide-react';

export default async function TeamDashboardPage() {
  // Check authentication
  const session = await getServerSession();
  if (!session) {
    redirect('/auth/login');
  }

  const authSession = requireAuth(session);
  const { user, organization } = authSession;

  // Check if user has team access permissions
  if (user.role === 'viewer') {
    redirect('/dashboard');
  }

  return (
    <DashboardLayout user={user} organization={organization}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Collaborate on relationships and share intelligence across your organization
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Share2 className="h-4 w-4 mr-2" />
                Share Relationship
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <Users className="h-4 w-4 mr-2" />
                Invite Member
              </button>
            </div>
          </div>
        </div>

        {/* Team Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">3 active this week</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Share2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shared Relationships</p>
                <p className="text-2xl font-bold text-gray-900">47</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">+5 this week</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Reach Score</p>
                <p className="text-2xl font-bold text-gray-900">85</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-purple-600">+12% this month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Insights</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-orange-600">3 high priority</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Team Insights */}
            <TeamInsightsCard organizationId={organization.id} />
            
            {/* Shared Relationships */}
            <SharedRelationshipsCard organizationId={organization.id} userId={user.id} />
            
            {/* Team Network Visualization */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Network className="h-5 w-5 mr-2" />
                      Team Network Overview
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Visualize your team&apos;s collective relationship network
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Full Network →
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Network className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Network Visualization</h4>
                  <p className="text-gray-600 mb-4">
                    Interactive network graph showing team relationship connections and overlaps
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">847</div>
                      <div className="text-gray-600">Total Contacts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">23</div>
                      <div className="text-gray-600">Network Overlaps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">156</div>
                      <div className="text-gray-600">Unique Connections</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Team Members */}
            <TeamMembersCard organizationId={organization.id} currentUserId={user.id} />
            
            {/* Team Activity Feed */}
            <TeamActivityFeed organizationId={organization.id} />
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share a Relationship
                  </button>
                  
                  <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Users className="h-4 w-4 mr-2" />
                    Invite Team Member
                  </button>
                  
                  <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </button>
                  
                  <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Activity className="h-4 w-4 mr-2" />
                    Export Team Data
                  </button>
                </div>
              </div>
            </div>

            {/* Collaboration Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-3">💡 Collaboration Tips</h4>
              <div className="space-y-3 text-sm text-blue-800">
                <div>
                  <strong>• Share Context:</strong> Include notes about why you&apos;re sharing a relationship
                </div>
                <div>
                  <strong>• Use Insights:</strong> Act on AI-generated collaboration opportunities
                </div>
                <div>
                  <strong>• Track Activity:</strong> Monitor team relationship activities for coordination
                </div>
                <div>
                  <strong>• Set Permissions:</strong> Control who can view, edit, or contact shared relationships
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 