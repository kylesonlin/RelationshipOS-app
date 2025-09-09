import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Building, 
  Target, 
  Sparkles,
  Shield
} from 'lucide-react';

interface OnboardingData {
  fullName: string;
  company: string;
  goals: string[];
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  addDemoData: boolean;
}

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    company: '',
    goals: [],
    acceptedTerms: false,
    acceptedPrivacy: false,
    addDemoData: true,
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const goalOptions = [
    'Improve networking effectiveness',
    'Track relationship health',
    'Automate follow-ups',
    'Analyze communication patterns',
    'Identify business opportunities',
    'Manage team relationships',
  ];

  useEffect(() => {
    // Pre-fill user data if available
    if (user) {
      setData(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
      }));
    }
  }, [user]);

  const handleGoalToggle = (goal: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) 
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!data.acceptedTerms || !data.acceptedPrivacy) {
      toast({
        title: "Terms Required",
        description: "Please accept the Terms of Service and Privacy Policy to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update user profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          full_name: data.fullName,
          company: data.company,
          onboarding_completed: true,
        });

      if (error) throw error;

      // Save onboarding preferences
      await supabase
        .from('user_ai_settings')
        .upsert({
          user_id: user?.id,
          preferences: {
            goals: data.goals,
            onboarding_completed_at: new Date().toISOString(),
          }
         });

      // Seed demo data if requested
      if (data.addDemoData) {
        try {
          await supabase.functions.invoke('seed-demo-data');
          toast({
            title: "Welcome to RelationshipOS!",
            description: "Your account has been set up with demo data to help you get started.",
          });
        } catch (demoError) {
          console.error('Demo data seeding failed:', demoError);
          toast({
            title: "Welcome to RelationshipOS!",
            description: "Your account has been set up successfully. Demo data couldn't be added, but you can explore the features.",
          });
        }
      } else {
        toast({
          title: "Welcome to RelationshipOS!",
          description: "Your account has been set up successfully.",
        });
      }

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: "Setup Error",
        description: error.message || "Failed to complete onboarding",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.fullName.trim().length > 0;
      case 2:
        return data.company.trim().length > 0;
      case 3:
        return data.goals.length > 0;
      case 4:
        return data.acceptedTerms && data.acceptedPrivacy;
      case 5:
        return true; // Demo data step is optional
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Welcome to RelationshipOS</h2>
              <p className="text-muted-foreground">
                Let's get your account set up in just a few steps
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={data.fullName}
                  onChange={(e) => setData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Tell us about your work</h2>
              <p className="text-muted-foreground">
                This helps us personalize your experience
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="company">Company or Organization</Label>
                <Input
                  id="company"
                  value={data.company}
                  onChange={(e) => setData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Enter your company name"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">What are your goals?</h2>
              <p className="text-muted-foreground">
                Select what you'd like to achieve with RelationshipOS
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goalOptions.map((goal) => (
                <div
                  key={goal}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    data.goals.includes(goal)
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => handleGoalToggle(goal)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={data.goals.includes(goal)}
                      onChange={() => {}}
                    />
                    <span className="text-sm font-medium">{goal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Privacy & Terms</h2>
              <p className="text-muted-foreground">
                Please review and accept our terms to complete setup
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <Checkbox
                  id="terms"
                  checked={data.acceptedTerms}
                  onCheckedChange={(checked) => 
                    setData(prev => ({ ...prev, acceptedTerms: checked as boolean }))
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                    I accept the{' '}
                    <Button 
                      variant="link" 
                      className="h-auto p-0 text-primary"
                      onClick={() => window.open('/terms', '_blank')}
                    >
                      Terms of Service
                    </Button>
                  </Label>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <Checkbox
                  id="privacy"
                  checked={data.acceptedPrivacy}
                  onCheckedChange={(checked) => 
                    setData(prev => ({ ...prev, acceptedPrivacy: checked as boolean }))
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="privacy" className="text-sm font-medium cursor-pointer">
                    I accept the{' '}
                    <Button 
                      variant="link" 
                      className="h-auto p-0 text-primary"
                      onClick={() => window.open('/privacy', '_blank')}
                    >
                      Privacy Policy
                    </Button>
                  </Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Get Started Quickly</h2>
              <p className="text-muted-foreground">
                Would you like us to add sample data to help you explore the platform?
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <Checkbox
                  id="demoData"
                  checked={data.addDemoData}
                  onCheckedChange={(checked) => 
                    setData(prev => ({ ...prev, addDemoData: checked as boolean }))
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="demoData" className="text-sm font-medium cursor-pointer">
                    Add sample data to my account
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will add 5 sample contacts, interactions, and tasks so you can immediately see how the platform works.
                  </p>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Sample data includes:</strong>
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Business contacts with realistic profiles</li>
                  <li>• Recent interaction history</li>
                  <li>• Follow-up tasks and reminders</li>
                  <li>• Progress tracking and gamification</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  You can delete this sample data at any time.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-strong">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">RelationshipOS</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep} of {totalSteps}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {renderStep()}
            
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className="bg-gradient-primary"
              >
                {loading ? (
                  "Setting up..."
                ) : currentStep === totalSteps ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Setup
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;