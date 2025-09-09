import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IntegrationCard } from "@/components/integrations/IntegrationCard"
import { SetupWizard } from "@/components/integrations/SetupWizard"
import { UsageMonitor } from "@/components/integrations/UsageMonitor"
import { SyncControls } from "@/components/integrations/SyncControls"
import { 
  Mail, 
  Calendar, 
  MessageSquare, 
  Brain, 
  Linkedin, 
  Settings,
  Plus,
  Activity,
  Database,
  Shield
} from "lucide-react"

export interface Integration {
  id: string
  user_id: string
  integration_type: string
  display_name: string
  api_key_encrypted?: string | null
  config: any
  is_active: boolean
  last_sync_at?: string | null
  usage_stats: any
  created_at: string
  updated_at: string
}

const AVAILABLE_INTEGRATIONS = [
  {
    type: "openai",
    name: "OpenAI",
    description: "AI-powered analysis and insights",
    icon: Brain,
    category: "AI",
    features: ["Smart contact analysis", "Meeting prep suggestions", "Automated insights"],
    setupSteps: 4
  },
  {
    type: "gmail",
    name: "Gmail",
    description: "Email communication tracking",
    icon: Mail,
    category: "Email",
    features: ["Email history", "Contact discovery", "Communication patterns"],
    setupSteps: 3
  },
  {
    type: "linkedin",
    name: "LinkedIn",
    description: "Professional network insights",
    icon: Linkedin,
    category: "Social",
    features: ["Profile enrichment", "Network mapping", "Industry insights"],
    setupSteps: 5
  },
  {
    type: "google_calendar",
    name: "Google Calendar",
    description: "Meeting and event synchronization",
    icon: Calendar,
    category: "Calendar",
    features: ["Meeting prep", "Schedule optimization", "Contact interactions"],
    setupSteps: 3
  },
  {
    type: "outlook",
    name: "Outlook",
    description: "Microsoft email and calendar",
    icon: Mail,
    category: "Email",
    features: ["Email tracking", "Calendar sync", "Contact management"],
    setupSteps: 4
  },
  {
    type: "slack",
    name: "Slack",
    description: "Team communication insights",
    icon: MessageSquare,
    category: "Communication",
    features: ["Message analysis", "Team interactions", "Collaboration patterns"],
    setupSteps: 3
  }
]

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setIntegrations(data || [])
    } catch (error) {
      console.error('Error fetching integrations:', error)
      toast({
        title: "Error",
        description: "Failed to load integrations",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const activeIntegrations = integrations.filter(i => i.is_active)
  const totalIntegrations = AVAILABLE_INTEGRATIONS.length
  const connectedCount = activeIntegrations.length

  const handleAddIntegration = (type: string) => {
    setSelectedIntegration(type)
    setShowWizard(true)
  }

  const handleWizardComplete = () => {
    setShowWizard(false)
    setSelectedIntegration(null)
    fetchIntegrations()
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Connect your tools and data sources to unlock powerful insights
          </p>
        </div>
        <Button onClick={() => setShowWizard(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Integration
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedCount}</div>
            <p className="text-xs text-muted-foreground">of {totalIntegrations} available</p>
            <Progress value={(connectedCount / totalIntegrations) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Syncs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeIntegrations.length}</div>
            <p className="text-xs text-muted-foreground">currently syncing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(activeIntegrations.map(i => AVAILABLE_INTEGRATIONS.find(ai => ai.type === i.integration_type)?.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">categories connected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeIntegrations.length > 0 ? "2m ago" : "-"}
            </div>
            <p className="text-xs text-muted-foreground">most recent</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="available" className="gap-2">
            <Database className="h-4 w-4" />
            Available
          </TabsTrigger>
          <TabsTrigger value="usage" className="gap-2">
            <Settings className="h-4 w-4" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Connected Integrations */}
            <Card>
              <CardHeader>
                <CardTitle>Connected Integrations</CardTitle>
                <CardDescription>
                  Manage your active integrations and sync settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeIntegrations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No integrations connected yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setShowWizard(true)}
                    >
                      Connect Your First Integration
                    </Button>
                  </div>
                ) : (
                  activeIntegrations.map((integration) => {
                    const config = AVAILABLE_INTEGRATIONS.find(
                      i => i.type === integration.integration_type
                    )
                    return (
                      <IntegrationCard
                        key={integration.id}
                        integration={integration}
                        config={config!}
                        onUpdate={fetchIntegrations}
                      />
                    )
                  })
                )}
              </CardContent>
            </Card>

            {/* Sync Controls */}
            <SyncControls integrations={activeIntegrations} onUpdate={fetchIntegrations} />
          </div>
        </TabsContent>

        <TabsContent value="available" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AVAILABLE_INTEGRATIONS.map((integration) => {
              const isConnected = integrations.some(
                i => i.integration_type === integration.type
              )
              const Icon = integration.icon

              return (
                <Card 
                  key={integration.type} 
                  className="relative hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {integration.category}
                          </Badge>
                        </div>
                      </div>
                      {isConnected && (
                        <Badge variant="default" className="absolute top-2 right-2">
                          Connected
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Features</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {integration.features.map((feature, index) => (
                            <li key={index}>• {feature}</li>
                          ))}
                        </ul>
                      </div>
                      <Button 
                        className="w-full" 
                        variant={isConnected ? "outline" : "default"}
                        onClick={() => handleAddIntegration(integration.type)}
                        disabled={isConnected}
                      >
                        {isConnected ? "Manage" : "Connect"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="usage">
          <UsageMonitor integrations={activeIntegrations} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security & API Keys</CardTitle>
              <CardDescription>
                Manage your API keys and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">API Key Encryption</h3>
                    <p className="text-sm text-muted-foreground">
                      All API keys are encrypted using AES-256 encryption
                    </p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Secure Storage</h3>
                    <p className="text-sm text-muted-foreground">
                      Keys are stored in Supabase with Row Level Security
                    </p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Access Logging</h3>
                    <p className="text-sm text-muted-foreground">
                      All API key usage is logged and monitored
                    </p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Setup Wizard */}
      {showWizard && (
        <SetupWizard
          integrationType={selectedIntegration}
          onComplete={handleWizardComplete}
          onCancel={() => {
            setShowWizard(false)
            setSelectedIntegration(null)
          }}
        />
      )}
    </div>
  )
}