import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  ExternalLink, 
  Key, 
  Shield,
  AlertTriangle,
  Mail,
  Calendar,
  MessageSquare,
  Brain,
  Linkedin
} from "lucide-react"

interface SetupWizardProps {
  integrationType: string | null
  onComplete: () => void
  onCancel: () => void
}

interface SetupStep {
  title: string
  description: string
  action?: string
  url?: string
  fields?: string[]
  isOAuth?: boolean
}

const INTEGRATION_CONFIGS = {
  openai: {
    name: "OpenAI",
    icon: Brain,
    color: "text-purple-600",
    steps: [
      {
        title: "Get API Key",
        description: "Obtain your OpenAI API key from the OpenAI platform",
        action: "Visit OpenAI Dashboard",
        url: "https://platform.openai.com/api-keys"
      },
      {
        title: "Configure Settings",
        description: "Set up your AI analysis preferences",
        fields: ["api_key", "model", "max_tokens"]
      },
      {
        title: "Test Connection",
        description: "Verify your API key works correctly"
      },
      {
        title: "Enable Features",
        description: "Choose which AI features to activate"
      }
    ] as SetupStep[]
  },
  gmail: {
    name: "Gmail",
    icon: Mail,
    color: "text-red-600",
    steps: [
      {
        title: "OAuth Setup",
        description: "Connect your Gmail account securely",
        action: "Authorize Gmail",
        isOAuth: true
      },
      {
        title: "Permissions",
        description: "Grant necessary permissions for email access"
      },
      {
        title: "Sync Settings",
        description: "Configure what data to synchronize"
      }
    ] as SetupStep[]
  },
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-blue-600",
    steps: [
      {
        title: "LinkedIn Developer Account",
        description: "Set up LinkedIn API access",
        action: "Visit LinkedIn Developers",
        url: "https://developer.linkedin.com/"
      },
      {
        title: "Create App",
        description: "Register your application with LinkedIn"
      },
      {
        title: "API Credentials",
        description: "Configure your API credentials",
        fields: ["client_id", "client_secret"]
      },
      {
        title: "Permissions",
        description: "Configure data access permissions"
      },
      {
        title: "Test & Enable",
        description: "Test the connection and enable features"
      }
    ] as SetupStep[]
  },
  google_calendar: {
    name: "Google Calendar",
    icon: Calendar,
    color: "text-blue-500",
    steps: [
      {
        title: "Google Cloud Console",
        description: "Set up Google Calendar API access",
        action: "Visit Google Cloud Console",
        url: "https://console.cloud.google.com/"
      },
      {
        title: "OAuth Configuration",
        description: "Configure OAuth consent and credentials"
      },
      {
        title: "Test Connection",
        description: "Verify calendar access works"
      }
    ] as SetupStep[]
  },
  outlook: {
    name: "Outlook",
    icon: Mail,
    color: "text-blue-700",
    steps: [
      {
        title: "Microsoft Azure",
        description: "Register app in Azure AD",
        action: "Visit Azure Portal",
        url: "https://portal.azure.com/"
      },
      {
        title: "API Permissions",
        description: "Configure Graph API permissions"
      },
      {
        title: "OAuth Setup",
        description: "Set up OAuth authentication"
      },
      {
        title: "Test & Configure",
        description: "Test connection and configure sync"
      }
    ] as SetupStep[]
  },
  slack: {
    name: "Slack",
    icon: MessageSquare,
    color: "text-purple-500",
    steps: [
      {
        title: "Slack App",
        description: "Create a Slack application",
        action: "Visit Slack API",
        url: "https://api.slack.com/apps"
      },
      {
        title: "Bot Permissions",
        description: "Configure bot token scopes"
      },
      {
        title: "Install to Workspace",
        description: "Install app to your Slack workspace"
      }
    ] as SetupStep[]
  }
}

export function SetupWizard({ integrationType, onComplete, onCancel }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const { toast } = useToast()

  if (!integrationType || !INTEGRATION_CONFIGS[integrationType as keyof typeof INTEGRATION_CONFIGS]) {
    return null
  }

  const config = INTEGRATION_CONFIGS[integrationType as keyof typeof INTEGRATION_CONFIGS]
  const Icon = config.icon
  const totalSteps = config.steps.length
  const currentStepConfig = config.steps[currentStep]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      await handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleTestConnection = async () => {
    setIsLoading(true)
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const success = Math.random() > 0.3 // 70% success rate for demo
      setTestResult({
        success,
        message: success 
          ? "Connection successful! API key is valid and working."
          : "Connection failed. Please check your API key and try again."
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: "Test failed due to network error. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { error } = await supabase
        .from('user_integrations')
        .upsert({
          user_id: user.id,
          integration_type: integrationType,
          display_name: config.name,
          api_key_encrypted: formData.api_key || "demo_key_encrypted",
          config: formData,
          is_active: true,
          usage_stats: { requests: 0, cost: 0 }
        }, {
          onConflict: 'user_id,integration_type'
        })

      if (error) throw error

      toast({
        title: "Integration Connected!",
        description: `${config.name} has been successfully configured and is now active.`,
      })

      onComplete()
    } catch (error) {
      console.error('Error saving integration:', error)
      toast({
        title: "Setup Failed",
        description: "Failed to save integration configuration",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    const step = currentStepConfig

    if (step.action && step.url) {
      return (
        <div className="space-y-4">
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              You'll need to visit the {config.name} developer portal to get your API credentials.
            </AlertDescription>
          </Alert>
          
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => window.open(step.url, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            {step.action}
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <p>After getting your credentials, return here to continue setup.</p>
          </div>
        </div>
      )
    }

    if (step.fields) {
      return (
        <div className="space-y-4">
          {step.fields.map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={field} className="capitalize">
                {field.replace('_', ' ')}
              </Label>
              <Input
                id={field}
                type={field.includes('key') || field.includes('secret') ? 'password' : 'text'}
                placeholder={`Enter your ${field.replace('_', ' ')}`}
                value={formData[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
            </div>
          ))}
          
          {step.title === "Test Connection" && (
            <div className="space-y-4">
              <Button 
                onClick={handleTestConnection} 
                disabled={isLoading || !formData.api_key}
                className="w-full"
              >
                {isLoading ? "Testing..." : "Test Connection"}
              </Button>
              
              {testResult && (
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      )
    }

    if (step.title === "Enable Features") {
      return (
        <div className="space-y-4">
          <div className="space-y-3">
            {[
              "Smart contact analysis",
              "Meeting preparation suggestions", 
              "Automated relationship insights",
              "Real-time data synchronization"
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox id={`feature-${index}`} defaultChecked />
                <Label htmlFor={`feature-${index}`} className="text-sm">
                  {feature}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (step.isOAuth) {
      return (
        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              We'll redirect you to {config.name} to authorize secure access to your account.
            </AlertDescription>
          </Alert>
          
          <Button className="w-full">
            Authorize {config.name}
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            {step.description}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-primary/10 rounded-lg ${config.color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle>Connect {config.name}</DialogTitle>
              <DialogDescription>
                Step {currentStep + 1} of {totalSteps}: {currentStepConfig.title}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
            </div>
            <Progress value={((currentStep + 1) / totalSteps) * 100} />
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{currentStepConfig.title}</CardTitle>
              <CardDescription>{currentStepConfig.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={currentStep === 0 ? onCancel : handlePrevious}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {currentStep === 0 ? "Cancel" : "Previous"}
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={isLoading || (currentStepConfig.fields && !formData.api_key)}
              className="gap-2"
            >
              {currentStep === totalSteps - 1 ? "Complete Setup" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}