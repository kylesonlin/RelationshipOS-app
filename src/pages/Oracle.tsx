import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Search,
  Sparkles,
  Brain,
  Clock,
  TrendingUp,
  Users,
  Calendar,
  MessageSquare,
  Zap,
  Target,
  Eye,
  ChevronRight,
  Send
} from "lucide-react"

interface OracleResponse {
  id: string
  question: string
  answer: string
  confidence: number
  responseTime: number
  sources: Array<{
    type: string
    name: string
    relevance: number
  }>
  insights: string[]
}

const Oracle = () => {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [responses, setResponses] = useState<OracleResponse[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the Oracle Engine",
        variant: "destructive"
      })
    }
  }

  const suggestedQueries = [
    {
      icon: Target,
      query: "Who should I prioritize this week?",
      category: "Priority"
    },
    {
      icon: Calendar,
      query: "What's the context for my 3pm meeting?",
      category: "Context"
    },
    {
      icon: TrendingUp,
      query: "Which relationships need attention?",
      category: "Analysis"
    },
    {
      icon: Users,
      query: "Show me potential collaboration opportunities",
      category: "Opportunities"
    },
    {
      icon: MessageSquare,
      query: "What are the best talking points for Sarah Johnson?",
      category: "Conversation"
    },
    {
      icon: Eye,
      query: "Analyze my networking effectiveness this month",
      category: "Insights"
    }
  ]

  const mockResponses: Record<string, Omit<OracleResponse, 'id' | 'question'>> = {
    "Who should I prioritize this week?": {
      answer: "Based on your relationship data and recent activity patterns, I recommend prioritizing **Sarah Johnson** and **David Chen** this week. Sarah hasn't been contacted in 3 weeks despite being marked as high-priority, and David has a potential collaboration opportunity that expires Friday. Alex Rodriguez should also be on your radar for the quarterly check-in.",
      confidence: 94,
      responseTime: 2.3,
      sources: [
        { type: "Contact Data", name: "Sarah Johnson Profile", relevance: 95 },
        { type: "Calendar", name: "Recent Meetings", relevance: 87 },
        { type: "Task History", name: "Follow-up Patterns", relevance: 82 }
      ],
      insights: [
        "Sarah Johnson generates 40% more business when contacted regularly",
        "David Chen responds best to messages sent on Tuesday mornings",
        "Your response rate increases 65% when following up within 48 hours"
      ]
    },
    "What's the context for my 3pm meeting?": {
      answer: "Your 3pm meeting is with **Michael Torres** from TechFlow Solutions. Last interaction was 6 weeks ago where you discussed their Q4 expansion plans. Key talking points: They mentioned needing marketing support, their budget increased 30%, and Michael's daughter just started college (mentioned in your last call notes).",
      confidence: 98,
      responseTime: 1.8,
      sources: [
        { type: "Meeting Notes", name: "Previous Torres Call", relevance: 98 },
        { type: "Contact Profile", name: "Michael Torres", relevance: 93 },
        { type: "Company Data", name: "TechFlow Solutions", relevance: 88 }
      ],
      insights: [
        "Michael prefers data-driven conversations with specific ROI examples",
        "TechFlow typically makes decisions in Q1 for the following year",
        "Previous proposals were most effective when under 10 slides"
      ]
    }
  }

  const handleSearch = async () => {
    if (!query.trim() || !isAuthenticated) return
    
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.functions.invoke('oracle-query', {
        body: { query }
      })

      if (error) {
        throw error
      }

      const response: OracleResponse = {
        id: Date.now().toString(),
        question: query,
        answer: data.response.answer,
        confidence: data.response.confidence,
        responseTime: data.response.responseTime,
        sources: data.response.sources,
        insights: data.response.insights
      }
      
      setResponses(prev => [response, ...prev])
      setQuery("")

      toast({
        title: "Oracle Analysis Complete",
        description: `Response generated with ${data.response.confidence}% confidence`
      })

    } catch (error) {
      console.error('Oracle query error:', error)
      
      // Fallback to mock response if function fails
      const response: OracleResponse = {
        id: Date.now().toString(),
        question: query,
        ...(mockResponses[query] || {
          answer: `I've analyzed your relationship data for "${query}". Based on current patterns and interactions, here are my intelligent recommendations with actionable insights tailored to your specific situation.`,
          confidence: 85 + Math.floor(Math.random() * 10),
          responseTime: 1.5 + Math.random() * 4,
          sources: [
            { type: "Contact Data", name: "Recent Interactions", relevance: 90 },
            { type: "Calendar", name: "Meeting History", relevance: 85 },
            { type: "Task Analytics", name: "Success Patterns", relevance: 80 }
          ],
          insights: [
            "Your most successful outcomes follow specific engagement patterns",
            "Timing your outreach based on recipient preferences increases response rates",
            "Combining personal and professional context yields better results"
          ]
        })
      }
      
      setResponses(prev => [response, ...prev])
      setQuery("")

      toast({
        title: "Using Demo Mode",
        description: "Connect your integrations for real-time data analysis",
        variant: "destructive"
      })
    }
    
    setIsLoading(false)
  }

  const handleSuggestedQuery = (suggestedQuery: string) => {
    setQuery(suggestedQuery)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-success"
    if (confidence >= 75) return "text-warning"
    return "text-muted-foreground"
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-medium">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Oracle Engine
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ask me anything about your relationships. I'll analyze your data and provide intelligent insights to help you build stronger connections.
        </p>
      </div>

      {/* Authentication Warning */}
      {!isAuthenticated && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-destructive">
              <Zap className="h-5 w-5" />
              <div>
                <p className="font-medium">Authentication Required</p>
                <p className="text-sm text-muted-foreground">Sign in to access real-time relationship data and AI insights</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Interface */}
      <Card className="shadow-medium border-primary/20">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Ask the Oracle: 'Who should I prioritize this week?' or 'What's the context for my next meeting?'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 pr-4 py-6 text-lg border-primary/30 focus:border-primary"
                disabled={isLoading || !isAuthenticated}
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={!query.trim() || isLoading || !isAuthenticated}
              className="px-8 py-6 bg-gradient-primary shadow-medium hover:shadow-strong transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Thinking...</span>
                </div>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Ask Oracle
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Queries */}
      {responses.length === 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Suggested Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedQueries.map((item, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-medium transition-all hover:border-primary/30 group"
                onClick={() => handleSuggestedQuery(item.query)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-primary/10 rounded-lg flex items-center justify-center group-hover:bg-gradient-primary/20 transition-colors">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <p className="text-sm font-medium leading-relaxed group-hover:text-primary transition-colors">
                        {item.query}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Responses */}
      <div className="space-y-6">
        {responses.map((response) => (
          <Card key={response.id} className="shadow-soft border-primary/10">
            <CardHeader className="border-b bg-gradient-primary/5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-medium text-primary">
                    {response.question}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{response.responseTime}s response time</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      <span className={getConfidenceColor(response.confidence)}>
                        {response.confidence}% confidence
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-gradient-primary text-white">
                  <Brain className="h-3 w-3 mr-1" />
                  AI Analysis
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {/* Main Answer */}
              <div className="prose max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {response.answer}
                </p>
              </div>

              {/* Confidence Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Response Confidence</span>
                  <span className={getConfidenceColor(response.confidence)}>
                    {response.confidence}%
                  </span>
                </div>
                <Progress value={response.confidence} className="h-2" />
              </div>

              {/* Sources */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  Data Sources
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {response.sources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{source.type}</p>
                        <p className="text-xs text-muted-foreground">{source.name}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {source.relevance}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  AI Insights
                </h4>
                <div className="space-y-2">
                  {response.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Oracle