import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGoogleSync = () => {
  const { toast } = useToast();

  const triggerSync = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check token status first
      const { data: tokens } = await supabase
        .from('user_google_tokens')
        .select('access_token, expires_at, scopes')
        .eq('user_id', user.id)
        .single();

      if (!tokens?.access_token) {
        toast({
          title: "Google Not Connected",
          description: "Please connect your Google account first",
          variant: "destructive"
        });
        return { success: false, error: 'Not connected' };
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(tokens.expires_at);
      if (now >= expiresAt) {
        toast({
          title: "Google Access Expired", 
          description: "Please reconnect your Google account - your access has expired",
          variant: "destructive"
        });
        return { success: false, error: 'Token expired' };
      }

      // Trigger the sync
      const { data, error } = await supabase.functions.invoke('trigger-google-sync', {
        body: { user_id: user.id }
      });

      if (error) {
        throw error;
      }

      const successfulSyncs = data.results?.filter((r: any) => r.success) || [];
      
      if (successfulSyncs.length > 0) {
        toast({
          title: "Sync Successful",
          description: `Successfully synced: ${data.synced_services?.join(', ')}`,
        });
      } else {
        toast({
          title: "Sync Issues",
          description: "Some services couldn't be synced. Check your Google permissions.",
          variant: "destructive"
        });
      }

      return { success: true, data };

    } catch (error: any) {
      console.error('Google sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync Google data",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  const { data: syncStatus, isLoading: syncLoading } = useQuery({
    queryKey: ['google-sync-status'],
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

  const isConnected = !!syncStatus?.access_token;
  const isExpired = syncStatus?.expires_at ? new Date() >= new Date(syncStatus.expires_at) : false;
  const hasGmailScope = syncStatus?.scopes?.includes('https://www.googleapis.com/auth/gmail.readonly');
  const hasCalendarScope = syncStatus?.scopes?.includes('https://www.googleapis.com/auth/calendar.readonly');

  return {
    triggerSync,
    isConnected,
    isExpired,
    hasGmailScope,
    hasCalendarScope,
    lastSync: syncStatus?.updated_at,
    loading: syncLoading
  };
};