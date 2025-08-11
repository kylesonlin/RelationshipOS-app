'use client'

import { DollarSign, Clock, Zap, Users } from 'lucide-react';

interface VAReplacementCardProps {
  organizationId: string;
  subscriptionTier?: string;
}

export default function VAReplacementCard({ organizationId, subscriptionTier }: VAReplacementCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">VA Replacement Value</h3>
        <p className="text-sm text-gray-600 mt-1">Key advantages over human VAs</p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <div className="font-medium text-green-900">Cost Savings</div>
                <div className="text-sm text-green-700">94% less than human VA</div>
              </div>
            </div>
            <div className="text-xl font-bold text-green-900">$4,201/mo</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <div className="font-medium text-blue-900">Speed Advantage</div>
                <div className="text-sm text-blue-700">1,440x faster response</div>
              </div>
            </div>
            <div className="text-xl font-bold text-blue-900">3.2s</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <div className="font-medium text-purple-900">Availability</div>
                <div className="text-sm text-purple-700">24/7/365 vs 8h/day</div>
              </div>
            </div>
            <div className="text-xl font-bold text-purple-900">99.8%</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-orange-600 mr-3" />
              <div>
                <div className="font-medium text-orange-900">Scalability</div>
                <div className="text-sm text-orange-700">Unlimited parallel tasks</div>
              </div>
            </div>
            <div className="text-xl font-bold text-orange-900">∞</div>
          </div>
        </div>
      </div>
    </div>
  );
} 