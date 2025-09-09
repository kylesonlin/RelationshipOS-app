import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

interface SmartWidgetProps {
  title: string;
  description?: string;
  value?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
  className?: string;
  priority?: 'high' | 'medium' | 'low';
}

export const SmartWidget = ({
  title,
  description,
  value,
  trend,
  trendValue,
  badge,
  badgeVariant = 'secondary',
  action,
  children,
  className = '',
  priority = 'medium'
}: SmartWidgetProps) => {
  const priorityStyles = {
    high: 'border-primary/20 bg-primary/5 animate-[pulse_4s_ease-in-out_infinite]',
    medium: 'border-border hover:border-primary/50 transition-colors',
    low: 'border-border opacity-90'
  };

  const trendIcon = {
    up: <TrendingUp className="h-4 w-4 text-green-500" />,
    down: <TrendingDown className="h-4 w-4 text-red-500" />,
    neutral: null
  };

  return (
    <Card className={`${priorityStyles[priority]} ${className} hover-scale cursor-pointer transition-all duration-300`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {title}
              {badge && (
                <Badge variant={badgeVariant} className="text-xs">
                  {badge}
                </Badge>
              )}
            </CardTitle>
            {description && (
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            )}
          </div>
          {action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              className="text-muted-foreground hover:text-primary"
            >
              {action.label}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {value && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-primary">
              {value}
            </span>
            {trend && trendValue && (
              <div className="flex items-center gap-1 text-sm">
                {trendIcon[trend]}
                <span className={`font-medium ${
                  trend === 'up' ? 'text-green-600' : 
                  trend === 'down' ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
        )}
        
        {children && (
          <div className="animate-fade-in">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
};