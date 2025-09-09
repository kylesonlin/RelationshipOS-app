import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface UsageMeterProps {
  resourceType: keyof typeof limitMap;
  title: string;
  description?: string;
}

const limitMap = {
  oracle_queries: 'AI Oracle Queries',
  contacts: 'Contacts',
  team_members: 'Team Members'
} as const;

export const UsageMeter = ({ resourceType, title, description }: UsageMeterProps) => {
  const { usage, getCurrentPlan, isWithinLimit } = useSubscription();

  const currentPlan = getCurrentPlan();
  const currentUsage = usage[resourceType] || 0;
  const limit = currentPlan?.limits[resourceType] || 0;
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((currentUsage / limit) * 100, 100);
  const isNearLimit = percentage > 80;
  const withinLimit = isWithinLimit(resourceType);

  return (
    <Card className={`${!withinLimit ? 'border-destructive' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Badge variant={withinLimit ? "secondary" : "destructive"}>
            {isUnlimited ? 'Unlimited' : `${currentUsage}/${limit}`}
          </Badge>
        </div>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {!isUnlimited && (
          <>
            <Progress 
              value={percentage} 
              className={`h-2 ${isNearLimit ? 'bg-warning/20' : ''}`}
            />
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-muted-foreground">
                {currentUsage} used
              </span>
              <div className="flex items-center gap-1">
                {withinLimit ? (
                  <CheckCircle className="w-3 h-3 text-success" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-destructive" />
                )}
                <span className={withinLimit ? 'text-success' : 'text-destructive'}>
                  {withinLimit ? 'Available' : 'Limit reached'}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};