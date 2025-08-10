import { redirect } from 'next/navigation';
import { getServerSession, requireAuth } from '@/lib/auth';
import { databaseService } from '@/lib/database';
import { billingService, formatPrice, getDaysUntilTrialExpiry } from '@/lib/billing';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import OracleSearch from '@/components/oracle/oracle-search';
import StatsCards from '@/components/dashboard/stats-cards';
import RecentActivity from '@/components/dashboard/recent-activity';
import QuickActions from '@/components/dashboard/quick-actions';

export default async function DashboardPage() {
  // Check authentication
  const session = await getServerSession();
  if (!session) {
    redirect('/auth/login');
  }

  const authSession = requireAuth(session);
  const { user, organization } = authSession;

  try {
    // Fetch dashboard data in parallel
    const [subscription, recentQueries, peopleStats] = await Promise.all([
      billingService.getSubscription(organization.id),
      databaseService.getOracleHistory(organization.id, user.id, 10),
      getDashboardStats(organization.id)
    ]);

    // Calculate trial info
    const trialDaysLeft = subscription ? getDaysUntilTrialExpiry(subscription.trialEndsAt) : 0;
    const isTrialActive = subscription?.status === 'trial' && trialDaysLeft > 0;

    return (
      <DashboardLayout user={user} organization={organization}>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.firstName}
              </h1>
              <p className="text-gray-600 mt-2">
                Here&apos;s your relationship intelligence overview for {organization.name}
              </p>
            </div>
            
            {/* Trial/Subscription Status */}
            {subscription && (
              <div className="mt-4 lg:mt-0">
                {isTrialActive ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Trial:</span> {trialDaysLeft} days remaining
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <p className="text-sm text-green-700">
                      <span className="font-medium">{subscription.tier.replace('_', ' ').toUpperCase()}:</span> {formatPrice(subscription.price)}
                      {subscription.billingCycle === 'annual' ? '/year' : '/month'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <StatsCards stats={peopleStats} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Oracle Search */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Ask Oracle Anything
                  </h2>
                  <p className="text-gray-600">
                    Get instant insights about your professional relationships
                  </p>
                </div>
                <OracleSearch />
              </div>

              {/* Recent Activity */}
              <div className="mt-8">
                <RecentActivity queries={recentQueries} />
              </div>
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              <QuickActions organizationId={organization.id} />
              
              {/* Subscription Info */}
              {subscription && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Subscription</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">
                        {subscription.tier.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        subscription.status === 'active' ? 'text-green-600' :
                        subscription.status === 'trial' ? 'text-blue-600' :
                        'text-red-600'
                      }`}>
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">
                        {formatPrice(subscription.price)}
                        {subscription.billingCycle === 'annual' ? '/year' : '/month'}
                      </span>
                    </div>
                    {isTrialActive && (
                      <div className="pt-3 border-t border-gray-200">
                        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          Upgrade Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Help & Support */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                <div className="space-y-2">
                  <a 
                    href="/docs" 
                    className="block text-blue-600 hover:text-blue-700 text-sm"
                  >
                    📚 Documentation
                  </a>
                  <a 
                    href="/support" 
                    className="block text-blue-600 hover:text-blue-700 text-sm"
                  >
                    💬 Contact Support
                  </a>
                  <a 
                    href="/demo" 
                    className="block text-blue-600 hover:text-blue-700 text-sm"
                  >
                    🎥 Watch Demo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );

  } catch (error) {
    console.error('Dashboard error:', error);
    
    // Fallback UI in case of errors
    return (
      <DashboardLayout user={user} organization={organization}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to RelationshipOS
          </h1>
          <p className="text-gray-600 mb-8">
            There was an issue loading your dashboard. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </DashboardLayout>
    );
  }
}

// Helper function to get dashboard statistics
async function getDashboardStats(organizationId: string) {
  try {
    // Get basic stats from database
    const peopleResult = await databaseService.searchPeople(organizationId, { limit: 1 });
    const totalPeople = peopleResult.total;
    
    // Get people with recent interactions (last 30 days)
    const recentInteractions = await databaseService.searchPeople(organizationId, {
      lastInteractionDays: 30,
      limit: 1
    });
    
    // Get strong relationships (strength >= 7)
    const strongRelationships = await databaseService.searchPeople(organizationId, {
      relationshipStrength: { min: 7 },
      limit: 1
    });

    return {
      totalPeople,
      recentInteractions: recentInteractions.total,
      strongRelationships: strongRelationships.total,
      needsFollowUp: Math.max(0, totalPeople - recentInteractions.total) // People without recent interaction
    };

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalPeople: 0,
      recentInteractions: 0,
      strongRelationships: 0,
      needsFollowUp: 0
    };
  }
} 