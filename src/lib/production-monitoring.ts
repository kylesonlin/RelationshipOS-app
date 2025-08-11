// Production Monitoring Service for RelationshipOS
// Comprehensive monitoring, error tracking, performance metrics, and alerting
// for production-grade relationship intelligence platform

// System health and performance metrics
export interface SystemMetrics {
  timestamp: string;
  uptime: number;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
    heapUsed: number;
    heapTotal: number;
  };
  database: {
    connections: number;
    queryTime: number;
    errorRate: number;
  };
  cache: {
    hitRate: number;
    memoryUsage: number;
    operations: number;
  };
  api: {
    requestCount: number;
    averageResponseTime: number;
    errorRate: number;
    slowRequests: number;
  };
  oracle: {
    queriesPerMinute: number;
    averageResponseTime: number;
    successRate: number;
    cacheHitRate: number;
  };
}

// Error tracking and classification
export interface ProductionError {
  id: string;
  timestamp: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  type: 'database' | 'api' | 'oracle' | 'auth' | 'billing' | 'integration' | 'system';
  message: string;
  stack?: string;
  context: {
    userId?: string;
    organizationId?: string;
    requestId?: string;
    endpoint?: string;
    userAgent?: string;
    ip?: string;
  };
  metadata: Record<string, unknown>;
  resolved: boolean;
  resolution?: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
}

// Performance monitoring for Oracle Engine
export interface OraclePerformanceMetrics {
  responseTime: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: {
    queriesPerSecond: number;
    queriesPerMinute: number;
    queriesPerHour: number;
  };
  accuracy: {
    successRate: number;
    errorRate: number;
    timeoutRate: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    evictionRate: number;
  };
  userExperience: {
    satisfactionScore: number;
    abandonmentRate: number;
    retryRate: number;
  };
}

// Real-time alerts and notifications
export interface Alert {
  id: string;
  type: 'performance' | 'error' | 'security' | 'capacity' | 'business';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  actions: AlertAction[];
}

export interface AlertAction {
  type: 'email' | 'slack' | 'webhook' | 'auto_scale' | 'restart_service';
  target: string;
  executed: boolean;
  result?: string;
}

// Business metrics and KPIs
export interface BusinessMetrics {
  customers: {
    total: number;
    active: number;
    newSignups: number;
    churn: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    growth: number;
  };
  usage: {
    totalOracleQueries: number;
    averageQueriesPerUser: number;
    peakUsage: number;
  };
  satisfaction: {
    nps: number;
    supportTickets: number;
    featureRequests: number;
  };
}

// Production monitoring service
export class ProductionMonitoringService {
  private static instance: ProductionMonitoringService;
  private errors: Map<string, ProductionError> = new Map();
  private metrics: SystemMetrics[] = [];
  private alerts: Map<string, Alert> = new Map();
  private alertRules: AlertRule[] = [];
  private isMonitoring: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;

  static getInstance(): ProductionMonitoringService {
    if (!ProductionMonitoringService.instance) {
      ProductionMonitoringService.instance = new ProductionMonitoringService();
    }
    return ProductionMonitoringService.instance;
  }

  // Start comprehensive monitoring
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.setupDefaultAlertRules();
    
