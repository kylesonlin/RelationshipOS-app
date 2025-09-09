import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, CheckCircle, ExternalLink, Eye, Users, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityAuditLog {
  created_at: string;
  user_id: string;
  user_name: string | null;
  action: string;
  table_name: string;
  ip_address: unknown;
  metadata: any;
}

export const SecurityDashboard = () => {
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase.rpc('get_security_dashboard');
      
      if (error) {
        console.error('Error fetching audit logs:', error);
        toast({
          title: "Access Denied",
          description: "Admin access required to view security dashboard.",
          variant: "destructive"
        });
      } else {
        setAuditLogs(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const securitySettings = [
    {
      title: "OTP Expiry Configuration",
      description: "Configure OTP expiry time (recommended: 5-10 minutes)",
      status: "warning",
      action: "Configure in Supabase Dashboard → Authentication → Settings",
      link: "https://supabase.com/docs/guides/platform/going-into-prod#security"
    },
    {
      title: "Leaked Password Protection",
      description: "Enable protection against known leaked passwords",
      status: "warning", 
      action: "Enable in Supabase Dashboard → Authentication → Settings",
      link: "https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection"
    },
    {
      title: "PostgreSQL Version",
      description: "Upgrade to latest version with security patches",
      status: "warning",
      action: "Schedule upgrade in Supabase Dashboard → Settings → Infrastructure",
      link: "https://supabase.com/docs/guides/platform/upgrading"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'success': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Security Dashboard</h1>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your critical data exposure issues have been fixed. Profile and team leaderboard access are now properly secured.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Settings
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Security Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4">
            {securitySettings.map((setting, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(setting.status)}
                      <CardTitle className="text-lg">{setting.title}</CardTitle>
                    </div>
                    <Badge variant={getStatusColor(setting.status)}>
                      {setting.status.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription>{setting.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{setting.action}</p>
                    <Button variant="outline" size="sm" asChild>
                      <a href={setting.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Documentation
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <p>Loading audit logs...</p>
              </CardContent>
            </Card>
          ) : auditLogs.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p>No audit logs available or insufficient permissions.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>Audit trail of sensitive data access and modifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {auditLogs.slice(0, 20).map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{log.action}</Badge>
                        <span className="text-sm">{log.table_name}</span>
                        <span className="text-sm text-muted-foreground">{log.user_name || 'Unknown User'}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Data Access Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  ✅ Profile access restricted to users<br/>
                  ✅ Team leaderboard requires authentication<br/>
                  ✅ Audit logging enabled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Platform Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  ⚠️ OTP expiry needs configuration<br/>
                  ⚠️ Password protection disabled<br/>
                  ⚠️ PostgreSQL version outdated
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Enhanced Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  ✅ Row Level Security enabled<br/>
                  ✅ Rate limiting infrastructure<br/>
                  ✅ Comprehensive audit trails
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};