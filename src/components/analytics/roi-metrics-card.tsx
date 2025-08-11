'use client'

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Clock,
  Calculator,
  Target,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface ROIMetrics {
  monthlyVACost: number;
  relationshipOSCost: number;
  monthlySavings: number;
  annualSavings: number;
  timesSavedHours: number;
  timeSavingsValue: number;
  totalROI: number;
  paybackPeriod: number;
  efficiency: number;
}

interface ROICalculation {
  investment: {
    relationshipOSCost: number;
    totalInvestment: number;
  };
  returns: {
    vaCostSavings: number;
    timeSavingsValue: number;
    opportunityValue: number;
    totalReturns: number;
  };
  metrics: {
    roi: number;
    paybackPeriod: number;
    npv: number;
    breakEvenPoint: string;
  };
}

interface ROIMetricsCardProps {
  organizationId: string;
  subscriptionTier?: string;
}

export default function ROIMetricsCard({ organizationId, subscriptionTier }: ROIMetricsCardProps) {
  const [roiData, setROIData] = useState<{
    vaReplacement: ROIMetrics;
    roi: ROICalculation;
    summary: {
      totalSavings: number;
      paybackPeriod: number;
      roiPercentage: number;
      efficiencyGain: number;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeHorizon, setTimeHorizon] = useState(12); // months

  useEffect(() => {
    loadROIMetrics();
  }, [organizationId, timeHorizon]);

  const loadROIMetrics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/roi?timeHorizon=${timeHorizon}`);
      
      if (response.ok) {
        const data = await response.json();
        setROIData(data.data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load ROI metrics');
      }
    } catch {
      setError('Network error loading ROI metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  };

  const getROIColor = (roi: number) => {
    if (roi >= 300) return 'text-green-600';
    if (roi >= 200) return 'text-blue-600';
    if (roi >= 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            ROI Analysis
          </h3>
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

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200">
        <div className="px-6 py-4 border-b border-red-200">
          <h3 className="text-lg font-semibold text-red-900 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error Loading ROI Metrics
          </h3>
        </div>
        <div className="p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadROIMetrics}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!roiData) return null;

  const { vaReplacement, roi, summary } = roiData;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              ROI Analysis vs Human VAs
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Return on investment and cost savings analysis
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Time Horizon:</label>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
            >
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
              <option value={24}>24 months</option>
              <option value={36}>36 months</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Key ROI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getROIColor(summary.roiPercentage)}`}>
              {formatPercentage(summary.roiPercentage, 0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total ROI</div>
            <div className="flex items-center justify-center mt-2">
              <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600">Exceptional return</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(summary.totalSavings)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Savings</div>
            <div className="text-xs text-gray-500 mt-2">
              Over {timeHorizon} months
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {summary.paybackPeriod.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 mt-1">Payback (Months)</div>
            <div className="flex items-center justify-center mt-2">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600">Fast recovery</span>
            </div>
          </div>
        </div>

        {/* Cost Comparison */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Monthly Cost Comparison</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-900">Human VA Cost</span>
                <ArrowDown className="h-4 w-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-900">
                {formatCurrency(vaReplacement.monthlyVACost)}
              </div>
              <div className="text-xs text-red-700 mt-1">
                Traditional relationship management
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900">RelationshipOS</span>
                <ArrowUp className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(vaReplacement.relationshipOSCost)}
              </div>
              <div className="text-xs text-green-700 mt-1">
                AI-powered relationship intelligence
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-lg font-semibold text-gray-900">
              Monthly Savings: <span className="text-green-600">{formatCurrency(vaReplacement.monthlySavings)}</span>
            </div>
            <div className="text-sm text-gray-600">
              {formatPercentage((vaReplacement.monthlySavings / vaReplacement.monthlyVACost) * 100)} cost reduction
            </div>
          </div>
        </div>

        {/* Value Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Investment Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">RelationshipOS Cost</span>
                <span className="text-sm font-medium">{formatCurrency(roi.investment.relationshipOSCost * timeHorizon)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Setup & Training</span>
                <span className="text-sm font-medium text-green-600">$0</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total Investment</span>
                <span className="font-medium">{formatCurrency(roi.investment.totalInvestment)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Returns Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">VA Cost Savings</span>
                <span className="text-sm font-medium">{formatCurrency(roi.returns.vaCostSavings)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Time Savings Value</span>
                <span className="text-sm font-medium">{formatCurrency(roi.returns.timeSavingsValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Opportunity Value</span>
                <span className="text-sm font-medium">{formatCurrency(roi.returns.opportunityValue)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total Returns</span>
                <span className="font-medium text-green-600">{formatCurrency(roi.returns.totalReturns)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Efficiency Metrics */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3">Efficiency Advantages</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{vaReplacement.efficiency.toFixed(1)}x</div>
              <div className="text-xs text-blue-700">More Cost Efficient</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{vaReplacement.timesSavedHours.toFixed(0)}</div>
              <div className="text-xs text-blue-700">Hours Saved/Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{formatCurrency(vaReplacement.timeSavingsValue)}</div>
              <div className="text-xs text-blue-700">Time Value/Month</div>
            </div>
          </div>
        </div>

        {/* Break-even Timeline */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Break-even Point</div>
              <div className="text-sm text-gray-600">{roi.metrics.breakEvenPoint}</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">Net Present Value</div>
              <div className={`text-sm font-medium ${roi.metrics.npv > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(roi.metrics.npv)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 