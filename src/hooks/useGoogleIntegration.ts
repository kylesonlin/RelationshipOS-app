import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GoogleIntegrationStatus {
  isConnected: boolean;
  hasGmailAccess: boolean;
  hasCalendarAccess: boolean;
  loading: boolean;
  error: string | null;
}

export const useGoogleIntegration = () => {
  const [status, setStatus] = useState<GoogleIntegrationStatus>({
    isConnected: false,
    hasGmailAccess: false,
    hasCalendarAccess: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkGoogleIntegrationStatus();
  }, []);

  const checkGoogleIntegrationStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));

      const { data: tokens, error } = await supabase
        .from('user_google_tokens')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" - safe to ignore with maybeSingle
        throw error;
      }

      const isConnected = !!tokens?.access_token;
      const hasGmailAccess = tokens?.scopes?.includes('https://www.googleapis.com/auth/gmail.readonly') || false;
      const hasCalendarAccess = tokens?.scopes?.includes('https://www.googleapis.com/auth/calendar.readonly') || false;

      setStatus({
        isConnected,
        hasGmailAccess,
        hasCalendarAccess,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Error checking Google integration status:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to check Google integration status',
      }));
    }
  };

  const storeGoogleTokens = async (session: any) => {
    try {
      if (!session?.provider_token) {
        throw new Error('No provider token found in session');
      }

      const { error } = await supabase.functions.invoke('store-google-tokens', {
        body: {
          provider_token: session.provider_token,
          provider_refresh_token: session.provider_refresh_token,
          user: session.user,
        },
      });

      if (error) {
        throw error;
      }

      // Refresh status after storing tokens
      await checkGoogleIntegrationStatus();
    } catch (error: any) {
      console.error('Error storing Google tokens:', error);
      setStatus(prev => ({
        ...prev,
        error: error.message || 'Failed to store Google tokens',
      }));
    }
  };

  return {
    ...status,
    checkGoogleIntegrationStatus,
    storeGoogleTokens,
  };
};