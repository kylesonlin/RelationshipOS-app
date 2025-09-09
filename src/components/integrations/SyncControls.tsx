import { useState } from "react"
import { Integration } from "@/pages/Integrations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { 
  RefreshCw, 
  Settings, 
  Play, 
  Pause, 
  Calendar, 
  Clock,
  Database,
  Zap
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface SyncControlsProps {
  integrations: Integration[]
  onUpdate: () => void
}

export function SyncControls({ integrations, onUpdate }: SyncControlsProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [autoSync, setAutoSync] = useState(true)
  const [syncInterval, setSyncInterval] = useState("1h")
  const { toast } = useToast()

  const handleSyncAll = async () => {
    setIsSyncing(true)
    try {
      // Simulate bulk sync process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Update all integrations with new sync time
      const updates = integrations.map(integration => 
        supabase
          .from('user_integrations')
          .update({ 
            last_sync_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', integration.id)
      )

      await Promise.all(updates)

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${integrations.length} integrations`,
      })
      
      onUpdate()
    } catch (error) {
      console.error('Error syncing integrations:', error)
      toast({
        title: "Sync Failed",
        description: "Failed to sync one or more integrations",
        variant: "destructive"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleToggleAutoSync = async (enabled: boolean) => {
    setAutoSync(enabled)
    toast({
      title: enabled ? "Auto-sync Enabled" : "Auto-sync Disabled",
      description: enabled 
        ? `Data will sync automatically every ${syncInterval}` 
        : "Manual sync only",
    })
  }

  const getLastSyncTime = () => {
    if (integrations.length === 0) return "Never"
    
    const lastSyncTimes = integrations
      .filter(i => i.last_sync_at)
      .map(i => new Date(i.last_sync_at!))
    
    if (lastSyncTimes.length === 0) return "Never"
    
    const mostRecent = new Date(Math.max(...lastSyncTimes.map(d => d.getTime())))
    return formatDistanceToNow(mostRecent, { addSuffix: true })
  }

  const getSyncStatus = () => {
    if (isSyncing) return { status: "syncing", color: "text-blue-600" }
    if (integrations.length === 0) return { status: "no integrations", color: "text-muted-foreground" }
    if (autoSync) return { status: "auto-sync active", color: "text-green-600" }
    return { status: "manual sync only", color: "text-yellow-600" }
  }

  const syncStatus = getSyncStatus()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Sync Controls
        </CardTitle>
        <CardDescription>
          Manage data synchronization across all integrations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Status</Label>
            <div className={`flex items-center gap-2 ${syncStatus.color}`}>
              {isSyncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : autoSync ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
              <span className="text-sm font-medium capitalize">{syncStatus.status}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Last Sync</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{getLastSyncTime()}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={handleSyncAll}
            disabled={isSyncing || integrations.length === 0}
            className="flex-1 gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? "Syncing..." : "Sync All"}
          </Button>
          
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Configure
          </Button>
        </div>

        {/* Auto-sync Settings */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Automatic Sync</Label>
              <p className="text-xs text-muted-foreground">
                Automatically sync data at regular intervals
              </p>
            </div>
            <Switch
              checked={autoSync}
              onCheckedChange={handleToggleAutoSync}
            />
          </div>

          {autoSync && (
            <div className="space-y-2">
              <Label className="text-sm">Sync Interval</Label>
              <Select value={syncInterval} onValueChange={setSyncInterval}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15m">Every 15 minutes</SelectItem>
                  <SelectItem value="30m">Every 30 minutes</SelectItem>
                  <SelectItem value="1h">Every hour</SelectItem>
                  <SelectItem value="6h">Every 6 hours</SelectItem>
                  <SelectItem value="24h">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Integration Status */}
        <div className="space-y-3 pt-4 border-t">
          <Label className="text-sm font-medium">Integration Status</Label>
          {integrations.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">No integrations connected</p>
            </div>
          ) : (
            integrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${integration.is_active ? 'bg-green-600' : 'bg-gray-400'}`} />
                  <span className="text-sm font-medium">{integration.display_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={integration.is_active ? "default" : "secondary"} className="text-xs">
                    {integration.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {integration.last_sync_at && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(integration.last_sync_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Next Sync Info */}
        {autoSync && integrations.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Next automatic sync in {syncInterval === "15m" ? "15 minutes" : syncInterval === "30m" ? "30 minutes" : syncInterval === "1h" ? "1 hour" : syncInterval === "6h" ? "6 hours" : "24 hours"}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}