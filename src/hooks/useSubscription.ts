import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  plan_id: string;
  name: string;
  description: string;
  price_monthly: number;
  features: any;
  limits: any;
}

interface SubscriptionStatus {
  subscribed: boolean;
  plan_id: string | null;
  subscription_status: string;
  is_trial: boolean;
  trial_end: string | null;
  subscription_start: string | null;
  subscription_end: string | null;
}

interface UsageData {
  oracle_queries: number;
  contacts: number;
  team_members: number;
}

export const useSubscription = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [usage, setUsage] = useState<UsageData>({ oracle_queries: 0, contacts: 0, team_members: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // Get current user without causing circular dependency
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === 'SIGNED_IN' && session) {
        // Check subscription when user signs in
        setTimeout(() => {
          checkSubscription();
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSubscription = async () => {
    try {
      setError(null);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription(data);
      return data;
    } catch (err: any) {
      console.error('Error checking subscription:', err);
      setError(err.message || 'Failed to check subscription');
      return null;
    }
  };

  const createCheckout = async (planId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan_id: planId }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Redirecting to checkout",
          description: "Opening Stripe checkout in a new tab...",
        });
      }
      
      return data;
    } catch (err: any) {
      console.error('Error creating checkout:', err);
      toast({
        title: "Error",
        description: err.message || 'Failed to create checkout session',
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Opening billing portal",
          description: "Redirecting to manage your subscription...",
        });
      }
      
      return data;
    } catch (err: any) {
      console.error('Error opening customer portal:', err);
      toast({
        title: "Error",
        description: err.message || 'Failed to open customer portal',
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const trackUsage = async (resourceType: string, count: number = 1, metadata?: any) => {
    try {
      if (!user?.id) {
        console.error('No user ID available for usage tracking');
        return;
      }

      const { error } = await supabase.from('usage_tracking').insert({
        user_id: user.id,
        resource_type: resourceType,
        usage_count: count,
        metadata: metadata || {},
      });
      
      if (error) throw error;
      
      await loadUsage();
    } catch (err: any) {
      console.error('Error tracking usage:', err);
    }
  };

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly');
      
      if (error) throw error;
      setPlans((data || []) as SubscriptionPlan[]);
    } catch (err: any) {
      console.error('Error loading plans:', err);
      setError(err.message);
    }
  };

  const loadUsage = async () => {
    try {
      const { data, error } = await supabase.rpc('get_current_month_usage');
      
      if (error) throw error;
      
      const usageMap = (data || []).reduce((acc: any, item) => {
        acc[item.resource_type] = item.total_usage;
        return acc;
      }, {});
      
      setUsage({
        oracle_queries: usageMap.oracle_query || 0,
        contacts: usageMap.contact || 0,
        team_members: usageMap.team_member || 0,
      });
    } catch (err: any) {
      console.error('Error loading usage:', err);
    }
  };

  const getCurrentPlan = () => {
    if (!subscription?.plan_id) return null;
    return plans.find(plan => plan.plan_id === subscription.plan_id) || null;
  };

  const canUseFeature = (feature: string): boolean => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return false;
    return currentPlan.features[feature] === true;
  };

  const isWithinLimit = (limitType: string): boolean => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return false;
    
    const limit = currentPlan.limits[limitType];
    if (limit === -1) return true; // Unlimited
    
    const currentUsage = usage[limitType as keyof UsageData] || 0;
    return currentUsage < limit;
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await Promise.all([
        loadPlans(),
        checkSubscription(),
        loadUsage(),
      ]);
      setLoading(false);
    };

    // Only initialize if we have a user
    if (user) {
      initialize();
    }
  }, [user]);

  return {
    plans,
    subscription,
    usage,
    loading,
    error,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    trackUsage,
    getCurrentPlan,
    canUseFeature,
    isWithinLimit,
    loadUsage,
  };
};