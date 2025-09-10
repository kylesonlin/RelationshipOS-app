import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Immediate redirect without loading screens
    if (!loading) {
      if (user) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/auth", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Return empty div instead of loading screen for instant feel
  return <div className="min-h-screen bg-background" />;
};

export default Index;
