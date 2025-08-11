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
    const period = searchParams.get('period') as 'week' | 'month' | 'quarter' | 'year' || 'month';
    const subscriptionTier = authSession.organization.subscriptionTier || 'business';

    // Generate executive dashboard
    const dashboard = await businessIntelligenceService.generateExecutiveDashboard(
      authSession.organization.id,
      period,
      subscriptionTier as any
    );

    return NextResponse.json({
      success: true,
      data: dashboard,
      metadata: {
        organizationId: authSession.organization.id,
        period,
        subscriptionTier,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Executive dashboard API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate executive dashboard',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
} 