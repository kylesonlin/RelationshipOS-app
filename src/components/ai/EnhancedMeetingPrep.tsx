import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Users,
  Brain,
  Target,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  AlertTriangle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

interface MeetingPrepData {
  summary: string;
  attendeeProfiles: Array<{
    id: string;
    name: string;
    email: string;
    company?: string;
    title?: string;
    relationshipStrength?: number;
    recentTopics?: string[];
    sentimentTrend?: number;
  }>;
  suggestedTalkingPoints: string[];
  potentialChallenges: string[];
  strategicOpportunities: string[];
  conversationStarters: string[];
  followUpActions: string[];
  confidenceScore: number;
}

interface EnhancedMeetingPrepProps {
  meetingId?: string;
  attendeeEmails?: string[];
  meetingTitle?: string;
  meetingDate?: string;
  onPrepComplete?: (prepData: MeetingPrepData) => void;
}

export const EnhancedMeetingPrep = ({
  meetingId,
  attendeeEmails,
  meetingTitle,
  meetingDate,
  onPrepComplete
}: EnhancedMeetingPrepProps) => {
  const [prepData, setPrepData] = useState<MeetingPrepData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const generateMeetingPrep = async () => {
    if (!meetingId && (!attendeeEmails || attendeeEmails.length === 0)) {
      toast({
        title: "Missing Information",
        description: "Please provide either a meeting ID or attendee emails",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-meeting-prep', {
        body: {
          meetingId,
          attendeeEmails,
          meetingTitle,
          meetingDate
        }
      });

      if (error) throw error;

      setPrepData(data.meetingPrep);
      onPrepComplete?.(data.meetingPrep);

      toast({
        title: "Meeting Prep Complete",
        description: `Generated insights for ${data.attendeeCount} attendees`,
      });

    } catch (error) {
      console.error('Error generating meeting prep:', error);
      
      // Fallback demo data
      const demoPrep: MeetingPrepData = {
        summary: `Strategic preparation for "${meetingTitle || 'Meeting'}" with comprehensive attendee analysis and relationship intelligence.`,
        attendeeProfiles: (attendeeEmails || ['example@company.com']).map((email, index) => ({
          id: `demo-${index}`,
          name: `Contact ${index + 1}`,
          email,
          company: 'Example Corp',
          title: 'Director',
          relationshipStrength: 7,
          recentTopics: ['quarterly planning', 'project updates'],
          sentimentTrend: 0.3
        })),
        suggestedTalkingPoints: [
          'Reference previous conversations about quarterly goals',
          'Discuss recent industry developments and their impact',
          'Address any concerns raised in recent communications',
          'Explore opportunities for strategic collaboration'
        ],
        potentialChallenges: [
          'Different communication styles may require adaptation',
          'Competing priorities could limit follow-up availability',
          'Technical complexity might need simplified explanations'
        ],
        strategicOpportunities: [
          'Strengthen relationship foundation through active listening',
          'Position as valuable resource and industry connector',
          'Identify potential partnership or collaboration areas'
        ],
        conversationStarters: [
          'How has your team been adapting to recent market changes?',
          'What are your biggest priorities for the next quarter?',
          'I saw your recent update about the product launch - how did it go?'
        ],
        followUpActions: [
          'Send meeting recap within 24 hours with key takeaways',
          'Schedule follow-up meetings for specific action items',
          'Make relevant introductions mentioned during meeting',
          'Share promised resources or industry insights'
        ],
        confidenceScore: 85
      };

      setPrepData(demoPrep);
      
      toast({
        title: "Demo Meeting Prep",
        description: "Generated sample preparation - connect integrations for real data",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getRelationshipColor = (strength?: number) => {
    if (!strength) return 'bg-gray-500';
    if (strength >= 8) return 'bg-green-500';
    if (strength >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSentimentIcon = (sentiment?: number) => {
    if (!sentiment) return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    if (sentiment > 0.2) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (sentiment < -0.2) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    return <div className="w-2 h-2 bg-yellow-400 rounded-full" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>AI Meeting Preparation</CardTitle>
                <CardDescription>
                  {meetingTitle || 'Meeting'} - {attendeeEmails?.length || 0} attendees
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={generateMeetingPrep}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Generate Prep
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Meeting Prep Results */}
      {prepData && (
        <div className="space-y-6">
          {/* Confidence Score */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Preparation Confidence</p>
                    <p className="text-sm text-muted-foreground">Based on relationship data quality</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={prepData.confidenceScore > 80 ? 'default' : 'secondary'} className="text-lg px-3 py-1">
                    {prepData.confidenceScore}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="attendees">Attendees</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
              <TabsTrigger value="conversation">Conversation</TabsTrigger>
              <TabsTrigger value="followup">Follow-up</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Meeting Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{prepData.summary}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Key Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {prepData.strategicOpportunities.slice(0, 3).map((opportunity, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Potential Challenges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {prepData.potentialChallenges.slice(0, 3).map((challenge, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="attendees" className="space-y-4">
              {prepData.attendeeProfiles.map((attendee, index) => (
                <Card key={attendee.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{attendee.name}</CardTitle>
                        <CardDescription>
                          {attendee.title} at {attendee.company}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Relationship:</span>
                          <div className={`w-3 h-3 rounded-full ${getRelationshipColor(attendee.relationshipStrength)}`} />
                          <span className="text-sm font-medium">{attendee.relationshipStrength}/10</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Sentiment:</span>
                          {getSentimentIcon(attendee.sentimentTrend)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Recent Topics:</p>
                        <div className="flex flex-wrap gap-2">
                          {attendee.recentTopics?.map((topic, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          )) || <span className="text-sm text-muted-foreground">No recent topics</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="strategy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Strategic Talking Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {prepData.suggestedTalkingPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary text-xs font-bold">{index + 1}</span>
                        </div>
                        <span className="text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conversation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Conversation Starters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prepData.conversationStarters.map((starter, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium mb-1">Option {index + 1}:</p>
                        <p className="text-sm text-muted-foreground">"{starter}"</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="followup" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Follow-up Action Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {prepData.followUpActions.map((action, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <span className="text-sm">{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};