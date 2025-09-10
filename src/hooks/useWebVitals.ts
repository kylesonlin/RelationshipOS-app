import { useEffect, useCallback } from 'react';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceData {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay  
  cls?: number; // Cumulative Layout Shift
  inp?: number; // Interaction to Next Paint
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

// Thresholds based on Google's Core Web Vitals
const THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  inp: { good: 200, poor: 500 },
  fcp: { good: 1800, poor: 3000 },
  ttfb: { good: 800, poor: 1800 }
};

const getRating = (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[metric as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

let performanceData: PerformanceData = {};
let observers: PerformanceObserver[] = [];

const useWebVitals = (onMetric?: (metric: WebVitalMetric) => void) => {
  const reportMetric = useCallback((name: string, value: number, entries: PerformanceEntry[]) => {
    const metric: WebVitalMetric = {
      name,
      value,
      rating: getRating(name, value),
      delta: value - (performanceData[name as keyof PerformanceData] || 0),
      entries
    };

    performanceData[name as keyof PerformanceData] = value;
    onMetric?.(metric);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vital] ${name}:`, {
        value: Math.round(value * 100) / 100,
        rating: metric.rating,
        entries: entries.length
      });
    }
  }, [onMetric]);

  useEffect(() => {
    // Cleanup existing observers
    observers.forEach(observer => observer.disconnect());
    observers = [];

    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformancePaintTiming[];
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          reportMetric('lcp', lastEntry.startTime, entries);
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      observers.push(lcpObserver);

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEventTiming[];
        entries.forEach(entry => {
          reportMetric('fid', entry.processingStart - entry.startTime, [entry]);
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      observers.push(fidObserver);

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as LayoutShift[];
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        reportMetric('cls', clsValue, entries);
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      observers.push(clsObserver);

      // Interaction to Next Paint (INP)
      const inpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEventTiming[];
        entries.forEach(entry => {
          const inp = entry.processingStart + entry.duration - entry.startTime;
          reportMetric('inp', inp, [entry]);
        });
      });
      
      try {
        inpObserver.observe({ type: 'event', buffered: true });
        observers.push(inpObserver);
      } catch (e) {
        // INP might not be supported in all browsers
        console.warn('INP observation not supported');
      }

      // First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformancePaintTiming[];
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            reportMetric('fcp', entry.startTime, [entry]);
          }
        });
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
      observers.push(fcpObserver);

      // Time to First Byte (TTFB)
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        const ttfb = nav.responseStart - nav.requestStart;
        reportMetric('ttfb', ttfb, [nav]);
      }

    } catch (error) {
      console.warn('Web Vitals measurement not supported:', error);
    }

    return () => {
      observers.forEach(observer => observer.disconnect());
      observers = [];
    };
  }, [reportMetric]);

  const getPerformanceScore = useCallback(() => {
    const scores = Object.entries(performanceData).map(([metric, value]) => {
      const rating = getRating(metric, value);
      return rating === 'good' ? 100 : rating === 'needs-improvement' ? 75 : 50;
    });

    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }, []);

  const getDetailedMetrics = useCallback(() => ({
    ...performanceData,
    score: getPerformanceScore(),
    ratings: Object.entries(performanceData).reduce((acc, [metric, value]) => ({
      ...acc,
      [metric]: getRating(metric, value)
    }), {})
  }), [getPerformanceScore]);

  return {
    performanceData,
    getPerformanceScore,
    getDetailedMetrics
  };
};

export default useWebVitals;