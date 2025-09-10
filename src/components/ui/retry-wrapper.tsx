import { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface RetryWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onRetry?: () => void;
  errorMessage?: string;
  maxRetries?: number;
}

export const RetryWrapper = ({ 
  children, 
  fallback,
  onRetry,
  errorMessage = "Something went wrong",
  maxRetries = 3
}: RetryWrapperProps) => {
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setHasError(false);
      onRetry?.();
    }
  };

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  if (hasError) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-sm">Error</CardTitle>
          </div>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleRetry}
            disabled={retryCount >= maxRetries}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {retryCount >= maxRetries ? 'Max retries reached' : `Retry (${retryCount}/${maxRetries})`}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary onError={() => setHasError(true)}>
      {children}
    </ErrorBoundary>
  );
};

// Simple error boundary for the retry wrapper
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

import React from 'react';