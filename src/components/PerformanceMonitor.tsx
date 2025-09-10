import { useEffect, useState, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Activity, Zap, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import useWebVitals from '@/hooks/useWebVitals';
import { queryCache } from '@/hooks/useAdvancedCache';

interface PerformanceMonitorProps {
  showDetails?: boolean;
  compact?: boolean;
}

export const PerformanceMonitor = memo<PerformanceMonitorProps>(({ 
  showDetails = false, 
  compact = false 
}) => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [cacheStats, setCacheStats] = useState({ cacheSize: 0, subscriberCount: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const { getPerformanceScore, getDetailedMetrics } = useWebVitals((metric) => {
    setMetrics(prev => {
      const filtered = prev.filter(m => m.name !== metric.name);
      return [...filtered, metric].slice(-10); // Keep last 10 metrics
    });
  });

  useEffect(() => {
    const updateCacheStats = () => {
      setCacheStats(queryCache.getStats());
    };

    updateCacheStats();
    const interval = setInterval(updateCacheStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!showDetails && process.env.NODE_ENV === 'production') {
    return null;
  }

  if (compact) {
    const score = getPerformanceScore();
    return (
      <div className="flex items-center gap-2 text-sm">
        <Activity className="h-4 w-4" />
        <span>Score: {score}</span>
        <Badge variant={score >= 90 ? 'default' : score >= 75 ? 'secondary' : 'destructive'}>
          {score >= 90 ? 'Good' : score >= 75 ? 'Fair' : 'Poor'}
        </Badge>
      </div>
    );
  }

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Performance
      </Button>
    );
  }

  const score = getPerformanceScore();
  const detailedMetrics = getDetailedMetrics();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 75) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Monitor
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Overall Score</span>
            <div className="flex items-center gap-2">
              {getScoreIcon(score)}
              <span className={`font-bold ${getScoreColor(score)}`}>{score}</span>
            </div>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        {/* Core Web Vitals */}
        {metrics.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Core Web Vitals</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {metrics.slice(-4).map((metric) => (
                <div key={metric.name} className="flex justify-between">
                  <span className="uppercase">{metric.name}:</span>
                  <Badge 
                    variant={metric.rating === 'good' ? 'default' : 
                            metric.rating === 'needs-improvement' ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    {Math.round(metric.value)}ms
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cache Stats */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Cache Performance</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>Cache Size:</span>
              <span>{cacheStats.cacheSize}</span>
            </div>
            <div className="flex justify-between">
              <span>Subscribers:</span>
              <span>{cacheStats.subscriberCount}</span>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Memory Usage</h4>
          <div className="text-xs">
            {(performance as any).memory ? (
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span>{Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>{Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024)}MB</span>
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">Not available</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';