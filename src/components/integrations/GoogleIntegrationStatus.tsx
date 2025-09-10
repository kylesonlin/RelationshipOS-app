import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RefreshCw, Mail, Calendar } from "lucide-react";
import { useGoogleIntegration } from "@/hooks/useGoogleIntegration";

export const GoogleIntegrationStatus = () => {
  const { 
    isConnected, 
    hasGmailAccess, 
    hasCalendarAccess, 
    loading, 
    error,
    checkConnectionStatus 
  } = useGoogleIntegration();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Checking Google Integration...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Google Integration Status
          {isConnected ? (
            <CheckCircle className="h-5 w-5 text-success" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
        </CardTitle>
        <CardDescription>
          Your Google services integration status
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="font-medium">Gmail Access</span>
            </div>
            <Badge variant={hasGmailAccess ? "default" : "secondary"}>
              {hasGmailAccess ? "Connected" : "Not Connected"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Calendar Access</span>
            </div>
            <Badge variant={hasCalendarAccess ? "default" : "secondary"}>
              {hasCalendarAccess ? "Connected" : "Not Connected"}
            </Badge>
          </div>
        </div>
        
        {!isConnected && (
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Sign in with Google to enable Gmail and Calendar integration
            </p>
          </div>
        )}
        
        <Button 
          onClick={checkConnectionStatus}
          variant="outline" 
          className="w-full"
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </CardContent>
    </Card>
  );
};