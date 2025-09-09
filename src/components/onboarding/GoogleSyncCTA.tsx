import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  Calendar, 
  Mail, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  Cloud,
  RefreshCw,
  Shield
} from 'lucide-react';
import { useGoogleIntegration } from '@/hooks/useGoogleIntegration';
import { useRelationshipInsights } from '@/hooks/useRelationshipInsights';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface GoogleSyncCTAProps {
  totalContacts: number;
  onSyncComplete?: () => void;
}

export const GoogleSyncCTA = ({ totalContacts, onSyncComplete }: GoogleSyncCTAProps) => {
  const { isConnected, hasGmailAccess, hasCalendarAccess, loading: integrationLoading } = useGoogleIntegration();
  const { syncCalendarData, syncGmailData, loading: syncLoading } = useRelationshipInsights();
  const [syncStep, setSyncStep] = useState<'idle' | 'syncing' | 'complete' | 'error'>('idle');
  const [syncProgress, setSyncProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // If user already has significant data, don't show this CTA
  if (totalContacts > 3) {
    return null;
  }

  const handleFullSync = async () => {
    if (!isConnected) {
      navigate('/integrations');
      return;
    }

    try {
      setSyncStep('syncing');
      setSyncProgress(10);
      setErrorMessage('');

      // Sync calendar data first
      if (hasCalendarAccess) {
        setSyncProgress(30);
        await syncCalendarData();
        toast({
          title: "Calendar synced!",
          description: "Your meetings and events are now available in RelationshipOS.",
        });
      }

      setSyncProgress(60);

      // Sync Gmail data
      if (hasGmailAccess) {
        setSyncProgress(80);
        await syncGmailData();
        toast({
          title: "Gmail synced!",
          description: "Your email interactions are now being analyzed.",
        });
      }

      setSyncProgress(100);
      setSyncStep('complete');
      
      toast({
        title: "🎉 Sync Complete!",
        description: "Your AI relationship intelligence is now active.",
      });

      // Call completion callback after a short delay
      setTimeout(() => {
        onSyncComplete?.();
      }, 2000);

    } catch (error: any) {
      console.error('Sync error:', error);
      setSyncStep('error');
      setSyncProgress(0);
      setErrorMessage(error.message || 'Sync failed');
      
      toast({
        title: "Sync Failed",
        description: "Please try again or check your Google connection.",
        variant: "destructive",
      });
    }
  };

  const getConnectionStatus = () => {
    if (!isConnected) return { icon: AlertCircle, text: "Not Connected", color: "text-destructive" };
    if (hasGmailAccess && hasCalendarAccess) return { icon: CheckCircle, text: "Full Access", color: "text-success" };
    return { icon: AlertCircle, text: "Partial Access", color: "text-warning" };
  };

  const status = getConnectionStatus();

  if (syncStep === 'complete') {
    return (
      <Card className="executive-card-premium border-success/30 bg-success/5">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="h-6 w-6 text-success" />
          </div>
          <CardTitle className="text-success">Intelligence Activated!</CardTitle>
          <CardDescription>
            Your AI relationship team is now analyzing your data and generating insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={() => navigate('/analytics')}
            className="executive-button"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            View AI Insights
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (syncStep === 'syncing') {
    return (
      <Card className="executive-card border-primary/30">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <RefreshCw className="h-6 w-6 text-primary animate-spin" />
          </div>
          <CardTitle>Syncing Your Data...</CardTitle>
          <CardDescription>
            Your AI team is importing and analyzing your Google data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={syncProgress} className="h-3" />
          <div className="text-sm text-center text-muted-foreground">
            {syncProgress < 30 && "Connecting to Google..."}
            {syncProgress >= 30 && syncProgress < 60 && "Importing calendar events..."}
            {syncProgress >= 60 && syncProgress < 80 && "Analyzing email interactions..."}
            {syncProgress >= 80 && "Generating intelligence insights..."}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (syncStep === 'error') {
    return (
      <Card className="executive-card border-destructive/30 bg-destructive/5">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Sync Failed</CardTitle>
          <CardDescription>
            {errorMessage || "There was an issue syncing your data"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <Button 
            onClick={() => setSyncStep('idle')}
            variant="outline"
            className="mr-2"
          >
            Try Again
          </Button>
          <Button 
            onClick={() => navigate('/integrations')}
            variant="outline"
          >
            Check Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="executive-card border-primary/30">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Cloud className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Activate AI Intelligence</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <status.icon className={`h-4 w-4 ${status.color}`} />
              <span className={`text-sm font-medium ${status.color}`}>{status.text}</span>
            </div>
          </div>
        </div>
        <CardDescription>
          Connect your Google account to unlock relationship intelligence and automated insights.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!isConnected && (
          <Alert className="border-warning/30 bg-warning/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Google connection required:</strong> Connect your Google account first to enable data sync.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">What gets synced:</h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-sm">Calendar Events</div>
                <div className="text-xs text-muted-foreground">Meeting insights & relationship mapping</div>
              </div>
              <Badge variant={hasCalendarAccess ? "default" : "secondary"} className="text-xs">
                {hasCalendarAccess ? "Ready" : "Pending"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-sm">Email Interactions</div>
                <div className="text-xs text-muted-foreground">Communication analysis & follow-up suggestions</div>
              </div>
              <Badge variant={hasGmailAccess ? "default" : "secondary"} className="text-xs">
                {hasGmailAccess ? "Ready" : "Pending"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-sm">Contact Intelligence</div>
                <div className="text-xs text-muted-foreground">Relationship health & opportunity detection</div>
              </div>
              <Badge variant="outline" className="text-xs">Auto-generated</Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {!isConnected ? (
            <Button 
              onClick={() => navigate('/integrations')}
              className="executive-button flex-1"
            >
              <Cloud className="h-4 w-4 mr-2" />
              Connect Google Account
            </Button>
          ) : (
            <Button 
              onClick={handleFullSync}
              disabled={syncLoading || integrationLoading}
              className="executive-button flex-1"
            >
              {syncLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Activate Intelligence
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
          <Shield className="h-3 w-3" />
          Your data is encrypted and never shared. Google sync can be disabled anytime.
        </div>
      </CardContent>
    </Card>
  );
};