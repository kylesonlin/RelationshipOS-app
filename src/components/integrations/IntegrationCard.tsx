import { useState } from "react"
import { Integration } from "@/pages/Integrations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { 
  Settings, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  MoreVertical,
  Eye,
  EyeOff,
  Edit
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"

interface IntegrationCardProps {
  integration: Integration
  config: {
    name: string
    icon: any
    category: string
    features: string[]
  }
  onUpdate: () => void
}

export function IntegrationCard({ integration, config, onUpdate }: IntegrationCardProps) {
  const [isToggling, setIsToggling] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const { toast } = useToast()
  const Icon = config.icon

  const handleToggle = async (enabled: boolean) => {
    setIsToggling(true)
    try {
      const { error } = await supabase
        .from('user_integrations')
        .update({ 
          is_active: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', integration.id)

      if (error) throw error

      toast({
        title: enabled ? "Integration Enabled" : "Integration Disabled",
        description: `${config.name} is now ${enabled ? "active" : "inactive"}`,
      })
      
      onUpdate()
    } catch (error) {
      console.error('Error toggling integration:', error)
      toast({
        title: "Error",
        description: "Failed to update integration status",
        variant: "destructive"
      })
    } finally {
      setIsToggling(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const { error } = await supabase
        .from('user_integrations')
        .update({ 
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', integration.id)

      if (error) throw error

      toast({
        title: "Sync Complete",
        description: `${config.name} data has been synchronized`,
      })
      
      onUpdate()
    } catch (error) {
      console.error('Error syncing integration:', error)
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize data",
        variant: "destructive"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusColor = () => {
    if (!integration.is_active) return "text-muted-foreground"
    if (integration.last_sync_at) {
      const lastSync = new Date(integration.last_sync_at)
      const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60)
      if (hoursSinceSync > 24) return "text-yellow-600"
    }
    return "text-green-600"
  }

  const getStatusIcon = () => {
    if (!integration.is_active) return <AlertCircle className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{integration.display_name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {config.category}
                </Badge>
                <div className={`flex items-center gap-1 text-xs ${getStatusColor()}`}>
                  {getStatusIcon()}
                  {integration.is_active ? "Active" : "Inactive"}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              checked={integration.is_active}
              onCheckedChange={handleToggle}
              disabled={isToggling}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleSync} disabled={isSyncing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sync Now
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-muted-foreground"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4 mr-2" />
                  ) : (
                    <Eye className="h-4 w-4 mr-2" />
                  )}
                  {showApiKey ? "Hide" : "Show"} API Key
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* API Key Display */}
        {showApiKey && integration.api_key_encrypted && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">API Key</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKey(false)}
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
            <code className="text-xs font-mono break-all">
              {integration.api_key_encrypted.substring(0, 20)}...
            </code>
          </div>
        )}

        {/* Last Sync Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last sync:</span>
          <span>
            {integration.last_sync_at 
              ? formatDistanceToNow(new Date(integration.last_sync_at), { addSuffix: true })
              : "Never"
            }
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSync}
            disabled={!integration.is_active || isSyncing}
            className="flex-1"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? "Syncing..." : "Sync"}
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Settings className="h-3 w-3 mr-1" />
            Configure
          </Button>
        </div>

        {/* Usage Stats */}
        {integration.usage_stats && Object.keys(integration.usage_stats).length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Recent Usage
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Requests:</span>
                <span className="ml-1 font-medium">
                  {integration.usage_stats.requests || 0}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Cost:</span>
                <span className="ml-1 font-medium">
                  ${(integration.usage_stats.cost || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}