import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton"
import { SmartWidget } from "@/components/dashboard/SmartWidget"
import { ActionSuggestions } from "@/components/dashboard/ActionSuggestions"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { RelationshipHealthScore } from "@/components/gamification/RelationshipHealthScore"
import { SeedDemoData } from "@/components/SeedDemoData"
import { useAuth } from "@/hooks/useAuth"
import { useSubscription } from "@/hooks/useSubscription"
import { useDashboardData } from "@/hooks/useDashboardData"
import { useNavigate } from "react-router-dom"
import { 
  Search, 
  Sparkles, 
  Users, 
  Calendar, 
  TrendingUp, 
  MessageSquare,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Flame,
  Zap
} from "lucide-react"

const Dashboard = () => {
  const { user } = useAuth();
  const { subscription, canUseFeature } = useSubscription();
  const { metrics, loading } = useDashboardData();
  const navigate = useNavigate();
  const [oracleQuery, setOracleQuery] = useState("");

  // Show loading state while fetching data
  if (loading) {
    return <DashboardSkeleton />;
  }

  // If no metrics available, show default loading
  if (!metrics) {
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

  // Use real data from the dashboard metrics
  const upcomingMeetings = metrics.upcomingMeetings;
  const staleContacts = metrics.staleContacts;
  const weeklyGoal = Math.round(metrics.weeklyGoal);
  const relationshipHealth = metrics.relationshipHealth;
  const totalContacts = metrics.totalContacts;

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
      {/* Smart Header with Context */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">
          {getTimeBasedGreeting()}, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-muted-foreground text-lg">
          You have {upcomingMeetings} meetings today and {staleContacts} relationships that need attention
        </p>
        {totalContacts === 0 && (
          <div className="mt-4">
            <SeedDemoData />
          </div>
        )}
      </div>

      {/* Oracle Interface - Premium Feature */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 shadow-elegant">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Ask Oracle Anything
            </CardTitle>
          </div>
          <CardDescription className="text-base">
            Get AI-powered insights about your relationships, upcoming meetings, and opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about your relationships, meetings, or opportunities..."
              value={oracleQuery}
              onChange={(e) => setOracleQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleOracleSearch()}
              className="text-base"
            />
            <Button 
              onClick={handleOracleSearch}
              className="bg-gradient-primary shadow-medium hover:shadow-strong transition-all px-6"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/oracle?q=who should I follow up with this week')}
              className="text-xs"
            >
              Who should I follow up with?
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/oracle?q=upcoming meeting preparation recommendations')}
              className="text-xs"
            >
              Meeting prep suggestions
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/oracle?q=relationship health insights')}
              className="text-xs"
            >
              Relationship insights
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
                {metrics.weeklyGoalProgress}/5 meaningful interactions this week
              </p>
            </SmartWidget>

            <SmartWidget
              title="Today's Meetings"
              value={upcomingMeetings}
              description="Prep recommended for all"
              badge="Action needed"
              badgeVariant="destructive"
              priority="high"
              action={{
                label: "Prep Now",
                onClick: () => navigate('/meeting-prep')
              }}
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {upcomingMeetings > 0 ? "Next meeting prep available" : "No meetings today"}
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
                {staleContacts > 0 ? `Including high-value contacts` : "All relationships are current"}
              </div>
            </SmartWidget>
          </div>

          {/* Quick Actions */}
          <QuickActions />

          {/* Action Suggestions */}
          <ActionSuggestions />
        </div>

        {/* Right Column - Relationship Health & Goals */}
        <div className="space-y-6">
          <RelationshipHealthScore />

          {/* Recent Wins */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Recent Wins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Connected with 3 new prospects this week</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Completed all follow-ups on time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Relationship health score improved 5%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/analytics')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/time-tracking')}
              >
                <Clock className="h-4 w-4 mr-2" />
                Time Tracking
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/follow-up-automation')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Automation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard