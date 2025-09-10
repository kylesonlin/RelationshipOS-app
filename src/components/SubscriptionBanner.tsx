import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Clock, Users, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SubscriptionBanner = () => {
  const { subscription, usage, getCurrentPlan, isWithinLimit, loading } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show banner if user is logged in and either not subscribed or has low usage
    if (user && !loading) {
      const shouldShow = !subscription?.subscribed || 
        !isWithinLimit('oracle_queries') || 
        !isWithinLimit('contacts');
      setShowBanner(shouldShow);
    }
  }, [user, subscription, usage, loading, isWithinLimit]);

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const getDaysRemaining = () => {
    if (!subscription?.trial_end) return 0;
    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getUsagePercentage = (resourceType: string, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    const currentUsage = usage[resourceType as keyof typeof usage] || 0;
    return Math.min((currentUsage / limit) * 100, 100);
  };

  if (!user || loading || !showBanner) return null;

  const isTrialActive = subscription?.is_trial;
  const currentPlan = getCurrentPlan();
  const title = isTrialActive ? 'Free Trial Active' : 'Upgrade Your Plan';
  const description = isTrialActive 
    ? `${getDaysRemaining()} days remaining in your trial` 
    : 'Unlock unlimited access to all features';

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <Button onClick={handleUpgrade} className="bg-gradient-primary">
            {isTrialActive ? 'Choose Plan' : 'Upgrade Now'}
          </Button>
        </div>
      </CardHeader>
      
      {isTrialActive && currentPlan && (
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Current Plan: {currentPlan.name}</span>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Trial Active
            </Badge>
          </div>
          
          {/* Usage indicators */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Oracle Queries</span>
              </div>
              <Progress 
                value={getUsagePercentage('oracle_queries', currentPlan.limits.oracle_queries)} 
                className="h-2"
              />
              <span className="text-xs text-muted-foreground">
                {usage.oracle_queries}/{currentPlan.limits.oracle_queries === -1 ? '∞' : currentPlan.limits.oracle_queries}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Contacts</span>
              </div>
              <Progress 
                value={getUsagePercentage('contacts', currentPlan.limits.contacts)} 
                className="h-2"
              />
              <span className="text-xs text-muted-foreground">
                {usage.contacts}/{currentPlan.limits.contacts === -1 ? '∞' : currentPlan.limits.contacts}
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};