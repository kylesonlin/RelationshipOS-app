import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/hooks/useSubscription";
import { Check, Crown, Zap, Users, ArrowRight } from "lucide-react";
import { useState } from "react";

const PricingPage = () => {
  const { plans, subscription, createCheckout, loading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    try {
      await createCheckout(planId);
    } catch (error) {
      // Error handled in hook
    } finally {
      setSelectedPlan(null);
    }
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toLocaleString()}`;
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'personal_pro': return <Zap className="h-6 w-6" />;
      case 'business': return <Users className="h-6 w-6" />;
      case 'enterprise': return <Crown className="h-6 w-6" />;
      default: return <Zap className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'personal_pro': return 'border-blue-200 bg-blue-50/50';
      case 'business': return 'border-purple-200 bg-purple-50/50';
      case 'enterprise': return 'border-yellow-200 bg-yellow-50/50';
      default: return 'border-gray-200';
    }
  };

  const getFeatureList = (planId: string) => {
    switch (planId) {
      case 'personal_pro':
        return [
          '100 Oracle queries per month',
          'Manage up to 500 contacts',
          'Gmail & Calendar integration',
          'Relationship health scoring',
          'Basic analytics dashboard',
          'Mobile app access',
        ];
      case 'business':
        return [
          'Unlimited Oracle queries',
          'Unlimited contacts',
          'Team collaboration (5 users)',
          'LinkedIn integration',
          'Advanced analytics',
          'Team performance metrics',
          'Priority email support',
          'Custom integrations',
        ];
      case 'enterprise':
        return [
          'Everything in Business',
          'Unlimited team members',
          'Custom integrations',
          'Dedicated account manager',
          'Priority phone support',
          'Advanced security features',
          'Custom onboarding',
          'SLA guarantees',
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-96 animate-pulse">
              <div className="h-full bg-muted/50 rounded-lg" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Choose Your{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            RelationshipOS
          </span>{" "}
          Plan
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
          Transform your professional relationships with AI-powered insights. 
          Start with a 14-day free trial, no credit card required.
        </p>
        
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            ✨ 14-day free trial
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            🔒 No credit card required
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            ⚡ Cancel anytime
          </Badge>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan) => {
          const isCurrentPlan = subscription?.plan_id === plan.plan_id;
          const isPopular = plan.plan_id === 'business';
          
          return (
            <Card 
              key={plan.plan_id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                isCurrentPlan ? 'ring-2 ring-primary' : ''
              } ${getPlanColor(plan.plan_id)}`}
            >
              {isPopular && (
                <Badge 
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-white px-3 py-1"
                >
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.plan_id)}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
                
                <div className="mt-4">
                  <div className="text-4xl font-bold">
                    {formatPrice(plan.price_monthly)}
                    <span className="text-base font-normal text-muted-foreground">/month</span>
                  </div>
                  {!subscription?.subscribed && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Free for 14 days, then {formatPrice(plan.price_monthly)}/month
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {getFeatureList(plan.plan_id).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan.plan_id)}
                  disabled={loading || selectedPlan === plan.plan_id || isCurrentPlan}
                  className={`w-full mt-6 ${
                    isPopular 
                      ? 'bg-gradient-primary hover:bg-gradient-primary/90' 
                      : ''
                  }`}
                  variant={isCurrentPlan ? "outline" : "default"}
                >
                  {selectedPlan === plan.plan_id ? (
                    "Processing..."
                  ) : isCurrentPlan ? (
                    "Current Plan"
                  ) : subscription?.subscribed ? (
                    <>Switch to {plan.name} <ArrowRight className="ml-2 h-4 w-4" /></>
                  ) : (
                    <>Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How does the 14-day free trial work?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You get full access to all features of your selected plan for 14 days. 
                No credit card required to start. You'll only be charged after the trial ends.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time through your billing portal. 
                Changes take effect at your next billing cycle.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What happens if I exceed my usage limits?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We'll notify you when you're approaching your limits. You can upgrade your plan 
                or wait until the next billing cycle for your usage to reset.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;