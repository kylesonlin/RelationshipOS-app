import { useAdvancedQuery } from '@/hooks/useAdvancedCache';
import { supabase } from '@/integrations/supabase/client';

export const useSubscriptionOptimized = () => {
  const { data: plans, loading: plansLoading } = useAdvancedQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });
      
      return { data, error };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - plans don't change often
  });

  const { data: usage, loading: usageLoading } = useAdvancedQuery({
    queryKey: ['current-usage'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_month_usage');
      return { data, error };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for usage data
  });

  const { data: subscriber, loading: subscriberLoading } = useAdvancedQuery({
    queryKey: ['subscriber-data'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: null };
      
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      return { data, error };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loading = plansLoading || usageLoading || subscriberLoading;

  return {
    plans: plans || [],
    usage: usage || [],
    subscriber,
    loading
  };
};