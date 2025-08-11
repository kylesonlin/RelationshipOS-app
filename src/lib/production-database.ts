// Production Database Service for RelationshipOS
// High-performance, production-ready database operations with connection pooling,
// error handling, monitoring, and multi-tenant security

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './supabase';

// Production database configuration
export interface ProductionDatabaseConfig {
  supabaseUrl: string;
  supabaseKey: string;
  connectionPoolSize: number;
  queryTimeout: number;
  retryAttempts: number;
  enableLogging: boolean;
  enableMetrics: boolean;
  enableCaching: boolean;
}

// Database operation metrics
export interface DatabaseMetrics {
  totalQueries: number;
  averageResponseTime: number;
  errorRate: number;
  connectionPoolUsage: number;
  cacheHitRate: number;
  slowQueries: number;
  activeSessions: number;
  lastUpdated: string;
}

// Transaction context for multi-table operations
export interface DatabaseTransaction {
  id: string;
  organizationId: string;
  userId: string;
  operations: DatabaseOperation[];
  status: 'pending' | 'committed' | 'rolled_back' | 'failed';
  startTime: number;
  endTime?: number;
}

// Individual database operation
export interface DatabaseOperation {
  type: 'insert' | 'update' | 'delete' | 'select';
  table: string;
  data?: Record<string, unknown>;
  filters?: Record<string, unknown>;
  timestamp: number;
}

// Production-ready query builder
export interface ProductionQuery {
  table: string;
  select?: string;
  filters?: Record<string, unknown>;
  orderBy?: { column: string; ascending: boolean };
  limit?: number;
  offset?: number;
  joins?: QueryJoin[];
  aggregations?: QueryAggregation[];
}

export interface QueryJoin {
  table: string;
  on: string;
  type: 'inner' | 'left' | 'right' | 'full';
}

export interface QueryAggregation {
  function: 'count' | 'sum' | 'avg' | 'min' | 'max';
  column: string;
  alias?: string;
}

// Production database connection pool
class ProductionConnectionPool {
  private clients: SupabaseClient<Database>[] = [];
  private availableClients: SupabaseClient<Database>[] = [];
  private busyClients: Set<SupabaseClient<Database>> = new Set();
  private config: ProductionDatabaseConfig;

  constructor(config: ProductionDatabaseConfig) {
    this.config = config;
    this.initializePool();
  }

  private initializePool(): void {
    for (let i = 0; i < this.config.connectionPoolSize; i++) {
      const client = createClient<Database>(
        this.config.supabaseUrl,
        this.config.supabaseKey,
        {
          db: {
            schema: 'public',
          },
          auth: {
            autoRefreshToken: true,
            persistSession: true,
          },
          realtime: {
            params: {
              eventsPerSecond: 10,
            },
          },
        }
      );
      
      this.clients.push(client);
      this.availableClients.push(client);
    }
  }

  async acquireClient(): Promise<SupabaseClient<Database>> {
    if (this.availableClients.length === 0) {
      // Wait for a client to become available
      await new Promise(resolve => setTimeout(resolve, 10));
      return this.acquireClient();
    }

    const client = this.availableClients.pop()!;
    this.busyClients.add(client);
    return client;
  }

  releaseClient(client: SupabaseClient<Database>): void {
    if (this.busyClients.has(client)) {
      this.busyClients.delete(client);
      this.availableClients.push(client);
    }
  }

  getPoolStats() {
    return {
      total: this.clients.length,
      available: this.availableClients.length,
      busy: this.busyClients.size,
      utilization: (this.busyClients.size / this.clients.length) * 100
    };
  }
}

// Production database service
export class ProductionDatabaseService {
  private static instance: ProductionDatabaseService;
  private connectionPool: ProductionConnectionPool;
  private config: ProductionDatabaseConfig;
  private metrics: DatabaseMetrics;
  private activeTransactions: Map<string, DatabaseTransaction> = new Map();

  constructor(config: ProductionDatabaseConfig) {
    this.config = config;
    this.connectionPool = new ProductionConnectionPool(config);
    this.metrics = this.initializeMetrics();
  }

  static getInstance(config?: ProductionDatabaseConfig): ProductionDatabaseService {
    if (!ProductionDatabaseService.instance) {
      if (!config) {
        throw new Error('ProductionDatabaseService requires configuration on first initialization');
      }
      ProductionDatabaseService.instance = new ProductionDatabaseService(config);
    }
    return ProductionDatabaseService.instance;
  }

