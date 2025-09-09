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
  Zap,
  DollarSign,
  ArrowUp,
  Brain
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

  // ROI calculations for AI Team Dashboard
  const monthlyVACost = 5000;
  const relationshipOSCost = 299;
  const monthlySavings = monthlyVACost - relationshipOSCost;
  const tasksAutomated = 127;
  const hoursPerWeek = 15;

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
      {/* AI Team Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Your AI Relationship Team
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          {getTimeBasedGreeting()}, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}
        </p>
        {totalContacts === 0 && (
          <div className="mt-4">
            <SeedDemoData />
          </div>
        )}
      </div>

      {/* ROI Metrics - What Your AI Team Accomplished */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-elegant">
        <CardHeader className="text-center pb-3">
          <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            What Your AI Team Accomplished This Month
          </CardTitle>
          <CardDescription>
            Your virtual relationship management team vs. hiring a $5K/month VA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                ${monthlySavings.toLocaleString()}
              </div>
              <p className="text-sm text-green-600 dark:text-green-500">Monthly Savings</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-background border">
              <div className="text-2xl font-bold">{tasksAutomated}</div>
              <p className="text-sm text-muted-foreground">Tasks Automated</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-background border">
              <div className="text-2xl font-bold">{hoursPerWeek}</div>
              <p className="text-sm text-muted-foreground">Hours Saved/Week</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-background border">
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                1,574%
                <ArrowUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">Annual ROI</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/roi-dashboard')}
              className="bg-background/50"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Full ROI Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Your AI Team's Daily Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActionSuggestions />
        </div>
        <div>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-primary" />
                Ask Your AI Team
              </CardTitle>
              <CardDescription>
                Get instant insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="What should I focus on today?"
                  value={oracleQuery}
                  onChange={(e) => setOracleQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleOracleSearch()}
                  className="text-sm"
                />
                <Button 
                  onClick={handleOracleSearch}
                  size="sm"
                  className="bg-gradient-primary px-4"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/oracle?q=who should I follow up with this week')}
                  className="justify-start text-xs h-8"
                >
                  Who needs follow-up?
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/oracle?q=upcoming meeting preparation recommendations')}
                  className="justify-start text-xs h-8"
                >
                  Meeting prep help
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <SmartWidget
          title="Relationship Health"
          value={`${relationshipHealth}%`}
          trend="up"
          trendValue="+5% this week"
          badge="Excellent"
          badgeVariant="default"
          priority="medium"
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
        </SmartWidget>

        <SmartWidget
          title="Today's Meetings"
          value={upcomingMeetings}
          description="Prep available"
          badge={upcomingMeetings > 0 ? "Action needed" : "All clear"}
          badgeVariant={upcomingMeetings > 0 ? "destructive" : "default"}
          priority="medium"
          action={{
            label: "Prep Now",
            onClick: () => navigate('/meeting-prep')
          }}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {upcomingMeetings > 0 ? "Meeting prep available" : "No meetings today"}
          </div>
        </SmartWidget>

        <SmartWidget
          title="Stale Relationships"
          value={staleContacts}
          description="Need attention"
          badge="Priority"
          badgeVariant="secondary"
          priority="medium"
          action={{
            label: "Review",
            onClick: () => navigate('/contacts?filter=stale')
          }}
        >
          <div className="text-sm text-muted-foreground">
            {staleContacts > 0 ? "High-value contacts included" : "All relationships current"}
          </div>
        </SmartWidget>
      </div>
    </div>
  )
}

export default Dashboard