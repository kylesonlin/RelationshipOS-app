import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/hooks/useSubscription";
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings
} from "lucide-react";

const BillingDashboard = () => {
  const { 
    subscription, 
    usage, 
    getCurrentPlan, 
    openCustomerPortal, 
    loading,
    canUseFeature,
    isWithinLimit 
  } = useSubscription();

  const currentPlan = getCurrentPlan();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getStatusBadge = () => {
    if (!subscription) return <Badge variant="secondary">No Subscription</Badge>;
    
    switch (subscription.subscription_status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-700">Free Trial</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'canceled':
        return <Badge variant="outline">Canceled</Badge>;
      default:
        return <Badge variant="secondary">{subscription.subscription_status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-48 animate-pulse">
              <div className="h-full bg-muted/50 rounded-lg" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing & Usage</h1>
        <p className="text-muted-foreground">
          Manage your subscription and monitor your usage
        </p>
      </div>

      {/* Subscription Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">
                  {currentPlan?.name || 'No Plan'}
                </span>
                {getStatusBadge()}
              </div>
              {currentPlan && (
                <p className="text-2xl font-bold">
                  ${(currentPlan.price_monthly / 100).toLocaleString()}/month
                </p>
              )}
              <Button 
                onClick={openCustomerPortal}
                variant="outline" 
                className="w-full"
                disabled={loading}
              >
                <Settings className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Billing Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscription?.is_trial ? (
                <>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-600">Free Trial</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Trial ends: {formatDate(subscription.trial_end)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Current period: {formatDate(subscription?.subscription_start)} - {formatDate(subscription?.subscription_end)}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Usage Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentPlan && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Oracle Queries</span>
                    <p className="font-semibold">
                      {usage.oracle_queries} / {currentPlan.limits.oracle_queries_monthly === -1 ? '∞' : currentPlan.limits.oracle_queries_monthly}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contacts</span>
                    <p className="font-semibold">
                      {usage.contacts} / {currentPlan.limits.contacts_limit === -1 ? '∞' : currentPlan.limits.contacts_limit}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Oracle Queries Usage</CardTitle>
            <CardDescription>Monthly Oracle Engine usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentPlan && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Used this month</span>
                    <span>
                      {usage.oracle_queries} / {currentPlan.limits.oracle_queries_monthly === -1 ? '∞' : currentPlan.limits.oracle_queries_monthly}
                    </span>
                  </div>
                  {currentPlan.limits.oracle_queries_monthly !== -1 && (
                    <Progress 
                      value={getUsagePercentage(usage.oracle_queries, currentPlan.limits.oracle_queries_monthly)} 
                      className="h-2"
                    />
                  )}
                  {!isWithinLimit('oracle_queries_monthly') && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>You've reached your monthly limit</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacts Usage</CardTitle>
            <CardDescription>Contact management limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentPlan && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Contacts stored</span>
                    <span>
                      {usage.contacts} / {currentPlan.limits.contacts_limit === -1 ? '∞' : currentPlan.limits.contacts_limit}
                    </span>
                  </div>
                  {currentPlan.limits.contacts_limit !== -1 && (
                    <Progress 
                      value={getUsagePercentage(usage.contacts, currentPlan.limits.contacts_limit)} 
                      className="h-2"
                    />
                  )}
                  {!isWithinLimit('contacts_limit') && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>You've reached your contact limit</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>Available features in your current plan</CardDescription>
        </CardHeader>
        <CardContent>
          {currentPlan ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(currentPlan.features).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center gap-2">
                  {enabled ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                  )}
                  <span className="text-sm capitalize">
                    {feature.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No active subscription plan</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingDashboard;