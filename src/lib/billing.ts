// Production Billing System for RelationshipOS
// Subscription management with Stripe integration

import { supabase } from './supabase';

// Billing types
export interface Subscription {
  id: string;
  organizationId: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  status: 'trial' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  tier: 'personal_pro' | 'business' | 'enterprise';
  price: number; // in cents
  billingCycle: 'monthly' | 'annual';
  trialEndsAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  organizationId: string;
  stripePaymentMethodId?: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  organizationId: string;
  subscriptionId: string;
  stripeInvoiceId?: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  amount: number; // in cents
  currency: string;
  description: string;
  invoiceDate: string;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

export interface UsageRecord {
  id: string;
  organizationId: string;
  subscriptionId: string;
  metricType: 'oracle_queries' | 'users' | 'storage_gb';
  quantity: number;
  recordedAt: string;
  billingPeriod: string;
}

// Subscription tiers and pricing
export const SUBSCRIPTION_TIERS = {
  personal_pro: {
    name: 'Personal Pro',
    description: 'Perfect for individual professionals',
    price: 29900, // $299/month in cents
    features: [
      'Unlimited Oracle queries',
      'Up to 5,000 relationships',
      'Email & LinkedIn integration',
      'Mobile app access',
      'Basic analytics'
    ],
    limits: {
      users: 1,
      relationships: 5000,
      oracleQueries: -1, // unlimited
      storageGb: 10
    }
  },
  business: {
    name: 'Business',
    description: 'For teams and small businesses',
    price: 99900, // $999/month in cents
    features: [
      'Everything in Personal Pro',
      'Up to 10 team members',
      'Unlimited relationships',
      'Advanced analytics',
      'Team collaboration',
      'Priority support'
    ],
    limits: {
      users: 10,
      relationships: -1, // unlimited
      oracleQueries: -1, // unlimited
      storageGb: 100
    }
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For large organizations',
    price: 299900, // $2,999/month in cents
    features: [
      'Everything in Business',
      'Unlimited team members',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees',
      'Custom deployment'
    ],
    limits: {
      users: -1, // unlimited
      relationships: -1, // unlimited
      oracleQueries: -1, // unlimited
      storageGb: 1000
    }
  }
} as const;

// Billing service class
export class BillingService {
  private static instance: BillingService;
  
  static getInstance(): BillingService {
    if (!BillingService.instance) {
      BillingService.instance = new BillingService();
    }
    return BillingService.instance;
  }

