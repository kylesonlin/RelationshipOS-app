import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseOptimizedQueryOptions<T> {
  queryKey: string;
  queryFn: () => Promise<{ data: T | null; error: any }>;
  dependencies?: any[];
  staleTime?: number;
  enabled?: boolean;
  initialData?: T;
}

// Enhanced in-memory cache with TTL and storage persistence
class QueryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

const queryCache = new QueryCache();

export const useOptimizedQuery = <T>({
  queryKey,
  queryFn,
  dependencies = [],
  staleTime = 5 * 60 * 1000,
  enabled = true,
  initialData
}: UseOptimizedQueryOptions<T>) => {
  const [data, setData] = useState<T | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check cache first
  const cachedData = useMemo(() => queryCache.get<T>(queryKey), [queryKey]);

  useEffect(() => {
    if (!enabled) return;

    // Use cached data if available
    if (cachedData && !initialData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    // Set initial data if provided
    if (initialData && !data) {
      setData(initialData);
      setLoading(false);
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await queryFn();

        if (result.error) {
          throw new Error(result.error.message);
        }

        if (result.data) {
          setData(result.data);
          queryCache.set(queryKey, result.data, staleTime);
        }
      } catch (err: any) {
        const errorMessage = err.message || 'An error occurred';
        setError(errorMessage);
        
        // Only show toast for non-cached errors
        if (!cachedData) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [queryKey, enabled, staleTime, ...dependencies]);

  const refetch = () => {
    queryCache.invalidate(queryKey);
    setLoading(true);
    setError(null);
  };

  const mutate = (newData: T) => {
    setData(newData);
    queryCache.set(queryKey, newData, staleTime);
  };

  return { 
    data, 
    loading: loading && !cachedData, 
    error, 
    refetch, 
    mutate,
    isStale: !cachedData && !!data
  };
};

export { queryCache };