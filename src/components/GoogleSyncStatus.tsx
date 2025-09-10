import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw, Calendar, Mail, CheckCircle, Clock } from 'lucide-react';
import { useGoogleSync } from '@/hooks/useGoogleSync';
import { useGoogleIntegration } from '@/hooks/useGoogleIntegration';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const GoogleSyncStatus = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { triggerSync, isConnected, isExpired, hasGmailScope, hasCalendarScope, lastSync } = useGoogleSync();
  const googleIntegration = useGoogleIntegration();
  const { toast } = useToast();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await triggerSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReconnect = async () => {
    try {
      // Clear existing tokens
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_google_tokens')
          .delete()
          .eq('user_id', user.id);
      }
      
      // Redirect to Google OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly',
          redirectTo: `${window.location.origin}/google-success`
        }
      });

      if (error) {
        toast({
          title: "Reconnection Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (!isConnected) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            Google Account Not Connected
          </CardTitle>
          <CardDescription className="text-orange-700">
            Connect your Google account to sync emails and calendar events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleReconnect} className="w-full">
            Connect Google Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isExpired) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            Google Access Expired
          </CardTitle>
          <CardDescription className="text-red-700">
            Your Google access has expired. Please reconnect to continue syncing data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleReconnect} variant="destructive" className="w-full">
            Reconnect Google Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Google Sync Status
        </CardTitle>
        <CardDescription>
          Your Google account is connected and ready to sync
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {hasGmailScope && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              Gmail Connected
            </Badge>
          )}
          {hasCalendarScope && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Calendar Connected
            </Badge>
          )}
        </div>

        {lastSync && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Last synced: {new Date(lastSync).toLocaleString()}
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleSync} 
            disabled={isSyncing}
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
          
          <Button variant="outline" onClick={handleReconnect}>
            Reconnect
          </Button>
        </div>

        {!hasGmailScope && !hasCalendarScope && (
          <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded">
            No Gmail or Calendar permissions detected. Click "Reconnect" to grant access.
          </div>
        )}
      </CardContent>
    </Card>
  );
};