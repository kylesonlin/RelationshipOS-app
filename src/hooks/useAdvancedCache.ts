import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  staleTime: number;
  lastAccessed: number;
}

interface QueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<{ data: T | null; error: any }>;
  staleTime?: number;
  gcTime?: number;
  enabled?: boolean;
  initialData?: T;
  retry?: number;
  retryDelay?: number;
  select?: (data: T) => any;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

class AdvancedQueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private subscribers = new Map<string, Set<() => void>>();
  private gcTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Run garbage collection every 5 minutes
    this.gcTimer = setInterval(() => this.garbageCollect(), 5 * 60 * 1000);
  }

  private getKey(queryKey: string[]): string {
    return JSON.stringify(queryKey);
  }

  get<T>(queryKey: string[]): CacheEntry<T> | null {
    const key = this.getKey(queryKey);
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    // Update last accessed time
    entry.lastAccessed = Date.now();
    
    return entry;
  }

  set<T>(queryKey: string[], data: T, options: { ttl?: number; staleTime?: number } = {}): void {
    const key = this.getKey(queryKey);
    const now = Date.now();
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: options.ttl || 10 * 60 * 1000, // 10 minutes default
      staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes default
      lastAccessed: now,
    };

    this.cache.set(key, entry);
    this.notifySubscribers(key);
  }

  invalidate(queryKey: string[]): void {
    const key = this.getKey(queryKey);
    this.cache.delete(key);
    this.notifySubscribers(key);
  }

  invalidatePattern(pattern: string): void {
    const keysToInvalidate: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToInvalidate.push(key);
      }
    }

    keysToInvalidate.forEach(key => {
      this.cache.delete(key);
      this.notifySubscribers(key);
    });
  }

  subscribe(queryKey: string[], callback: () => void): () => void {
    const key = this.getKey(queryKey);
    
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key)!.add(callback);

    return () => {
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  private notifySubscribers(key: string): void {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach(callback => callback());
    }
  }

  private garbageCollect(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      // Remove entries that are past their TTL and haven't been accessed recently
      if (now - entry.timestamp > entry.ttl && now - entry.lastAccessed > 30 * 60 * 1000) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  isStale<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.staleTime;
  }

  clear(): void {
    this.cache.clear();
    this.subscribers.clear();
  }

  getStats() {
    return {
      cacheSize: this.cache.size,
      subscriberCount: Array.from(this.subscribers.values()).reduce((sum, set) => sum + set.size, 0),
    };
  }

  destroy(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
    }
    this.clear();
  }
}

const queryCache = new AdvancedQueryCache();

export const useAdvancedQuery = <T, TSelected = T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000,
  gcTime = 10 * 60 * 1000,
  enabled = true,
  initialData,
  retry = 3,
  retryDelay = 1000,
  select,
  onSuccess,
  onError,
}: QueryOptions<T> & { select?: (data: T) => TSelected }) => {
  const [state, setState] = useState<{
    data: TSelected | T | null;
    loading: boolean;
    error: string | null;
    isStale: boolean;
    isFetching: boolean;
  }>({
    data: initialData || null,
    loading: !initialData,
    error: null,
    isStale: false,
    isFetching: false,
  });

  const { toast } = useToast();

  // Check cache and determine if data is stale
  const cacheEntry = useMemo(() => queryCache.get<T>(queryKey), [queryKey]);
  const isStale = useMemo(() => cacheEntry ? queryCache.isStale(cacheEntry) : true, [cacheEntry]);

  // Transform data if select function is provided
  const transformedData = useMemo(() => {
    if (!cacheEntry?.data) return null;
    return select ? select(cacheEntry.data) : cacheEntry.data;
  }, [cacheEntry?.data, select]);

  const fetchData = useCallback(async (isBackground = false) => {
    if (!enabled) return;

    setState(prev => ({ 
      ...prev, 
      loading: !isBackground && !cacheEntry, 
      isFetching: true,
      error: null 
    }));

    let retryCount = 0;
    
    const attemptFetch = async (): Promise<void> => {
      try {
        const result = await queryFn();

        if (result.error) {
          throw new Error(result.error.message);
        }

        if (result.data) {
          queryCache.set(queryKey, result.data, { ttl: gcTime, staleTime });
          
          const finalData = select ? select(result.data) : result.data;
          
          setState(prev => ({
            ...prev,
            data: finalData,
            loading: false,
            isFetching: false,
            error: null,
            isStale: false,
          }));

          onSuccess?.(result.data);
        }
      } catch (err: any) {
        retryCount++;
        
        if (retryCount <= retry) {
          setTimeout(() => attemptFetch(), retryDelay * retryCount);
          return;
        }

        const errorMessage = err.message || 'An error occurred';
        
        setState(prev => ({
          ...prev,
          loading: false,
          isFetching: false,
          error: errorMessage,
        }));

        onError?.(err);
        
        if (!isBackground) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    };

    await attemptFetch();
  }, [queryKey, queryFn, enabled, retry, retryDelay, select, onSuccess, onError, toast, gcTime, staleTime, cacheEntry]);

  // Subscribe to cache changes
  useEffect(() => {
    const unsubscribe = queryCache.subscribe(queryKey, () => {
      const entry = queryCache.get<T>(queryKey);
      if (entry) {
        const finalData = select ? select(entry.data) : entry.data;
        setState(prev => ({
          ...prev,
          data: finalData,
          isStale: queryCache.isStale(entry),
        }));
      }
    });

    return unsubscribe;
  }, [queryKey, select]);

  // Initial data load
  useEffect(() => {
    if (cacheEntry && !state.data) {
      setState(prev => ({
        ...prev,
        data: transformedData,
        loading: false,
        isStale: isStale,
      }));
    }

    if (!cacheEntry || isStale) {
      fetchData(!cacheEntry);
    }
  }, [cacheEntry, isStale, transformedData, fetchData, state.data]);

  const refetch = useCallback(() => {
    queryCache.invalidate(queryKey);
    return fetchData(false);
  }, [queryKey, fetchData]);

  const invalidate = useCallback(() => {
    queryCache.invalidate(queryKey);
  }, [queryKey]);

  return {
    ...state,
    data: transformedData || state.data,
    refetch,
    invalidate,
    remove: () => queryCache.invalidate(queryKey),
  };
};

export { queryCache };
export default useAdvancedQuery;