import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsContextType {
  track: (event: string, properties?: Record<string, any>) => void;
  page: (page: string, properties?: Record<string, any>) => void;
  trackConversion: (event: string, value?: number, currency?: string) => void;
  trackExperiment: (experimentName: string, variant: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const analytics = useAnalytics();
  const location = useLocation();

  // Track page views automatically with debouncing
  useEffect(() => {
    if (!analytics) return;
    
    // Debounce page tracking to prevent multiple calls
    const timer = setTimeout(() => {
      const pageTitle = document.title || location.pathname;
      analytics.page(pageTitle, {
        path: location.pathname,
        search: location.search,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname, analytics]); // Only track when path changes

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};