import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleIntegration } from './useGoogleIntegration';
import { useSubscription } from './useSubscription';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { storeGoogleTokens } = useGoogleIntegration();
  const { checkSubscription } = useSubscription();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle Google OAuth callback and store tokens
        if (event === 'SIGNED_IN' && session?.provider_token) {
          console.log('Google sign-in detected, storing tokens...');
          await storeGoogleTokens(session);
        }

        // Check subscription status on sign in
        if (event === 'SIGNED_IN' && session) {
          setTimeout(() => {
            checkSubscription();
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [storeGoogleTokens]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!user
  };
};