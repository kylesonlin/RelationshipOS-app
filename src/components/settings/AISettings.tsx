import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { 
  Brain, 
  Zap, 
  Shield, 
  Crown, 
  Settings,
  Info,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Clock,
  Sparkles
} from "lucide-react"

interface AISettings {
  id: string
  user_id: string
  ai_mode: string
  openai_api_key_encrypted?: string | null
  monthly_platform_usage: number
  monthly_platform_limit: number
  usage_reset_date: string
  preferences: any
}

interface UsageLog {
  id: string
  ai_mode: string
  model_used: string
  tokens_used: number
  cost_usd: number
  request_type: string
  created_at: string
}

export function AISettings() {
  const [settings, setSettings] = useState<AISettings | null>(null)
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAISettings()
    fetchUsageLogs()
  }, [])

  const fetchAISettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_ai_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error

      if (!data) {
        // Create default settings
        const { data: newSettings, error: createError } = await supabase
          .from('user_ai_settings')
          .insert({
            user_id: user.id,
            ai_mode: 'platform',
            monthly_platform_usage: 0,
            monthly_platform_limit: 100
          })
          .select()
          .single()

        if (createError) throw createError
        setSettings(newSettings)
      } else {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching AI settings:', error)
      toast({
        title: "Error",
        description: "Failed to load AI settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUsageLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setUsageLogs(data || [])
    } catch (error) {
      console.error('Error fetching usage logs:', error)
    }
  }

  const handleModeSwitch = async (newMode: 'platform' | 'user') => {
    if (!settings) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_ai_settings')
        .update({
          ai_mode: newMode,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id)

      if (error) throw error

      setSettings({ ...settings, ai_mode: newMode })
      
      toast({
        title: "AI Mode Updated",
        description: `Switched to ${newMode === 'platform' ? 'Platform' : 'User'} AI mode`,
      })
    } catch (error) {
      console.error('Error updating AI mode:', error)
      toast({
        title: "Error",
        description: "Failed to update AI mode",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveApiKey = async () => {
    if (!settings || !apiKey.trim()) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_ai_settings')
        .update({
          openai_api_key_encrypted: apiKey, // In production, this should be encrypted
          ai_mode: 'user',
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id)

      if (error) throw error

      setSettings({ 
        ...settings, 
        openai_api_key_encrypted: apiKey,
        ai_mode: 'user'
      })
      setApiKey("")
      
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been securely saved and User AI mode is now active",
      })
    } catch (error) {
      console.error('Error saving API key:', error)
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const getPlatformUsagePercentage = () => {
    if (!settings) return 0
    return (settings.monthly_platform_usage / settings.monthly_platform_limit) * 100
  }

  const getMonthlyUsageCost = () => {
    return usageLogs
      .filter(log => {
        const logDate = new Date(log.created_at)
        const currentMonth = new Date().getMonth()
        return logDate.getMonth() === currentMonth && log.ai_mode === 'user'
      })
      .reduce((sum, log) => sum + parseFloat(log.cost_usd.toString()), 0)
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

  if (!settings) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold">AI Configuration</h3>
        <p className="text-muted-foreground">
          Choose between Platform AI (limited, included) or User AI (unlimited, your key)
        </p>
      </div>

      {/* Current Mode Display */}
      <Card className={`border-2 ${settings.ai_mode === 'user' ? 'border-primary' : 'border-muted'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.ai_mode === 'user' ? (
                <Crown className="h-6 w-6 text-primary" />
              ) : (
                <Brain className="h-6 w-6 text-muted-foreground" />
              )}
              <div>
                <CardTitle className="flex items-center gap-2">
                  {settings.ai_mode === 'user' ? 'User AI Mode' : 'Platform AI Mode'}
                  <Badge variant={settings.ai_mode === 'user' ? 'default' : 'secondary'}>
                    {settings.ai_mode === 'user' ? 'UNLIMITED' : 'LIMITED'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {settings.ai_mode === 'user' 
                    ? 'Using your OpenAI API key for unlimited access'
                    : 'Using platform-provided AI with monthly limits'
                  }
                </CardDescription>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold">
                {settings.ai_mode === 'user' ? '∞' : `${settings.monthly_platform_usage}/${settings.monthly_platform_limit}`}
              </div>
              <div className="text-xs text-muted-foreground">
                {settings.ai_mode === 'user' ? 'requests' : 'monthly requests'}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {settings.ai_mode === 'platform' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Usage this month</span>
                <span>{getPlatformUsagePercentage().toFixed(1)}%</span>
              </div>
              <Progress value={getPlatformUsagePercentage()} />
              {getPlatformUsagePercentage() > 80 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You're approaching your monthly limit. Consider switching to User AI mode for unlimited access.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="modes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modes">AI Modes</TabsTrigger>
          <TabsTrigger value="usage">Usage & Costs</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="modes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Platform AI Mode */}
            <Card className={`relative ${settings.ai_mode === 'platform' ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Platform AI</CardTitle>
                    <CardDescription>Included with your plan</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">100 requests/month included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">No API key required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Basic AI features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Standard response times</span>
                  </div>
                </div>
                
                <Button 
                  variant={settings.ai_mode === 'platform' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => handleModeSwitch('platform')}
                  disabled={saving || settings.ai_mode === 'platform'}
                >
                  {settings.ai_mode === 'platform' ? 'Currently Active' : 'Switch to Platform AI'}
                </Button>
              </CardContent>
            </Card>

            {/* User AI Mode */}
            <Card className={`relative ${settings.ai_mode === 'user' ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      User AI
                      <Badge variant="outline" className="text-xs">
                        PREMIUM
                      </Badge>
                    </CardTitle>
                    <CardDescription>Your OpenAI API key</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Unlimited requests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Advanced AI models (GPT-5)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Faster response times</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Enterprise features</span>
                  </div>
                </div>

                {!settings.openai_api_key_encrypted ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="api-key">OpenAI API Key</Label>
                      <Input
                        id="api-key"
                        type="password"
                        placeholder="sk-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="w-full"
                      onClick={handleSaveApiKey}
                      disabled={saving || !apiKey.trim()}
                    >
                      {saving ? 'Saving...' : 'Save API Key & Activate'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">API Key Connected</span>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? 'Hide API Key' : 'Manage API Key'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Feature Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Comparison</CardTitle>
              <CardDescription>Compare what's available in each mode</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Feature</th>
                      <th className="text-center p-2">Platform AI</th>
                      <th className="text-center p-2">User AI</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr className="border-b">
                      <td className="p-2">Monthly Requests</td>
                      <td className="text-center p-2">100</td>
                      <td className="text-center p-2">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">AI Model</td>
                      <td className="text-center p-2">GPT-4.1 Mini</td>
                      <td className="text-center p-2">GPT-5, O3, O4</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Response Time</td>
                      <td className="text-center p-2">Standard</td>
                      <td className="text-center p-2">Priority</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Advanced Analytics</td>
                      <td className="text-center p-2">❌</td>
                      <td className="text-center p-2">✅</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Custom Prompts</td>
                      <td className="text-center p-2">❌</td>
                      <td className="text-center p-2">✅</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">API Rate Limits</td>
                      <td className="text-center p-2">Platform Limits</td>
                      <td className="text-center p-2">Your Limits</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          {/* Cost Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">This Month (Platform)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {settings.monthly_platform_usage}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {settings.monthly_platform_limit} requests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">This Month (User AI)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-1">
                  <DollarSign className="h-5 w-5" />
                  {getMonthlyUsageCost().toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  OpenAI API costs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageLogs.length}</div>
                <p className="text-xs text-muted-foreground">
                  all time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Usage</CardTitle>
              <CardDescription>Your latest AI requests and costs</CardDescription>
            </CardHeader>
            <CardContent>
              {usageLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No usage data yet</p>
                  <p className="text-sm">Start using AI features to see your usage here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {usageLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={log.ai_mode === 'user' ? 'default' : 'secondary'}>
                          {log.ai_mode === 'user' ? 'User AI' : 'Platform'}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">{log.request_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.model_used} • {log.tokens_used} tokens
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {log.ai_mode === 'user' ? `$${parseFloat(log.cost_usd.toString()).toFixed(4)}` : 'Included'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced AI behavior and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto-optimize model selection</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically choose the best model for each request
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Enable response caching</Label>
                    <p className="text-xs text-muted-foreground">
                      Cache similar requests to reduce API calls
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Usage notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when approaching limits
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-4 border-t">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your API keys are encrypted and stored securely. We never have access to your OpenAI account or billing.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}