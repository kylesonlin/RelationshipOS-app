import { Suspense, lazy } from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';

// Lazy load pages for better performance
export const LazyROIDashboard = lazy(() => import('@/pages/ROIDashboard'));
export const LazyOracle = lazy(() => import('@/pages/Oracle'));
export const LazyContacts = lazy(() => import('@/pages/Contacts'));
export const LazyTimeTracking = lazy(() => import('@/pages/TimeTracking'));
export const LazyMeetingPrep = lazy(() => import('@/pages/MeetingPrep'));
export const LazyAnalytics = lazy(() => import('@/pages/Analytics'));
export const LazyFollowUpAutomation = lazy(() => import('@/pages/FollowUpAutomation'));
export const LazyIntegrations = lazy(() => import('@/pages/Integrations'));
export const LazyTeamSharing = lazy(() => import('@/pages/TeamSharing'));
export const LazySettings = lazy(() => import('@/pages/Settings'));
export const LazyGamificationDashboard = lazy(() => import('@/pages/GamificationDashboard'));

interface LazyPageProps {
  children: React.ReactNode;
}

export const LazyPageWrapper = ({ children }: LazyPageProps) => (
  <Suspense fallback={<LoadingScreen message="Loading page..." />}>
    {children}
  </Suspense>
);