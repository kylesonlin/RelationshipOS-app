// Business Intelligence Service for RelationshipOS
// Executive analytics, ROI tracking, and VA replacement metrics

import { supabase } from './supabase';

// Business Intelligence types
export interface VAReplacementMetrics {
  monthlyVACost: number; // What they would pay for human VA
  relationshipOSCost: number; // What they pay us
  monthlySavings: number; // Direct cost savings
  annualSavings: number; // Projected annual savings
  timesSavedHours: number; // Hours saved vs manual work
  timeSavingsValue: number; // Dollar value of time saved
  totalROI: number; // Total return on investment
  paybackPeriod: number; // Months to break even
  efficiency: number; // Speed improvement vs human VA
}

export interface PerformanceMetrics {
  responseTime: {
    average: number; // Average Oracle response time (ms)
    p95: number; // 95th percentile response time
    guarantee: number; // Our 10-second guarantee
    humanComparison: number; // How much faster than human
  };
  accuracy: {
    oracleAccuracy: number; // AI accuracy percentage
    userSatisfaction: number; // User satisfaction score
    humanComparison: number; // Accuracy vs human VA
  };
  availability: {
    uptime: number; // System uptime percentage
    availability: string; // 24/7 vs human VA hours
    responseDelay: number; // Immediate vs human response time
  };
  scalability: {
    parallelQueries: number; // Simultaneous queries handled
    userCapacity: number; // Users served simultaneously
    humanLimitation: string; // Human VA limitations
  };
}

export interface BusinessImpact {
  relationshipMetrics: {
    totalRelationships: number;
    activeRelationships: number;
    relationshipGrowth: number; // Month-over-month growth
    strongRelationships: number; // Relationships scoring 8+
    networkReach: number; // Unique organizations connected
  };
  opportunityMetrics: {
    opportunitiesIdentified: number;
    opportunitiesActedUpon: number;
    estimatedValue: number; // Dollar value of opportunities
    conversionRate: number; // Opportunity to success rate
    averageOpportunityValue: number;
  };
  productivityMetrics: {
    meetingsPrepared: number;
    followUpsSuggested: number;
    introductionsFacilitated: number;
    relationshipInsights: number;
    automatedTasks: number;
  };
  teamMetrics: {
    teamMembers: number;
    collaborations: number;
    sharedRelationships: number;
    teamEfficiencyGain: number; // Percentage improvement
    networkOverlapReduction: number;
  };
}

export interface ExecutiveDashboard {
  period: string; // 'week', 'month', 'quarter', 'year'
  vaReplacement: VAReplacementMetrics;
  performance: PerformanceMetrics;
  businessImpact: BusinessImpact;
  trends: {
    savingsTrend: Array<{ period: string; savings: number }>;
    performanceTrend: Array<{ period: string; responseTime: number; satisfaction: number }>;
    growthTrend: Array<{ period: string; relationships: number; opportunities: number }>;
    efficiencyTrend: Array<{ period: string; timesSaved: number; tasksAutomated: number }>;
  };
  benchmarks: {
    industryAverage: {
      vaCost: number;
      responseTime: number;
      accuracy: number;
    };
    competitorComparison: {
      feature: string;
      relationshipOS: string;
      humanVA: string;
      advantage: string;
    }[];
  };
}

export interface ROICalculation {
  investment: {
    relationshipOSCost: number;
    onboardingCost: number;
    trainingCost: number;
    totalInvestment: number;
  };
  returns: {
    vaCostSavings: number;
    timeSavingsValue: number;
    opportunityValue: number;
    efficiencyGains: number;
    totalReturns: number;
  };
  metrics: {
    roi: number; // Return on Investment percentage
    paybackPeriod: number; // Months
    npv: number; // Net Present Value
    breakEvenPoint: string; // Date
  };
}

export class BusinessIntelligenceService {
  private static instance: BusinessIntelligenceService;

  static getInstance(): BusinessIntelligenceService {
    if (!BusinessIntelligenceService.instance) {
      BusinessIntelligenceService.instance = new BusinessIntelligenceService();
    }
    return BusinessIntelligenceService.instance;
  }

  // VA Replacement Analytics
  async calculateVAReplacementMetrics(
    organizationId: string,
    subscriptionTier: 'personal_pro' | 'business' | 'enterprise'
  ): Promise<VAReplacementMetrics> {
    // Get actual usage data (in production, this would query real metrics)
    const usageData = await this.getOrganizationUsage(organizationId);
    
    // Calculate costs based on subscription tier
    const relationshipOSCosts = {
      personal_pro: 299,
      business: 999,
      enterprise: 2499
    };

    // Estimate human VA cost based on usage and complexity
    const humanVACost = this.estimateHumanVACost(usageData);
    const relationshipOSCost = relationshipOSCosts[subscriptionTier];
    
    const monthlySavings = humanVACost - relationshipOSCost;
    const annualSavings = monthlySavings * 12;
    
    // Calculate time savings (Oracle vs human research)
    const timesSavedHours = usageData.oracleQueries * 0.75; // 45 min saved per query
    const timeSavingsValue = timesSavedHours * 85; // $85/hour executive time
    
    const totalROI = ((monthlySavings + timeSavingsValue) / relationshipOSCost) * 100;
    const paybackPeriod = relationshipOSCost / monthlySavings;
    const efficiency = humanVACost / relationshipOSCost; // X times more efficient

    return {
      monthlyVACost: humanVACost,
      relationshipOSCost,
      monthlySavings,
      annualSavings,
      timesSavedHours,
      timeSavingsValue,
      totalROI,
      paybackPeriod,
      efficiency
    };
  }

