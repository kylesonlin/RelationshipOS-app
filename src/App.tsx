import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Layout from "./components/layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AnalyticsProvider } from "./components/AnalyticsProvider";
import { ABTestProvider } from "./components/ABTestProvider";
import CookieConsent from "./components/CookieConsent";
// Import pages directly for better performance - only keep lazy loading for heavy pages
import ROIDashboard from "./pages/ROIDashboard";
import Oracle from "./pages/Oracle";
import Contacts from "./pages/Contacts";
import TimeTracking from "./pages/TimeTracking";
import MeetingPrep from "./pages/MeetingPrep";
import Analytics from "./pages/Analytics";
import FollowUpAutomation from "./pages/FollowUpAutomation";
import Integrations from "./pages/Integrations";
import TeamSharing from "./pages/TeamSharing";
import Settings from "./pages/Settings";
import GamificationDashboard from "./pages/GamificationDashboard";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import GoogleSuccess from "./pages/GoogleSuccess";
import Index from "./pages/Index";
import ResetPassword from "./pages/ResetPassword";
import ErrorPage from "./pages/ErrorPage";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import BillingSuccess from "./pages/BillingSuccess";
import BillingDashboard from "./pages/BillingDashboard";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Onboarding from "./pages/Onboarding";
import AdminDashboard from "./pages/AdminDashboard";
import Support from "./pages/Support";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false;
        return failureCount < 3;
      },
    },
  },
});

// Wrapper component for providers that need router context
const AppWithProviders = () => (
  <AnalyticsProvider>
    <ABTestProvider>
      <Outlet />
      <CookieConsent />
    </ABTestProvider>
  </AnalyticsProvider>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppWithProviders />,
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
        element: <ResetPassword />,
        errorElement: <ErrorPage />,
      },
      {
        path: "pricing",
        element: <Pricing />,
        errorElement: <ErrorPage />,
      },
      {
        path: "terms",
        element: <TermsOfService />,
        errorElement: <ErrorPage />,
      },
      {
        path: "privacy",
        element: <PrivacyPolicy />,
        errorElement: <ErrorPage />,
      },
      {
        path: "onboarding",
        element: <Onboarding />,
        errorElement: <ErrorPage />,
      },
      {
        path: "billing/success",
        element: <BillingSuccess />,
        errorElement: <ErrorPage />,
      },
      {
        path: "billing",
        element: (
          <ProtectedRoute>
            <Layout>
              <BillingDashboard />
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "billing-dashboard",
        element: (
          <ProtectedRoute>
            <Layout>
              <BillingDashboard />
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
        element: (
          <ProtectedRoute>
            <Layout>
              <Dashboard />
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
              <Oracle />
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "achievements",
        element: (
          <ProtectedRoute>
            <Layout>
              <GamificationDashboard />
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
              <Contacts />
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
              <TimeTracking />
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
              <MeetingPrep />
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
              <Analytics />
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "roi-dashboard",
        element: (
          <ProtectedRoute>
            <Layout>
              <ROIDashboard />
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "gamification-dashboard",
        element: (
          <ProtectedRoute>
            <Layout>
              <GamificationDashboard />
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
              <FollowUpAutomation />
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
              <TeamSharing />
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "follow-up",
        element: (
          <ProtectedRoute>
            <Layout>
              <FollowUpAutomation />
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
              <Integrations />
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "team",
        element: (
          <ProtectedRoute>
            <Layout>
              <TeamSharing />
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "documents",
        element: (
          <ProtectedRoute>
            <Layout>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Documents</h1>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
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
              <Settings />
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
              <Support />
            </Layout>
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <Layout>
              <AdminDashboard />
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

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
