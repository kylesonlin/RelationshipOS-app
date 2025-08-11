import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, requireAuth, requirePermission } from '@/lib/auth';
import { businessIntelligenceService } from '@/lib/business-intelligence';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const authSession = requireAuth(session);
    requirePermission(authSession.user, 'read');

    const { searchParams } = new URL(request.url);
    const timeHorizon = parseInt(searchParams.get('timeHorizon') || '12'); // months
    const subscriptionTier = authSession.organization.subscriptionTier || 'business';

    // Calculate ROI metrics
    const roiCalculation = await businessIntelligenceService.calculateROI(
      authSession.organization.id,
      subscriptionTier as any,
      timeHorizon
    );

    // Get VA replacement metrics
    const vaReplacementMetrics = await businessIntelligenceService.calculateVAReplacementMetrics(
      authSession.organization.id,
      subscriptionTier as any
    );

    // Get performance comparison
    const performanceMetrics = await businessIntelligenceService.getPerformanceMetrics(
      authSession.organization.id
    );

    return NextResponse.json({
      success: true,
      data: {
        roi: roiCalculation,
        vaReplacement: vaReplacementMetrics,
        performance: performanceMetrics,
        summary: {
          totalSavings: roiCalculation.returns.vaCostSavings,
          paybackPeriod: roiCalculation.metrics.paybackPeriod,
          roiPercentage: roiCalculation.metrics.roi,
          efficiencyGain: vaReplacementMetrics.efficiency,
          responseTimeAdvantage: Math.round(performanceMetrics.responseTime.humanComparison / performanceMetrics.responseTime.average)
        }
      },
      metadata: {
        organizationId: authSession.organization.id,
        subscriptionTier,
        timeHorizon,
        calculatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('ROI calculation API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to calculate ROI metrics',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin permissions
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const authSession = requireAuth(session);
    requirePermission(authSession.user, 'admin');

    const body = await request.json();
    const { customVACost, customUsage, timeHorizon } = body;

    // Allow custom ROI calculations for what-if scenarios
    if (!customVACost || !customUsage) {
      return NextResponse.json(
        { error: 'Missing required fields: customVACost, customUsage' },
        { status: 400 }
      );
    }

    const subscriptionTier = authSession.organization.subscriptionTier || 'business';

    // Calculate custom ROI scenario
    const customROI = await businessIntelligenceService.calculateROI(
      authSession.organization.id,
      subscriptionTier as any,
      timeHorizon || 12
    );

    // Apply custom parameters
    const customSavings = customVACost - customROI.investment.relationshipOSCost;
    const customAnnualSavings = customSavings * 12;
    const customROIPercentage = ((customAnnualSavings) / (customROI.investment.relationshipOSCost * 12)) * 100;

    return NextResponse.json({
      success: true,
      data: {
        scenario: 'custom',
        customInputs: { customVACost, customUsage, timeHorizon },
        results: {
          ...customROI,
          customMetrics: {
            monthlySavings: customSavings,
            annualSavings: customAnnualSavings,
            roiPercentage: customROIPercentage,
            paybackPeriod: customROI.investment.relationshipOSCost / customSavings
          }
        }
      },
      message: 'Custom ROI scenario calculated successfully'
    });

  } catch (error) {
    console.error('Custom ROI calculation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to calculate custom ROI scenario',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
} 