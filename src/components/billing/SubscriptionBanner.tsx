import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { Crown, Zap, Users, ArrowRight, Star } from "lucide-react";

const SubscriptionBanner = () => {
  const { subscription, getCurrentPlan, loading } = useSubscription();
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show banner if user is not subscribed or on trial
    if (user && (!subscription?.subscribed || subscription?.is_trial)) {
      setShowBanner(true);
    }
  }, [user, subscription]);

  const currentPlan = getCurrentPlan();

  if (loading || !showBanner || !user) return null;

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  const getDaysRemaining = () => {
    if (!subscription?.trial_end) return 0;
    const trialEnd = new Date(subscription.trial_end);
    const today = new Date();
    const diffTime = trialEnd.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = getDaysRemaining();

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {subscription?.is_trial ? `${daysRemaining} days left in your free trial` : 'Unlock RelationshipOS Pro'}
              </CardTitle>
              <CardDescription>
                {subscription?.is_trial 
                  ? `Upgrade to continue accessing all features after your trial ends`
                  : 'Get unlimited Oracle queries, advanced analytics, and more'
                }
              </CardDescription>
            </div>
          </div>
          <Button onClick={handleUpgrade} className="flex-shrink-0">
            {subscription?.is_trial ? 'Upgrade Now' : 'Start Free Trial'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      {subscription?.is_trial && (
        <CardContent className="pt-0">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Current plan: {currentPlan?.name}</span>
            </div>
            <Badge variant="secondary">Trial Active</Badge>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default SubscriptionBanner;