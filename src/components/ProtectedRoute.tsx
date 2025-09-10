import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Check if we're in development/preview environment  
    const isLovablePreview = window.location.hostname.includes('lovable.dev') || 
                            window.location.hostname.includes('sandbox');
    
    // For dashboard route in development, allow demo mode without reload
    if (window.location.pathname === '/dashboard' && isLovablePreview) {
      // The useAuth hook will handle demo mode initialization
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};