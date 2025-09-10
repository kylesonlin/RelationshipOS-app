import { useEffect } from 'react';
import { logger } from '@/utils/logger';

export const usePerformanceMonitor = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      // This would integrate with a real monitoring service
      return;
    }

    // Basic performance monitoring
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          
          // Log slow page loads
          if (navEntry.loadEventEnd && navEntry.loadEventEnd > 3000) {
            logger.warn('Slow page load detected:', {
              url: window.location.pathname,
              loadTime: navEntry.loadEventEnd,
              timestamp: Date.now()
            });
          }
        }
        
        if (entry.entryType === 'largest-contentful-paint') {
          const lcpEntry = entry as PerformanceEntry;
          
          // Log poor LCP
          if (lcpEntry.startTime > 2500) {
            logger.warn('Poor LCP detected:', {
              url: window.location.pathname,
              lcp: lcpEntry.startTime,
              timestamp: Date.now()
            });
          }
        }
      });
    });

    // Observe navigation and paint timing
    try {
      observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint'] });
    } catch (error) {
      logger.error('Performance observer error:', error);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Monitor memory usage
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        
        // Log high memory usage
        if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
          logger.warn('High memory usage detected:', {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit,
            url: window.location.pathname
          });
        }
      }
    };

    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);
};