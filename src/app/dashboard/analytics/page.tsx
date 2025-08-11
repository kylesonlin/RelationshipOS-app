import { redirect } from 'next/navigation';
import { getServerSession, requireAuth } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import ROIMetricsCard from '@/components/analytics/roi-metrics-card';
import PerformanceComparisonCard from '@/components/analytics/performance-comparison-card';
import BusinessImpactCard from '@/components/analytics/business-impact-card';
import VAReplacementCard from '@/components/analytics/va-replacement-card';
import TrendsChart from '@/components/analytics/trends-chart';
import BenchmarkCard from '@/components/analytics/benchmark-card';
import { BarChart3, TrendingUp, DollarSign, Zap, Users, Target, Calendar, Download } from 'lucide-react';

export default async function AnalyticsDashboardPage() {
  // Check authentication
  const session = await getServerSession();
  if (!session) {
    redirect('/auth/login');
  }

  const authSession = requireAuth(session);
  const { user, organization } = authSession;

  // Check if user has analytics access
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
              <h1 className="text-3xl font-bold text-gray-900">Executive Analytics</h1>
              <p className="text-gray-600 mt-2">
                ROI metrics, performance analytics, and business intelligence for RelationshipOS
              </p>
            </div>
            
            <div className="flex space-x-3">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
              
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <BarChart3 className="h-4 w-4 mr-2" />
                Custom Report
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Savings</p>
                <p className="text-2xl font-bold text-gray-900">$4,201</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">vs $4,500 human VA</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-gray-900">3.2s</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600">1,440x faster than human</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ROI</p>
                <p className="text-2xl font-bold text-gray-900">1,847%</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-purple-600">2.3 month payback</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Opportunities</p>
                <p className="text-2xl font-bold text-gray-900">$2.34M</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-orange-600">23 identified this month</span>
            </div>
          </div>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Primary Metrics */}
          <div className="lg:col-span-2 space-y-8">
            {/* ROI Metrics */}
            <ROIMetricsCard organizationId={organization.id} subscriptionTier={organization.subscriptionTier} />
            
            {/* Performance Comparison */}
            <PerformanceComparisonCard organizationId={organization.id} />
            
            {/* Business Impact */}
            <BusinessImpactCard organizationId={organization.id} />
            
            {/* Trends Chart */}
            <TrendsChart organizationId={organization.id} period="month" />
          </div>

          {/* Right Column - Secondary Metrics */}
          <div className="space-y-8">
            {/* VA Replacement Card */}
            <VAReplacementCard organizationId={organization.id} subscriptionTier={organization.subscriptionTier} />
            
            {/* Benchmark Card */}
            <BenchmarkCard />
            
            {/* Executive Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Executive Summary</h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">💰 Cost Optimization</h4>
                    <p className="text-sm text-green-800">
                      RelationshipOS saves <strong>$4,201/month</strong> compared to human VAs, 
                      with <strong>94% cost reduction</strong> and <strong>2.3 month payback</strong>.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">⚡ Performance Advantage</h4>
                    <p className="text-sm text-blue-800">
                      <strong>3.2 second</strong> average response time vs <strong>12 hours</strong> 
                      for human VAs. <strong>24/7 availability</strong> with <strong>99.8% uptime</strong>.
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">📈 Business Impact</h4>
                    <p className="text-sm text-purple-800">
                      <strong>$2.34M</strong> in opportunities identified, 
                      <strong>340% team efficiency</strong> gain, and <strong>847 relationships</strong> 
                      actively managed.
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-900 mb-2">🚀 Scalability</h4>
                    <p className="text-sm text-orange-800">
                      Handle <strong>1,000 simultaneous queries</strong> vs human VAs limited to 
                      <strong>one task at a time</strong>. Infinite scale potential.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">
                      <strong>ROI Leadership:</strong> Your 1,847% ROI is 3.2x higher than industry average
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">
                      <strong>Speed Advantage:</strong> 1,440x faster than human VAs creates massive competitive edge
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">
                      <strong>Opportunity Detection:</strong> AI identified 23 opportunities worth $2.34M this month
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">
                      <strong>Team Efficiency:</strong> 340% productivity gain through relationship intelligence
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recommended Actions</h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-gray-700">
                      Schedule quarterly business review to showcase ROI metrics
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-gray-700">
                      Expand team access to maximize network effect value
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Target className="h-4 w-4 text-purple-600" />
                    <p className="text-sm text-gray-700">
                      Act on high-value opportunities identified by Oracle
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <p className="text-sm text-gray-700">
                      Track competitor adoption to maintain advantage
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Additional Analytics */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Benchmarks</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">A+</div>
              <div className="text-sm text-gray-600">Cost Efficiency Grade</div>
              <div className="text-xs text-gray-500 mt-1">vs Industry Standard</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">A+</div>
              <div className="text-sm text-gray-600">Performance Grade</div>
              <div className="text-xs text-gray-500 mt-1">Response Time & Accuracy</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">A+</div>
              <div className="text-sm text-gray-600">ROI Grade</div>
              <div className="text-xs text-gray-500 mt-1">Return on Investment</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 