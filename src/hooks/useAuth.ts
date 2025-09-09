import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleIntegration } from './useGoogleIntegration';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { storeGoogleTokens } = useGoogleIntegration();

  useEffect(() => {
    // Check for existing session FIRST to ensure immediate auth state
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        console.log('Session found:', !!session);
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
        console.log('Auth state changed:', event, session?.user?.email || 'no user');
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false after we've processed the initial session
        if (event !== 'INITIAL_SESSION') {
          setLoading(false);
        }

        // Handle Google OAuth callback and store tokens - defer to prevent deadlock
        if (event === 'SIGNED_IN' && session?.provider_token) {
          console.log('Google sign-in detected, storing tokens...');
          setTimeout(() => {
            storeGoogleTokens(session);
          }, 0);
        }
      }
    );

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