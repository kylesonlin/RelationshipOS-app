import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { UsageDisplay } from '@/components/UsageDisplay';
import { Database, Users, Calendar, CreditCard, Settings } from 'lucide-react';
import { format } from 'date-fns';

export const BillingDashboard = () => {
  const { 
    subscription, 
    usage, 
    getCurrentPlan, 
    openCustomerPortal, 
    loading 
  } = useSubscription();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getStatusBadge = () => {
    if (!subscription) return <Badge variant="secondary">Free</Badge>;
    
    if (subscription.is_trial) {
      return <Badge className="bg-blue-100 text-blue-700">Trial</Badge>;
    }
    
    if (subscription.subscribed) {
      return <Badge className="bg-green-100 text-green-700">Active</Badge>;
    }
    
    return <Badge variant="secondary">Free</Badge>;
  };

  const currentPlan = getCurrentPlan();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted/50 rounded animate-pulse" />
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-32 animate-pulse">
              <div className="h-full bg-muted/50 rounded-lg" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Billing & Usage</h1>
        {subscription?.subscribed && (
          <Button onClick={openCustomerPortal} variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Manage Subscription
          </Button>
        )}
      </div>

      {/* Subscription Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentPlan?.name || 'Free'}
            </div>
            <div className="flex items-center gap-2 mt-2">
              {getStatusBadge()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billing Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription?.is_trial ? 'Trial' : 'Monthly'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {subscription?.subscription_end 
                ? `Ends ${formatDate(subscription.subscription_end)}`
                : 'No active subscription'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentPlan?.limits.oracle_queries === -1 ? 'Unlimited' : 'Limited'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Current month usage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Oracle Queries Usage</CardTitle>
            <CardDescription>
              AI-powered relationship insights and analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsageDisplay
              resourceType="oracle_queries"
              title="Oracle Queries"
              icon={<Database className="h-5 w-5" />}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacts Usage</CardTitle>
            <CardDescription>
              Professional contacts in your network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsageDisplay
              resourceType="contacts"
              title="Contacts"
              icon={<Users className="h-5 w-5" />}
            />
          </CardContent>
        </Card>
      </div>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>
            {currentPlan ? `Features included in your ${currentPlan.name} plan` : 'Free tier features'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {currentPlan ? (
              Object.entries(currentPlan.features).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className={`text-sm ${enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                Limited access to basic features. Upgrade for full functionality.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!subscription?.subscribed && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
            <CardDescription>
              Get unlimited access to all RelationshipOS features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/pricing'} 
              className="bg-gradient-primary"
            >
              View Plans & Pricing
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};