  async getPerformanceMetrics(organizationId: string): Promise<PerformanceMetrics> {
    // In production, this would aggregate real performance data
    return {
      responseTime: {
        average: 3200, // 3.2 seconds average
        p95: 8500, // 8.5 seconds 95th percentile
        guarantee: 10000, // 10 second guarantee
        humanComparison: 43200 // 12 hours average human response
      },
      accuracy: {
        oracleAccuracy: 94.5, // 94.5% accuracy
        userSatisfaction: 4.7, // 4.7/5 satisfaction
        humanComparison: 87.2 // Human VA accuracy estimate
      },
      availability: {
        uptime: 99.8, // 99.8% uptime
        availability: '24/7/365', // Always available
        responseDelay: 0 // Immediate response
      },
      scalability: {
        parallelQueries: 1000, // Handle 1000 simultaneous queries
        userCapacity: 10000, // Support 10K users simultaneously
        humanLimitation: 'One user at a time, 8-hour workday'
      }
    };
  }

  async getBusinessImpact(organizationId: string): Promise<BusinessImpact> {
    // Mock business impact data - in production, this would aggregate real metrics
    return {
      relationshipMetrics: {
        totalRelationships: 847,
        activeRelationships: 623,
        relationshipGrowth: 12.5, // 12.5% month-over-month
        strongRelationships: 234,
        networkReach: 156 // Unique organizations
      },
      opportunityMetrics: {
        opportunitiesIdentified: 23,
        opportunitiesActedUpon: 17,
        estimatedValue: 2340000, // $2.34M in opportunities
        conversionRate: 73.9, // 73.9% conversion rate
        averageOpportunityValue: 137647 // Average $137K per opportunity
      },
      productivityMetrics: {
        meetingsPrepared: 89,
        followUpsSuggested: 156,
        introductionsFacilitated: 34,
        relationshipInsights: 412,
        automatedTasks: 1247
      },
      teamMetrics: {
        teamMembers: 12,
        collaborations: 67,
        sharedRelationships: 47,
        teamEfficiencyGain: 340, // 340% efficiency gain
        networkOverlapReduction: 23
      }
    };
  }

  async generateExecutiveDashboard(
    organizationId: string,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month',
    subscriptionTier: 'personal_pro' | 'business' | 'enterprise' = 'business'
  ): Promise<ExecutiveDashboard> {
    const [vaReplacement, performance, businessImpact] = await Promise.all([
      this.calculateVAReplacementMetrics(organizationId, subscriptionTier),
      this.getPerformanceMetrics(organizationId),
      this.getBusinessImpact(organizationId)
    ]);

    const trends = await this.getTrendData(organizationId, period);
    const benchmarks = this.getBenchmarkData();

    return {
      period,
      vaReplacement,
      performance,
      businessImpact,
      trends,
      benchmarks
    };
  }

  async calculateROI(
    organizationId: string,
    subscriptionTier: 'personal_pro' | 'business' | 'enterprise',
    timeHorizon: number = 12 // months
  ): Promise<ROICalculation> {
    const vaMetrics = await this.calculateVAReplacementMetrics(organizationId, subscriptionTier);
    const businessImpact = await this.getBusinessImpact(organizationId);

    const monthlyInvestment = vaMetrics.relationshipOSCost;
    const totalInvestment = monthlyInvestment * timeHorizon;

    const monthlyReturns = vaMetrics.monthlySavings + vaMetrics.timeSavingsValue;
    const opportunityValue = businessImpact.opportunityMetrics.estimatedValue * 0.1; // 10% attribution
    const totalReturns = (monthlyReturns * timeHorizon) + opportunityValue;

    const roi = ((totalReturns - totalInvestment) / totalInvestment) * 100;
    const paybackPeriod = totalInvestment / monthlyReturns;
    const npv = totalReturns - totalInvestment;

    const startDate = new Date();
    const breakEvenDate = new Date(startDate.getTime() + paybackPeriod * 30 * 24 * 60 * 60 * 1000);

    return {
      investment: {
        relationshipOSCost: monthlyInvestment,
        onboardingCost: 0, // Self-service onboarding
        trainingCost: 0, // AI-powered, no training needed
        totalInvestment
      },
      returns: {
        vaCostSavings: vaMetrics.monthlySavings * timeHorizon,
        timeSavingsValue: vaMetrics.timeSavingsValue * timeHorizon,
        opportunityValue,
        efficiencyGains: businessImpact.teamMetrics.teamEfficiencyGain * 1000, // Estimated value
        totalReturns
      },
      metrics: {
        roi,
        paybackPeriod,
        npv,
        breakEvenPoint: breakEvenDate.toLocaleDateString()
      }
    };
  }

  // Helper methods
  private async getOrganizationUsage(organizationId: string): Promise<{
    oracleQueries: number;
    relationships: number;
    teamSize: number;
    meetingsPrepared: number;
    complexity: 'low' | 'medium' | 'high';
  }> {
    // Mock usage data - in production, this would query actual metrics
    return {
      oracleQueries: 67, // Oracle queries this month
      relationships: 847, // Total relationships managed
      teamSize: 12, // Team members
      meetingsPrepared: 89, // Meetings with AI prep
      complexity: 'high' // Based on relationship count and team size
    };
  }

  private estimateHumanVACost(usage: {
    oracleQueries: number;
    relationships: number;
    teamSize: number;
    meetingsPrepared: number;
    complexity: 'low' | 'medium' | 'high';
  }): number {
    // Base VA cost calculation
    let baseCost = 4500; // $4.5K base for executive VA

    // Adjust based on complexity and usage
    if (usage.complexity === 'high') baseCost *= 1.3;
    if (usage.relationships > 500) baseCost *= 1.2;
    if (usage.teamSize > 10) baseCost *= 1.4;
    if (usage.oracleQueries > 50) baseCost *= 1.25;

    // Cap at reasonable maximum
    return Math.min(baseCost, 8500);
  }

  private async getTrendData(organizationId: string, period: string): Promise<ExecutiveDashboard['trends']> {
    // Mock trend data - in production, this would query time-series data
    const periods = period === 'week' ? 
      ['4 weeks ago', '3 weeks ago', '2 weeks ago', 'Last week', 'This week'] :
      ['4 months ago', '3 months ago', '2 months ago', 'Last month', 'This month'];

    return {
      savingsTrend: periods.map((p, i) => ({
        period: p,
        savings: 4200 + (i * 300) + Math.random() * 200
      })),
      performanceTrend: periods.map((p, i) => ({
        period: p,
        responseTime: 4000 - (i * 200),
        satisfaction: 4.2 + (i * 0.1)
      })),
      growthTrend: periods.map((p, i) => ({
        period: p,
        relationships: 720 + (i * 25),
        opportunities: 15 + (i * 2)
      })),
      efficiencyTrend: periods.map((p, i) => ({
        period: p,
        timesSaved: 45 + (i * 5),
        tasksAutomated: 980 + (i * 60)
      }))
    };
  }

  private getBenchmarkData(): ExecutiveDashboard['benchmarks'] {
    return {
      industryAverage: {
        vaCost: 5200, // Industry average VA cost
        responseTime: 14400000, // 4 hours average response
        accuracy: 82.3 // Industry average accuracy
      },
      competitorComparison: [
        {
          feature: 'Response Time',
          relationshipOS: '< 10 seconds',
          humanVA: '2-8 hours',
          advantage: '1,440x faster'
        },
        {
          feature: 'Availability',
          relationshipOS: '24/7/365',
          humanVA: '8-10 hours/day',
          advantage: '3x more available'
        },
        {
          feature: 'Cost',
          relationshipOS: '$299/month',
          humanVA: '$4,500/month',
          advantage: '94% cost savings'
        },
        {
          feature: 'Scalability',
          relationshipOS: 'Unlimited queries',
          humanVA: 'Sequential tasks only',
          advantage: 'Infinite scale'
        },
        {
          feature: 'Consistency',
          relationshipOS: '100% consistent',
          humanVA: 'Variable quality',
          advantage: 'Perfect reliability'
        },
        {
          feature: 'Learning',
          relationshipOS: 'Continuous AI improvement',
          humanVA: 'Limited human learning',
          advantage: 'Exponential growth'
        }
      ]
    };
  }
}

// Export singleton instance
export const businessIntelligenceService = BusinessIntelligenceService.getInstance();

// Utility functions
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;
  if (milliseconds < 3600000) return `${(milliseconds / 60000).toFixed(1)}m`;
  return `${(milliseconds / 3600000).toFixed(1)}h`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function calculateEfficiencyGain(before: number, after: number): number {
  return ((after - before) / before) * 100;
}

export function getROIColor(roi: number): string {
  if (roi >= 300) return 'text-green-600';
  if (roi >= 200) return 'text-blue-600';
  if (roi >= 100) return 'text-yellow-600';
  return 'text-red-600';
}

export function getPerformanceGrade(metric: number, target: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  const ratio = metric / target;
  if (ratio >= 0.95) return 'A';
  if (ratio >= 0.85) return 'B';
  if (ratio >= 0.75) return 'C';
  if (ratio >= 0.65) return 'D';
  return 'F';
} 