import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Calendar, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GoogleSuccess = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        console.log('GoogleSuccess page loaded, checking session...');
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session check result:', { session: !!session, error: sessionError });
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          toast({
            title: "Authentication Error",
            description: `Session error: ${sessionError.message}`,
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        if (!session) {
          console.error('No valid session found after Google auth');
          toast({
            title: "Authentication Error", 
            description: "No valid session found. Please try signing in again.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        console.log('Google auth successful! User:', session.user.email);
        console.log('Session details:', {
          userId: session.user.id,
          email: session.user.email,
          provider: session.user.app_metadata?.provider,
          providerToken: !!session.provider_token,
          providerRefreshToken: !!session.provider_refresh_token
        });

        // Store Google tokens if available
        if (session.provider_token && session.provider_refresh_token) {
          console.log('Storing Google tokens...');
          try {
            const { data: tokenResult, error: tokenError } = await supabase.functions.invoke('store-google-tokens', {
              body: {
                provider_token: session.provider_token,
                provider_refresh_token: session.provider_refresh_token,
                user: session.user
              }
            });

            if (tokenError) {
              console.error('Error storing Google tokens:', tokenError);
              toast({
                title: "Warning",
                description: "Authentication successful, but Google integration may have issues.",
                variant: "destructive",
              });
            } else {
              console.log('Google tokens stored successfully:', tokenResult);
            }
          } catch (tokenStoreError) {
            console.error('Failed to store Google tokens:', tokenStoreError);
          }
        } else {
          console.warn('No provider tokens found in session');
        }

        toast({
          title: "Welcome to RelationshipOS! 🎉",
          description: "Your Google account has been connected successfully.",
        });

        // Short delay before redirect to ensure everything is processed
        setTimeout(() => {
          console.log('Redirecting to dashboard...');
          navigate("/");
        }, 1000);

      } catch (error) {
        console.error('Error handling Google auth:', error);
        toast({
          title: "Authentication Error",
          description: `Error processing authentication: ${error.message}`,
          variant: "destructive",
        });
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    handleAuthSuccess();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Setting up your account...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <CardTitle className="text-2xl">Welcome to RelationshipOS!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Your Google account has been connected successfully. You now have access to:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-success/5 rounded-lg">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Mail className="h-5 w-5 text-success" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Gmail Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    AI analysis of your email patterns
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-success ml-auto" />
              </div>

              <div className="flex items-center gap-3 p-3 bg-success/5 rounded-lg">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-success" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Calendar Sync</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatic meeting tracking
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-success ml-auto" />
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <Button onClick={() => navigate("/")} className="w-full">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleSuccess;
