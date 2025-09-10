import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let initialized = false;
    
    // Check for existing session FIRST to ensure immediate auth state
    const initializeAuth = async () => {
      if (initialized) return;
      initialized = true;
      
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Skip if this is the initial session we already handled
        if (event === 'INITIAL_SESSION') return;
        
        console.log('Auth state changed:', event, session?.user?.email || 'no user');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle Google OAuth callback and store tokens - only once per sign-in
        if (event === 'SIGNED_IN' && session?.provider_token && !session.user.last_sign_in_at) {
          console.log('Google sign-in detected, storing tokens...');
          setTimeout(async () => {
            try {
              await supabase.functions.invoke('store-google-tokens', {
                body: {
                  provider_token: session.provider_token,
                  provider_refresh_token: session.provider_refresh_token,
                  user: session.user
                }
              });
            } catch (error) {
              console.error('Failed to store Google tokens:', error);
            }
          }, 0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []); // Empty dependency array to prevent re-initialization

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