import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Mail, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Users,
  Brain,
  Zap
} from 'lucide-react';
import { useRelationshipInsights } from '@/hooks/useRelationshipInsights';
import { useGoogleIntegration } from '@/hooks/useGoogleIntegration';
import { useToast } from '@/hooks/use-toast';

export const IntelligentSyncDashboard = () => {
  const { toast } = useToast();
  const { 
    isConnected, 
    hasGmailAccess, 
    hasCalendarAccess, 
    isExpired,
    loading: integrationLoading,
    triggerSync,
    lastSync
  } = useGoogleIntegration();
  const { 
    generateNewInsights, 
    insights, 
    loading: insightsLoading 
  } = useRelationshipInsights();
  
  const [syncStatus, setSyncStatus] = useState({
    fullSync: { running: false, lastSync: null, progress: 0 },
    insights: { running: false, lastGenerated: null, count: insights.length }
  });

  const handleFullIntelligentSync = async () => {
    if (!isConnected) {
      toast({
        title: "Google not connected",
        description: "Please connect your Google account first",
        variant: "destructive"
      });
      return;
    }

    if (isExpired) {
      toast({
        title: "Google access expired",
        description: "Please reconnect your Google account",
        variant: "destructive"
      });
      return;
    }

    setSyncStatus(prev => ({ 
      ...prev, 
      fullSync: { ...prev.fullSync, running: true, progress: 0 } 
    }));
    
    try {
      // Step 1: Sync Google data (Gmail + Calendar)
      setSyncStatus(prev => ({ 
        ...prev, 
        fullSync: { ...prev.fullSync, progress: 25 } 
      }));
      
      const syncResult = await triggerSync();
      
      if (!syncResult.success) {
        throw new Error(syncResult.error || 'Sync failed');
      }

      // Step 2: Generate AI insights from synced data
      setSyncStatus(prev => ({ 
        ...prev, 
        fullSync: { ...prev.fullSync, progress: 75 } 
      }));
      
      const insightResult = await generateNewInsights();
      
      setSyncStatus(prev => ({
        ...prev,
        fullSync: {
          running: false,
          lastSync: new Date().toISOString(),
          progress: 100
        },
        insights: {
          running: false,
          lastGenerated: new Date().toISOString(),
          count: insightResult?.insights_generated || 0
        }
      }));
      
      const emailCount = syncResult.data?.results?.find((r: any) => r.service === 'gmail')?.processed || 0;
      const eventCount = syncResult.data?.results?.find((r: any) => r.service === 'calendar')?.processed || 0;
      const insightCount = insightResult?.insights_generated || 0;
      
      toast({
        title: "Full Intelligence Sync Complete",
        description: `Processed ${emailCount} emails, ${eventCount} events, and generated ${insightCount} insights`,
      });
      
    } catch (error: any) {
      setSyncStatus(prev => ({ 
        ...prev, 
        fullSync: { ...prev.fullSync, running: false, progress: 0 } 
      }));
      
      toast({
        title: "Sync failed",
        description: error.message || "Please try again or check your connection",
        variant: "destructive"
      });
    }
  };

  const handleGenerateInsights = async () => {
    setSyncStatus(prev => ({ ...prev, insights: { ...prev.insights, running: true } }));
    
    try {
      const result = await generateNewInsights();
      setSyncStatus(prev => ({
        ...prev,
        insights: {
          running: false,
          lastGenerated: new Date().toISOString(),
          count: result?.insights_generated || 0
        }
      }));
      
      toast({
        title: "Insights generated successfully",
        description: `Created ${result?.insights_generated || 0} new insights`,
      });
    } catch (error) {
      setSyncStatus(prev => ({ ...prev, insights: { ...prev.insights, running: false } }));
      toast({
        title: "Insight generation failed",
        description: "Please try again or check your connection",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Intelligent Data Processing
          </CardTitle>
          <CardDescription>
            Real-time sync and analysis of your Google Calendar and Gmail data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Sync Progress Bar */}
          {syncStatus.fullSync.running && (
            <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Intelligent Sync in Progress</span>
                <span className="text-sm text-muted-foreground">{syncStatus.fullSync.progress}%</span>
              </div>
              <Progress value={syncStatus.fullSync.progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {syncStatus.fullSync.progress < 25 ? "Initializing..." :
                 syncStatus.fullSync.progress < 75 ? "Syncing Google data..." :
                 "Generating AI insights..."}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold">Calendar Access</div>
              <div className="text-2xl font-bold text-blue-600">
                {hasCalendarAccess ? <CheckCircle className="h-6 w-6 mx-auto" /> : <AlertCircle className="h-6 w-6 mx-auto text-muted-foreground" />}
              </div>
              <div className="text-xs text-muted-foreground">
                {hasCalendarAccess ? 'Connected' : 'Not connected'}
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Mail className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-semibold">Gmail Access</div>
              <div className="text-2xl font-bold text-green-600">
                {hasGmailAccess ? <CheckCircle className="h-6 w-6 mx-auto" /> : <AlertCircle className="h-6 w-6 mx-auto text-muted-foreground" />}
              </div>
              <div className="text-xs text-muted-foreground">
                {hasGmailAccess ? 'Connected' : 'Not connected'}
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Zap className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="font-semibold">AI Insights</div>
              <div className="text-2xl font-bold text-purple-600">
                {syncStatus.insights.count}
              </div>
              <div className="text-xs text-muted-foreground">
                {syncStatus.insights.lastGenerated ? 'Recently generated' : 'Not generated yet'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleFullIntelligentSync}
              disabled={syncStatus.fullSync.running || !isConnected || isExpired}
              className="bg-gradient-primary"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus.fullSync.running ? 'animate-spin' : ''}`} />
              {syncStatus.fullSync.running ? 'Syncing...' : 'Full Intelligence Sync'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleGenerateInsights}
              disabled={syncStatus.insights.running || insightsLoading}
            >
              <Brain className={`h-4 w-4 mr-2 ${(syncStatus.insights.running || insightsLoading) ? 'animate-pulse' : ''}`} />
              Generate New Insights
            </Button>
            
            {lastSync && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                <Clock className="h-4 w-4" />
                Last sync: {new Date(lastSync).toLocaleDateString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Insights Preview */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Latest AI Insights
            </CardTitle>
            <CardDescription>
              Proactive recommendations from your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.slice(0, 3).map(insight => (
                <div key={insight.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Badge 
                    variant={insight.priority === 'high' ? 'destructive' : 'secondary'}
                    className="mt-0.5"
                  >
                    {insight.priority}
                  </Badge>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  </div>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
            
            {insights.length > 3 && (
              <div className="text-center mt-4">
                <Badge variant="outline">
                  +{insights.length - 3} more insights available
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isConnected && (
        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <h4 className="font-medium">Google Integration Required</h4>
                <p className="text-sm text-muted-foreground">
                  Connect your Google account to enable intelligent relationship insights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};