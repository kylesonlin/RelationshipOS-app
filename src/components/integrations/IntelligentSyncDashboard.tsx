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
  const { isConnected, hasGmailAccess, hasCalendarAccess } = useGoogleIntegration();
  const { 
    syncCalendarData, 
    syncGmailData, 
    generateNewInsights, 
    insights, 
    loading 
  } = useRelationshipInsights();
  
  const [syncStatus, setSyncStatus] = useState({
    calendar: { running: false, lastSync: null, count: 0 },
    gmail: { running: false, lastSync: null, count: 0 },
    insights: { running: false, lastGenerated: null, count: insights.length }
  });

  const handleCalendarSync = async () => {
    if (!hasCalendarAccess) {
      toast({
        title: "Calendar not connected",
        description: "Please connect your Google Calendar first",
        variant: "destructive"
      });
      return;
    }

    setSyncStatus(prev => ({ ...prev, calendar: { ...prev.calendar, running: true } }));
    
    try {
      const result = await syncCalendarData();
      setSyncStatus(prev => ({
        ...prev,
        calendar: {
          running: false,
          lastSync: new Date().toISOString(),
          count: result?.processed_events || 0
        }
      }));
      
      toast({
        title: "Calendar synced successfully",
        description: `Processed ${result?.processed_events || 0} calendar events`,
      });
    } catch (error) {
      setSyncStatus(prev => ({ ...prev, calendar: { ...prev.calendar, running: false } }));
      toast({
        title: "Calendar sync failed",
        description: "Please try again or check your connection",
        variant: "destructive"
      });
    }
  };

  const handleGmailSync = async () => {
    if (!hasGmailAccess) {
      toast({
        title: "Gmail not connected",
        description: "Please connect your Gmail account first",
        variant: "destructive"
      });
      return;
    }

    setSyncStatus(prev => ({ ...prev, gmail: { ...prev.gmail, running: true } }));
    
    try {
      const result = await syncGmailData();
      setSyncStatus(prev => ({
        ...prev,
        gmail: {
          running: false,
          lastSync: new Date().toISOString(),
          count: result?.processed || 0
        }
      }));
      
      toast({
        title: "Gmail synced successfully",
        description: `Processed ${result?.processed || 0} email interactions`,
      });
    } catch (error) {
      setSyncStatus(prev => ({ ...prev, gmail: { ...prev.gmail, running: false } }));
      toast({
        title: "Gmail sync failed",
        description: "Please try again or check your connection",
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

  const handleFullSync = async () => {
    if (hasCalendarAccess) await handleCalendarSync();
    if (hasGmailAccess) await handleGmailSync();
    await handleGenerateInsights();
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Data Intelligence
          </CardTitle>
          <CardDescription>
            Real-time sync and analysis of your Google Calendar and Gmail data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold">Calendar Events</div>
              <div className="text-2xl font-bold text-blue-600">
                {syncStatus.calendar.count}
              </div>
              <div className="text-xs text-muted-foreground">
                {syncStatus.calendar.lastSync ? 'Recently synced' : 'Not synced yet'}
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Mail className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-semibold">Email Interactions</div>
              <div className="text-2xl font-bold text-green-600">
                {syncStatus.gmail.count}
              </div>
              <div className="text-xs text-muted-foreground">
                {syncStatus.gmail.lastSync ? 'Recently synced' : 'Not synced yet'}
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
              onClick={handleFullSync}
              disabled={loading || !isConnected}
              className="bg-gradient-primary"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Full Intelligence Sync
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleCalendarSync}
              disabled={syncStatus.calendar.running || !hasCalendarAccess}
            >
              <Calendar className={`h-4 w-4 mr-2 ${syncStatus.calendar.running ? 'animate-pulse' : ''}`} />
              Sync Calendar
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleGmailSync}
              disabled={syncStatus.gmail.running || !hasGmailAccess}
            >
              <Mail className={`h-4 w-4 mr-2 ${syncStatus.gmail.running ? 'animate-pulse' : ''}`} />
              Sync Gmail
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleGenerateInsights}
              disabled={syncStatus.insights.running}
            >
              <Brain className={`h-4 w-4 mr-2 ${syncStatus.insights.running ? 'animate-pulse' : ''}`} />
              Generate Insights
            </Button>
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