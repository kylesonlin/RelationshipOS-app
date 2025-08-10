import { NextResponse } from 'next/server';
import { getCache } from '@/lib/cache';

export async function GET() {
  try {
    const cache = getCache();
    const stats = cache.getStats();
    
    // Calculate performance grades
    const getPerformanceGrade = (avgTime: number): string => {
      if (avgTime < 1000) return 'A+';
      if (avgTime < 2000) return 'A';
      if (avgTime < 3000) return 'B+';
      if (avgTime < 5000) return 'B';
      if (avgTime < 8000) return 'C';
      return 'D';
    };

    const getCacheEfficiencyGrade = (hitRate: number): string => {
      if (hitRate >= 90) return 'A+';
      if (hitRate >= 80) return 'A';
      if (hitRate >= 70) return 'B+';
      if (hitRate >= 60) return 'B';
      if (hitRate >= 50) return 'C';
      return 'D';
    };

    // System health checks
    const healthChecks = {
      oracleApi: true, // Always true if this endpoint responds
      cache: stats.size >= 0, // Cache is functioning
      performance: stats.averageResponseTime < 10000, // Under 10s guarantee
      memory: stats.size < stats.maxSize * 0.9, // Cache not near full
    };

    const overallHealth = Object.values(healthChecks).every(check => check);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      systemHealth: {
        status: overallHealth ? 'healthy' : 'warning',
        uptime: process.uptime() * 1000, // Convert to milliseconds
        checks: healthChecks
      },
      performance: {
        averageResponseTime: {
          value: Math.round(stats.averageResponseTime),
          unit: 'milliseconds',
          grade: getPerformanceGrade(stats.averageResponseTime),
          target: '< 10,000ms',
          achieved: stats.averageResponseTime < 10000
        },
        responseTimeBreakdown: {
          excellent: '< 2s (A+)',
          good: '2-5s (A-B+)', 
          acceptable: '5-10s (B-C)',
          needsOptimization: '> 10s (D)'
        }
      },
      cache: {
        hitRate: {
          value: Math.round(stats.cacheHitRate * 100) / 100,
          unit: 'percentage',
          grade: getCacheEfficiencyGrade(stats.cacheHitRate),
          interpretation: stats.cacheHitRate > 70 ? 'excellent' : 
                         stats.cacheHitRate > 50 ? 'good' : 
                         stats.cacheHitRate > 30 ? 'fair' : 'poor'
        },
        usage: {
          size: stats.size,
          maxSize: stats.maxSize,
          utilizationPercentage: Math.round((stats.size / stats.maxSize) * 100),
          status: stats.size < stats.maxSize * 0.8 ? 'optimal' : 
                  stats.size < stats.maxSize * 0.95 ? 'high' : 'critical'
        },
        statistics: {
          totalQueries: stats.totalQueries,
          hits: stats.hits,
          misses: stats.misses,
          efficiency: stats.totalQueries > 0 ? 
            `${stats.hits} hits, ${stats.misses} misses` : 'No queries yet'
        }
      },
      benchmarks: {
        targetMetrics: {
          responseTime: '< 10 seconds (guarantee)',
          cacheHitRate: '> 70% (optimal)',
          availability: '99.9% uptime'
        },
        competitorComparison: {
          humanVA: '2-3 days response time',
          traditionalCRM: '30+ seconds for complex queries',
          oracleAdvantage: stats.averageResponseTime < 10000 ? 
            `${Math.round(86400000 / Math.max(stats.averageResponseTime, 1))}x faster than human VAs` :
            'Working to achieve speed advantage'
        }
      },
      recommendations: generateRecommendations(stats),
      monitoring: {
        alerts: generateAlerts(stats, healthChecks),
        nextOptimization: stats.cacheHitRate < 80 ? 
          'Improve cache hit rate by analyzing query patterns' :
          stats.averageResponseTime > 5000 ?
          'Optimize response time through query optimization' :
          'System performing optimally'
      }
    });

  } catch (error) {
    console.error('Performance monitoring error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get performance metrics',
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

function generateRecommendations(stats: { averageResponseTime: number; cacheHitRate: number; size: number; maxSize: number; totalQueries: number }): string[] {
  const recommendations: string[] = [];
  
  if (stats.averageResponseTime > 8000) {
    recommendations.push('⚠️ Response time approaching 10s limit - consider query optimization');
  }
  
  if (stats.cacheHitRate < 60) {
    recommendations.push('📈 Low cache hit rate - analyze query patterns for better caching');
  }
  
  if (stats.size > stats.maxSize * 0.9) {
    recommendations.push('💾 Cache near capacity - consider increasing cache size');
  }
  
  if (stats.totalQueries < 10) {
    recommendations.push('🧪 Limited data - run more queries to get accurate performance metrics');
  }
  
  if (stats.averageResponseTime < 2000 && stats.cacheHitRate > 80) {
    recommendations.push('✅ Excellent performance - system operating optimally');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ No immediate optimizations needed - system performing well');
  }
  
  return recommendations;
}

function generateAlerts(stats: { averageResponseTime: number; cacheHitRate: number; size: number; maxSize: number }, healthChecks: Record<string, boolean>): string[] {
  const alerts: string[] = [];
  
  if (stats.averageResponseTime > 10000) {
    alerts.push('🚨 CRITICAL: Response time exceeds 10s guarantee');
  }
  
  if (!healthChecks.performance) {
    alerts.push('🚨 CRITICAL: Performance guarantee not met');
  }
  
  if (stats.size >= stats.maxSize) {
    alerts.push('🚨 CRITICAL: Cache at maximum capacity');
  }
  
  if (stats.averageResponseTime > 7000) {
    alerts.push('⚠️ WARNING: Response time approaching limit');
  }
  
  if (stats.cacheHitRate < 30) {
    alerts.push('⚠️ WARNING: Very low cache efficiency');
  }
  
  return alerts;
} 