import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AIModeIndicator } from "@/components/ai/AIModeIndicator"
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
    lastUpdated?: string
    recordCount?: number
  }>
  insights: string[]
  followUpQuestions: string[]
  conversationId: string
  proactiveRecommendations?: string[]
}

const Oracle = () => {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [responses, setResponses] = useState<OracleResponse[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [conversationId, setConversationId] = useState<string>("")
  const [proactiveInsights, setProactiveInsights] = useState<string[]>([])
  const { toast } = useToast()

  // Simple function to check if Supabase is configured
  const isSupabaseConfigured = () => {
    return !!supabase
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    // Skip auth check if Supabase is not configured
    if (!isSupabaseConfigured()) {
      setIsAuthenticated(true) // Allow demo mode
      return
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use the Oracle Engine",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(true) // Fallback to demo mode
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
      ],
      followUpQuestions: [
        "Would you like me to draft personalized outreach messages for Sarah and David?",
        "Should I analyze the optimal timing for contacting Alex Rodriguez?",
        "Can I help you schedule these priority touchpoints in your calendar?"
      ],
      conversationId: "demo_conv_1",
      proactiveRecommendations: [
        "💡 I notice you have the highest response rates on Tuesday mornings",
        "📈 Consider setting up quarterly check-ins with your top 10 contacts",
        "🎯 David's company just announced new funding - perfect conversation starter"
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
      ],
      followUpQuestions: [
        "Would you like me to prepare a brief with Michael's recent company updates?",
        "Should I identify mutual connections who could provide additional context?",
        "Can I draft follow-up talking points for after the meeting?"
      ],
      conversationId: "demo_conv_2",
      proactiveRecommendations: [
        "📊 TechFlow's recent earnings report shows 25% growth - great conversation starter",
        "🤝 Your mutual connection Lisa Park could provide additional insights",
        "📅 Consider scheduling a follow-up within 48 hours to maintain momentum"
      ]
    }
  }

  const handleSearch = async () => {
    if (!query.trim() || !isAuthenticated) return
    
    setIsLoading(true)
    
    try {
      // Increment usage if using platform mode
      if ((window as any).incrementAIUsage) {
        await (window as any).incrementAIUsage()
      }

      // Check if Supabase is properly configured
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured - using demo mode')
      }
      
      const { data, error } = await supabase.functions.invoke('oracle-query', {
        body: { 
          query, 
          conversationId: conversationId || undefined,
          userId: 'demo-user'
        }
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
        insights: data.response.insights,
        followUpQuestions: data.response.followUpQuestions || [],
        conversationId: data.response.conversationId,
        proactiveRecommendations: data.response.proactiveRecommendations || []
      }
      
      // Update conversation ID for context
      if (!conversationId) {
        setConversationId(data.response.conversationId)
      }
      
      // Store proactive insights
      if (data.response.proactiveRecommendations) {
        setProactiveInsights(data.response.proactiveRecommendations)
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
        }),
        followUpQuestions: mockResponses[query]?.followUpQuestions || [
          "Would you like me to analyze specific relationships in detail?",
          "Should I identify your highest-priority contacts for this week?",
          "Can I help you create a strategic outreach plan?"
        ],
        conversationId: conversationId || `demo_${Date.now()}`,
        proactiveRecommendations: [
          "💡 I notice 3 high-value contacts haven't been contacted recently",
          "📈 Your Tuesday outreach typically has 40% higher response rates",
          "🎯 Two contacts in your network recently changed roles - perfect timing for outreach"
        ]
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
      {/* Header with AI Mode Indicator */}
      <div className="flex items-center justify-between">
        <div className="text-center space-y-4 flex-1">
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
        <AIModeIndicator onOpenSettings={() => window.open('/settings?tab=ai', '_self')} />
      </div>

      {/* Proactive Insights */}
      {proactiveInsights.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Sparkles className="h-5 w-5" />
              Proactive Insights
            </CardTitle>
            <CardDescription>
              Strategic recommendations I've identified from your relationship data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proactiveInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-300 text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Warning */}
      {!isSupabaseConfigured() && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-warning-foreground">
              <Zap className="h-5 w-5" />
              <div>
                <p className="font-medium">Demo Mode Active</p>
                <p className="text-sm text-muted-foreground">Connect to Supabase in project settings to enable real-time Oracle functionality</p>
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
                disabled={isLoading}
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={!query.trim() || isLoading}
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

              {/* Follow-up Questions */}
              {response.followUpQuestions && response.followUpQuestions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Follow-up Questions
                  </h4>
                  <div className="space-y-2">
                    {response.followUpQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(question)}
                        className="w-full text-left p-3 bg-primary/5 hover:bg-primary/10 rounded-lg border border-primary/10 hover:border-primary/20 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <ChevronRight className="h-3 w-3 text-primary group-hover:translate-x-0.5 transition-transform" />
                          </div>
                          <span className="text-sm text-primary group-hover:text-primary/80">{question}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Oracle