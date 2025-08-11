'use client'

import { useState, useEffect } from 'react';
import { Target, Users, TrendingUp, Briefcase, AlertCircle } from 'lucide-react';

interface BusinessImpactCardProps {
  organizationId: string;
}

export default function BusinessImpactCard({ organizationId }: BusinessImpactCardProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, [organizationId]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Business Impact</h3>
        </div>
        <div className="p-6 animate-pulse">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Business Impact
        </h3>
        <p className="text-sm text-gray-600 mt-1">Key metrics and opportunities identified</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-green-600" />
              <span className="text-lg font-bold text-green-900">$2.34M</span>
            </div>
            <div className="text-sm text-green-700">Opportunities Identified</div>
            <div className="text-xs text-green-600 mt-1">23 opportunities this month</div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-bold text-blue-900">847</span>
            </div>
            <div className="text-sm text-blue-700">Active Relationships</div>
            <div className="text-xs text-blue-600 mt-1">234 strong connections</div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-lg font-bold text-purple-900">340%</span>
            </div>
            <div className="text-sm text-purple-700">Team Efficiency Gain</div>
            <div className="text-xs text-purple-600 mt-1">vs manual processes</div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="h-5 w-5 text-orange-600" />
              <span className="text-lg font-bold text-orange-900">89</span>
            </div>
            <div className="text-sm text-orange-700">Meetings Prepared</div>
            <div className="text-xs text-orange-600 mt-1">AI-powered context</div>
          </div>
        </div>
      </div>
    </div>
  );
} 