import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Calendar, 
  Users, 
  Mail, 
  Phone, 
  Target,
  ArrowRight,
  Sparkles,
  MapPin,
  Coffee,
  Briefcase,
  Clock,
  TrendingUp,
  X,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRelationshipInsights } from '@/hooks/useRelationshipInsights';
import { useGoogleIntegration } from '@/hooks/useGoogleIntegration';

interface ActionSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: () => void;
  icon: any;
  category: 'relationship' | 'productivity' | 'growth';
  isDismissible?: boolean;
  isLinkedInPreview?: boolean;
}

export const ActionSuggestions = () => {
  const navigate = useNavigate();
  const { isConnected, hasGmailAccess, hasCalendarAccess } = useGoogleIntegration();
  const { 
    insights, 
    loading, 
    error, 
    dismissInsight, 
    generateNewInsights, 
    syncCalendarData, 
    syncGmailData 
  } = useRelationshipInsights();
  const [suggestions, setSuggestions] = useState<ActionSuggestion[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    generateSuggestions();
  }, [insights, navigate]);

  const generateSuggestions = () => {
    // Convert relationship insights to action suggestions
    const insightSuggestions: ActionSuggestion[] = insights.map(insight => {
      let icon = Brain;
      let category: 'relationship' | 'productivity' | 'growth' = 'relationship';
      let action = () => navigate('/contacts');

      // Map insight types to appropriate icons and actions
      switch (insight.insight_type) {
        case 'meeting_prep':
          icon = Calendar;
          category = 'productivity';
          action = () => navigate('/meeting-prep');
          break;
        case 'follow_up':
        case 'email_response':
          icon = Mail;
          category = 'relationship';
          action = () => navigate(`/contacts${insight.contact_id ? `?contact=${insight.contact_id}` : ''}`);
          break;
        case 'linkedin_preview':
          icon = Coffee;
          category = 'growth';
          action = () => navigate('/gamification-dashboard'); // Show LinkedIn teaser
          break;
        default:
          icon = Users;
      }

      return {
        id: insight.id,
        title: insight.title,
        description: insight.description,
        priority: insight.priority,
        action,
        icon,
        category,
        isDismissible: true,
        isLinkedInPreview: insight.insight_type === 'linkedin_preview'
      };
    });

    // Add fallback suggestions if no insights available
    if (insightSuggestions.length === 0) {
      const fallbackSuggestions: ActionSuggestion[] = [
        {
          id: 'setup-google',
          title: 'Connect Google Calendar & Gmail',
          description: 'Enable smart insights by connecting your Google account',
          priority: 'high',
          action: () => navigate('/integrations'),
          icon: Users,
          category: 'productivity',
          isDismissible: false
        },
        {
          id: 'add-contacts',
          title: 'Add your first contacts',
          description: 'Import contacts to start building your network',
          priority: 'medium',
          action: () => navigate('/contacts'),
          icon: Users,
          category: 'relationship',
          isDismissible: false
        },
        {
          id: 'explore-oracle',
          title: 'Try the Oracle AI assistant',
          description: 'Ask questions about your relationships and opportunities',
          priority: 'low',
          action: () => navigate('/oracle'),
          icon: Brain,
          category: 'growth',
          isDismissible: false
        }
      ];

      setSuggestions(fallbackSuggestions);
    } else {
      // Sort by priority and take top 5
      const prioritized = insightSuggestions
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, 5);

      setSuggestions(prioritized);
    }
  };

  const handleDismiss = async (suggestion: ActionSuggestion) => {
    if (suggestion.isDismissible) {
      await dismissInsight(suggestion.id);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Sync data if Google is connected
      if (isConnected) {
        if (hasCalendarAccess) {
          await syncCalendarData();
        }
        if (hasGmailAccess) {
          await syncGmailData();
        }
      }
      
      // Generate new insights
      await generateNewInsights();
    } catch (error) {
      console.error('Error refreshing insights:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'relationship': return 'bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400 dark:border-blue-800';
      case 'productivity': return 'bg-green-500/10 text-green-700 border-green-200 dark:text-green-400 dark:border-green-800';
      case 'growth': return 'bg-purple-500/10 text-purple-700 border-purple-200 dark:text-purple-400 dark:border-purple-800';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50';
      case 'medium': return 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/50';
      case 'low': return 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50';
      default: return '';
    }
  };

  if (loading && suggestions.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Your AI Team's Daily Agenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Team's Daily Intelligence
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p className="executive-subtitle text-sm">
          {isConnected 
            ? "Real-time strategic insights from integrated data sources" 
            : "Connect Google for executive intelligence capabilities"
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {error}
          </div>
        )}
        
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <div
              key={suggestion.id}
              className={`metric-card p-5 cursor-pointer group relative transition-all duration-300 hover:shadow-executive ${getPriorityStyles(suggestion.priority)}`}
              onClick={suggestion.action}
            >
              {suggestion.isDismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss(suggestion);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              
              <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-3 rounded-xl executive-card-premium group-hover:shadow-soft transition-all">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                        {suggestion.title}
                        {suggestion.isLinkedInPreview && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Level 4 Preview
                          </Badge>
                        )}
                      </h4>
                      <Badge 
                        variant={suggestion.priority === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs ml-2 flex-shrink-0"
                      >
                        {suggestion.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.description}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs mt-2 ${getCategoryColor(suggestion.category)}`}
                    >
                      {suggestion.category}
                    </Badge>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1 group-hover:text-primary transition-colors" />
              </div>
            </div>
          );
        })}
        
        <div className="pt-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full"
            onClick={() => navigate('/oracle')}
          >
            <Brain className="h-4 w-4 mr-2" />
            Need different insights? Ask your AI team
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};