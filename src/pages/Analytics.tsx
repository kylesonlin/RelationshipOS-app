import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useAnalyticsData } from "@/hooks/useAnalyticsData"
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton"
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Target,
  Calendar,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Clock,
  Zap,
  Star,
  ArrowUp,
  ArrowDown
} from "lucide-react"

export default function Analytics() {
  const { analytics, loading } = useAnalyticsData()

  if (loading) {
    return <DashboardSkeleton />
  }

  if (!analytics) {
    return <DashboardSkeleton />
  }

  const totalRelationships = analytics.relationshipHealth.strong + 
                             analytics.relationshipHealth.warm + 
                             analytics.relationshipHealth.cold + 
                             analytics.relationshipHealth.declining

  const keyMetrics = [
    {
      title: "Relationship Score",
      value: `${analytics.keyMetrics.relationshipScore.toFixed(1)}/10`,
      change: "+12%",
      trend: "up",
      description: "Average across portfolio"
    },
    {
      title: "Active Relationships", 
      value: analytics.keyMetrics.activeRelationships.toString(),
      change: "+8",
      trend: "up",
      description: "Engaged in last 30 days"
    },
    {
      title: "Opportunities Identified",
      value: analytics.keyMetrics.opportunitiesIdentified.toString(),
      change: "+5",
      trend: "up", 
      description: "This month"
    },
    {
      title: "At-Risk Relationships",
      value: analytics.keyMetrics.atRiskRelationships.toString(),
      change: "-3",
      trend: "down",
      description: "Require attention"
    }
  ]

  const businessImpact = [
    {
      metric: "Pipeline Value",
      value: analytics.businessImpact.pipelineValue,
      change: "+15%",
      impact: "High",
      source: "Relationship referrals"
    },
    {
      metric: "Deal Velocity",
      value: analytics.businessImpact.dealVelocity,
      change: "-18%",
      impact: "High",
      source: "Faster warm introductions"
    },
    {
      metric: "Win Rate",
      value: analytics.businessImpact.winRate,
      change: "+7%",
      impact: "Medium",
      source: "Better context & preparation"
    },
    {
      metric: "Customer Retention",
      value: analytics.businessImpact.customerRetention,
      change: "+3%",
      impact: "Medium", 
      source: "Proactive relationship management"
    }
  ]

  const riskAlerts = [
    {
      type: "declining",
      contact: "Contact requiring attention",
      company: "Various Companies",
      issue: "Multiple contacts need follow-up",
      severity: "medium",
      action: "Review stale contacts"
    },
    {
      type: "opportunity",
      contact: "Network expansion",
      company: "Growth opportunities",
      issue: "Consider expanding network",
      severity: "medium",
      action: "Connect with new prospects"
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Relationship Analytics</h1>
        <p className="text-muted-foreground">
          Track relationship health, business impact, and opportunities across your network
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              {metric.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center gap-1 text-xs">
                <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {metric.change}
                </span>
                <span className="text-muted-foreground">{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">Relationship Health</TabsTrigger>
          <TabsTrigger value="impact">Business Impact</TabsTrigger>
          <TabsTrigger value="engagement">Engagement Trends</TabsTrigger>
          <TabsTrigger value="alerts">Risk Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Relationship Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Relationship Distribution</CardTitle>
                <CardDescription>{totalRelationships} total relationships tracked</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Strong ({analytics.relationshipHealth.strong})</span>
                    </div>
                    <span className="text-sm font-medium">
                      {((analytics.relationshipHealth.strong / totalRelationships) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={(analytics.relationshipHealth.strong / totalRelationships) * 100} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Warm ({relationshipHealth.warm})</span>
                    </div>
                    <span className="text-sm font-medium">
                      {((relationshipHealth.warm / totalRelationships) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={(relationshipHealth.warm / totalRelationships) * 100} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Cold ({relationshipHealth.cold})</span>
                    </div>
                    <span className="text-sm font-medium">
                      {((relationshipHealth.cold / totalRelationships) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={(relationshipHealth.cold / totalRelationships) * 100} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Declining ({relationshipHealth.declining})</span>
                    </div>
                    <span className="text-sm font-medium">
                      {((relationshipHealth.declining / totalRelationships) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={(relationshipHealth.declining / totalRelationships) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Relationships */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Relationships</CardTitle>
                <CardDescription>Highest scoring contacts this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topContacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">{contact.company}</div>
                        <div className="text-xs text-muted-foreground">
                          {contact.interactions} interactions • {contact.lastContact}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{contact.score}</span>
                          {contact.trend === 'up' && <ArrowUp className="h-3 w-3 text-green-600" />}
                          {contact.trend === 'down' && <ArrowDown className="h-3 w-3 text-red-600" />}
                        </div>
                        <Badge variant={contact.value === 'High' ? 'default' : 'secondary'}>
                          {contact.value} Value
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="impact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Impact Metrics</CardTitle>
              <CardDescription>How relationship management drives business results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {businessImpact.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{item.metric}</div>
                      <div className="text-sm text-muted-foreground">{item.source}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-xl font-bold">{item.value}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600">{item.change}</span>
                        <Badge variant={item.impact === 'High' ? 'default' : 'secondary'}>
                          {item.impact} Impact
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ROI Summary */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Relationship ROI Summary
              </CardTitle>
              <CardDescription>Quantified value from relationship management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">$2.4M</div>
                  <div className="text-sm text-green-600 dark:text-green-500">Pipeline Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">56%</div>
                  <div className="text-sm text-green-600 dark:text-green-500">From Relationships</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">15.2x</div>
                  <div className="text-sm text-green-600 dark:text-green-500">Revenue Multiple</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
              <CardDescription>Communication patterns over the last 4 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {engagementTrends.map((month, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{month.month}</span>
                      <span className="text-sm text-muted-foreground">
                        {month.emails + month.meetings + month.calls} total touchpoints
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Emails</span>
                        </div>
                        <div className="text-lg font-bold">{month.emails}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Meetings</span>
                        </div>
                        <div className="text-lg font-bold">{month.meetings}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">Calls</span>
                        </div>
                        <div className="text-lg font-bold">{month.calls}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Alerts & Opportunities
              </CardTitle>
              <CardDescription>Proactive insights requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskAlerts.map((alert, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${
                    alert.severity === 'high' ? 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800' :
                    alert.type === 'opportunity' ? 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800' :
                    'border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            alert.type === 'opportunity' ? 'default' : 
                            alert.severity === 'high' ? 'destructive' : 'secondary'
                          }>
                            {alert.type === 'opportunity' ? 'Opportunity' : 'Risk'}
                          </Badge>
                          <span className="font-medium">{alert.contact}</span>
                          <span className="text-sm text-muted-foreground">at {alert.company}</span>
                        </div>
                        <p className="text-sm">{alert.issue}</p>
                        <div className="text-sm font-medium text-primary">
                          Suggested action: {alert.action}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Take Action
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Opportunities</CardTitle>
              <CardDescription>Ways to improve your relationship management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Zap className="h-4 w-4 mr-2" />
                Automate follow-ups for 23 cold relationships
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Star className="h-4 w-4 mr-2" />
                Schedule quarterly reviews with top 10 contacts
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Create engagement campaigns for declining relationships
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}