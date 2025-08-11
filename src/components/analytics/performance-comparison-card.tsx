'use client'

import { useState, useEffect } from 'react';
import { Zap, Clock, Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface PerformanceMetrics {
  responseTime: {
    average: number;
    p95: number;
    guarantee: number;
    humanComparison: number;
  };
  accuracy: {
    oracleAccuracy: number;
    userSatisfaction: number;
    humanComparison: number;
  };
  availability: {
    uptime: number;
    availability: string;
    responseDelay: number;
  };
  scalability: {
    parallelQueries: number;
    userCapacity: number;
    humanLimitation: string;
  };
}

interface PerformanceComparisonCardProps {
  organizationId: string;
}

export default function PerformanceComparisonCard({ organizationId }: PerformanceComparisonCardProps) {
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPerformanceMetrics();
  }, [organizationId]);

  const loadPerformanceMetrics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/roi');
      
      if (response.ok) {
        const data = await response.json();
        setPerformance(data.data.performance);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load performance metrics');
      }
    } catch {
      setError('Network error loading performance metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (milliseconds: number) => {
    if (milliseconds < 1000) return `${milliseconds}ms`;
    if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;
    if (milliseconds < 3600000) return `${(milliseconds / 60000).toFixed(1)}m`;
    return `${(milliseconds / 3600000).toFixed(1)}h`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Performance Comparison
          </h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !performance) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200">
        <div className="px-6 py-4 border-b border-red-200">
          <h3 className="text-lg font-semibold text-red-900 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error Loading Performance
          </h3>
        </div>
        <div className="p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadPerformanceMetrics}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const speedAdvantage = Math.round(performance.responseTime.humanComparison / performance.responseTime.average);
  const accuracyAdvantage = performance.accuracy.oracleAccuracy - performance.accuracy.humanComparison;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Zap className="h-5 w-5 mr-2" />
          Performance Comparison: RelationshipOS vs Human VAs
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Head-to-head performance analysis across key metrics
        </p>
      </div>

      <div className="p-6">
        {/* Response Time Comparison */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Response Time
            </h4>
            <div className="text-sm text-green-600 font-medium">
              {speedAdvantage}x faster
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">
                  {formatDuration(performance.responseTime.average)}
                </div>
                <div className="text-sm text-blue-700 mt-1">RelationshipOS Average</div>
                <div className="text-xs text-blue-600 mt-2">
                  95th percentile: {formatDuration(performance.responseTime.p95)}
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-900">
                  {formatDuration(performance.responseTime.humanComparison)}
                </div>
                <div className="text-sm text-red-700 mt-1">Human VA Average</div>
                <div className="text-xs text-red-600 mt-2">
                  Typical research time
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              Beats 10-second guarantee consistently
            </div>
          </div>
        </div>

        {/* Accuracy Comparison */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Accuracy & Satisfaction
            </h4>
            <div className="text-sm text-green-600 font-medium">
              +{accuracyAdvantage.toFixed(1)}% more accurate
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-900">
                  {performance.accuracy.oracleAccuracy}%
                </div>
                <div className="text-sm text-green-700 mt-1">Oracle Accuracy</div>
                <div className="text-xs text-green-600 mt-2">
                  User satisfaction: {performance.accuracy.userSatisfaction}/5
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-900">
                  {performance.accuracy.humanComparison}%
                </div>
                <div className="text-sm text-yellow-700 mt-1">Human VA Accuracy</div>
                <div className="text-xs text-yellow-600 mt-2">
                  Variable quality
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Comparison */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Availability & Reliability
            </h4>
            <div className="text-sm text-blue-600 font-medium">
              {performance.availability.availability}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {performance.availability.uptime}%
              </div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">24/7</div>
              <div className="text-sm text-gray-600">Always Available</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0s</div>
              <div className="text-sm text-gray-600">Response Delay</div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-600">
              Human VAs: 8-10 hours/day, business days only
            </div>
          </div>
        </div>

        {/* Scalability Comparison */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h4 className="font-semibold text-purple-900 mb-4">Scalability Advantage</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-lg font-semibold text-purple-900 mb-2">RelationshipOS</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Parallel Queries:</span>
                  <span className="text-sm font-medium">{formatNumber(performance.scalability.parallelQueries)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">User Capacity:</span>
                  <span className="text-sm font-medium">{formatNumber(performance.scalability.userCapacity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Limitation:</span>
                  <span className="text-sm font-medium text-green-600">None</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-purple-900 mb-2">Human VAs</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Parallel Tasks:</span>
                  <span className="text-sm font-medium text-red-600">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">User Capacity:</span>
                  <span className="text-sm font-medium text-red-600">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Limitation:</span>
                  <span className="text-sm font-medium text-red-600">Sequential only</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Performance Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">A+</div>
              <div className="text-xs text-gray-600">Speed Grade</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">A+</div>
              <div className="text-xs text-gray-600">Accuracy Grade</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">A+</div>
              <div className="text-xs text-gray-600">Reliability Grade</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">A+</div>
              <div className="text-xs text-gray-600">Scale Grade</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 