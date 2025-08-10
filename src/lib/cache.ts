// High-performance cache for Oracle Engine responses
// In-memory implementation with Redis-compatible interface for future upgrade

interface CacheEntry {
  value: unknown;
  expiresAt: number;
  hitCount: number;
  createdAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  totalQueries: number;
  averageResponseTime: number;
  cacheHitRate: number;
}

class PerformanceCache {
  private cache = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalQueries: 0,
    averageResponseTime: 0,
    cacheHitRate: 0
  };
  private maxSize = 1000; // Maximum cache entries
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  constructor(maxSize?: number, defaultTTL?: number) {
    if (maxSize) this.maxSize = maxSize;
    if (defaultTTL) this.defaultTTL = defaultTTL;
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  // Generate cache key for Oracle queries
  generateQueryKey(query: string, organizationId?: string): string {
    const normalizedQuery = query.toLowerCase().trim();
    const hash = this.simpleHash(normalizedQuery);
    return organizationId ? `oracle:${organizationId}:${hash}` : `oracle:global:${hash}`;
  }

  // Store Oracle response in cache
  async set(
    key: string, 
    value: unknown, 
    ttlMs?: number
  ): Promise<void> {
    const expiration = ttlMs || this.defaultTTL;
    const expiresAt = Date.now() + expiration;
    
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt,
      hitCount: 0,
      createdAt: Date.now()
    });
  }

  // Retrieve Oracle response from cache
  async get(key: string): Promise<unknown | null> {
    this.stats.totalQueries++;
    
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateCacheHitRate();
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateCacheHitRate();
      return null;
    }

    // Update hit statistics
    entry.hitCount++;
    this.stats.hits++;
    this.updateCacheHitRate();
    
    return entry.value;
  }

  // Check if key exists and is not expired
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Delete specific cache entry
  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  // Clear all cache entries
  async clear(): Promise<void> {
    this.cache.clear();
    this.resetStats();
  }

  // Get cache statistics for monitoring
  getStats(): CacheStats & { size: number; maxSize: number } {
    return {
      ...this.stats,
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }

  // Cached Oracle query wrapper
  async getCachedOracleResponse(
    query: string,
    organizationId: string,
    generator: () => Promise<unknown>
  ): Promise<{ data: unknown; fromCache: boolean; responseTime: number }> {
    const startTime = Date.now();
    const cacheKey = this.generateQueryKey(query, organizationId);
    
    // Try to get from cache first
    const cached = await this.get(cacheKey);
    if (cached) {
      const responseTime = Date.now() - startTime;
      this.updateAverageResponseTime(responseTime);
      return {
        data: cached,
        fromCache: true,
        responseTime
      };
    }

    // Generate new response
    const data = await generator();
    const responseTime = Date.now() - startTime;
    
    // Cache the response (longer TTL for successful responses)
    const ttl = responseTime > 5000 ? 10 * 60 * 1000 : this.defaultTTL; // 10 min for slow queries
    await this.set(cacheKey, data, ttl);
    
    this.updateAverageResponseTime(responseTime);
    
    return {
      data,
      fromCache: false,
      responseTime
    };
  }

  // Simple hash function for cache keys
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Find oldest cache entry for eviction
  private getOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }

  // Clean up expired entries
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`Cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }

  // Update cache hit rate
  private updateCacheHitRate(): void {
    this.stats.cacheHitRate = this.stats.totalQueries > 0 
      ? (this.stats.hits / this.stats.totalQueries) * 100 
      : 0;
  }

  // Update average response time
  private updateAverageResponseTime(newTime: number): void {
    const totalRequests = this.stats.hits + this.stats.misses;
    if (totalRequests === 1) {
      this.stats.averageResponseTime = newTime;
    } else {
      this.stats.averageResponseTime = 
        (this.stats.averageResponseTime * (totalRequests - 1) + newTime) / totalRequests;
    }
  }

  // Reset statistics
  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      totalQueries: 0,
      averageResponseTime: 0,
      cacheHitRate: 0
    };
  }
}

// Singleton cache instance
let cacheInstance: PerformanceCache | null = null;

export function getCache(): PerformanceCache {
  if (!cacheInstance) {
    cacheInstance = new PerformanceCache(
      1000, // Max 1000 cached queries
      5 * 60 * 1000 // 5 minute default TTL
    );
  }
  return cacheInstance;
}

// Export cache interface for Redis migration
export type { CacheStats };
export { PerformanceCache }; 