import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Zap,
  Clock,
  Send,
  Calendar,
  MessageSquare,
  Users,
  Target,
  Bell,
  CheckCircle,
  Play,
  Pause,
  Settings,
  Edit,
  Plus
} from "lucide-react"

export default function FollowUpAutomation() {
  const [isCreatingRule, setIsCreatingRule] = useState(false)

  const automationRules = [
    {
      id: 1,
      name: "Post-Meeting Follow-up",
      trigger: "Meeting completed",
      action: "Send thank you + next steps",
      delay: "2 hours",
      active: true,
      success_rate: "94%",
      total_sent: 127
    },
    {
      id: 2,
      name: "Cold Contact Nurture",
      trigger: "No interaction in 30 days", 
      action: "Send value-add content",
      delay: "immediate",
      active: true,
      success_rate: "67%",
      total_sent: 89
    },
    {
      id: 3,
      name: "Proposal Follow-up",
      trigger: "Proposal sent",
      action: "Follow up on status",
      delay: "3 days",
      active: true,
      success_rate: "78%",
      total_sent: 45
    },
    {
      id: 4,
      name: "Introduction Request",
      trigger: "Mutual connection identified",
      action: "Request warm introduction",
      delay: "1 day",
      active: false,
      success_rate: "85%",
      total_sent: 23
    }
  ]

  const pendingFollowUps = [
    {
      contact: "Sarah Johnson",
      company: "Johnson Industries",
      action: "Send meeting recap + action items",
      scheduled: "In 1 hour",
      type: "post-meeting",
      priority: "high"
    },
    {
      contact: "Mike Chen",
      company: "TechCorp", 
      action: "Follow up on proposal status",
      scheduled: "Tomorrow 9 AM",
      type: "proposal",
      priority: "high"
    },
    {
      contact: "Alex Rivera",
      company: "StartupX",
      action: "Share industry insights article",
      scheduled: "In 2 days",
      type: "nurture",
      priority: "medium"
    },
    {
      contact: "Lisa Park",
      company: "InnovateCo",
      action: "Schedule Q1 planning call",
      scheduled: "Next week",
      type: "relationship",
      priority: "low"
    }
  ]

  const templates = [
    {
      name: "Meeting Follow-up",
      category: "Post-Meeting",
      usage: "High",
      last_modified: "2 days ago"
    },
    {
      name: "Value-Add Content Share",
      category: "Nurture",
      usage: "Medium", 
      last_modified: "1 week ago"
    },
    {
      name: "Introduction Request",
      category: "Networking",
      usage: "Low",
      last_modified: "2 weeks ago"
    },
    {
      name: "Proposal Check-in",
      category: "Sales",
      usage: "High",
      last_modified: "3 days ago"
    }
  ]

  const recentActivity = [
    {
      action: "Sent follow-up to Sarah Johnson",
      time: "2 hours ago",
      status: "delivered",
      rule: "Post-Meeting Follow-up"
    },
    {
      action: "Scheduled reminder for Mike Chen",
      time: "4 hours ago", 
      status: "scheduled",
      rule: "Proposal Follow-up"
    },
    {
      action: "Sent nurture email to cold contacts (12)",
      time: "1 day ago",
      status: "delivered",
      rule: "Cold Contact Nurture"
    },
    {
      action: "Introduction request to David Kim",
      time: "2 days ago",
      status: "pending",
      rule: "Introduction Request"
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Follow-up Automation</h1>
        <p className="text-muted-foreground">
          Smart suggestions and automated sequences for relationship maintenance
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Processing follow-ups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-muted-foreground">
              Average response rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.2h</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Follow-ups</TabsTrigger>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Upcoming Follow-ups
              </CardTitle>
              <CardDescription>Actions scheduled by automation rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingFollowUps.map((followUp, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{followUp.contact}</span>
                        <span className="text-sm text-muted-foreground">at {followUp.company}</span>
                        <Badge variant={
                          followUp.priority === 'high' ? 'destructive' :
                          followUp.priority === 'medium' ? 'default' : 'secondary'
                        }>
                          {followUp.priority} priority
                        </Badge>
                      </div>
                      <div className="text-sm">{followUp.action}</div>
                      <div className="text-xs text-muted-foreground">
                        Scheduled: {followUp.scheduled}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Send Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Automation Rules</CardTitle>
                <CardDescription>Configure when and how follow-ups are triggered</CardDescription>
              </div>
              <Button onClick={() => setIsCreatingRule(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Rule
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{rule.name}</h4>
                        <Switch checked={rule.active} />
                        {rule.active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Paused</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Trigger:</span> {rule.trigger}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Action:</span> {rule.action}
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Delay: {rule.delay}</span>
                        <span>Success: {rule.success_rate}</span>
                        <span>Sent: {rule.total_sent}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        {rule.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Create New Rule */}
          {isCreatingRule && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Automation Rule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rule Name</label>
                    <Input placeholder="e.g., Demo Follow-up" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trigger Event</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meeting">Meeting completed</SelectItem>
                        <SelectItem value="proposal">Proposal sent</SelectItem>
                        <SelectItem value="no-contact">No contact in X days</SelectItem>
                        <SelectItem value="email-opened">Email opened</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Action Description</label>
                  <Input placeholder="e.g., Send personalized follow-up email" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Delay</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delay" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="1d">1 day</SelectItem>
                      <SelectItem value="3d">3 days</SelectItem>
                      <SelectItem value="1w">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message Template</label>
                  <Textarea placeholder="Write your follow-up message template..." />
                </div>
                <div className="flex gap-2">
                  <Button>Create Rule</Button>
                  <Button variant="outline" onClick={() => setIsCreatingRule(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Message Templates</CardTitle>
                <CardDescription>Reusable templates for different follow-up scenarios</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Usage: {template.usage}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Modified: {template.last_modified}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            Preview
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Automation Activity</CardTitle>
              <CardDescription>Actions taken by your automation rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-sm text-muted-foreground">
                        Rule: {activity.rule}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm text-muted-foreground">{activity.time}</div>
                      <Badge variant={
                        activity.status === 'delivered' ? 'default' :
                        activity.status === 'scheduled' ? 'secondary' : 'outline'
                      }>
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common automation tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start" variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Send immediate follow-ups to all pending actions
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule batch follow-ups for cold contacts
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Create nurture sequence for new leads
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}