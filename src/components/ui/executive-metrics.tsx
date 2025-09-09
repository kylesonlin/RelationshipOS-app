import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ExecutiveMetricProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  description?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  priority?: "high" | "medium" | "low";
}

const ExecutiveMetric = React.forwardRef<HTMLDivElement, ExecutiveMetricProps>(
  ({ 
    className, 
    title, 
    value, 
    trend, 
    trendValue, 
    description, 
    badge, 
    badgeVariant = "default",
    priority = "medium",
    children,
    ...props 
  }, ref) => {
    const getTrendIcon = () => {
      switch (trend) {
        case "up":
          return <TrendingUp className="h-4 w-4 text-success" />;
        case "down":
          return <TrendingDown className="h-4 w-4 text-destructive" />;
        default:
          return <Minus className="h-4 w-4 text-muted-foreground" />;
      }
    };

    const getPriorityStyles = () => {
      switch (priority) {
        case "high":
          return "border-destructive/30 bg-destructive/5";
        case "low":
          return "border-success/30 bg-success/5";
        default:
          return "border-primary/30 bg-primary/5";
      }
    };

    return (
      <Card 
        ref={ref} 
        className={cn("metric-card", getPriorityStyles(), className)} 
        {...props}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            {badge && (
              <Badge variant={badgeVariant} className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="data-metric text-2xl font-bold">
              {value}
            </div>
            
            {(trend || trendValue) && (
              <div className="flex items-center gap-2 text-sm">
                {trend && getTrendIcon()}
                {trendValue && (
                  <span className={cn(
                    "font-medium",
                    trend === "up" && "text-success",
                    trend === "down" && "text-destructive",
                    !trend && "text-muted-foreground"
                  )}>
                    {trendValue}
                  </span>
                )}
              </div>
            )}
            
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
            
            {children}
          </div>
        </CardContent>
      </Card>
    );
  }
);

ExecutiveMetric.displayName = "ExecutiveMetric";

interface ExecutiveKPIProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  target?: string | number;
  progress?: number;
  description?: string;
  status?: "on-track" | "at-risk" | "exceeded";
}

const ExecutiveKPI = React.forwardRef<HTMLDivElement, ExecutiveKPIProps>(
  ({ 
    className, 
    title, 
    value, 
    target, 
    progress, 
    description, 
    status = "on-track",
    children,
    ...props 
  }, ref) => {
    const getStatusStyles = () => {
      switch (status) {
        case "exceeded":
          return "border-success/30 bg-success/10";
        case "at-risk":
          return "border-warning/30 bg-warning/10";
        default:
          return "border-primary/30 bg-primary/10";
      }
    };

    const getStatusBadge = () => {
      switch (status) {
        case "exceeded":
          return { text: "Exceeded", variant: "default" as const };
        case "at-risk":
          return { text: "At Risk", variant: "destructive" as const };
        default:
          return { text: "On Track", variant: "secondary" as const };
      }
    };

    const statusBadge = getStatusBadge();

    return (
      <Card 
        ref={ref} 
        className={cn("executive-card-premium", getStatusStyles(), className)} 
        {...props}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              {title}
            </CardTitle>
            <Badge variant={statusBadge.variant} className="text-xs">
              {statusBadge.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="roi-display text-3xl">
                {value}
              </span>
              {target && (
                <span className="text-sm text-muted-foreground">
                  / {target}
                </span>
              )}
            </div>
            
            {progress !== undefined && (
              <div className="space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-primary transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {progress}% complete
                </div>
              </div>
            )}
            
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
            
            {children}
          </div>
        </CardContent>
      </Card>
    );
  }
);

ExecutiveKPI.displayName = "ExecutiveKPI";

export { ExecutiveMetric, ExecutiveKPI };