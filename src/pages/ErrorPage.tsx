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

  console.error('Error caught by ErrorBoundary:', error);

  const getErrorMessage = () => {
    if (error?.statusText) return error.statusText;
    if (error?.message) return error.message;
    if (error?.status === 404) {
      return "The page you're looking for doesn't exist.";
    }
    if (error?.status === 500) {
      return "Internal server error. Please try again later.";
    }
    return "An unexpected error occurred.";
  };

  const getErrorTitle = () => {
    if (error?.status === 404) return "Page Not Found";
    if (error?.status === 500) return "Server Error";
    return "Something Went Wrong";
  };

  const handleRefresh = () => {
    // Reload the page to reset error state
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl">{getErrorTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            {getErrorMessage()}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
          
          {error?.status && (
            <p className="text-sm text-gray-500 mt-4">
              Error Code: {error.status}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;