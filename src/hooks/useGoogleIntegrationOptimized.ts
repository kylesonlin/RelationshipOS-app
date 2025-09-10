import { useState, useEffect } from 'react';
import { useAdvancedQuery } from '@/hooks/useAdvancedCache';
import { supabase } from '@/integrations/supabase/client';

export const useGoogleIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  
  const { data: tokens, loading, refetch } = useAdvancedQuery({
    queryKey: ['google-tokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_google_tokens')
        .select('*')
        .maybeSingle();
      
      return { data, error };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true
  });

  useEffect(() => {
    setIsConnected(!!tokens && !!tokens.access_token);
  }, [tokens]);

  const checkConnectionStatus = async () => {
    await refetch();
  };

  const disconnect = async () => {
    try {
      await supabase
        .from('user_google_tokens')
        .delete()
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      setIsConnected(false);
      await refetch();
    } catch (error) {
      console.error('Error disconnecting Google:', error);
    }
  };

  return {
    isConnected,
    tokens,
    loading,
    checkConnectionStatus,
    disconnect
  };
};