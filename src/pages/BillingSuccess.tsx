import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";

const BillingSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkSubscription, subscription } = useSubscription();
  const { toast } = useToast();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Check subscription status after successful payment
      const verifySubscription = async () => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        await checkSubscription();
        
        toast({
          title: "Welcome to RelationshipOS! 🎉",
          description: "Your subscription has been activated successfully.",
        });
      };
      
      verifySubscription();
    }
  }, [sessionId, checkSubscription, toast]);

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Thank you for subscribing to RelationshipOS! Your account has been activated.
            </p>
            
            {subscription?.is_trial && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                  <Sparkles className="h-4 w-4" />
                  14-Day Free Trial Started
                </div>
                <p className="text-sm text-blue-600">
                  Enjoy full access to all features. You won't be charged until your trial ends.
                </p>
              </div>
            )}
            
            <div className="text-left space-y-2">
              <h3 className="font-semibold">What's next?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Connect your Gmail and Calendar</li>
                <li>• Import your existing contacts</li>
                <li>• Start using the Oracle Engine</li>
                <li>• Explore relationship insights</li>
              </ul>
            </div>
          </div>

          <Button onClick={handleContinue} className="w-full">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <p className="text-xs text-muted-foreground">
            You can manage your subscription anytime in your billing settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingSuccess;