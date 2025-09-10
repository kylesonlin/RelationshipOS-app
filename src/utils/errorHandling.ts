import { toast } from '@/hooks/use-toast';
import { logger } from './logger';

export const handleError = (error: any, context?: string) => {
  const message = error?.message || 'An unexpected error occurred';
  const title = context ? `${context} Error` : 'Error';
  
  logger.error(`${title}:`, error);
  
  // Enhanced error messages for common scenarios
  const enhancedMessage = getEnhancedErrorMessage(error, message);
  
  toast({
    title,
    description: enhancedMessage,
    variant: "destructive",
  });
};

const getEnhancedErrorMessage = (error: any, fallback: string): string => {
  // Network errors
  if (!navigator.onLine) {
    return "You're offline. Please check your internet connection and try again.";
  }
  
  // Supabase specific errors
  if (error?.code === 'PGRST116') {
    return "Access denied. Please check your permissions.";
  }
  
  if (error?.code === '23505') {
    return "This item already exists. Please try with different details.";
  }
  
  if (error?.message?.includes('JWT expired')) {
    return "Your session has expired. Please sign in again.";
  }
  
  if (error?.message?.includes('Network request failed')) {
    return "Connection failed. Please check your internet and try again.";
  }
  
  if (error?.status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }
  
  return fallback;
};

export const handleSuccess = (message: string, title = 'Success') => {
  toast({
    title,
    description: message,
  });
};

export const withErrorHandling = async <T>(
  fn: () => Promise<T>, 
  context?: string
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    handleError(error, context);
    return null;
  }
};