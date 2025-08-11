// Production Cache Service for RelationshipOS
// High-performance Redis-based caching with invalidation strategies,
// analytics, and automatic scaling for production workloads

import Redis from 'ioredis';

// Production cache configuration
export interface ProductionCacheConfig {
  redisUrl?: string;
  redisHost: string;
  redisPort: number;
  redisPassword?: string;
  keyPrefix: string;
  defaultTTL: number;
  maxMemory: string;
  enableCompression: boolean;
  enableAnalytics: boolean;
  connectionPoolSize: number;
}

// Cache operation types
export type CacheOperation = 'get' | 'set' | 'delete' | 'clear' | 'increment' | 'expire';

// Cache analytics and metrics
export interface CacheMetrics {
  totalOperations: number;
  hits: number;
  misses: number;
  hitRate: number;
  averageResponseTime: number;
  memoryUsage: number;
  keyCount: number;
  evictions: number;
  errors: number;
  lastUpdated: string;
  operationCounts: Record<CacheOperation, number>;
}

// Cache entry metadata
export interface CacheEntry<T = unknown> {
  value: T;
  key: string;
  ttl: number;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  tags: string[];
}

// Cache invalidation patterns
export interface InvalidationPattern {
  type: 'exact' | 'prefix' | 'suffix' | 'wildcard' | 'tags';
  pattern: string;
  reason?: string;
  cascade?: boolean;
}

// Production cache service with Redis
export class ProductionCacheService {
  private static instance: ProductionCacheService;
  private redis: Redis;
  private config: ProductionCacheConfig;
  private metrics: CacheMetrics;
  private compressionEnabled: boolean;

  constructor(config: ProductionCacheConfig) {
    this.config = config;
    this.compressionEnabled = config.enableCompression;
    this.metrics = this.initializeMetrics();
    this.redis = this.createRedisConnection();
    this.setupRedisEventHandlers();
  }

  static getInstance(config?: ProductionCacheConfig): ProductionCacheService {
    if (!ProductionCacheService.instance) {
      if (!config) {
        throw new Error('ProductionCacheService requires configuration on first initialization');
      }
      ProductionCacheService.instance = new ProductionCacheService(config);
    }
    return ProductionCacheService.instance;
  }

  private createRedisConnection(): Redis {
    const redisConfig: any = {
      host: this.config.redisHost,
      port: this.config.redisPort,
      password: this.config.redisPassword,
      keyPrefix: this.config.keyPrefix,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    };

    // Use Redis URL if provided (for cloud services like Redis Cloud)
    if (this.config.redisUrl) {
      return new Redis(this.config.redisUrl, {
        ...redisConfig,
        keyPrefix: this.config.keyPrefix,
      });
    }

    return new Redis(redisConfig);
  }

  private setupRedisEventHandlers(): void {
    this.redis.on('connect', () => {
      console.log('Redis connection established');
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
      this.metrics.errors++;
    });

    this.redis.on('close', () => {
      console.log('Redis connection closed');
    });
  }

  private initializeMetrics(): CacheMetrics {
    return {
      totalOperations: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      keyCount: 0,
      evictions: 0,
      errors: 0,
      lastUpdated: new Date().toISOString(),
      operationCounts: {
        get: 0,
        set: 0,
        delete: 0,
        clear: 0,
        increment: 0,
        expire: 0,
      },
    };
  }

  // High-performance get with compression and analytics
  async get<T = unknown>(
    key: string,
    organizationId?: string
  ): Promise<T | null> {
    const startTime = performance.now();
    const fullKey = this.buildKey(key, organizationId);

    try {
      const result = await this.redis.get(fullKey);
      const responseTime = performance.now() - startTime;

      this.updateMetrics('get', responseTime, result !== null);

      if (result === null) {
        return null;
      }

      // Handle compressed data
      const value = this.compressionEnabled ? 
        this.decompress(result) : result;

      return JSON.parse(value) as T;

    } catch (error) {
      this.metrics.errors++;
      console.error('Cache get error:', error);
      return null;
    }
  }

