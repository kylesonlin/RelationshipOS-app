import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/ui/loading-screen";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index page - Auth state:', { user: !!user, loading });
    
    if (!loading) {
      if (user) {
        console.log('User authenticated, redirecting to dashboard');
        navigate("/dashboard");
      } else {
        console.log('No user found, redirecting to auth');
        navigate("/auth");
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <LoadingScreen message="Loading RelationshipOS..." />;
  }

  return null;
};

export default Index;
