import { toast } from '@/hooks/use-toast';

export const handleError = (error: any, context?: string) => {
  const message = error?.message || 'An unexpected error occurred';
  const title = context ? `${context} Error` : 'Error';
  
  console.error(`${title}:`, error);
  
  toast({
    title,
    description: message,
    variant: "destructive",
  });
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