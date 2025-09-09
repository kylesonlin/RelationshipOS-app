import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Clock, 
  Play, 
  Pause, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  Users,
  FileText,
  Target,
  CheckCircle
} from "lucide-react"

export default function TimeTracking() {
  const weeklyStats = {
    totalSaved: 15.5,
    target: 20,
    lastWeek: 12.3
  }

  const dailyBreakdown = [
    { day: "Mon", hours: 2.5, tasks: 8 },
    { day: "Tue", hours: 3.2, tasks: 12 },
    { day: "Wed", hours: 2.8, tasks: 9 },
    { day: "Thu", hours: 3.5, tasks: 14 },
    { day: "Fri", hours: 2.1, tasks: 7 },
    { day: "Sat", hours: 0.8, tasks: 3 },
    { day: "Sun", hours: 0.6, tasks: 2 }
  ]

  const taskCategories = [
    {
      category: "Email Management",
      icon: MessageSquare,
      timeSpent: "4.2 hours",
      timeSaved: "8.5 hours",
      efficiency: 67,
      tasks: 34,
      color: "text-blue-600"
    },
    {
      category: "Meeting Preparation", 
      icon: Calendar,
      timeSpent: "2.1 hours",
      timeSaved: "6.8 hours",
      efficiency: 76,
      tasks: 12,
      color: "text-green-600"
    },
    {
      category: "Contact Management",
      icon: Users,
      timeSpent: "3.5 hours", 
      timeSaved: "5.2 hours",
      efficiency: 60,
      tasks: 28,
      color: "text-purple-600"
    },
    {
      category: "Follow-up Tasks",
      icon: Target,
      timeSpent: "1.8 hours",
      timeSaved: "4.1 hours", 
      efficiency: 82,
      tasks: 19,
      color: "text-orange-600"
    },
    {
      category: "Report Generation",
      icon: FileText,
      timeSpent: "0.9 hours",
      timeSaved: "3.2 hours",
      efficiency: 78,
      tasks: 8,
      color: "text-red-600"
    }
  ]

  const recentTasks = [
    { task: "Prepared meeting brief for Johnson Industries", time: "12 min saved", status: "completed", category: "Meeting Prep" },
    { task: "Automated follow-up sequence for Q3 prospects", time: "45 min saved", status: "completed", category: "Follow-up" },
    { task: "Updated contact profiles from LinkedIn sync", time: "23 min saved", status: "completed", category: "Contact Mgmt" },
    { task: "Generated relationship health report", time: "38 min saved", status: "completed", category: "Analytics" },
    { task: "Scheduled coffee meetings with warm leads", time: "15 min saved", status: "completed", category: "Scheduling" }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Time Tracking & Productivity</h1>
        <p className="text-muted-foreground">
          Monitor time saved through automation and track your relationship management efficiency
        </p>
      </div>

      {/* Current Session */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Time Savings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-primary">3.2 hours</div>
              <p className="text-sm text-muted-foreground">Saved through automation today</p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                +26% vs yesterday
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.totalSaved}h</div>
            <p className="text-xs text-muted-foreground">
              {weeklyStats.totalSaved - weeklyStats.lastWeek > 0 ? '+' : ''}{(weeklyStats.totalSaved - weeklyStats.lastWeek).toFixed(1)}h from last week
            </p>
            <Progress value={(weeklyStats.totalSaved / weeklyStats.target) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Automated</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              Across all categories this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Gain</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <p className="text-xs text-muted-foreground">
              Average time reduction
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="daily">Daily Breakdown</TabsTrigger>
          <TabsTrigger value="recent">Recent Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4">
            {taskCategories.map((category, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted ${category.color}`}>
                        <category.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{category.category}</div>
                        <div className="text-sm text-muted-foreground">{category.tasks} tasks automated</div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Spent:</span> {category.timeSpent}
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        <span className="text-muted-foreground">Saved:</span> {category.timeSaved}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Efficiency</span>
                      <span>{category.efficiency}%</span>
                    </div>
                    <Progress value={category.efficiency} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Time Savings</CardTitle>
              <CardDescription>Hours saved per day this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyBreakdown.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 text-sm font-medium">{day.day}</div>
                      <div className="flex-1">
                        <Progress value={(day.hours / 4) * 100} className="h-3" />
                      </div>
                    </div>
                    <div className="text-right space-x-4">
                      <span className="text-sm text-muted-foreground">{day.tasks} tasks</span>
                      <span className="font-medium">{day.hours}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Automated Tasks</CardTitle>
              <CardDescription>Tasks completed automatically in the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium">{task.task}</div>
                        <div className="text-sm text-muted-foreground">{task.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-200">
                        {task.time}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Optimize Your Time Savings</CardTitle>
          <CardDescription>Recommendations to increase your productivity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start" variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Enable advanced automation for email sequences (+2h/day potential)
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Connect calendar for automatic meeting prep (+1.5h/day potential)
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Set up custom workflow rules for your industry
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}