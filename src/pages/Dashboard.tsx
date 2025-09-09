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
import { GoogleSyncCTA } from "@/components/onboarding/GoogleSyncCTA"
import { ExecutiveCalendarWidget } from "@/components/dashboard/ExecutiveCalendarWidget"
import { useAuth } from "@/hooks/useAuth"
import { useSubscription } from "@/hooks/useSubscription"
import { useDashboardData } from "@/hooks/useDashboardData"
import { useGoogleIntegration } from "@/hooks/useGoogleIntegration"
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
  const { metrics, loading, refreshMetrics } = useDashboardData();
  const { isConnected, hasGmailAccess, hasCalendarAccess } = useGoogleIntegration();
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

  // Determine if user needs onboarding vs showing full dashboard
  const needsOnboarding = totalContacts < 3 && (!isConnected || (!hasGmailAccess && !hasCalendarAccess));
  const hasIntelligenceData = isConnected && (hasGmailAccess || hasCalendarAccess);

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
      {/* Executive AI Command Center Hero */}
      <div className="text-center space-y-6 py-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center executive-card-premium">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div className="text-left">
            <h1 className="executive-title text-4xl md:text-5xl">
              AI Command Center
            </h1>
            <p className="executive-subtitle mt-2">
              {getTimeBasedGreeting()}, {user?.user_metadata?.full_name?.split(' ')[0] || 'Executive'}
            </p>
          </div>
        </div>
      </div>

      {/* Executive ROI Hero - Primary Value Proposition */}
      <Card className="executive-card-premium border-primary/30">
        <CardHeader className="text-center pb-6">
          <CardTitle className="executive-title text-2xl flex items-center justify-center gap-3">
            <DollarSign className="h-8 w-8 text-success" />
            Executive ROI Dashboard
          </CardTitle>
          <CardDescription className="executive-subtitle">
            Your AI team's measurable business impact vs. traditional $5K/month VA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="metric-card p-6 text-center">
              <div className="roi-display text-3xl mb-2">
                ${monthlySavings.toLocaleString()}
              </div>
              <p className="text-sm font-medium text-success">Monthly Savings</p>
              <p className="text-xs text-muted-foreground mt-1">94% cost reduction</p>
            </div>
            <div className="metric-card p-6 text-center">
              <div className="data-metric text-3xl mb-2">{tasksAutomated}</div>
              <p className="text-sm font-medium">Tasks Automated</p>
              <p className="text-xs text-muted-foreground mt-1">Daily operations</p>
            </div>
            <div className="metric-card p-6 text-center">
              <div className="data-metric text-3xl mb-2">{hoursPerWeek}h</div>
              <p className="text-sm font-medium">Weekly Time Saved</p>
              <p className="text-xs text-muted-foreground mt-1">Executive focus time</p>
            </div>
            <div className="metric-card p-6 text-center">
              <div className="roi-display text-3xl mb-2 flex items-center justify-center gap-2">
                1,574%
                <ArrowUp className="h-5 w-5 text-success" />
              </div>
              <p className="text-sm font-medium text-success">Annual ROI</p>
              <p className="text-xs text-muted-foreground mt-1">Annualized return</p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Button 
              onClick={() => navigate('/roi-dashboard')}
              className="executive-button"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Complete ROI Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Content Based on User State */}
      {needsOnboarding ? (
        // Show onboarding experience for new users
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GoogleSyncCTA 
            totalContacts={totalContacts} 
            onSyncComplete={() => {
              refreshMetrics();
              // Force re-render by updating a state or triggering navigation
              window.location.reload();
            }} 
          />
          <ExecutiveCalendarWidget />
        </div>
      ) : (
        // Show full dashboard for active users
        <>
          {/* AI Team's Strategic Intelligence */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ActionSuggestions />
            </div>
            <div>
              {hasIntelligenceData ? (
                <ExecutiveCalendarWidget />
              ) : (
                <Card className="executive-card border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="h-5 w-5 text-primary" />
                      AI Strategy Assistant
                    </CardTitle>
                    <CardDescription>
                      Executive decision support and strategic insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Strategic question or decision support..."
                        value={oracleQuery}
                        onChange={(e) => setOracleQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleOracleSearch()}
                        className="text-sm executive-card"
                      />
                      <Button 
                        onClick={handleOracleSearch}
                        size="sm"
                        className="executive-button px-4"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate('/oracle?q=strategic relationship priorities this week')}
                        className="justify-start text-xs h-9 hover:bg-primary/10"
                      >
                        Strategic priorities
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate('/oracle?q=executive meeting preparation analysis')}
                        className="justify-start text-xs h-9 hover:bg-primary/10"
                      >
                        Meeting intelligence
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Executive Intelligence Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card className="metric-card hover:shadow-executive cursor-pointer" onClick={() => navigate('/analytics')}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Relationship Health
                  </CardTitle>
                  <Badge variant="default" className="text-xs">Excellent</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="data-metric text-2xl font-bold">
                    {relationshipHealth}%
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="font-medium text-success">+5% this week</span>
                  </div>
                  <Progress value={relationshipHealth} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card hover:shadow-executive cursor-pointer" onClick={() => navigate('/gamification-dashboard')}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Weekly Performance
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">3 days left</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="data-metric text-2xl font-bold">
                    {weeklyGoal}%
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="font-medium text-success">On track</span>
                  </div>
                  <Progress value={weeklyGoal} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card hover:shadow-executive cursor-pointer" onClick={() => navigate('/meeting-prep')}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Today's Meetings
                  </CardTitle>
                  <Badge 
                    variant={upcomingMeetings > 0 ? "destructive" : "default"} 
                    className="text-xs"
                  >
                    {upcomingMeetings > 0 ? "Action needed" : "All clear"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="data-metric text-2xl font-bold">
                    {upcomingMeetings}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{upcomingMeetings > 0 ? "Meeting prep available" : "No meetings today"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card hover:shadow-executive cursor-pointer" onClick={() => navigate('/contacts?filter=stale')}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Stale Relationships
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">Priority</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="data-metric text-2xl font-bold">
                    {staleContacts}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {staleContacts > 0 ? "High-value contacts included" : "All relationships current"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard