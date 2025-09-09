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
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActionSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: () => void;
  icon: any;
  category: 'relationship' | 'productivity' | 'growth';
}

export const ActionSuggestions = () => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<ActionSuggestion[]>([]);

  useEffect(() => {
    // Simulate intelligent suggestions based on user behavior/data
    const generateSuggestions = () => {
      const currentHour = new Date().getHours();
      const isBusinessHours = currentHour >= 9 && currentHour <= 17;
      
      const allSuggestions: ActionSuggestion[] = [
        {
          id: 'follow-up-contacts',
          title: 'Follow up with 3 contacts',
          description: 'You have contacts that haven\'t been touched in 2+ weeks',
          priority: 'high',
          action: () => navigate('/contacts?filter=stale'),
          icon: Users,
          category: 'relationship'
        },
        {
          id: 'meeting-prep',
          title: 'Prepare for today\'s meetings',
          description: 'Review context for your 2 upcoming meetings',
          priority: isBusinessHours ? 'high' : 'medium',
          action: () => navigate('/meeting-prep'),
          icon: Calendar,
          category: 'productivity'
        },
        {
          id: 'oracle-insights',
          title: 'Get relationship insights',
          description: 'Ask Oracle about your top opportunities',
          priority: 'medium',
          action: () => navigate('/oracle'),
          icon: Brain,
          category: 'growth'
        },
        {
          id: 'quick-email',
          title: 'Send 5-minute check-ins',
          description: 'Quick touchpoints with warm connections',
          priority: 'medium',
          action: () => navigate('/follow-up-automation'),
          icon: Mail,
          category: 'relationship'
        }
      ];

      // Prioritize suggestions based on time and context
      const prioritized = allSuggestions
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, 3);

      setSuggestions(prioritized);
    };

    generateSuggestions();
  }, [navigate]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'relationship': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'productivity': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'growth': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50/50';
      case 'medium': return 'border-yellow-200 bg-yellow-50/50';
      case 'low': return 'border-green-200 bg-green-50/50';
      default: return '';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Smart Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <div
              key={suggestion.id}
              className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm cursor-pointer animate-fade-in ${getPriorityStyles(suggestion.priority)}`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={suggestion.action}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-foreground">
                        {suggestion.title}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getCategoryColor(suggestion.category)}`}
                      >
                        {suggestion.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-2" />
              </div>
            </div>
          );
        })}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-4"
          onClick={() => navigate('/oracle')}
        >
          <Brain className="h-4 w-4 mr-2" />
          Ask Oracle for more insights
        </Button>
      </CardContent>
    </Card>
  );
};