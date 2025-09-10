import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let authSubscription: any = null;
    
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          logger.error('Error getting session:', error);
        }
        
        // Only update state if component is still mounted
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        logger.error('Auth initialization error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!isMounted) return;
          
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);

          // Handle Google token storage only for sign-in events
          if (event === 'SIGNED_IN' && session?.provider_token) {
            setTimeout(async () => {
              if (!isMounted) return;
              try {
                await supabase.functions.invoke('store-google-tokens', {
                  body: {
                    provider_token: session.provider_token,
                    provider_refresh_token: session.provider_refresh_token,
                    user: session.user
                  }
                });
              } catch (error) {
                logger.error('Failed to store Google tokens:', error);
              }
            }, 0);
          }
        }
      );
      return subscription;
    };

    // Initialize auth and set up listener
    initializeAuth();
    authSubscription = setupAuthListener();

    // Cleanup function
    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array to prevent re-initialization

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.error('Error signing out:', error.message);
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