import { redirect } from 'next/navigation';
import { getServerSession, requireAuth } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import VAComparisonCard from '@/components/va-comparison/va-comparison-card';
import ROICaseStudies from '@/components/va-comparison/roi-case-studies';
import VAReplacementCalculator from '@/components/va-comparison/va-replacement-calculator';
import CompetitiveMatrix from '@/components/va-comparison/competitive-matrix';
import { DollarSign, Zap, Target, TrendingUp, Calculator, FileText, Award, Users } from 'lucide-react';

export default async function VAComparisonPage() {
  // Check authentication
  const session = await getServerSession();
  if (!session) {
    redirect('/auth/login');
  }

  const authSession = requireAuth(session);
  const { user, organization } = authSession;

  return (
    <DashboardLayout user={user} organization={organization}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">VA Replacement ROI</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive analysis proving 10x value at 20x less cost than human VAs
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FileText className="h-4 w-4 mr-2" />
                ROI Report
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Savings
              </button>
            </div>
          </div>
        </div>

        {/* Value Proposition Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 mb-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">RelationshipOS vs Human VAs</h2>
            <p className="text-xl mb-6">Superior relationship intelligence at a fraction of the cost</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">94%</div>
                <div className="text-sm opacity-90">Cost Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">1,440x</div>
                <div className="text-sm opacity-90">Faster Response</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm opacity-90">Always Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">∞</div>
                <div className="text-sm opacity-90">Infinite Scale</div>
              </div>
            </div>
          </div>
        </div>

        {/* ROI Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Savings</p>
                <p className="text-2xl font-bold text-gray-900">$4,401</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">vs $5,400 Senior VA</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Performance Advantage</p>
                <p className="text-2xl font-bold text-gray-900">1,440x</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600">Faster than human research</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Annual ROI</p>
                <p className="text-2xl font-bold text-gray-900">5,281%</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-purple-600">Exceptional returns</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Payback Period</p>
                <p className="text-2xl font-bold text-gray-900">0.2</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-orange-600">Months to break even</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Analysis */}
          <div className="lg:col-span-2 space-y-8">
            {/* VA Comparison Analysis */}
            <VAComparisonCard organizationId={organization.id} subscriptionTier={organization.subscriptionTier} />
            
            {/* Competitive Matrix */}
            <CompetitiveMatrix />
            
            {/* ROI Case Studies */}
            <ROICaseStudies />
          </div>

          {/* Right Column - Calculator & Tools */}
          <div className="space-y-8">
            {/* VA Replacement Calculator */}
            <VAReplacementCalculator organizationId={organization.id} />
            
            {/* Key Differentiators */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Why RelationshipOS Wins
                </h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-gray-900">Instant Intelligence</div>
                      <div className="text-sm text-gray-600">Sub-10 second Oracle responses vs hours of human research</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-gray-900">AI Pattern Recognition</div>
                      <div className="text-sm text-gray-600">Superhuman ability to identify relationship opportunities</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-gray-900">Perfect Memory</div>
                      <div className="text-sm text-gray-600">Never forgets any relationship detail or context</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-gray-900">Infinite Scalability</div>
                      <div className="text-sm text-gray-600">Handle unlimited simultaneous requests without degradation</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium text-gray-900">Continuous Learning</div>
                      <div className="text-sm text-gray-600">AI improves capabilities automatically over time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Guarantee */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Success Guarantee
              </h4>
              <div className="space-y-3 text-sm text-green-800">
                <div>
                  <strong>• 30-Day Money Back:</strong> Risk-free trial period
                </div>
                <div>
                  <strong>• Performance SLA:</strong> Sub-10 second response guarantee
                </div>
                <div>
                  <strong>• ROI Promise:</strong> Minimum 300% ROI or money back
                </div>
                <div>
                  <strong>• 99.8% Uptime:</strong> Always available when you need it
                </div>
                <div>
                  <strong>• Data Security:</strong> Enterprise-grade security and privacy
                </div>
              </div>
            </div>

            {/* Migration Support */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Migration Support
                </h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">1</span>
                    </div>
                    <span>Free consultation to assess current VA costs</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">2</span>
                    </div>
                    <span>Parallel operation during 30-day transition</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">3</span>
                    </div>
                    <span>Data import and team training included</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">4</span>
                    </div>
                    <span>Dedicated success manager for Enterprise</span>
                  </div>
                </div>
                
                <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                  Schedule Migration Call
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="bg-gray-900 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Replace Your Human VA?</h3>
          <p className="text-lg mb-6 text-gray-300">
            Join hundreds of executives saving $50K+ annually with superior AI relationship intelligence
          </p>
          
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100">
              Start Free Trial
            </button>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
              Schedule Demo
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-400">
            30-day money-back guarantee • No setup fees • Cancel anytime
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 