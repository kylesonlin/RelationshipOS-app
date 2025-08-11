'use client'

import { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Network,
  ArrowRight,
  X
} from 'lucide-react';

interface TeamInsight {
  type: 'network_overlap' | 'collaboration_opportunity' | 'relationship_gap' | 'warm_introduction';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  involvedMembers: string[];
  suggestedAction: string;
  potentialValue: string;
  relatedPeople: string[];
  generatedAt: string;
  status: 'new' | 'reviewed' | 'acted_upon' | 'dismissed';
}

interface TeamInsightsCardProps {
  organizationId: string;
}

export default function TeamInsightsCard({ organizationId }: TeamInsightsCardProps) {
  const [insights, setInsights] = useState<TeamInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    loadTeamInsights();
  }, [organizationId]);

  const loadTeamInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/team/insights');
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data.data.insights || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load team insights');
      }
    } catch {
      setError('Network error loading team insights');
    } finally {
      setIsLoading(false);
    }
  };

  const updateInsightStatus = async (insightId: string, status: TeamInsight['status']) => {
    try {
      const response = await fetch('/api/team/insights', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          insightId,
          status
        })
      });

      if (response.ok) {
        setInsights(prev => prev.map(insight => 
          insight.title === insightId ? { ...insight, status } : insight
        ));
      }
    } catch (error) {
      console.error('Error updating insight status:', error);
    }
  };

  const getInsightIcon = (type: TeamInsight['type']) => {
    switch (type) {
      case 'warm_introduction': return <Users className="h-5 w-5" />;
      case 'network_overlap': return <Network className="h-5 w-5" />;
      case 'collaboration_opportunity': return <Target className="h-5 w-5" />;
      case 'relationship_gap': return <AlertTriangle className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: TeamInsight['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getStatusIcon = (status: TeamInsight['status']) => {
    switch (status) {
      case 'new': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'reviewed': return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      case 'acted_upon': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'dismissed': return <X className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredInsights = insights.filter(insight => 
    filter === 'all' || insight.priority === filter
  );

  const newInsightsCount = insights.filter(i => i.status === 'new').length;
  const highPriorityCount = insights.filter(i => i.priority === 'high').length;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Team Insights
          </h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200">
        <div className="px-6 py-4 border-b border-red-200">
          <h3 className="text-lg font-semibold text-red-900 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Error Loading Team Insights
          </h3>
        </div>
        <div className="p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadTeamInsights}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Team Insights
              {newInsightsCount > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {newInsightsCount} new
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              AI-generated collaboration opportunities and team optimization suggestions
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {filteredInsights.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="mx-auto h-12 w-12 text-gray-300" />
            <h4 className="mt-2 text-sm font-medium text-gray-900">No insights found</h4>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? 'Check back later for new team collaboration opportunities'
                : `No ${filter} priority insights at the moment`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInsights.map((insight, index) => (
              <div 
                key={index}
                className={`border-l-4 rounded-lg p-4 ${getPriorityColor(insight.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getInsightIcon(insight.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                          insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {insight.priority}
                        </span>
                        <div className="flex items-center">
                          {getStatusIcon(insight.status)}
                          <span className="ml-1 text-xs text-gray-500 capitalize">
                            {insight.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Value:</span> {insight.potentialValue}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTimeAgo(insight.generatedAt)}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Suggested action:</span> {insight.suggestedAction}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {insight.status === 'new' && (
                            <>
                              <button
                                onClick={() => updateInsightStatus(insight.title, 'reviewed')}
                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                              >
                                Review
                              </button>
                              <button
                                onClick={() => updateInsightStatus(insight.title, 'dismissed')}
                                className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                          
                          {insight.status === 'reviewed' && (
                            <button
                              onClick={() => updateInsightStatus(insight.title, 'acted_upon')}
                              className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center"
                            >
                              Mark Complete <ArrowRight className="h-3 w-3 ml-1" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {insights.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              {highPriorityCount > 0 && (
                <span className="text-red-600 font-medium">
                  {highPriorityCount} high priority insights
                </span>
              )}
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              View All Insights →
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 