  // High-performance set with compression and TTL
  async set<T = unknown>(
    key: string,
    value: T,
    ttl?: number,
    organizationId?: string,
    tags: string[] = []
  ): Promise<boolean> {
    const startTime = performance.now();
    const fullKey = this.buildKey(key, organizationId);
    const cacheTTL = ttl || this.config.defaultTTL;

    try {
      let serializedValue = JSON.stringify(value);
      
      // Apply compression if enabled
      if (this.compressionEnabled) {
        serializedValue = this.compress(serializedValue);
      }

      // Set value with TTL
      const result = await this.redis.setex(fullKey, cacheTTL, serializedValue);
      
      // Store tags for invalidation
      if (tags.length > 0) {
        await this.setTags(fullKey, tags);
      }

      const responseTime = performance.now() - startTime;
      this.updateMetrics('set', responseTime, true);

      return result === 'OK';

    } catch (error) {
      this.metrics.errors++;
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Multi-get for batch operations
  async mget<T = unknown>(
    keys: string[],
    organizationId?: string
  ): Promise<(T | null)[]> {
    if (keys.length === 0) return [];

    const startTime = performance.now();
    const fullKeys = keys.map(key => this.buildKey(key, organizationId));

    try {
      const results = await this.redis.mget(...fullKeys);
      const responseTime = performance.now() - startTime;

      this.updateMetrics('get', responseTime, true);

      return results.map(result => {
        if (result === null) return null;
        
        try {
          const value = this.compressionEnabled ? 
            this.decompress(result) : result;
          return JSON.parse(value) as T;
        } catch {
          return null;
        }
      });

    } catch (error) {
      this.metrics.errors++;
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  // Multi-set for batch operations
  async mset(
    entries: Array<{
      key: string;
      value: unknown;
      ttl?: number;
      organizationId?: string;
    }>
  ): Promise<boolean> {
    if (entries.length === 0) return true;

    const startTime = performance.now();

    try {
      const pipeline = this.redis.pipeline();

      for (const entry of entries) {
        const fullKey = this.buildKey(entry.key, entry.organizationId);
        const ttl = entry.ttl || this.config.defaultTTL;
        
        let serializedValue = JSON.stringify(entry.value);
        if (this.compressionEnabled) {
          serializedValue = this.compress(serializedValue);
        }

        pipeline.setex(fullKey, ttl, serializedValue);
      }

      const results = await pipeline.exec();
      const responseTime = performance.now() - startTime;
      
      this.updateMetrics('set', responseTime, true);

      return results?.every(([error]) => error === null) || false;

    } catch (error) {
      this.metrics.errors++;
      console.error('Cache mset error:', error);
      return false;
    }
  }

  // Delete single key
  async delete(key: string, organizationId?: string): Promise<boolean> {
    const startTime = performance.now();
    const fullKey = this.buildKey(key, organizationId);

    try {
      const result = await this.redis.del(fullKey);
      const responseTime = performance.now() - startTime;
      
      this.updateMetrics('delete', responseTime, true);
      
      return result > 0;

    } catch (error) {
      this.metrics.errors++;
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Increment counter (for rate limiting, metrics, etc.)
  async increment(
    key: string,
    amount: number = 1,
    organizationId?: string,
    ttl?: number
  ): Promise<number> {
    const startTime = performance.now();
    const fullKey = this.buildKey(key, organizationId);

    try {
      const result = await this.redis.incrby(fullKey, amount);
      
      // Set TTL if specified and key was just created
      if (ttl && result === amount) {
        await this.redis.expire(fullKey, ttl);
      }

      const responseTime = performance.now() - startTime;
      this.updateMetrics('increment', responseTime, true);

      return result;

    } catch (error) {
      this.metrics.errors++;
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  // Cache invalidation with patterns
  async invalidate(pattern: InvalidationPattern): Promise<number> {
    const startTime = performance.now();
    let deletedCount = 0;

    try {
      let keys: string[] = [];

      switch (pattern.type) {
        case 'exact':
          keys = [pattern.pattern];
          break;

        case 'prefix':
          keys = await this.redis.keys(`${pattern.pattern}*`);
          break;

        case 'suffix':
          keys = await this.redis.keys(`*${pattern.pattern}`);
          break;

        case 'wildcard':
          keys = await this.redis.keys(pattern.pattern);
          break;

        case 'tags':
          keys = await this.getKeysByTag(pattern.pattern);
          break;
      }

      if (keys.length > 0) {
        // Delete in batches to avoid blocking Redis
        const batchSize = 100;
        for (let i = 0; i < keys.length; i += batchSize) {
          const batch = keys.slice(i, i + batchSize);
          const result = await this.redis.del(...batch);
          deletedCount += result;
        }
      }

      const responseTime = performance.now() - startTime;
      this.updateMetrics('delete', responseTime, true);

      console.log(`Cache invalidation: ${deletedCount} keys deleted for pattern ${pattern.pattern}`);
      return deletedCount;

    } catch (error) {
      this.metrics.errors++;
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  // Oracle-specific caching for relationship intelligence
  async cacheOracleResponse(
    query: string,
    response: unknown,
    organizationId: string,
    contextHash?: string
  ): Promise<boolean> {
    const key = `oracle:${this.hashQuery(query)}:${contextHash || 'default'}`;
    const ttl = 3600; // 1 hour for Oracle responses
    const tags = ['oracle', `org:${organizationId}`];
    
    return this.set(key, response, ttl, organizationId, tags);
  }

  async getCachedOracleResponse<T = unknown>(
    query: string,
    organizationId: string,
    contextHash?: string
  ): Promise<T | null> {
    const key = `oracle:${this.hashQuery(query)}:${contextHash || 'default'}`;
    return this.get<T>(key, organizationId);
  }

  // Performance monitoring and health checks
  async getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: CacheMetrics;
    redisInfo: {
      connected: boolean;
      memoryUsed: string;
      keyCount: number;
      uptime: number;
    };
  }> {
    try {
      const info = await this.redis.info('memory');
      const keyCount = await this.redis.dbsize();
      const ping = await this.redis.ping();

      const redisInfo = {
        connected: ping === 'PONG',
        memoryUsed: this.extractMemoryUsage(info),
        keyCount,
        uptime: this.extractUptime(info),
      };

      const status = redisInfo.connected && this.metrics.errorRate < 0.01 ? 
        'healthy' : 
        redisInfo.connected ? 'degraded' : 'unhealthy';

      return {
        status,
        metrics: { ...this.metrics, lastUpdated: new Date().toISOString() },
        redisInfo,
      };

    } catch (error) {
      console.error('Cache health check failed:', error);
      return {
        status: 'unhealthy',
        metrics: this.metrics,
        redisInfo: {
          connected: false,
          memoryUsed: '0',
          keyCount: 0,
          uptime: 0,
        },
      };
    }
  }

  // Utility methods
  private buildKey(key: string, organizationId?: string): string {
    return organizationId ? `${organizationId}:${key}` : key;
  }

  private hashQuery(query: string): string {
    // Simple hash function for cache keys
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private compress(data: string): string {
    // Simple compression simulation (in production, use actual compression library)
    return data; // TODO: Implement actual compression
  }

  private decompress(data: string): string {
    // Simple decompression simulation
    return data; // TODO: Implement actual decompression
  }

  private async setTags(key: string, tags: string[]): Promise<void> {
    const pipeline = this.redis.pipeline();
    
    for (const tag of tags) {
      const tagKey = `tag:${tag}`;
      pipeline.sadd(tagKey, key);
      pipeline.expire(tagKey, this.config.defaultTTL);
    }
    
    await pipeline.exec();
  }

  private async getKeysByTag(tag: string): Promise<string[]> {
    const tagKey = `tag:${tag}`;
    return this.redis.smembers(tagKey);
  }

  private updateMetrics(
    operation: CacheOperation,
    responseTime: number,
    isHit: boolean
  ): void {
    this.metrics.totalOperations++;
    this.metrics.operationCounts[operation]++;
    
    if (operation === 'get') {
      if (isHit) {
        this.metrics.hits++;
      } else {
        this.metrics.misses++;
      }
      
      this.metrics.hitRate = this.metrics.hits / (this.metrics.hits + this.metrics.misses);
    }

    // Update average response time (moving average)
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalOperations - 1) + responseTime) / 
      this.metrics.totalOperations;

    this.metrics.lastUpdated = new Date().toISOString();
  }

  private extractMemoryUsage(info: string): string {
    const match = info.match(/used_memory_human:(.+)/);
    return match ? match[1].trim() : '0B';
  }

  private extractUptime(info: string): number {
    const match = info.match(/uptime_in_seconds:(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  // Clean up resources
  async close(): Promise<void> {
    await this.redis.quit();
  }

  // Get current metrics
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  // Clear all cache (development/testing only)
  async clear(): Promise<boolean> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cache clear is not allowed in production');
    }

    try {
      await this.redis.flushdb();
      this.metrics = this.initializeMetrics();
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }
}

// Factory function for production cache
export function createProductionCache(): ProductionCacheService {
  const config: ProductionCacheConfig = {
    redisUrl: process.env.REDIS_URL,
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT || '6379'),
    redisPassword: process.env.REDIS_PASSWORD,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'ros:',
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'),
    maxMemory: process.env.REDIS_MAX_MEMORY || '256mb',
    enableCompression: process.env.CACHE_COMPRESSION === 'true',
    enableAnalytics: true,
    connectionPoolSize: parseInt(process.env.REDIS_POOL_SIZE || '10'),
  };

  return ProductionCacheService.getInstance(config);
}

// Export singleton instance
export const productionCache = createProductionCache();

// Cache decorators for common patterns
export function cached(ttl?: number, tags?: string[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `method:${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
      
      // Try to get from cache first
      const cached = await productionCache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Cache the result
      await productionCache.set(cacheKey, result, ttl, undefined, tags);

      return result;
    };
  };
}

// Utility functions
export function invalidateOracleCache(organizationId: string): Promise<number> {
  return productionCache.invalidate({
    type: 'tags',
    pattern: `org:${organizationId}`,
    reason: 'Organization data updated'
  });
}

export function invalidateUserCache(userId: string): Promise<number> {
  return productionCache.invalidate({
    type: 'prefix',
    pattern: `user:${userId}`,
    reason: 'User data updated'
  });
} 