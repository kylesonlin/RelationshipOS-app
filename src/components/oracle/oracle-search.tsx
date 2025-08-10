'use client'

import { useState } from 'react'
import { Loader2, Search, Sparkles, TrendingUp, Users, AlertTriangle, Target } from 'lucide-react'

interface OracleResponse {
  response: string
  query: string
  timestamp: string
  model: string
}

export default function OracleSearch() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<OracleResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Professional demo queries that showcase Oracle's revolutionary capabilities
  const suggestedQueries = [
    {
      icon: <TrendingUp className="h-4 w-4" />,
      category: "Strategic Analysis",
      query: "Analyze my professional relationships and identify my top 5 networking opportunities for Q1 2024",
      description: "Comprehensive relationship intelligence and strategic recommendations"
    },
    {
      icon: <AlertTriangle className="h-4 w-4" />,
      category: "Risk Assessment", 
      query: "Which of my key relationships are at risk of deteriorating in the next 6 months?",
      description: "Predictive relationship health analysis with actionable prevention strategies"
    },
    {
      icon: <Target className="h-4 w-4" />,
      category: "ROI Optimization",
      query: "Optimize my Q1 networking strategy for maximum ROI on relationship investments",
      description: "Data-driven networking optimization with specific time and resource allocation"
    },
    {
      icon: <Users className="h-4 w-4" />,
      category: "Network Mapping",
      query: "Map my professional network and identify the most influential connectors for business development",
      description: "Network analysis revealing key relationship multipliers and introduction paths"
    },
    {
      icon: <Sparkles className="h-4 w-4" />,
      category: "Opportunity Detection",
      query: "Identify emerging partnership opportunities based on recent industry changes and my network",
      description: "AI-powered opportunity recognition using real-time market intelligence"
    }
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/oracle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to get Oracle response')
      }

      const data: OracleResponse = await res.json()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuery = (suggestedQuery: string) => {
    setQuery(suggestedQuery)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Oracle Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Oracle Engine
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Revolutionary relationship intelligence that replaces $5K/month human VAs with 10x superior AI analysis
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            Sub-10 Second Analysis
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center">
            <Users className="h-3 w-3 mr-1" />
            Unlimited Network Scale
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full flex items-center">
            <Target className="h-3 w-3 mr-1" />
            Predictive Intelligence
          </span>
        </div>
      </div>

      {/* Oracle Query Input */}
      <div className="bg-white rounded-lg border-2 border-purple-200 shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Search className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Ask Oracle</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Get instant relationship intelligence and strategic networking recommendations
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Oracle to analyze your professional relationships..."
              className="flex-1 text-lg px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !query.trim()}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Ask Oracle</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Suggested Professional Queries */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center">
          Professional Relationship Intelligence Demos
        </h2>
        <p className="text-center text-gray-600">
          Experience Oracle&apos;s revolutionary capabilities with these enterprise-grade analysis examples
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestedQueries.map((item, index) => (
            <div 
              key={index} 
              className="bg-white border-2 border-gray-200 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg hover:border-purple-300"
              onClick={() => handleSuggestedQuery(item.query)}
            >
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                  {item.icon}
                </div>
                <h3 className="text-sm font-semibold">{item.category}</h3>
              </div>
              <p className="text-sm font-medium mb-2 line-clamp-3">{item.query}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Oracle Response */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 text-red-600 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Oracle Error</span>
          </div>
          <p className="text-red-700">{error}</p>
          <p className="text-sm text-red-600 mt-1">
            Note: Oracle requires OpenAI API configuration for full functionality
          </p>
        </div>
      )}

      {response && (
        <div className="bg-white border-2 border-green-200 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-green-800">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Oracle Intelligence Report</h2>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="px-2 py-1 border border-green-300 text-green-700 rounded">
                {response.model}
              </span>
              <span>{new Date(response.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
          <p className="text-green-700 mb-4">
            Professional relationship intelligence delivered in seconds
          </p>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Query Analyzed:</h4>
              <p className="text-green-700 italic">&quot;{response.query}&quot;</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-green-200">
              <h4 className="font-semibold text-gray-800 mb-3">Oracle Analysis:</h4>
              <div className="text-gray-700 space-y-2">
                {response.response.split('\n').map((line, index) => (
                  <p key={index} className="last:mb-0">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="font-semibold text-purple-800">Enterprise Value</span>
              </div>
              <p className="text-sm text-purple-700">
                This analysis would cost $2,000+ from a human VA and take 2-3 days. 
                Oracle delivered superior intelligence in seconds at near-zero marginal cost.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Value Proposition Footer */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
        <div className="text-center space-y-3">
          <h3 className="text-xl font-semibold text-purple-800">
            Experience the Future of Professional Relationship Management
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <div className="font-semibold text-purple-700">100x Faster Analysis</div>
              <div className="text-purple-600">Instant relationship intelligence vs. days of human research</div>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-purple-700">Predictive Insights</div>
              <div className="text-purple-600">Prevent relationship loss before it happens</div>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-purple-700">94% Cost Reduction</div>
              <div className="text-purple-600">$299/month vs. $5K/month human VAs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 