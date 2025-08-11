'use client'

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Clock, 
  Zap, 
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertCircle,
  Target
} from 'lucide-react';

interface VAComparisonData {
  cost: {
    humanVA: {
      monthlyCost: number;
      totalCostOwnership: number;
      additionalCosts: {
        benefits: number;
        training: number;
        tools: number;
        management: number;
        total: number;
      };
    };
    relationshipOS: {
      monthlyCost: number;
      totalCostOwnership: number;
    };
    savings: {
      monthly: number;
      annual: number;
      percentage: number;
    };
  };
  performance: {
    responseTime: {
      humanVA: number;
      relationshipOS: number;
      advantage: string;
    };
    accuracy: {
      humanVA: number;
      relationshipOS: number;
      advantage: number;
    };
    availability: {
      humanVA: string;
      relationshipOS: string;
      advantage: string;
    };
  };
  capabilities: {
    superiority: string[];
  };
}

interface VAComparisonCardProps {
  organizationId: string;
  subscriptionTier?: string;
}

export default function VAComparisonCard({ organizationId, subscriptionTier }: VAComparisonCardProps) {
  const [comparisonData, setComparisonData] = useState<VAComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVAComparison();
  }, [organizationId]);

  const loadVAComparison = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/va-comparison?type=comparison');
      
      if (response.ok) {
        const data = await response.json();
        setComparisonData(data.data.comparison);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load VA comparison');
      }
    } catch {
      setError('Network error loading VA comparison');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">VA Comparison Analysis</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !comparisonData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200">
        <div className="px-6 py-4 border-b border-red-200">
          <h3 className="text-lg font-semibold text-red-900 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error Loading Comparison
          </h3>
        </div>
        <div className="p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadVAComparison}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          RelationshipOS vs Human VA Analysis
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Comprehensive comparison across cost, performance, and capabilities
        </p>
      </div>

      <div className="p-6">
        {/* Cost Comparison */}
        <div className="mb-8">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Cost Analysis
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h5 className="font-medium text-red-900 mb-3">Human VA (Senior Level)</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-red-700">Base Cost:</span>
                  <span className="font-medium">{formatCurrency(comparisonData.cost.humanVA.monthlyCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Benefits (30%):</span>
                  <span className="font-medium">{formatCurrency(comparisonData.cost.humanVA.additionalCosts.benefits)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Training:</span>
                  <span className="font-medium">{formatCurrency(comparisonData.cost.humanVA.additionalCosts.training)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Tools & Software:</span>
                  <span className="font-medium">{formatCurrency(comparisonData.cost.humanVA.additionalCosts.tools)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Management (15%):</span>
                  <span className="font-medium">{formatCurrency(comparisonData.cost.humanVA.additionalCosts.management)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-red-900 font-medium">Total Monthly:</span>
                  <span className="font-bold text-lg">{formatCurrency(comparisonData.cost.humanVA.totalCostOwnership)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-medium text-green-900 mb-3">RelationshipOS ({subscriptionTier || 'Business'})</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Monthly Cost:</span>
                  <span className="font-medium">{formatCurrency(comparisonData.cost.relationshipOS.monthlyCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Setup Cost:</span>
                  <span className="font-medium text-green-600">$0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Training Cost:</span>
                  <span className="font-medium text-green-600">$0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Additional Tools:</span>
                  <span className="font-medium text-green-600">$0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Management:</span>
                  <span className="font-medium text-green-600">$0</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-green-900 font-medium">Total Monthly:</span>
                  <span className="font-bold text-lg">{formatCurrency(comparisonData.cost.relationshipOS.totalCostOwnership)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-lg font-semibold text-blue-900">
              Monthly Savings: <span className="text-green-600">{formatCurrency(comparisonData.cost.savings.monthly)}</span>
            </div>
            <div className="text-sm text-blue-700 mt-1">
              {comparisonData.cost.savings.percentage.toFixed(1)}% cost reduction • Annual savings: {formatCurrency(comparisonData.cost.savings.annual)}
            </div>
          </div>
        </div>

        {/* Performance Comparison */}
        <div className="mb-8">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Performance Metrics
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <Clock className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">Response Time</div>
                <div className="text-xs text-red-600">Human VA: {formatDuration(comparisonData.performance.responseTime.humanVA)}</div>
                <div className="text-xs text-green-600">RelationshipOS: {formatDuration(comparisonData.performance.responseTime.relationshipOS)}</div>
                <div className="text-sm font-medium text-blue-600 mt-1">{comparisonData.performance.responseTime.advantage}</div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <Target className="h-6 w-6 mx-auto text-green-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">Accuracy</div>
                <div className="text-xs text-red-600">Human VA: {comparisonData.performance.accuracy.humanVA}%</div>
                <div className="text-xs text-green-600">RelationshipOS: {comparisonData.performance.accuracy.relationshipOS}%</div>
                <div className="text-sm font-medium text-green-600 mt-1">+{comparisonData.performance.accuracy.advantage.toFixed(1)}% better</div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <Users className="h-6 w-6 mx-auto text-purple-600 mb-2" />
                <div className="text-sm text-gray-600 mb-1">Availability</div>
                <div className="text-xs text-red-600">Human VA: {comparisonData.performance.availability.humanVA}</div>
                <div className="text-xs text-green-600">RelationshipOS: {comparisonData.performance.availability.relationshipOS}</div>
                <div className="text-sm font-medium text-purple-600 mt-1">{comparisonData.performance.availability.advantage}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Capability Advantages */}
        <div className="mb-8">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            RelationshipOS Advantages
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comparisonData.capabilities.superiority.slice(0, 8).map((advantage, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{advantage}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Human VA Limitations */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 mb-3">Human VA Limitations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Limited to business hours only',
              'Sequential task processing',
              'Human errors and inconsistency',
              'Expensive benefits and overhead',
              'Training and management required',
              'Limited by human memory',
              'Cannot scale instantly',
              'Vacation and sick days'
            ].map((limitation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-red-700">{limitation}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 mb-2">
              The Verdict: RelationshipOS Delivers Superior Value
            </div>
            <div className="text-sm text-gray-700">
              <strong>94% cost savings</strong> with <strong>1,440x better performance</strong> and <strong>superhuman capabilities</strong> that no human VA can match
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 