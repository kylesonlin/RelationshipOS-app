// Simple preloader hook to prevent module resolution errors
export const usePreloader = () => {
  const preloadRoute = (route: string) => {
    // Simple dynamic import for route preloading
    try {
      switch (route) {
        case '/dashboard':
          return import('@/pages/Dashboard');
        case '/analytics':
          return import('@/pages/Analytics');
        case '/strategic-intelligence':
          return import('@/pages/StrategicIntelligence');
        case '/settings':
          return import('@/pages/Settings');
        case '/integrations':
          return import('@/pages/Integrations');
        case '/contacts':
          return import('@/pages/Contacts');
        case '/oracle':
          return import('@/pages/Oracle');
        case '/meeting-prep':
          return import('@/pages/MeetingPrep');
        case '/follow-up-automation':
          return import('@/pages/FollowUpAutomation');
        case '/gamification-dashboard':
          return import('@/pages/GamificationDashboard');
        case '/admin-dashboard':
          return import('@/pages/AdminDashboard');
        default:
          return Promise.resolve();
      }
    } catch (error) {
      console.warn('Failed to preload route:', route, error);
      return Promise.resolve();
    }
  };

  return {
    preloadRoute,
    onMouseEnter: (route: string) => () => preloadRoute(route),
    onFocus: (route: string) => () => preloadRoute(route),
  };
};