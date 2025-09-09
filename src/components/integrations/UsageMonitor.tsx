import { useState } from "react"
import { Integration } from "@/pages/Integrations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, DollarSign, Activity, Clock } from "lucide-react"

interface UsageMonitorProps {
  integrations: Integration[]
}

const DEMO_USAGE_DATA = [
  { name: "OpenAI", requests: 1250, cost: 24.50, limit: 10000, color: "#8B5CF6" },
  { name: "Gmail", requests: 3420, cost: 0, limit: 5000, color: "#EF4444" },
  { name: "LinkedIn", requests: 890, cost: 12.30, limit: 2000, color: "#0077B5" },
  { name: "Calendar", requests: 567, cost: 0, limit: 1000, color: "#10B981" },
]

const DEMO_TIMELINE_DATA = [
  { date: "Jan 1", openai: 120, gmail: 340, linkedin: 89, calendar: 45 },
  { date: "Jan 2", openai: 135, gmail: 280, linkedin: 95, calendar: 52 },
  { date: "Jan 3", openai: 98, gmail: 390, linkedin: 76, calendar: 48 },
  { date: "Jan 4", openai: 156, gmail: 420, linkedin: 103, calendar: 61 },
  { date: "Jan 5", openai: 142, gmail: 380, linkedin: 88, calendar: 55 },
  { date: "Jan 6", openai: 128, gmail: 350, linkedin: 92, calendar: 49 },
  { date: "Jan 7", openai: 165, gmail: 410, linkedin: 107, calendar: 58 },
]

const DEMO_COST_DATA = [
  { date: "Week 1", cost: 45.20 },
  { date: "Week 2", cost: 52.80 },
  { date: "Week 3", cost: 38.90 },
  { date: "Week 4", cost: 61.50 },
]

export function UsageMonitor({ integrations }: UsageMonitorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")

  const totalCost = DEMO_USAGE_DATA.reduce((sum, item) => sum + item.cost, 0)
  const totalRequests = DEMO_USAGE_DATA.reduce((sum, item) => sum + item.requests, 0)
  const averageResponseTime = 245 // ms

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              -5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active APIs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.length}</div>
            <p className="text-xs text-muted-foreground">
              of 6 available
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Usage by Service</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="limits">Quota & Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="usage">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Volume</CardTitle>
                <CardDescription>API requests by service</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={DEMO_USAGE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Distribution</CardTitle>
                <CardDescription>Cost breakdown by service</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={DEMO_USAGE_DATA.filter(d => d.cost > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, cost }) => `${name}: $${cost}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cost"
                    >
                      {DEMO_USAGE_DATA.filter(d => d.cost > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Usage Over Time</CardTitle>
              <CardDescription>API request timeline by service</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={DEMO_TIMELINE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="openai" stroke="#8B5CF6" strokeWidth={2} />
                  <Line type="monotone" dataKey="gmail" stroke="#EF4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="linkedin" stroke="#0077B5" strokeWidth={2} />
                  <Line type="monotone" dataKey="calendar" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Cost Trend</CardTitle>
                <CardDescription>Total API costs over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={DEMO_COST_DATA}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                    <Line type="monotone" dataKey="cost" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Current month spending by service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {DEMO_USAGE_DATA.map((service, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{service.name}</span>
                      <Badge variant="outline">${service.cost.toFixed(2)}</Badge>
                    </div>
                    {service.cost > 0 && (
                      <Progress 
                        value={(service.cost / totalCost) * 100} 
                        className="h-2"
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="limits">
          <div className="space-y-4">
            {DEMO_USAGE_DATA.map((service, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge 
                      variant={service.requests / service.limit > 0.8 ? "destructive" : "default"}
                    >
                      {((service.requests / service.limit) * 100).toFixed(1)}% used
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{service.requests.toLocaleString()} requests</span>
                      <span>{service.limit.toLocaleString()} limit</span>
                    </div>
                    <Progress 
                      value={(service.requests / service.limit) * 100} 
                      className={`h-3 ${service.requests / service.limit > 0.8 ? 'text-red-600' : ''}`}
                    />
                    <p className="text-xs text-muted-foreground">
                      {service.limit - service.requests} requests remaining this month
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}