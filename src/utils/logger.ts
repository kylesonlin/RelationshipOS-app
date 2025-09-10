// Production-safe logging utility
const isDevelopment = import.meta.env.DEV;

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.info(message, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(message, ...args);
    }
    // In production, you might want to send to error tracking service
  },
  
  error: (message: string, error?: any, ...args: any[]) => {
    if (isDevelopment) {
      console.error(message, error, ...args);
    }
    // In production, send to error tracking service
    if (!isDevelopment && typeof window !== 'undefined') {
      // Example: Sentry, LogRocket, or other error tracking
      // window.errorTracker?.captureException(error, { extra: { message, ...args } });
    }
  },
  
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.debug(message, ...args);
    }
  }
};