    // Collect metrics every minute
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 60000);

    console.log('Production monitoring started');
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    console.log('Production monitoring stopped');
  }

  // Track production errors with context
  trackError(
    error: Error | string,
    type: ProductionError['type'],
    level: ProductionError['level'],
    context: ProductionError['context'] = {},
    metadata: Record<string, unknown> = {}
  ): string {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'object' ? error.stack : undefined;
    
    // Create error fingerprint for grouping
    const fingerprint = this.createErrorFingerprint(errorMessage, type, context.endpoint);
    
    const now = new Date().toISOString();
    
    if (this.errors.has(fingerprint)) {
      // Update existing error
      const existingError = this.errors.get(fingerprint)!;
      existingError.occurrences++;
      existingError.lastSeen = now;
      existingError.metadata = { ...existingError.metadata, ...metadata };
    } else {
      // Create new error
      const productionError: ProductionError = {
        id: fingerprint,
        timestamp: now,
        level,
        type,
        message: errorMessage,
        stack: errorStack,
        context,
        metadata,
        resolved: false,
        occurrences: 1,
        firstSeen: now,
        lastSeen: now,
      };
      
      this.errors.set(fingerprint, productionError);
    }

    // Check if this error should trigger an alert
    this.evaluateErrorAlert(this.errors.get(fingerprint)!);

    // Log error for immediate visibility
    console.error(`Production Error [${type}/${level}]:`, {
      message: errorMessage,
      context,
      metadata,
      fingerprint,
    });

    return fingerprint;
  }

  // Track Oracle Engine performance
  trackOracleQuery(
    query: string,
    responseTime: number,
    success: boolean,
    fromCache: boolean,
    organizationId: string,
    userId: string
  ): void {
    const metrics = {
      timestamp: new Date().toISOString(),
      query: this.sanitizeQuery(query),
      responseTime,
      success,
      fromCache,
      organizationId,
      userId,
      metadata: {
        hourOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
      },
    };

    // Store metrics for analysis
    this.storeOracleMetrics(metrics);

    // Check performance thresholds
    this.evaluateOraclePerformance(responseTime, success);
  }

  // Track API endpoint performance
  trackAPIRequest(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    userId?: string,
    organizationId?: string
  ): void {
    const metrics = {
      timestamp: new Date().toISOString(),
      endpoint,
      method,
      statusCode,
      responseTime,
      userId,
      organizationId,
      success: statusCode < 400,
    };

    this.storeAPIMetrics(metrics);

    // Check for performance issues
    if (responseTime > 5000) {
      this.trackError(
        `Slow API response: ${endpoint} took ${responseTime}ms`,
        'api',
        'medium',
        { endpoint, userId, organizationId },
        { responseTime, statusCode }
      );
    }
  }

  // Get current system health
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    metrics: SystemMetrics;
    errors: ProductionError[];
    alerts: Alert[];
  }> {
    const currentMetrics = await this.collectSystemMetrics();
    const recentErrors = Array.from(this.errors.values())
      .filter(error => !error.resolved)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
    
    const activeAlerts = Array.from(this.alerts.values())
      .filter(alert => !alert.resolved);

    // Health checks
    const checks = {
      database: currentMetrics.database.errorRate < 0.01,
      cache: currentMetrics.cache.hitRate > 0.8,
      api: currentMetrics.api.errorRate < 0.05,
      oracle: currentMetrics.oracle.successRate > 0.95,
      memory: currentMetrics.memory.percentage < 85,
    };

    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const status = healthyChecks === Object.keys(checks).length ? 'healthy' :
                   healthyChecks >= 3 ? 'degraded' : 'unhealthy';

    return {
      status,
      checks,
      metrics: currentMetrics,
      errors: recentErrors,
      alerts: activeAlerts,
    };
  }

  // Get Oracle performance analytics
  getOracleAnalytics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): OraclePerformanceMetrics {
    // Mock implementation - in production, this would query actual metrics store
    return {
      responseTime: {
        average: 3200,
        p50: 2800,
        p95: 8500,
        p99: 9800,
      },
      throughput: {
        queriesPerSecond: 2.5,
        queriesPerMinute: 150,
        queriesPerHour: 9000,
      },
      accuracy: {
        successRate: 97.8,
        errorRate: 2.2,
        timeoutRate: 0.5,
      },
      cache: {
        hitRate: 84.2,
        missRate: 15.8,
        evictionRate: 2.1,
      },
      userExperience: {
        satisfactionScore: 4.7,
        abandonmentRate: 1.2,
        retryRate: 3.1,
      },
    };
  }

  // Get business metrics dashboard
  getBusinessMetrics(): BusinessMetrics {
    // Mock implementation - in production, this would aggregate real data
    return {
      customers: {
        total: 47,
        active: 43,
        newSignups: 8,
        churn: 2,
      },
      revenue: {
        mrr: 14063, // Monthly recurring revenue
        arr: 168756, // Annual recurring revenue
        growth: 34.5, // Percentage growth
      },
      usage: {
        totalOracleQueries: 45230,
        averageQueriesPerUser: 952,
        peakUsage: 1247,
      },
      satisfaction: {
        nps: 78, // Net Promoter Score
        supportTickets: 3,
        featureRequests: 12,
      },
    };
  }

  // Create alert rules for monitoring
  private setupDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: 'oracle_response_time',
        metric: 'oracle.responseTime',
        condition: '>',
        threshold: 10000, // 10 seconds
        severity: 'error',
        description: 'Oracle response time exceeds 10 second guarantee',
      },
      {
        id: 'error_rate_high',
        metric: 'api.errorRate',
        condition: '>',
        threshold: 0.05, // 5% error rate
        severity: 'warning',
        description: 'API error rate is above acceptable threshold',
      },
      {
        id: 'memory_usage_high',
        metric: 'memory.percentage',
        condition: '>',
        threshold: 90, // 90% memory usage
        severity: 'critical',
        description: 'Memory usage is critically high',
      },
      {
        id: 'database_slow',
        metric: 'database.queryTime',
        condition: '>',
        threshold: 5000, // 5 seconds
        severity: 'warning',
        description: 'Database queries are running slowly',
      },
    ];
  }

  // Collect comprehensive system metrics
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    const metrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      cpu: {
        usage: await this.getCPUUsage(),
        loadAverage: process.loadavg(),
      },
      memory: {
        used: process.memoryUsage().rss,
        total: this.getTotalMemory(),
        percentage: (process.memoryUsage().rss / this.getTotalMemory()) * 100,
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal,
      },
      database: {
        connections: await this.getDatabaseConnections(),
        queryTime: await this.getAverageDatabaseQueryTime(),
        errorRate: this.getDatabaseErrorRate(),
      },
      cache: {
        hitRate: await this.getCacheHitRate(),
        memoryUsage: await this.getCacheMemoryUsage(),
        operations: await this.getCacheOperations(),
      },
      api: {
        requestCount: this.getAPIRequestCount(),
        averageResponseTime: this.getAPIResponseTime(),
        errorRate: this.getAPIErrorRate(),
        slowRequests: this.getSlowAPIRequests(),
      },
      oracle: {
        queriesPerMinute: this.getOracleQueriesPerMinute(),
        averageResponseTime: this.getOracleResponseTime(),
        successRate: this.getOracleSuccessRate(),
        cacheHitRate: this.getOracleCacheHitRate(),
      },
    };

    // Store metrics for historical analysis
    this.metrics.push(metrics);
    
    // Keep only last 24 hours of metrics
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.metrics = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > oneDayAgo
    );

    // Evaluate alert rules
    this.evaluateAlertRules(metrics);

    return metrics;
  }

  // Utility methods for metrics collection
  private async getCPUUsage(): Promise<number> {
    // Simplified CPU usage calculation
    return Math.random() * 100; // Mock implementation
  }

  private getTotalMemory(): number {
    return process.env.NODE_ENV === 'production' ? 2 * 1024 * 1024 * 1024 : 1024 * 1024 * 1024; // 2GB or 1GB
  }

  private async getDatabaseConnections(): Promise<number> {
    // Mock - in production, this would query the connection pool
    return Math.floor(Math.random() * 10) + 1;
  }

  private async getAverageDatabaseQueryTime(): Promise<number> {
    // Mock - in production, this would be actual metrics
    return Math.random() * 1000 + 100;
  }

  private getDatabaseErrorRate(): number {
    return Math.random() * 0.01; // Mock 0-1% error rate
  }

  private async getCacheHitRate(): Promise<number> {
    return Math.random() * 0.2 + 0.8; // Mock 80-100% hit rate
  }

  private async getCacheMemoryUsage(): Promise<number> {
    return Math.random() * 100; // Mock memory usage
  }

  private async getCacheOperations(): Promise<number> {
    return Math.floor(Math.random() * 1000) + 100;
  }

  private getAPIRequestCount(): number {
    return Math.floor(Math.random() * 500) + 100;
  }

  private getAPIResponseTime(): number {
    return Math.random() * 2000 + 200;
  }

  private getAPIErrorRate(): number {
    return Math.random() * 0.05; // Mock 0-5% error rate
  }

  private getSlowAPIRequests(): number {
    return Math.floor(Math.random() * 10);
  }

  private getOracleQueriesPerMinute(): number {
    return Math.floor(Math.random() * 100) + 50;
  }

  private getOracleResponseTime(): number {
    return Math.random() * 5000 + 1000;
  }

  private getOracleSuccessRate(): number {
    return Math.random() * 0.05 + 0.95; // Mock 95-100% success rate
  }

  private getOracleCacheHitRate(): number {
    return Math.random() * 0.2 + 0.8; // Mock 80-100% cache hit rate
  }

  // Error handling and alerting
  private createErrorFingerprint(message: string, type: string, endpoint?: string): string {
    const key = `${type}:${endpoint || 'unknown'}:${message.substring(0, 50)}`;
    return Buffer.from(key).toString('base64').substring(0, 16);
  }

  private sanitizeQuery(query: string): string {
    // Remove sensitive information from queries for logging
    return query.replace(/\b[\w._%+-]+@[\w.-]+\.[A-Z]{2,}\b/gi, '[EMAIL]')
                .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD]');
  }

  private storeOracleMetrics(metrics: any): void {
    // In production, this would store in a time-series database
    console.log('Oracle metrics:', metrics);
  }

  private storeAPIMetrics(metrics: any): void {
    // In production, this would store in a time-series database
    console.log('API metrics:', metrics);
  }

  private evaluateErrorAlert(error: ProductionError): void {
    // Trigger alerts for critical errors or high frequency errors
    if (error.level === 'critical' || error.occurrences > 10) {
      this.createAlert({
        type: 'error',
        severity: error.level === 'critical' ? 'critical' : 'warning',
        title: `${error.type} Error Alert`,
        description: `Error "${error.message}" has occurred ${error.occurrences} times`,
        metric: 'error.occurrences',
        threshold: 1,
        currentValue: error.occurrences,
      });
    }
  }

  private evaluateOraclePerformance(responseTime: number, success: boolean): void {
    if (responseTime > 10000) {
      this.createAlert({
        type: 'performance',
        severity: 'error',
        title: 'Oracle Response Time Violation',
        description: `Oracle query took ${responseTime}ms, exceeding 10 second guarantee`,
        metric: 'oracle.responseTime',
        threshold: 10000,
        currentValue: responseTime,
      });
    }

    if (!success) {
      this.trackError(
        'Oracle query failed',
        'oracle',
        'medium',
        {},
        { responseTime, success }
      );
    }
  }

  private evaluateAlertRules(metrics: SystemMetrics): void {
    for (const rule of this.alertRules) {
      const currentValue = this.getMetricValue(metrics, rule.metric);
      const shouldAlert = this.evaluateCondition(currentValue, rule.condition, rule.threshold);

      if (shouldAlert) {
        this.createAlert({
          type: 'performance',
          severity: rule.severity,
          title: `${rule.metric} Alert`,
          description: rule.description,
          metric: rule.metric,
          threshold: rule.threshold,
          currentValue,
        });
      }
    }
  }

  private getMetricValue(metrics: SystemMetrics, path: string): number {
    const parts = path.split('.');
    let value: any = metrics;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return typeof value === 'number' ? value : 0;
  }

  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '>=': return value >= threshold;
      case '<=': return value <= threshold;
      case '==': return value === threshold;
      default: return false;
    }
  }

  private createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'acknowledged' | 'resolved' | 'actions'>): void {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: Alert = {
      id: alertId,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false,
      actions: [],
      ...alertData,
    };

    this.alerts.set(alertId, alert);
    
    console.warn(`ALERT [${alert.severity}]: ${alert.title}`, {
      description: alert.description,
      metric: alert.metric,
      threshold: alert.threshold,
      currentValue: alert.currentValue,
    });
  }
}

// Alert rule interface
interface AlertRule {
  id: string;
  metric: string;
  condition: '>' | '<' | '>=' | '<=' | '==';
  threshold: number;
  severity: Alert['severity'];
  description: string;
}

// Export singleton instance
export const productionMonitoring = ProductionMonitoringService.getInstance();

// Utility functions for easy monitoring integration
export function trackError(
  error: Error | string,
  type: ProductionError['type'] = 'system',
  level: ProductionError['level'] = 'medium',
  context: ProductionError['context'] = {}
): string {
  return productionMonitoring.trackError(error, type, level, context);
}

export function trackOracleQuery(
  query: string,
  responseTime: number,
  success: boolean,
  fromCache: boolean,
  organizationId: string,
  userId: string
): void {
  productionMonitoring.trackOracleQuery(query, responseTime, success, fromCache, organizationId, userId);
}

export function trackAPIRequest(
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number,
  userId?: string,
  organizationId?: string
): void {
  productionMonitoring.trackAPIRequest(endpoint, method, statusCode, responseTime, userId, organizationId);
}

// Initialize monitoring in production
if (process.env.NODE_ENV === 'production') {
  productionMonitoring.startMonitoring();
} 