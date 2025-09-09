import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CacheOptions {
  key: string;
  ttl?: number; // Time to live in milliseconds
  refetchOnStale?: boolean;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// In-memory cache
const cache = new Map<string, CachedData<any>>();

export const useCache = <T>(options: CacheOptions) => {
  const { key, ttl = 5 * 60 * 1000, refetchOnStale = true } = options; // Default 5 minutes
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const isStale = useMemo(() => {
    const cached = cache.get(key);
    if (!cached) return true;
    return Date.now() - cached.timestamp > cached.ttl;
  }, [key, ttl]);

  const getCachedData = () => {
    const cached = cache.get(key);
    if (cached && !isStale) {
      return cached.data;
    }
    return null;
  };

  const setCachedData = (newData: T) => {
    cache.set(key, {
      data: newData,
      timestamp: Date.now(),
      ttl,
    });
    setData(newData);
  };

  const clearCache = () => {
    cache.delete(key);
  };

  useEffect(() => {
    const cached = getCachedData();
    if (cached) {
      setData(cached);
    }
  }, [key]);

  return {
    data,
    loading,
    error,
    isStale,
    setCachedData,
    clearCache,
    setLoading,
    setError,
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) { // Log slow renders (>100ms)
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  });
};

// Database query optimization hook
export const useOptimizedQuery = <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  dependencies: any[],
  cacheKey: string
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { 
    data: cachedData, 
    isStale, 
    setCachedData, 
    setLoading: setCacheLoading,
    setError: setCacheError 
  } = useCache<T>({ key: cacheKey });

  useEffect(() => {
    if (cachedData && !isStale) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setCacheLoading(true);
        setError(null);
        setCacheError(null);

        const result = await queryFn();
        
        if (result.error) {
          throw new Error(result.error.message);
        }

        if (result.data) {
          setData(result.data);
          setCachedData(result.data);
        }
      } catch (err: any) {
        const errorMessage = err.message || 'An error occurred';
        setError(errorMessage);
        setCacheError(errorMessage);
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setCacheLoading(false);
      }
    };

    fetchData();
  }, [...dependencies, cacheKey, isStale]);

  return { data, loading, error };
};