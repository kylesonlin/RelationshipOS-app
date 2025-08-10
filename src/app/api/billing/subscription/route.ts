import { NextRequest, NextResponse } from 'next/server';
import { billingService, SUBSCRIPTION_TIERS } from '@/lib/billing';
import { getServerSession, requireAuth, requirePermission } from '@/lib/auth';

// Get current subscription
export async function GET() {
  try {
    const session = await getServerSession();
    const authSession = requireAuth(session);
    
    const subscription = await billingService.getSubscription(authSession.user.organizationId);
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Get usage information
    const usage = await billingService.getUsage(authSession.user.organizationId);
    const tierDetails = billingService.getSubscriptionTierDetails(subscription.tier);

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        tier: subscription.tier,
        price: subscription.price,
        billingCycle: subscription.billingCycle,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      },
      tierDetails,
      usage,
      organization: {
        id: authSession.organization.id,
        name: authSession.organization.name
      }
    });

  } catch (error) {
    console.error('Subscription fetch error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

// Create new subscription
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const authSession = requireAuth(session);
    requirePermission(authSession.user, 'billing');

    const { tier, billingCycle = 'monthly' } = await request.json();

    // Validate tier
    if (!tier || !(tier in SUBSCRIPTION_TIERS)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Validate billing cycle
    if (billingCycle !== 'monthly' && billingCycle !== 'annual') {
      return NextResponse.json(
        { error: 'Invalid billing cycle' },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const existingSubscription = await billingService.getSubscription(authSession.user.organizationId);
    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Subscription already exists. Use PUT to update.' },
        { status: 409 }
      );
    }

    const subscription = await billingService.createSubscription(
      authSession.user.organizationId,
      tier,
      billingCycle
    );

    const tierDetails = billingService.getSubscriptionTierDetails(tier);

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        tier: subscription.tier,
        price: subscription.price,
        billingCycle: subscription.billingCycle,
        trialEndsAt: subscription.trialEndsAt,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      },
      tierDetails,
      message: 'Subscription created successfully'
    });

  } catch (error) {
    console.error('Subscription creation error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json(
        { error: 'Only organization owners can manage billing' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

// Update subscription
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    const authSession = requireAuth(session);
    requirePermission(authSession.user, 'billing');

    const { tier } = await request.json();

    // Validate tier
    if (!tier || !(tier in SUBSCRIPTION_TIERS)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    const subscription = await billingService.updateSubscriptionTier(
      authSession.user.organizationId,
      tier
    );

    const tierDetails = billingService.getSubscriptionTierDetails(tier);

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        tier: subscription.tier,
        price: subscription.price,
        billingCycle: subscription.billingCycle,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      },
      tierDetails,
      message: 'Subscription updated successfully'
    });

  } catch (error) {
    console.error('Subscription update error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json(
        { error: 'Only organization owners can manage billing' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

// Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    const authSession = requireAuth(session);
    requirePermission(authSession.user, 'billing');

    const { searchParams } = new URL(request.url);
    const immediate = searchParams.get('immediate') === 'true';

    const subscription = await billingService.cancelSubscription(
      authSession.user.organizationId,
      immediate
    );

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        tier: subscription.tier,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      },
      message: immediate 
        ? 'Subscription canceled immediately' 
        : 'Subscription will cancel at the end of the current period'
    });

  } catch (error) {
    console.error('Subscription cancellation error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json(
        { error: 'Only organization owners can manage billing' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
} 