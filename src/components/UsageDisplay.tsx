import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface UsageDisplayProps {
  resourceType: 'oracle_queries' | 'contacts' | 'team_members';
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export const UsageDisplay = ({ resourceType, title, description, icon }: UsageDisplayProps) => {
  const { usage, getCurrentPlan, isWithinLimit } = useSubscription();
  
  const currentPlan = getCurrentPlan();
  const currentUsage = usage[resourceType] || 0;
  const limit = currentPlan?.limits[resourceType] ?? 
    (resourceType === 'oracle_queries' ? 10 : resourceType === 'contacts' ? 100 : 1); // Free tier limits
  
  const isUnlimited = limit === -1;
  const withinLimit = isWithinLimit(resourceType);
  const usagePercentage = isUnlimited ? 0 : Math.min((currentUsage / limit) * 100, 100);
  
  const getStatusColor = () => {
    if (isUnlimited) return 'text-green-600';
    if (usagePercentage < 70) return 'text-green-600';
    if (usagePercentage < 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (!withinLimit) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h4 className="font-medium">{title}</h4>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <Badge variant={withinLimit ? "default" : "destructive"}>
            {withinLimit ? "Available" : "Limit Reached"}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Usage</span>
          <span className={getStatusColor()}>
            {currentUsage} / {isUnlimited ? '∞' : limit}
          </span>
        </div>
        {!isUnlimited && (
          <Progress 
            value={usagePercentage} 
            className="h-2"
          />
        )}
      </div>
    </div>
  );
};