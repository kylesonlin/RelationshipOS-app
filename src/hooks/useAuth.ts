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
    const currentSessionRef = { current: null as any };
    
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          logger.error('Error getting session:', error);
        }
        
        // Check if we're in development/preview environment
        const isLovablePreview = window.location.hostname.includes('lovable.dev') || 
                                window.location.hostname.includes('sandbox');
        const isDashboardRoute = window.location.pathname === '/dashboard';
        
        // Check for demo user if no session
        if (!session) {
          const demoUser = localStorage.getItem('demo-user');
          
          // Auto-enable demo mode for dashboard in development environment
          if (!demoUser && isDashboardRoute && isLovablePreview) {
            localStorage.setItem('demo-user', 'true');
          }
          
          if (demoUser || (isDashboardRoute && isLovablePreview)) {
            const mockUser = {
              id: 'demo-user-123',
              email: 'demo@example.com',
              aud: 'authenticated',
              role: 'authenticated',
              app_metadata: {},
              user_metadata: { name: 'Demo User' },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              confirmed_at: new Date().toISOString(),
              email_confirmed_at: new Date().toISOString(),
              phone_confirmed_at: null,
              last_sign_in_at: new Date().toISOString(),
              recovery_sent_at: null,
              new_email: null,
              invited_at: null,
              action_link: null,
              email_change_sent_at: null,
              new_phone: null,
              phone_change_sent_at: null,
              phone: null,
              confirmation_sent_at: null,
              identities: [],
              factors: []
            } as any;

            const mockSession = {
              access_token: 'demo-token',
              refresh_token: 'demo-refresh',
              expires_in: 3600,
              expires_at: Math.floor(Date.now() / 1000) + 3600,
              token_type: 'bearer',
              user: mockUser
            } as any;

            if (isMounted) {
              setSession(mockSession);
              setUser(mockUser);
              setLoading(false);
            }
            return;
          }
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
          
          // Prevent unnecessary state updates if session hasn't changed
          if (JSON.stringify(session) === JSON.stringify(currentSessionRef.current)) {
            return;
          }
          
          currentSessionRef.current = session;
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
    // Clear demo user data if present
    localStorage.removeItem('demo-user');
    
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
    isAuthenticated: !!user,
    isDemoUser: user?.id === 'demo-user-123'
  };
};