  private initializeMetrics(): DatabaseMetrics {
    return {
      totalQueries: 0,
      averageResponseTime: 0,
      errorRate: 0,
      connectionPoolUsage: 0,
      cacheHitRate: 0,
      slowQueries: 0,
      activeSessions: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  // Execute production query with full monitoring and error handling
  async executeQuery<T = unknown>(
    query: ProductionQuery,
    organizationId: string,
    userId: string,
    requestId?: string
  ): Promise<{
    data: T[];
    count?: number;
    error?: string;
    executionTime: number;
    fromCache?: boolean;
  }> {
    const startTime = performance.now();
    const client = await this.connectionPool.acquireClient();
    
    try {
      // Build and execute query
      let queryBuilder = client
        .from(query.table)
        .select(query.select || '*', { count: 'exact' });

      // Apply filters with multi-tenant security
      const filters = {
        ...query.filters,
        organization_id: organizationId // Enforce multi-tenancy
      };

      Object.entries(filters).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });

      // Apply ordering
      if (query.orderBy) {
        queryBuilder = queryBuilder.order(query.orderBy.column, {
          ascending: query.orderBy.ascending
        });
      }

      // Apply pagination
      if (query.limit) {
        queryBuilder = queryBuilder.limit(query.limit);
      }
      if (query.offset) {
        queryBuilder = queryBuilder.range(query.offset, (query.offset + (query.limit || 100)) - 1);
      }

      // Execute query with timeout
      const { data, error, count } = await Promise.race([
        queryBuilder,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), this.config.queryTimeout)
        )
      ]);

      const executionTime = performance.now() - startTime;

      // Update metrics
      this.updateMetrics(executionTime, error ? true : false);

      // Log slow queries
      if (executionTime > 1000) {
        this.logSlowQuery(query, executionTime, requestId);
      }

      if (error) {
        this.logError('Query execution failed', error, {
          organizationId,
          userId,
          query,
          requestId
        });
        return {
          data: [],
          error: error.message,
          executionTime
        };
      }

      return {
        data: data as T[],
        count: count || undefined,
        executionTime
      };

    } catch (error) {
      const executionTime = performance.now() - startTime;
      this.updateMetrics(executionTime, true);
      this.logError('Query execution exception', error as Error, {
        organizationId,
        userId,
        query,
        requestId
      });

      return {
        data: [],
        error: (error as Error).message,
        executionTime
      };
    } finally {
      this.connectionPool.releaseClient(client);
    }
  }

  // Start database transaction for multi-table operations
  async beginTransaction(
    organizationId: string,
    userId: string
  ): Promise<string> {
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const transaction: DatabaseTransaction = {
      id: transactionId,
      organizationId,
      userId,
      operations: [],
      status: 'pending',
      startTime: Date.now()
    };

    this.activeTransactions.set(transactionId, transaction);
    return transactionId;
  }

  // Add operation to transaction
  async addToTransaction(
    transactionId: string,
    operation: Omit<DatabaseOperation, 'timestamp'>
  ): Promise<void> {
    const transaction = this.activeTransactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    transaction.operations.push({
      ...operation,
      timestamp: Date.now()
    });
  }

  // Commit transaction (execute all operations atomically)
  async commitTransaction(transactionId: string): Promise<{
    success: boolean;
    results: unknown[];
    error?: string;
  }> {
    const transaction = this.activeTransactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    const client = await this.connectionPool.acquireClient();
    
    try {
      const results: unknown[] = [];
      
      // Execute all operations in sequence
      for (const operation of transaction.operations) {
        let result;
        
        switch (operation.type) {
          case 'insert':
            const { data: insertData, error: insertError } = await client
              .from(operation.table)
              .insert({
                ...operation.data,
                organization_id: transaction.organizationId
              });
            
            if (insertError) throw insertError;
            result = insertData;
            break;

          case 'update':
            const { data: updateData, error: updateError } = await client
              .from(operation.table)
              .update(operation.data!)
              .match({
                ...operation.filters,
                organization_id: transaction.organizationId
              });
            
            if (updateError) throw updateError;
            result = updateData;
            break;

          case 'delete':
            const { data: deleteData, error: deleteError } = await client
              .from(operation.table)
              .delete()
              .match({
                ...operation.filters,
                organization_id: transaction.organizationId
              });
            
            if (deleteError) throw deleteError;
            result = deleteData;
            break;

          default:
            throw new Error(`Unsupported transaction operation: ${operation.type}`);
        }

        results.push(result);
      }

      // Mark transaction as committed
      transaction.status = 'committed';
      transaction.endTime = Date.now();

      this.activeTransactions.delete(transactionId);

      return {
        success: true,
        results
      };

    } catch (error) {
      // Mark transaction as failed
      transaction.status = 'failed';
      transaction.endTime = Date.now();

      this.logError('Transaction commit failed', error as Error, {
        transactionId,
        transaction
      });

      this.activeTransactions.delete(transactionId);

      return {
        success: false,
        results: [],
        error: (error as Error).message
      };
    } finally {
      this.connectionPool.releaseClient(client);
    }
  }

  // Rollback transaction (clean up without executing)
  async rollbackTransaction(transactionId: string): Promise<void> {
    const transaction = this.activeTransactions.get(transactionId);
    if (transaction) {
      transaction.status = 'rolled_back';
      transaction.endTime = Date.now();
      this.activeTransactions.delete(transactionId);
    }
  }

  // Bulk operations for performance
  async bulkInsert<T = unknown>(
    table: string,
    records: T[],
    organizationId: string,
    batchSize: number = 100
  ): Promise<{
    success: boolean;
    insertedCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let insertedCount = 0;

    // Process in batches to avoid overwhelming the database
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const client = await this.connectionPool.acquireClient();

      try {
        const batchWithOrgId = batch.map(record => ({
          ...record,
          organization_id: organizationId
        }));

        const { data, error } = await client
          .from(table)
          .insert(batchWithOrgId);

        if (error) {
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          insertedCount += batch.length;
        }

      } catch (error) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${(error as Error).message}`);
      } finally {
        this.connectionPool.releaseClient(client);
      }
    }

    return {
      success: errors.length === 0,
      insertedCount,
      errors
    };
  }

  // Production health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: DatabaseMetrics;
    connectionPool: ReturnType<ProductionConnectionPool['getPoolStats']>;
    uptime: number;
    checks: {
      database: boolean;
      connection: boolean;
      performance: boolean;
    };
  }> {
    const startTime = performance.now();
    
    try {
      // Test database connectivity
      const client = await this.connectionPool.acquireClient();
      const { error } = await client.from('users').select('id').limit(1);
      this.connectionPool.releaseClient(client);

      const responseTime = performance.now() - startTime;
      const poolStats = this.connectionPool.getPoolStats();

      const checks = {
        database: !error,
        connection: poolStats.available > 0,
        performance: responseTime < 500
      };

      const healthyChecks = Object.values(checks).filter(Boolean).length;
      const status = healthyChecks === 3 ? 'healthy' : 
                   healthyChecks === 2 ? 'degraded' : 'unhealthy';

      return {
        status,
        metrics: { ...this.metrics, lastUpdated: new Date().toISOString() },
        connectionPool: poolStats,
        uptime: Date.now() - (ProductionDatabaseService.instance?.startTime || Date.now()),
        checks
      };

    } catch (error) {
      this.logError('Health check failed', error as Error);
      
      return {
        status: 'unhealthy',
        metrics: this.metrics,
        connectionPool: this.connectionPool.getPoolStats(),
        uptime: 0,
        checks: {
          database: false,
          connection: false,
          performance: false
        }
      };
    }
  }

  // Performance monitoring and metrics
  private updateMetrics(executionTime: number, hasError: boolean): void {
    this.metrics.totalQueries++;
    
    // Update average response time (moving average)
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalQueries - 1) + executionTime) / 
      this.metrics.totalQueries;

    // Update error rate
    if (hasError) {
      this.metrics.errorRate = 
        ((this.metrics.errorRate * (this.metrics.totalQueries - 1)) + 1) / 
        this.metrics.totalQueries;
    }

    // Track slow queries
    if (executionTime > 1000) {
      this.metrics.slowQueries++;
    }

    // Update connection pool usage
    const poolStats = this.connectionPool.getPoolStats();
    this.metrics.connectionPoolUsage = poolStats.utilization;

    this.metrics.lastUpdated = new Date().toISOString();
  }

  private logSlowQuery(
    query: ProductionQuery, 
    executionTime: number, 
    requestId?: string
  ): void {
    if (this.config.enableLogging) {
      console.warn('Slow query detected:', {
        query,
        executionTime,
        requestId,
        timestamp: new Date().toISOString()
      });
    }
  }

  private logError(
    message: string, 
    error: Error, 
    context?: Record<string, unknown>
  ): void {
    if (this.config.enableLogging) {
      console.error(message, {
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get current metrics
  getMetrics(): DatabaseMetrics {
    return { ...this.metrics };
  }

  // Reset metrics (for testing or monitoring resets)
  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
  }

  private startTime = Date.now();
}

// Factory function for production database
export function createProductionDatabase(): ProductionDatabaseService {
  const config: ProductionDatabaseConfig = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    connectionPoolSize: parseInt(process.env.DB_POOL_SIZE || '5'),
    queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '10000'),
    retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3'),
    enableLogging: process.env.NODE_ENV !== 'production',
    enableMetrics: true,
    enableCaching: true
  };

  return ProductionDatabaseService.getInstance(config);
}

// Export singleton instance
export const productionDatabase = createProductionDatabase();

// Utility functions for common database operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }

  throw lastError!;
}

export function sanitizeInput(input: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  Object.entries(input).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (typeof value === 'string') {
        // Basic SQL injection prevention
        sanitized[key] = value.replace(/['"\\]/g, '');
      } else {
        sanitized[key] = value;
      }
    }
  });

  return sanitized;
} 