import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  TrendingUp,
  Users,
  Calendar,
  MessageSquare,
  Target,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

interface SmartInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  priority: string;
  action_data: any;
  created_at: string;
  expires_at?: string;
  contact_id?: string;
}

interface AIAnalytics {
  totalInsights: number;
  actionableInsights: number;
  relationshipHealth: number;
  opportunityScore: number;
  lastAnalysis: string;
}

export const SmartInsightsWidget = () => {
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInsights();
    fetchAnalytics();
  }, []);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('relationship_insights')
        .select('*')
        .eq('is_dismissed', false)
        .gte('expires_at', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Calculate analytics from insights data
      const { data: allInsights } = await supabase
        .from('relationship_insights')
        .select('insight_type, priority, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (allInsights) {
        const actionableCount = allInsights.filter(i => i.priority === 'high').length;
        const opportunityInsights = allInsights.filter(i => 
          i.insight_type.includes('opportunity') || i.insight_type.includes('introduction')
        ).length;

        setAnalytics({
          totalInsights: allInsights.length,
          actionableInsights: actionableCount,
          relationshipHealth: Math.min(100, 60 + (actionableCount * 5)),
          opportunityScore: Math.min(100, 40 + (opportunityInsights * 10)),
          lastAnalysis: allInsights[0]?.created_at || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const generateInsights = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-insights');
      
      if (error) throw error;

      toast({
        title: "AI Analysis Complete",
        description: `Generated ${data.insights_generated} new insights`,
      });

      await fetchInsights();
      await fetchAnalytics();
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not generate insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const dismissInsight = async (id: string) => {
    try {
      await supabase
        .from('relationship_insights')
        .update({ is_dismissed: true })
        .eq('id', id);

      setInsights(prev => prev.filter(insight => insight.id !== id));
      
      toast({
        title: "Insight Dismissed",
        description: "The insight has been marked as completed",
      });
    } catch (error) {
      console.error('Error dismissing insight:', error);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'meeting_prep': return Calendar;
      case 'follow_up': return Users;
      case 'email_response': return MessageSquare;
      case 'relationship_health': return TrendingUp;
      case 'positive_momentum': return Sparkles;
      case 'warm_introduction': return Users;
      case 'opportunity': return Target;
      default: return Brain;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Smart Insights</CardTitle>
              <CardDescription>AI-powered relationship intelligence</CardDescription>
            </div>
          </div>
          <Button
            onClick={generateInsights}
            disabled={isGenerating}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Analyze
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* AI Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Relationship Health</span>
                <span className="text-sm font-medium">{analytics.relationshipHealth}%</span>
              </div>
              <Progress value={analytics.relationshipHealth} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Opportunity Score</span>
                <span className="text-sm font-medium">{analytics.opportunityScore}%</span>
              </div>
              <Progress value={analytics.opportunityScore} className="h-2" />
            </div>
          </div>
        )}

        {/* Active Insights */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : insights.length > 0 ? (
            insights.map((insight) => {
              const IconComponent = getInsightIcon(insight.insight_type);
              return (
                <div
                  key={insight.id}
                  className="p-3 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium truncate">{insight.title}</h4>
                        <Badge variant={getPriorityColor(insight.priority)} className="text-xs">
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {insight.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(insight.created_at)}
                        </span>
                        <Button
                          onClick={() => dismissInsight(insight.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Done
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No active insights</p>
              <p className="text-xs">Generate analysis to see AI recommendations</p>
            </div>
          )}
        </div>

        {/* Analytics Summary */}
        {analytics && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{analytics.totalInsights} insights this month</span>
              <span>{analytics.actionableInsights} high priority</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};