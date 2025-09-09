import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout";
import ROIDashboard from "./pages/ROIDashboard";
import Oracle from "./pages/Oracle";
import Contacts from "./pages/Contacts";
import TimeTracking from "./pages/TimeTracking";
import MeetingPrep from "./pages/MeetingPrep";
import Analytics from "./pages/Analytics";
import FollowUpAutomation from "./pages/FollowUpAutomation";
import TeamSharing from "./pages/TeamSharing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

console.log("App component is loading...");

const App = () => {
  console.log("App component is rendering...");
  
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<ROIDashboard />} />
            <Route path="/oracle" element={<Oracle />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/time-tracking" element={<TimeTracking />} />
            <Route path="/meeting-prep" element={<MeetingPrep />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/follow-up" element={<FollowUpAutomation />} />
            <Route path="/team" element={<TeamSharing />} />
            <Route path="/documents" element={<div className="p-6"><h1 className="text-2xl font-bold">Documents</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
