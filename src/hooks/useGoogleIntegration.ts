import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GoogleIntegrationStatus {
  isConnected: boolean;
  hasGmailAccess: boolean;
  hasCalendarAccess: boolean;
  loading: boolean;
  error: string | null;
  isExpired: boolean;
  lastSync?: string;
}

export const useGoogleIntegration = () => {
  const [status, setStatus] = useState<GoogleIntegrationStatus>({
    isConnected: false,
    hasGmailAccess: false,
    hasCalendarAccess: false,
    loading: true,
    error: null,
    isExpired: false,
  });
  const { toast } = useToast();

  const { data: tokens, isLoading, refetch } = useQuery({
    queryKey: ['google-tokens'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_google_tokens')
        .select('access_token, expires_at, scopes, updated_at')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  useEffect(() => {
    const now = new Date();
    const isConnected = !!tokens?.access_token;
    const isExpired = tokens?.expires_at ? now >= new Date(tokens.expires_at) : false;
    const hasGmailScope = tokens?.scopes?.includes('https://www.googleapis.com/auth/gmail.readonly');
    const hasCalendarScope = tokens?.scopes?.includes('https://www.googleapis.com/auth/calendar.readonly');

    setStatus({
      isConnected,
      hasGmailAccess: hasGmailScope || false,
      hasCalendarAccess: hasCalendarScope || false,
      loading: isLoading,
      error: null,
      isExpired,
      lastSync: tokens?.updated_at,
    });
  }, [tokens, isLoading]);

  const storeGoogleTokens = async (session: any) => {
    try {
      if (!session?.provider_token || !session?.provider_refresh_token) {
        throw new Error('No provider token found in session');
      }

      const { error } = await supabase.functions.invoke('store-google-tokens', {
        body: {
          provider_token: session.provider_token,
          provider_refresh_token: session.provider_refresh_token,
          user: session.user
        }
      });

      if (error) throw error;
      await refetch();
    } catch (error: any) {
      console.error('Error storing Google tokens:', error);
      throw error;
    }
  };

  const triggerSync = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!tokens?.access_token) {
        toast({
          title: "Google Not Connected",
          description: "Please connect your Google account first",
          variant: "destructive"
        });
        return { success: false, error: 'Not connected' };
      }

      if (status.isExpired) {
        toast({
          title: "Google Access Expired", 
          description: "Please reconnect your Google account - your access has expired",
          variant: "destructive"
        });
        return { success: false, error: 'Token expired' };
      }

      // Show sync progress toast
      toast({
        title: "Starting Sync",
        description: "Synchronizing your Google data...",
      });

      const { data, error } = await supabase.functions.invoke('trigger-google-sync', {
        body: { user_id: user.id }
      });

      if (error) throw error;

      const successfulSyncs = data.results?.filter((r: any) => r.success) || [];
      
      if (successfulSyncs.length > 0) {
        const syncedServices = data.synced_services?.join(', ') || 'unknown services';
        const emailCount = data.results?.find((r: any) => r.service === 'gmail')?.processed || 0;
        const eventCount = data.results?.find((r: any) => r.service === 'calendar')?.processed || 0;
        
        toast({
          title: "Sync Successful",
          description: `Synced ${syncedServices}. Processed ${emailCount} emails and ${eventCount} calendar events.`,
        });
      } else {
        toast({
          title: "Sync Issues",
          description: "Some services couldn't be synced. Check your Google permissions and try again.",
          variant: "destructive"
        });
      }

      // Refresh token status after sync
      await refetch();
      
      return { success: true, data };

    } catch (error: any) {
      console.error('Google sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync Google data. Please try again.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  const checkConnectionStatus = async () => {
    await refetch();
  };

  const disconnect = async () => {
    try {
      await supabase
        .from('user_google_tokens')
        .delete()
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
      
      await refetch();
    } catch (error) {
      console.error('Error disconnecting Google:', error);
    }
  };

  return {
    ...status,
    tokens,
    checkConnectionStatus,
    disconnect,
    storeGoogleTokens,
    triggerSync,
    refetch,
  };
};