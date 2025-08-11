import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, requireAuth, requirePermission } from '@/lib/auth';
import { vaComparisonService } from '@/lib/va-comparison';

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
    const analysisType = searchParams.get('type') || 'comparison';
    
    if (analysisType === 'cases') {
      // Get ROI case studies
      const roiCases = vaComparisonService.generateROICases();
      
      return NextResponse.json({
        success: true,
        data: {
          cases: roiCases,
          summary: {
            totalCases: roiCases.length,
            averageSavings: 67200, // Average across cases
            averageROI: 850, // Average ROI percentage
            industries: [...new Set(roiCases.map(c => c.industry))]
          }
        }
      });
    }

    // Default VA comparison analysis
    const humanVAProfile = {
      role: 'executive_assistant' as const,
      experienceLevel: 'mid' as const,
      location: 'us_domestic' as const,
      specialization: ['relationship_management', 'research', 'scheduling'],
      hourlyCost: 45,
      monthlyHours: 120,
      monthlyCost: 5400,
      limitations: ['Working hours only', 'Sequential tasks', 'Limited expertise', 'Human errors'],
      capabilities: ['Email management', 'Calendar scheduling', 'Basic research', 'Data entry']
    };

    const comparisonMetrics = await vaComparisonService.generateVAComparison(
      authSession.organization.id,
      humanVAProfile,
      authSession.organization.subscriptionTier as any || 'business'
    );

    return NextResponse.json({
      success: true,
      data: {
        comparison: comparisonMetrics,
        humanVAProfile,
        relationshipOSPlan: authSession.organization.subscriptionTier || 'business',
        organizationId: authSession.organization.id
      }
    });

  } catch (error) {
    console.error('VA comparison API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate VA comparison',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    requirePermission(authSession.user, 'write');

    const body = await request.json();
    const { calculatorInputs, customVAProfile } = body;

    if (calculatorInputs) {
      // VA Replacement Calculator
      const calculationResult = vaComparisonService.calculateVAReplacement(calculatorInputs);
      
      return NextResponse.json({
        success: true,
        data: calculationResult,
        message: 'VA replacement calculation completed'
      });
    }

    if (customVAProfile) {
      // Custom VA comparison
      const comparisonMetrics = await vaComparisonService.generateVAComparison(
        authSession.organization.id,
        customVAProfile,
        authSession.organization.subscriptionTier as any || 'business'
      );

      return NextResponse.json({
        success: true,
        data: {
          comparison: comparisonMetrics,
          customVAProfile,
          organizationId: authSession.organization.id
        },
        message: 'Custom VA comparison generated'
      });
    }

    return NextResponse.json(
      { error: 'Missing required fields: calculatorInputs or customVAProfile' },
      { status: 400 }
    );

  } catch (error) {
    console.error('VA comparison calculation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform VA comparison calculation',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
} 