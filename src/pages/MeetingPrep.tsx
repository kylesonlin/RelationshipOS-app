import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EnhancedMeetingPrep } from "@/components/ai/EnhancedMeetingPrep"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar,
  Clock,
  Users,
  FileText,
  Lightbulb,
  AlertCircle,
  Star,
  MessageSquare,
  ExternalLink,
  Download,
  Search
} from "lucide-react"

export default function MeetingPrep() {
  const [searchTerm, setSearchTerm] = useState("")

  const upcomingMeetings = [
    {
      id: 1,
      title: "Q4 Strategy Discussion",
      company: "Johnson Industries",
      attendees: ["Sarah Johnson (CEO)", "Mike Chen (CTO)"],
      date: "Today, 2:00 PM",
      duration: "1 hour",
      status: "ready",
      lastInteraction: "3 days ago",
      relationship: "warm",
      context: "Previous meeting about integration partnership"
    },
    {
      id: 2,
      title: "Product Demo",
      company: "StartupX",
      attendees: ["Alex Rivera (Founder)", "Lisa Park (VP Product)"],
      date: "Tomorrow, 10:00 AM", 
      duration: "45 minutes",
      status: "generating",
      lastInteraction: "1 week ago",
      relationship: "new",
      context: "Initial outreach response"
    },
    {
      id: 3,
      title: "Partnership Review",
      company: "TechCorp",
      attendees: ["David Kim (BD)", "Rachel White (Legal)"],
      date: "Wed, 3:00 PM",
      duration: "30 minutes",
      status: "pending",
      lastInteraction: "2 weeks ago", 
      relationship: "strong",
      context: "Ongoing partnership negotiations"
    }
  ]

  const meetingBrief = {
    company: "Johnson Industries",
    meeting: "Q4 Strategy Discussion",
    attendees: [
      {
        name: "Sarah Johnson",
        role: "CEO",
        background: "15+ years in manufacturing, Harvard MBA",
        recent: "Posted about AI adoption challenges on LinkedIn",
        talking_points: ["Digital transformation initiatives", "Cost optimization strategies"]
      },
      {
        name: "Mike Chen", 
        role: "CTO",
        background: "Former Google engineer, 8 years at Johnson",
        recent: "Attended AWS re:Invent last month",
        talking_points: ["Cloud infrastructure", "Technical integration capabilities"]
      }
    ],
    company_context: {
      recent_news: "Johnson Industries announced 15% revenue growth in Q3",
      key_challenges: ["Legacy system modernization", "Supply chain optimization"],
      opportunities: ["AI-powered analytics", "Process automation"]
    },
    relationship_history: [
      "Initial meeting 3 months ago - expressed interest in partnership",
      "Follow-up email about technical requirements sent 2 weeks ago",
      "Sarah mentioned budget approval process in last call"
    ],
    suggested_agenda: [
      "Review Q3 results and Q4 projections",
      "Discuss integration timeline and milestones", 
      "Address technical requirements and capabilities",
      "Next steps and partnership framework"
    ],
    conversation_starters: [
      "Congratulations on the strong Q3 results - I saw the 15% growth announcement",
      "How has the team been handling the increased demand since the growth?",
      "I remember you mentioned the budget approval process - where do things stand?"
    ]
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">AI Meeting Preparation</h1>
        <p className="text-muted-foreground">
          Get intelligent briefings with context, talking points, and relationship insights
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search meetings, companies, or attendees..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Meetings</TabsTrigger>
          <TabsTrigger value="brief">Meeting Brief</TabsTrigger>
          <TabsTrigger value="templates">Brief Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4">
            {upcomingMeetings.map((meeting) => (
              <Card key={meeting.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{meeting.title}</h3>
                        <Badge variant={
                          meeting.status === 'ready' ? 'default' : 
                          meeting.status === 'generating' ? 'secondary' : 'outline'
                        }>
                          {meeting.status === 'ready' ? 'Brief Ready' :
                           meeting.status === 'generating' ? 'Generating...' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="text-lg font-medium text-primary">{meeting.company}</div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {meeting.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {meeting.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {meeting.attendees.length} attendees
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Last interaction:</span> {meeting.lastInteraction}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          meeting.relationship === 'strong' ? 'default' :
                          meeting.relationship === 'warm' ? 'secondary' : 'outline'
                        }>
                          {meeting.relationship} relationship
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      {meeting.status === 'ready' && (
                        <Button size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          View Brief
                        </Button>
                      )}
                      {meeting.status === 'generating' && (
                        <Button size="sm" variant="outline" disabled>
                          <Clock className="h-4 w-4 mr-2" />
                          Generating...
                        </Button>
                      )}
                      {meeting.status === 'pending' && (
                        <Button size="sm" variant="outline">
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Generate Brief
                        </Button>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Auto-updates in 5 min
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="brief" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {meetingBrief.meeting}
                </CardTitle>
                <CardDescription>{meetingBrief.company} • Today, 2:00 PM</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Share Brief
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Attendee Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Attendee Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {meetingBrief.attendees.map((attendee, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{attendee.name}</h4>
                      <p className="text-sm text-muted-foreground">{attendee.role}</p>
                    </div>
                    <Badge variant="outline">
                      <Star className="h-3 w-3 mr-1" />
                      Key Contact
                    </Badge>
                  </div>
                  <p className="text-sm">{attendee.background}</p>
                  <div className="text-sm">
                    <span className="font-medium text-primary">Recent:</span> {attendee.recent}
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Suggested talking points:</div>
                    <div className="flex flex-wrap gap-2">
                      {attendee.talking_points.map((point, i) => (
                        <Badge key={i} variant="secondary">{point}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Company Context */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Company Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-green-600 mb-2">Recent News</h4>
                <p className="text-sm">{meetingBrief.company_context.recent_news}</p>
              </div>
              <div>
                <h4 className="font-medium text-orange-600 mb-2">Key Challenges</h4>
                <ul className="text-sm space-y-1">
                  {meetingBrief.company_context.key_challenges.map((challenge, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-600 mb-2">Opportunities</h4>
                <ul className="text-sm space-y-1">
                  {meetingBrief.company_context.opportunities.map((opportunity, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      {opportunity}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Conversation Starters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversation Starters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {meetingBrief.conversation_starters.map((starter, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm italic">"{starter}"</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggested Agenda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Suggested Agenda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {meetingBrief.suggested_agenda.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sales Meeting</CardTitle>
                <CardDescription>For prospect meetings and demos</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Company research and recent news</li>
                  <li>• Decision maker backgrounds</li>
                  <li>• Pain points and use cases</li>
                  <li>• Competitive landscape</li>
                  <li>• Pricing and objection handling</li>
                </ul>
                <Button className="w-full mt-4" variant="outline">
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Partnership Meeting</CardTitle>
                <CardDescription>For collaboration discussions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Mutual value propositions</li>
                  <li>• Integration capabilities</li>
                  <li>• Partnership models</li>
                  <li>• Success metrics</li>
                  <li>• Legal and compliance</li>
                </ul>
                <Button className="w-full mt-4" variant="outline">
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Investor Meeting</CardTitle>
                <CardDescription>For funding and board meetings</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Investment portfolio analysis</li>
                  <li>• Market trends and opportunities</li>
                  <li>• Financial performance</li>
                  <li>• Growth strategy alignment</li>
                  <li>• Risk factors and mitigation</li>
                </ul>
                <Button className="w-full mt-4" variant="outline">
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Template</CardTitle>
                <CardDescription>Create your own brief template</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Define what information should be included in your custom meeting brief template..."
                  className="mb-4"
                />
                <Button className="w-full">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced AI Meeting Prep */}
      <EnhancedMeetingPrep 
        attendeeEmails={['sarah.johnson@example.com', 'michael.torres@techflow.com']}
        meetingTitle="Quarterly Strategy Review"
        meetingDate={new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()}
        onPrepComplete={(prepData) => {
          console.log('Meeting prep completed:', prepData);
        }}
      />
    </div>
  )
}