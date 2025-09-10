import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AnalyticsProvider } from "./components/AnalyticsProvider";
import { ABTestProvider } from "./components/ABTestProvider";
import CookieConsent from "./components/CookieConsent";
import { OfflineNotification } from "./components/OfflineNotification";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

// Critical pages - load immediately for better UX
import Layout from "./components/layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import GoogleSuccess from "./pages/GoogleSuccess";
import Index from "./pages/Index";
import ErrorPage from "./pages/ErrorPage";
import NotFound from "./pages/NotFound";

// Lazy load heavy pages for better initial performance
const ROIDashboard = lazy(() => import("./pages/ROIDashboard"));
const Oracle = lazy(() => import("./pages/Oracle"));
const Contacts = lazy(() => import("./pages/Contacts"));
const TimeTracking = lazy(() => import("./pages/TimeTracking"));
const MeetingPrep = lazy(() => import("./pages/MeetingPrep"));
const Analytics = lazy(() => import("./pages/Analytics"));
const FollowUpAutomation = lazy(() => import("./pages/FollowUpAutomation"));
const Integrations = lazy(() => import("./pages/Integrations"));
const TeamSharing = lazy(() => import("./pages/TeamSharing"));
const Settings = lazy(() => import("./pages/Settings"));
const GamificationDashboard = lazy(() => import("./pages/GamificationDashboard"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Pricing = lazy(() => import("./pages/Pricing"));
const BillingSuccess = lazy(() => import("./pages/BillingSuccess"));
const BillingDashboard = lazy(() => import("./pages/BillingDashboard"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Support = lazy(() => import("./pages/Support"));
const StrategicIntelligence = lazy(() => import("./pages/StrategicIntelligence"));

// Optimized React Query config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes (garbage collection)
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false;
        return failureCount < 2; // Reduced from 3 to 2 for faster failures
      },
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      refetchOnMount: false, // Prevent refetch on component mount
      refetchOnReconnect: false, // Prevent refetch on network reconnect
      refetchInterval: false, // Disable automatic background refetching to prevent loops
    },
    mutations: {
      retry: 1, // Retry mutations once
    },
  },
});

// Enhanced loading component with better UX
import { EnhancedLoading } from "@/components/ui/enhanced-loading";

const PageLoader = () => (
  <EnhancedLoading message="Loading page..." variant="full" />
);

// Lazy wrapper with enhanced loading
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

const AppWithProviders = () => (
  <AnalyticsProvider>
    <ABTestProvider>
      <Outlet />
    </ABTestProvider>
  </AnalyticsProvider>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppWithProviders />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "auth",
        element: <Auth />,
        errorElement: <ErrorPage />,
      },
      {
        path: "google-success",
        element: <GoogleSuccess />,
        errorElement: <ErrorPage />,
      },
      {
        path: "reset-password", 
        element: (
          <LazyWrapper>
            <ResetPassword />
          </LazyWrapper>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "pricing",
        element: (
          <LazyWrapper>
            <Pricing />
          </LazyWrapper>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "billing-success",
        element: (
          <LazyWrapper>
            <BillingSuccess />
          </LazyWrapper>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "billing-dashboard",
        element: (
          <ProtectedRoute>
            <Layout>
              <LazyWrapper>
                <BillingDashboard />
              </LazyWrapper>
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        index: true,
        element: <Index />,
        errorElement: <ErrorPage />,
      },
      {
        path: "dashboard",
        element: <Index />, // Use same component as index
        errorElement: <ErrorPage />,
      },
      {
        path: "roi-dashboard",
        element: (
          <ProtectedRoute>
            <Layout>
              <LazyWrapper>
                <ROIDashboard />
              </LazyWrapper>
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "oracle",
        element: (
          <ProtectedRoute>
            <Layout>
              <LazyWrapper>
                <Oracle />
              </LazyWrapper>
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "contacts",
        element: (
          <ProtectedRoute>
            <Layout>
              <LazyWrapper>
                <Contacts />
              </LazyWrapper>
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "time-tracking",
        element: (
          <ProtectedRoute>
            <Layout>
              <LazyWrapper>
                <TimeTracking />
              </LazyWrapper>
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "meeting-prep",
        element: (
          <ProtectedRoute>
            <Layout>
              <LazyWrapper>
                <MeetingPrep />
              </LazyWrapper>
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "analytics",
        element: (
          <ProtectedRoute>
            <Layout>
              <LazyWrapper>
                <Analytics />
              </LazyWrapper>
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "follow-up-automation",
        element: (
          <ProtectedRoute>
            <Layout>
              <LazyWrapper>
                <FollowUpAutomation />
              </LazyWrapper>
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "integrations",
        element: (
          <ProtectedRoute>
            <Layout>
              <LazyWrapper>
                <Integrations />
              </LazyWrapper>
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "team-sharing",
        element: (
          <ProtectedRoute>
            <Layout>
              <LazyWrapper>
                <TeamSharing />
              </LazyWrapper>
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <Layout>
              <LazyWrapper>
                <Settings />
              </LazyWrapper>
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "gamification",
        element: (
          <ProtectedRoute>
            <Layout>
              <LazyWrapper>
                <GamificationDashboard />
              </LazyWrapper>
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "terms",
        element: (
          <LazyWrapper>
            <TermsOfService />
          </LazyWrapper>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "privacy",
        element: (
          <LazyWrapper>
            <PrivacyPolicy />
          </LazyWrapper>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "onboarding",
        element: (
          <ProtectedRoute>
            <LazyWrapper>
              <Onboarding />
            </LazyWrapper>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <Layout>
              <LazyWrapper>
                <AdminDashboard />
              </LazyWrapper>
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "support",
        element: (
          <ProtectedRoute>
            <Layout>
              <LazyWrapper>
                <Support />
              </LazyWrapper>
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "strategic-intelligence",
        element: (
          <ProtectedRoute>
            <Layout>
              <LazyWrapper>
                <StrategicIntelligence />
              </LazyWrapper>
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

function AppContent() {
  const isOnline = useOnlineStatus();
  
  console.log('React object in AppContent:', React);
  console.log('TooltipProvider:', TooltipProvider);
  
  return (
    <>
      <OfflineNotification isOnline={isOnline} />
      <RouterProvider router={router} />
      <Toaster />
      <Sonner />
      <CookieConsent />
    </>
  );
}

function App() {
  console.log('React object in App:', React);
  console.log('React version:', React.version);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;