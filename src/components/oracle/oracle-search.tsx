'use client'

import { useState } from 'react'
import { Search, Send, Sparkles } from 'lucide-react'

export function OracleSearch() {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    const startTime = Date.now()
    
    try {
      const response = await fetch('/api/oracle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const totalTime = Date.now() - startTime
      
      if (data.error) {
        setResponse(`Error: ${data.error}${data.details ? `\n\nDetails: ${data.details}` : ''}`)
      } else {
        setResponse(`${data.response}\n\n---\nResponse Time: ${totalTime}ms | Tokens: ${data.metadata.tokens} | Model: ${data.metadata.model}`)
      }
    } catch (error) {
      setResponse(`Error: Unable to process query. Please check your connection and try again.\n\nDetails: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Oracle Search Interface */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Oracle Engine</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything about your professional relationships..."
              className="w-full pl-12 pr-12 py-4 text-lg border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              'Who should I prioritize this week?',
              'What\'s changed in my network?',
              'Who can introduce me to Google?',
              'What opportunities am I missing?'
            ].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuery(suggestion)}
                className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-full transition-colors"
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Oracle Response */}
      {(isLoading || response) && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Oracle Intelligence</h3>
          
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-slate-600 dark:text-slate-400">Analyzing your professional network...</span>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 font-sans">
                {response}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Performance Indicator */}
      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        <p>Target Response Time: &lt;10 seconds • Currently in Development Mode</p>
      </div>
    </div>
  )
} 