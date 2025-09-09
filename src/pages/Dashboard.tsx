import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton"
import { useSubscription } from "@/hooks/useSubscription"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { 
  Users, 
  TrendingUp, 
  Heart,
  Search,
  Brain,
  CheckCircle2,
  Clock,
  Send
} from "lucide-react"

const Dashboard = () => {
  const { user } = useAuth();
  const { subscription, canUseFeature } = useSubscription();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [oracleQuery, setOracleQuery] = useState("");
  const relationshipHealthScore = 85;

  useEffect(() => {
    // Simulate loading dashboard data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

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

  const recentActivity = [
    { action: "Asked Oracle about Q4 strategy", contact: "Marketing insights", time: "2 hours ago" },
    { action: "Connected with", contact: "Emily Wilson", time: "5 hours ago" },
    { action: "Oracle analyzed", contact: "Relationship patterns", time: "1 day ago" },
  ]

  const quickStats = [
    { label: "Total People", value: "247", icon: Users },
    { label: "Relationship Health", value: `${relationshipHealthScore}%`, icon: Heart },
    { label: "Recent Insights", value: "12", icon: TrendingUp },
  ]

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}</h1>
        <p className="text-muted-foreground text-lg">Ask Oracle anything about your relationships and network</p>
      </div>

      {/* Primary Oracle Search */}
      <Card className="border-primary/20 shadow-medium">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold">Ask Oracle Anything</h2>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Who should I prioritize this week? What's the context for my next meeting?"
                value={oracleQuery}
                onChange={(e) => setOracleQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleOracleSearch()}
                className="pl-12 pr-4 py-6 text-lg border-primary/30 focus:border-primary"
              />
            </div>
            <Button 
              onClick={handleOracleSearch}
              className="px-8 py-6 bg-gradient-primary shadow-medium hover:shadow-strong transition-all"
            >
              <Send className="h-5 w-5 mr-2" />
              Ask Oracle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="shadow-soft hover:shadow-medium transition-shadow text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-2">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your latest relationship activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">{activity.action}</span>
                  <span className="text-primary"> {activity.contact}</span>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard