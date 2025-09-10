import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  user_id?: string;
  timestamp?: string;
}

interface PageViewEvent {
  page: string;
  path: string;
  referrer?: string;
  user_id?: string;
  timestamp?: string;
}

export const useAnalytics = () => {
  const { user, loading } = useAuth();

  // Initialize analytics
  useEffect(() => {
    // Don't run analytics if auth is still loading
    if (loading) return;
    
    // Initialize your analytics service here
    // For example: Google Analytics, Mixpanel, Amplitude, etc.
    
    if (typeof window !== 'undefined') {
      // Set user properties if logged in
      if (user) {
        identifyUser(user.id, {
          email: user.email,
          created_at: user.created_at,
        });
      }
    }
  }, [user, loading]);

  const track = useCallback((event: string, properties?: Record<string, any>) => {
    const eventData: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: window.location.href,
        user_agent: navigator.userAgent,
      },
      user_id: user?.id,
      timestamp: new Date().toISOString(),
    };

    // Send to your analytics service
    
    // Example implementations:
    
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, {
        ...properties,
        user_id: user?.id,
      });
    }

    // Mixpanel
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track(event, {
        ...properties,
        user_id: user?.id,
      });
    }

    // Custom analytics endpoint
    // fetch('/api/analytics/events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(eventData),
    // });
  }, [user]);

  const page = useCallback((page: string, properties?: Record<string, any>) => {
    const pageData: PageViewEvent = {
      page,
      path: window.location.pathname,
      referrer: document.referrer,
      user_id: user?.id,
      timestamp: new Date().toISOString(),
    };

    

    // Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: page,
        page_location: window.location.href,
        user_id: user?.id,
      });
    }

    // Track as custom event
    track('page_view', {
      page,
      path: window.location.pathname,
      ...properties,
    });
  }, [user, track]);

  const identifyUser = useCallback((userId: string, traits: Record<string, any>) => {
    

    // Mixpanel
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.identify(userId);
      (window as any).mixpanel.people.set(traits);
    }

    // Amplitude
    if (typeof window !== 'undefined' && (window as any).amplitude) {
      (window as any).amplitude.getInstance().setUserId(userId);
      (window as any).amplitude.getInstance().setUserProperties(traits);
    }
  }, []);

  // Conversion tracking
  const trackConversion = useCallback((event: string, value?: number, currency = 'USD') => {
    track('conversion', {
      conversion_event: event,
      value,
      currency,
    });

    // Google Analytics Enhanced Ecommerce
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'purchase', {
        transaction_id: `${Date.now()}`,
        value,
        currency,
        items: [{
          item_id: event,
          item_name: event,
          category: 'subscription',
          quantity: 1,
          price: value,
        }]
      });
    }
  }, [track]);

  // A/B Testing
  const trackExperiment = useCallback((experimentName: string, variant: string) => {
    track('experiment_view', {
      experiment_name: experimentName,
      variant,
    });
  }, [track]);

  return {
    track,
    page,
    identifyUser,
    trackConversion,
    trackExperiment,
  };
};