  // Get organization subscription
  async getSubscription(organizationId: string): Promise<Subscription | null> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', organizationId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        organizationId: data.organization_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        stripeCustomerId: data.stripe_customer_id,
        status: data.status,
        tier: data.tier,
        price: data.price,
        billingCycle: data.billing_cycle,
        trialEndsAt: data.trial_ends_at,
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw new Error('Failed to fetch subscription');
    }
  }

  // Create new subscription
  async createSubscription(
    organizationId: string,
    tier: keyof typeof SUBSCRIPTION_TIERS,
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ): Promise<Subscription> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const tierConfig = SUBSCRIPTION_TIERS[tier];
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate price (annual gets 20% discount)
    const basePrice = tierConfig.price;
    const price = billingCycle === 'annual' ? Math.floor(basePrice * 12 * 0.8) : basePrice;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          id: subscriptionId,
          organization_id: organizationId,
          status: 'trial',
          tier,
          price,
          billing_cycle: billingCycle,
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 day trial
          cancel_at_period_end: false
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        organizationId: data.organization_id,
        status: data.status,
        tier: data.tier,
        price: data.price,
        billingCycle: data.billing_cycle,
        trialEndsAt: data.trial_ends_at,
        cancelAtPeriodEnd: data.cancel_at_period_end,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  // Update subscription tier
  async updateSubscriptionTier(
    organizationId: string,
    newTier: keyof typeof SUBSCRIPTION_TIERS
  ): Promise<Subscription> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const tierConfig = SUBSCRIPTION_TIERS[newTier];

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          tier: newTier,
          price: tierConfig.price,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        organizationId: data.organization_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        stripeCustomerId: data.stripe_customer_id,
        status: data.status,
        tier: data.tier,
        price: data.price,
        billingCycle: data.billing_cycle,
        trialEndsAt: data.trial_ends_at,
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new Error('Failed to update subscription');
    }
  }

  // Cancel subscription
  async cancelSubscription(organizationId: string, cancelImmediately: boolean = false): Promise<Subscription> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    try {
      const updateData = cancelImmediately
        ? { status: 'canceled', updated_at: new Date().toISOString() }
        : { cancel_at_period_end: true, updated_at: new Date().toISOString() };

      const { data, error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        organizationId: data.organization_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        stripeCustomerId: data.stripe_customer_id,
        status: data.status,
        tier: data.tier,
        price: data.price,
        billingCycle: data.billing_cycle,
        trialEndsAt: data.trial_ends_at,
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  // Record usage for billing
  async recordUsage(
    organizationId: string,
    metricType: 'oracle_queries' | 'users' | 'storage_gb',
    quantity: number
  ): Promise<void> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const subscription = await this.getSubscription(organizationId);
    if (!subscription) {
      throw new Error('No subscription found');
    }

    const usageId = `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const billingPeriod = this.getCurrentBillingPeriod();

    try {
      await supabase
        .from('usage_records')
        .insert({
          id: usageId,
          organization_id: organizationId,
          subscription_id: subscription.id,
          metric_type: metricType,
          quantity,
          billing_period: billingPeriod,
          recorded_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Error recording usage:', error);
      // Don't throw - usage recording should not break app functionality
    }
  }

  // Get usage for current billing period
  async getUsage(organizationId: string): Promise<Record<string, number>> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const billingPeriod = this.getCurrentBillingPeriod();

    try {
      const { data, error } = await supabase
        .from('usage_records')
        .select('metric_type, quantity')
        .eq('organization_id', organizationId)
        .eq('billing_period', billingPeriod);

      if (error) throw error;

      // Aggregate usage by metric type
      const usage: Record<string, number> = {};
      data?.forEach(record => {
        usage[record.metric_type] = (usage[record.metric_type] || 0) + record.quantity;
      });

      return usage;

    } catch (error) {
      console.error('Error fetching usage:', error);
      return {};
    }
  }

  // Check if organization can perform action based on subscription limits
  async checkUsageLimit(
    organizationId: string,
    metricType: 'oracle_queries' | 'users' | 'storage_gb',
    requestedQuantity: number = 1
  ): Promise<{ allowed: boolean; limit: number; current: number; remaining: number }> {
    const subscription = await this.getSubscription(organizationId);
    if (!subscription) {
      throw new Error('No subscription found');
    }

    const tierConfig = SUBSCRIPTION_TIERS[subscription.tier];
    const limitKey = metricType === 'oracle_queries' ? 'oracleQueries' : 
                     metricType === 'storage_gb' ? 'storageGb' : metricType;
    const limit = tierConfig.limits[limitKey as keyof typeof tierConfig.limits];
    
    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true, limit: -1, current: 0, remaining: -1 };
    }

    const usage = await this.getUsage(organizationId);
    const current = usage[metricType] || 0;
    const remaining = Math.max(0, limit - current);
    const allowed = remaining >= requestedQuantity;

    return { allowed, limit, current, remaining };
  }

  // Get subscription tier details
  getSubscriptionTierDetails(tier: keyof typeof SUBSCRIPTION_TIERS) {
    return SUBSCRIPTION_TIERS[tier];
  }

  // Get all available tiers
  getAllTiers() {
    return SUBSCRIPTION_TIERS;
  }

  // Calculate billing period string (YYYY-MM format)
  private getCurrentBillingPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  // Stripe integration methods (placeholder for actual Stripe implementation)
  async createStripeCheckoutSession(
    organizationId: string,
    tier: keyof typeof SUBSCRIPTION_TIERS,
    billingCycle: 'monthly' | 'annual'
  ): Promise<string> {
    // TODO: Implement Stripe Checkout session creation
    // This would create a Stripe checkout session and return the session URL
    
    const tierConfig = SUBSCRIPTION_TIERS[tier];
    const price = billingCycle === 'annual' ? Math.floor(tierConfig.price * 12 * 0.8) : tierConfig.price;
    
    console.log(`Creating Stripe checkout for ${tier} at $${price / 100}/${billingCycle}`);
    
    // For now, return a placeholder URL
    return `https://checkout.stripe.com/pay/placeholder?tier=${tier}&cycle=${billingCycle}`;
  }

  async createStripeCustomerPortalSession(organizationId: string): Promise<string> {
    // TODO: Implement Stripe Customer Portal session creation
    // This would create a Stripe customer portal session for managing subscription
    
    console.log(`Creating Stripe customer portal for ${organizationId}`);
    
    // For now, return a placeholder URL
    return `https://billing.stripe.com/portal/placeholder?org=${organizationId}`;
  }

  // Webhook handler for Stripe events
  async handleStripeWebhook(event: Record<string, unknown>): Promise<void> {
    // TODO: Implement Stripe webhook handling
    // This would process Stripe webhook events to update subscription status
    
    console.log(`Processing Stripe webhook: ${event.type}`);
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        break;
      case 'payment_intent.payment_failed':
        // Handle failed payment
        break;
      case 'customer.subscription.updated':
        // Handle subscription updates
        break;
      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }
}

// Export singleton instance
export const billingService = BillingService.getInstance();

// Utility functions
export function formatPrice(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export function isTrialExpired(trialEndsAt: string | null | undefined): boolean {
  if (!trialEndsAt) return false;
  return new Date() > new Date(trialEndsAt);
}

export function getDaysUntilTrialExpiry(trialEndsAt: string | null | undefined): number {
  if (!trialEndsAt) return 0;
  const days = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
} 