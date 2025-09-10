import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Preload critical routes for instant navigation
const preloadRoutes = () => {
  import("./pages/Contacts.tsx");
  import("./pages/Analytics.tsx");
  import("./pages/MeetingPrep.tsx");
  import("./pages/Oracle.tsx");
  import("./pages/Integrations.tsx");
};

// Preload after initial render
setTimeout(preloadRoutes, 100);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
