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
  TrendingUp
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
    // Generate intelligent, data-driven suggestions
    const generateSuggestions = () => {
      const currentHour = new Date().getHours();
      const currentDay = new Date().getDay();
      const isBusinessHours = currentHour >= 9 && currentHour <= 17;
      const isWeekend = currentDay === 0 || currentDay === 6;
      
      // Simulate realistic business intelligence
      const allSuggestions: ActionSuggestion[] = [
        {
          id: 'coffee-meeting',
          title: 'Sarah Chen from Acme Corp visiting SF',
          description: 'She\'s in town next week - perfect opportunity for coffee',
          priority: 'high',
          action: () => navigate('/contacts?search=sarah'),
          icon: Coffee,
          category: 'relationship'
        },
        {
          id: 'warm-intro',
          title: 'Intro Michael to Lisa for partnership',
          description: 'Both working on AI solutions - high synergy potential',
          priority: 'high',
          action: () => navigate('/contacts'),
          icon: Users,
          category: 'relationship'
        },
        {
          id: 'follow-up-proposal',
          title: 'Follow up on TechCorp proposal',
          description: 'Sent 5 days ago, optimal time for gentle follow-up',
          priority: 'high',
          action: () => navigate('/follow-up-automation'),
          icon: Mail,
          category: 'relationship'
        },
        {
          id: 'birthday-outreach',
          title: '3 connections have birthdays this week',
          description: 'Perfect excuse to reconnect with warm contacts',
          priority: 'medium',
          action: () => navigate('/contacts?filter=birthdays'),
          icon: Target,
          category: 'relationship'
        },
        {
          id: 'linkedin-activity',
          title: 'Tom Martinez got promoted to VP',
          description: 'Congratulate and explore new opportunities',
          priority: 'medium',
          action: () => navigate('/contacts?search=tom'),
          icon: TrendingUp,
          category: 'relationship'
        },
        {
          id: 'meeting-prep',
          title: 'Prep for investor call tomorrow',
          description: 'Research attendees and prepare talking points',
          priority: isBusinessHours ? 'high' : 'medium',
          action: () => navigate('/meeting-prep'),
          icon: Calendar,
          category: 'productivity'
        },
        {
          id: 'location-based',
          title: '2 contacts in Austin this week',
          description: 'David & Jennifer both traveling - coordinate meetup',
          priority: 'medium',
          action: () => navigate('/contacts?filter=location'),
          icon: MapPin,
          category: 'relationship'
        },
        {
          id: 'industry-sync',
          title: 'Connect with 3 fintech founders',
          description: 'All launching similar products - knowledge sharing opportunity',
          priority: 'medium',
          action: () => navigate('/contacts?filter=industry'),
          icon: Briefcase,
          category: 'growth'
        }
      ];

      // Smart prioritization based on context
      let contextualSuggestions = allSuggestions;
      
      if (isWeekend) {
        // Weekend: focus on relationship building over productivity
        contextualSuggestions = contextualSuggestions.filter(s => s.category !== 'productivity');
      }
      
      if (currentHour < 9) {
        // Early morning: prep and planning
        contextualSuggestions = contextualSuggestions.filter(s => 
          s.category === 'productivity' || s.id === 'meeting-prep'
        );
      }

      // Prioritize and limit to top 4-5 suggestions
      const prioritized = contextualSuggestions
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, 5);

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
          Your AI Team's Daily Agenda
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Proactive recommendations based on your network activity
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <div
              key={suggestion.id}
              className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer group ${getPriorityStyles(suggestion.priority)}`}
              onClick={suggestion.action}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                        {suggestion.title}
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