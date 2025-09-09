import { useState, useEffect } from 'react';
import { SmartWidget } from '@/components/dashboard/SmartWidget';
import { ActionSuggestions } from '@/components/dashboard/ActionSuggestions';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Target, 
  Clock,
  Brain,
  Sparkles,
  ArrowRight,
  BarChart3,
  Search,
  Send,
  Heart,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { subscription, canUseFeature } = useSubscription();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [oracleQuery, setOracleQuery] = useState("");

  useEffect(() => {
    // Simulate loading smart dashboard data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const handleOracleSearch = () => {
    if (oracleQuery.trim()) {
      navigate(`/oracle?q=${encodeURIComponent(oracleQuery)}`);
    } else {
      navigate('/oracle');
    }
  };

  // Smart dashboard metrics that adapt to user activity
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const upcomingMeetings = 2;
  const staleContacts = 8;
  const weeklyGoal = 75; // percentage
  const relationshipHealth = 87;

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
      {/* Smart Header with Context */}
      <div className="text-center space-y-3 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold">
          {getTimeBasedGreeting()}, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-muted-foreground text-lg">
          You have {upcomingMeetings} meetings today and {staleContacts} relationships that need attention
        </p>
      </div>

      {/* Primary Oracle Interface - Enhanced */}
      <Card className="border-primary/20 shadow-lg bg-gradient-to-br from-primary/5 to-purple/5 animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Ask Oracle Anything</h2>
              <p className="text-sm text-muted-foreground">Your AI relationship intelligence assistant</p>
            </div>
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              Smart
            </Badge>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Who should I prioritize this week? What opportunities am I missing?"
                value={oracleQuery}
                onChange={(e) => setOracleQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleOracleSearch()}
                className="pl-12 pr-4 py-6 text-lg border-primary/30 focus:border-primary bg-white/50"
              />
            </div>
            <Button 
              onClick={handleOracleSearch}
              className="px-8 py-6 bg-gradient-primary shadow-lg hover:shadow-xl transition-all hover-scale"
            >
              <Send className="h-5 w-5 mr-2" />
              Ask Oracle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Smart Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Key Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Smart Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SmartWidget
              title="Relationship Health"
              value={`${relationshipHealth}%`}
              trend="up"
              trendValue="+5% this week"
              badge="Excellent"
              badgeVariant="default"
              priority="high"
              noAnimations={true}
              action={{
                label: "View Details",
                onClick: () => navigate('/analytics')
              }}
            >
              <Progress value={relationshipHealth} className="h-2" />
            </SmartWidget>

            <SmartWidget
              title="Weekly Goal"
              value={`${weeklyGoal}%`}
              trend="up"
              trendValue="On track"
              badge="3 days left"
              badgeVariant="secondary"
              priority="medium"
              action={{
                label: "View Progress",
                onClick: () => navigate('/gamification-dashboard')
              }}
            >
              <Progress value={weeklyGoal} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                15/20 meaningful interactions this week
              </p>
            </SmartWidget>

            <SmartWidget
              title="Today's Meetings"
              value={upcomingMeetings}
              description="Prep recommended for all"
              badge="Action needed"
              badgeVariant="destructive"
              priority="high"
              noAnimations={true}
              action={{
                label: "Prep Now",
                onClick: () => navigate('/meeting-prep')
              }}
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Next: Sarah Chen in 2 hours
              </div>
            </SmartWidget>

            <SmartWidget
              title="Stale Relationships"
              value={staleContacts}
              description="Haven't connected in 2+ weeks"
              badge="Priority"
              badgeVariant="secondary"
              priority="medium"
              action={{
                label: "Review",
                onClick: () => navigate('/contacts?filter=stale')
              }}
            >
              <div className="text-sm text-muted-foreground">
                Including 3 high-value contacts
              </div>
            </SmartWidget>
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </div>

        {/* Right Column - Intelligent Suggestions */}
        <div className="space-y-6">
          <ActionSuggestions />
          
          {/* Recent Wins */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Recent Wins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-medium">Connected with Emily Wilson</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-medium">Oracle found 3 warm introductions</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-medium">Achieved weekly connection goal</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Smart Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-scale cursor-pointer" onClick={() => navigate('/analytics')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Analytics
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Deep insights into your relationship patterns and ROI
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale cursor-pointer" onClick={() => navigate('/time-tracking')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Time Saved
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary mb-1">15.5 hrs</p>
            <p className="text-sm text-muted-foreground">
              Saved this week through automation
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale cursor-pointer" onClick={() => navigate('/follow-up-automation')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Automation
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              12 active automations working for you
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;