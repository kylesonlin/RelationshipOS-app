import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Users, 
  Target,
  ArrowUp,
  CalendarDays,
  MessageSquare
} from "lucide-react"

export default function ROIDashboard() {
  // Simulated data - in real app this would come from analytics
  const monthlyVACost = 5000
  const relationshipOSCost = 299
  const monthlySavings = monthlyVACost - relationshipOSCost
  const yearlyROI = ((monthlySavings * 12) / (relationshipOSCost * 12)) * 100

  const timeMetrics = {
    hoursPerWeek: 15,
    tasksAutomated: 127,
    meetingsPrepared: 34,
    followUpsGenerated: 89
  }

  const costComparison = [
    { item: "Human VA (Full-time)", cost: "$5,000/month", annual: "$60,000" },
    { item: "RelationshipOS Enterprise", cost: "$299/month", annual: "$3,588" },
    { item: "Your Savings", cost: `$${monthlySavings.toLocaleString()}/month`, annual: `$${(monthlySavings * 12).toLocaleString()}`, highlight: true }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">ROI Dashboard</h1>
        <p className="text-muted-foreground">
          Track your cost savings vs. hiring a $5K/month relationship management VA
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              ${monthlySavings.toLocaleString()}
            </div>
            <p className="text-xs text-green-600 dark:text-green-500">
              vs. Human VA costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yearlyROI.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              Return on investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Saved/Week</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeMetrics.hoursPerWeek}</div>
            <p className="text-xs text-muted-foreground">
              Automated relationship tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Automated</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeMetrics.tasksAutomated}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Comparison Analysis
          </CardTitle>
          <CardDescription>
            See how RelationshipOS compares to hiring a dedicated relationship management VA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {costComparison.map((item, index) => (
              <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${
                item.highlight ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-muted/50'
              }`}>
                <div>
                  <div className="font-medium">{item.item}</div>
                  <div className="text-sm text-muted-foreground">{item.annual} annually</div>
                </div>
                <div className={`text-right ${item.highlight ? 'text-green-700 dark:text-green-400' : ''}`}>
                  <div className="font-bold text-lg">{item.cost}</div>
                  {item.highlight && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      {yearlyROI.toFixed(0)}% ROI
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Value Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>What You're Saving On</CardTitle>
            <CardDescription>Tasks that would require a full-time VA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>Email & Communication Management</span>
              </div>
              <span className="text-sm font-medium">$1,500/mo</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>Meeting Preparation & Scheduling</span>
              </div>
              <span className="text-sm font-medium">$1,200/mo</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Relationship Tracking & Updates</span>
              </div>
              <span className="text-sm font-medium">$1,000/mo</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span>Follow-up & Opportunity Tracking</span>
              </div>
              <span className="text-sm font-medium">$800/mo</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>Analytics & Reporting</span>
              </div>
              <span className="text-sm font-medium">$500/mo</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between font-bold">
                <span>Total VA Cost</span>
                <span>$5,000/mo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productivity Gains</CardTitle>
            <CardDescription>Efficiency improvements this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Meeting Preparation Time</span>
                <span>85% reduction</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Follow-up Efficiency</span>
                <span>92% improvement</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Relationship Insights</span>
                <span>78% faster</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Opportunity Detection</span>
                <span>95% automated</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps to Maximize ROI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start" variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Connect more team members (Team plan saves additional $2K/month per person)
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Enable advanced automation rules for 30% more time savings
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Schedule ROI review meeting with leadership team
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}