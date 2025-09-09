import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import SubscriptionBanner from "@/components/billing/SubscriptionBanner"
import { SeedDemoData } from "@/components/SeedDemoData"
import { useSubscription } from "@/hooks/useSubscription"
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Phone, 
  Mail, 
  MessageCircle,
  Plus,
  CheckCircle2,
  AlertCircle,
  Heart
} from "lucide-react"

const Dashboard = () => {
  const { subscription, canUseFeature } = useSubscription();
  const relationshipHealthScore = 85
  
  const upcomingTasks = [
    {
      id: 1,
      type: "follow-up",
      contact: "Sarah Johnson",
      task: "Follow up about marketing proposal",
      priority: "high",
      dueDate: "Today",
      lastContact: "2 weeks ago",
      avatar: "SJ"
    },
    {
      id: 2,
      type: "connect",
      contact: "David Lee",
      task: "Connect on LinkedIn",
      priority: "medium",
      dueDate: "Tomorrow",
      lastContact: "Never",
      avatar: "DL"
    },
    {
      id: 3,
      type: "call",
      contact: "Alex Rodriguez",
      task: "Quarterly check-in call",
      priority: "medium",
      dueDate: "This week",
      lastContact: "3 months ago",
      avatar: "AR"
    }
  ]

  const recentActivity = [
    { action: "Added new contact", contact: "Emily Wilson", time: "2 hours ago" },
    { action: "Completed follow-up", contact: "Mike Chen", time: "5 hours ago" },
    { action: "Scheduled meeting", contact: "Lisa Park", time: "1 day ago" },
  ]

  const stats = [
    { label: "Total Contacts", value: "247", icon: Users, change: "+12 this month" },
    { label: "This Week's Meetings", value: "8", icon: Calendar, change: "3 confirmed" },
    { label: "Follow-ups Due", value: "5", icon: Clock, change: "2 overdue" },
    { label: "Connection Growth", value: "+15%", icon: TrendingUp, change: "vs last month" },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground"
      case "medium": return "bg-warning text-warning-foreground"
      case "low": return "bg-success text-success-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "follow-up": return Mail
      case "connect": return Users
      case "call": return Phone
      default: return MessageCircle
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Subscription Banner */}
      <SubscriptionBanner />
      
      {/* Demo Data Section - Show if user has few contacts */}
      <div className="flex justify-center">
        <SeedDemoData />
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Good morning, Kyle</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your relationships today</p>
        </div>
        <Button className="bg-gradient-primary shadow-medium hover:shadow-strong transition-all">
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Relationship Health Score */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Relationship Health Score
            </CardTitle>
            <CardDescription>
              Overall strength of your network connections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-primary">{relationshipHealthScore}%</span>
              <Badge variant="outline" className="text-success border-success">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5% this month
              </Badge>
            </div>
            <Progress value={relationshipHealthScore} className="h-3" />
            <div className="text-sm text-muted-foreground">
              Your network is strong! Keep nurturing key relationships.
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common relationship management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Add New Contact
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Follow-up
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Mail className="mr-2 h-4 w-4" />
              Send Bulk Message
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest relationship activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">{activity.action}</span>
                  <span className="text-primary"> {activity.contact}</span>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI-Powered Suggestions */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            AI-Powered Relationship Suggestions
          </CardTitle>
          <CardDescription>
            Smart recommendations to strengthen your network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingTasks.map((task) => {
              const TaskIcon = getTaskIcon(task.type)
              return (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">{task.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{task.task}</h4>
                        <Badge className={getPriorityColor(task.priority)} variant="secondary">
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{task.contact}</span>
                        {" • "}Last contacted {task.lastContact} • Due {task.dueDate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <TaskIcon className="h-4 w-4 mr-1" />
                      {task.type === "follow-up" ? "Follow Up" : 
                       task.type === "connect" ? "Connect" : "Call"}
                    </Button>
                    <Button size="sm" variant="ghost">
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View All Suggestions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard