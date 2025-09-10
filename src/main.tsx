import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import App from "./App.tsx";
import "./index.css";

// Preload critical routes for instant navigation
const preloadRoutes = () => {
  // Only preload if not in development to avoid module loading issues
  if (import.meta.env.PROD) {
    import("./pages/Contacts.tsx");
    import("./pages/Analytics.tsx");
    import("./pages/MeetingPrep.tsx");
    import("./pages/Oracle.tsx");
    import("./pages/Integrations.tsx");
  }
};

// Preload after initial render
setTimeout(preloadRoutes, 1000);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider>
      <App />
    </TooltipProvider>
  </StrictMode>
);
