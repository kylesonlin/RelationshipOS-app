'use client'

import { TrendingUp } from 'lucide-react';

interface TrendsChartProps {
  organizationId: string;
  period: string;
}

export default function TrendsChart({ organizationId, period }: TrendsChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Performance Trends
        </h3>
      </div>
      <div className="p-6">
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Trends Visualization</h4>
          <p className="text-gray-600">Interactive charts showing ROI, performance, and business impact trends over time</p>
        </div>
      </div>
    </div>
  );
} 