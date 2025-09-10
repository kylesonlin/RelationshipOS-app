import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';

interface ProtectedFeatureProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  upgradeTitle?: string;
  upgradeDescription?: string;
}

export const ProtectedFeature = ({ 
  feature, 
  children, 
  fallback,
  upgradeTitle = "Premium Feature",
  upgradeDescription = "Upgrade to access this feature"
}: ProtectedFeatureProps) => {
  const { canUseFeature, createCheckout, loading, subscription } = useSubscription();
  const navigate = useNavigate();

  // Check if user can access this feature
  const hasAccess = canUseFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="border-2 border-dashed border-muted-foreground/30 bg-muted/30">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {upgradeTitle}
        </CardTitle>
        <CardDescription>
          {upgradeDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button 
          onClick={() => {
            // If already on trial/subscription, go to pricing to upgrade
            // Otherwise start with personal_pro
            if (subscription?.subscribed || subscription?.is_trial) {
              navigate('/pricing');
            } else {
              createCheckout('personal_pro');
            }
          }}
          disabled={loading}
          className="bg-gradient-primary"
        >
          {loading ? 'Processing...' : subscription?.subscribed ? 'Upgrade Plan' : 'Start Free Trial'}
        </Button>
      </CardContent>
    </Card>
  );
};