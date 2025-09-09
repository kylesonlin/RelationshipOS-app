import { useRouteError, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface RouteError {
  statusText?: string;
  message?: string;
  status?: number;
}

const ErrorPage = () => {
  const error = useRouteError() as RouteError;
  
  const getErrorMessage = () => {
    if (error?.status === 404) {
      return "The page you're looking for doesn't exist.";
    }
    if (error?.status === 500) {
      return "Internal server error. Please try again later.";
    }
    if (error?.statusText || error?.message) {
      return error.statusText || error.message;
    }
    return "An unexpected error occurred.";
  };

  const getErrorTitle = () => {
    if (error?.status === 404) return "Page Not Found";
    if (error?.status === 500) return "Server Error";
    return "Something Went Wrong";
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">{getErrorTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{getErrorMessage()}</p>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild variant="default">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
          
          {error?.status && (
            <p className="text-sm text-muted-foreground">
              Error Code: {error.status}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;