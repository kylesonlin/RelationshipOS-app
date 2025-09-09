import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Brain, 
  Crown, 
  Zap, 
  Info, 
  AlertTriangle,
  ExternalLink,
  Settings as SettingsIcon
} from "lucide-react"

interface AIModeIndicatorProps {
  onOpenSettings?: () => void
}

export function AIModeIndicator({ onOpenSettings }: AIModeIndicatorProps) {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchAISettings()
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
    } finally {
      setLoading(false)
    }
  }

  const getPlatformUsagePercentage = () => {
    if (!settings) return 0
    return (settings.monthly_platform_usage / settings.monthly_platform_limit) * 100
  }

  const incrementUsage = async () => {
    if (!settings || settings.ai_mode !== 'platform') return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Log the usage
      await supabase
        .from('ai_usage_logs')
        .insert({
          user_id: user.id,
          ai_mode: settings.ai_mode,
          model_used: 'gpt-4.1-mini-2025-04-14',
          tokens_used: 150,
          cost_usd: 0,
          request_type: 'oracle_query'
        })

      // Update usage count
      const newUsage = settings.monthly_platform_usage + 1
      await supabase
        .from('user_ai_settings')
        .update({ 
          monthly_platform_usage: newUsage,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id)

      setSettings({ ...settings, monthly_platform_usage: newUsage })

      // Show warning if approaching limit
      if (newUsage >= settings.monthly_platform_limit * 0.8) {
        toast({
          title: "Approaching AI Limit",
          description: "You're using 80% of your monthly Platform AI requests. Consider upgrading to User AI mode.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error incrementing usage:', error)
    }
  }

  // Export this function to be used by Oracle component
  useEffect(() => {
    (window as any).incrementAIUsage = incrementUsage
    return () => {
      delete (window as any).incrementAIUsage
    }
  }, [incrementUsage])

  if (loading || !settings) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded"></div>
            <div className="w-20 h-4 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full max-w-sm ${settings.ai_mode === 'user' ? 'border-primary' : 'border-muted'}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Mode Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.ai_mode === 'user' ? (
                <Crown className="h-4 w-4 text-primary" />
              ) : (
                <Brain className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium text-sm">
                {settings.ai_mode === 'user' ? 'User AI' : 'Platform AI'}
              </span>
              <Badge 
                variant={settings.ai_mode === 'user' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {settings.ai_mode === 'user' ? 'UNLIMITED' : 'LIMITED'}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenSettings}
              className="h-6 w-6 p-0"
            >
              <SettingsIcon className="h-3 w-3" />
            </Button>
          </div>

          {/* Usage Display */}
          {settings.ai_mode === 'platform' ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Monthly Usage</span>
                <span>{settings.monthly_platform_usage}/{settings.monthly_platform_limit}</span>
              </div>
              <Progress value={getPlatformUsagePercentage()} className="h-2" />
              {getPlatformUsagePercentage() > 90 && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Limit almost reached</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-green-600">
              <Zap className="h-3 w-3" />
              <span>Unlimited requests active</span>
            </div>
          )}

          {/* Quick Info */}
          <div className="text-xs text-muted-foreground">
            {settings.ai_mode === 'user' 
              ? 'Using your OpenAI API key'
              : 'Using platform AI credits'
            }
          </div>

          {/* Upgrade prompt for platform users */}
          {settings.ai_mode === 'platform' && getPlatformUsagePercentage() > 50 && (
            <Alert className="p-2">
              <Info className="h-3 w-3" />
              <AlertDescription className="text-xs">
                <div className="flex items-center justify-between">
                  <span>Need more AI requests?</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 text-xs"
                    onClick={onOpenSettings}
                  >
                    Upgrade
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}