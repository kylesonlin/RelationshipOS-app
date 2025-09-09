import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout";
import Dashboard from "./pages/Dashboard";
import Oracle from "./pages/Oracle";
import Contacts from "./pages/Contacts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/oracle" element={<Oracle />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/calendar" element={<div className="p-6"><h1 className="text-2xl font-bold">Calendar</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/tasks" element={<div className="p-6"><h1 className="text-2xl font-bold">Tasks</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/documents" element={<div className="p-6"><h1 className="text-2xl font-bold">Documents</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/messages" element={<div className="p-6"><h1 className="text-2xl font-bold">Messages</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
