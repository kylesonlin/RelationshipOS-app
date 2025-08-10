'use client'

import { useState, useEffect } from 'react';
import { 
  Calendar,
  Clock, 
  Users, 
  MapPin,
  ExternalLink,
  TrendingUp,
  MessageCircle,
  FileText,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Target,
  Briefcase,
  Heart,
  Loader2
} from 'lucide-react';

interface MeetingPrepProps {
  eventId: string;
  onContextLoaded?: (context: MeetingContext) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingUrl?: string;
  attendees: Array<{
    email: string;
    name?: string;
    responseStatus: string;
    organizer?: boolean;
  }>;
}

interface RelationshipHistory {
  attendeeEmail: string;
  lastMeeting?: {
    date: string;
    title: string;
    outcome?: string;
  };
  totalMeetings: number;
  avgMeetingFrequency: string;
  relationshipTrend: 'improving' | 'stable' | 'declining';
}

interface MeetingContext {
  eventId: string;
  title: string;
  attendees: Array<{
    email: string;
    name?: string;
    responseStatus: string;
    organizer?: boolean;
  }>;
  relationshipHistory: RelationshipHistory[];
  meetingPrep: {
    keyTopics: string[];
    lastInteractions: string[];
    mutualConnections: string[];
    companyUpdates: string[];
    suggestedTalkingPoints: string[];
  };
  aiInsights: {
    meetingImportance: number;
    relationshipHealth: Record<string, number>;
    recommendedOutcomes: string[];
    followUpSuggestions: string[];
  };
}

export default function MeetingPrep({ eventId, onContextLoaded }: MeetingPrepProps) {
  const [meetingContext, setMeetingContext] = useState<MeetingContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendees' | 'prep' | 'insights'>('overview');
  const [checklistItems, setChecklistItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadMeetingContext();
  }, [eventId]);

  const loadMeetingContext = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/integrations/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          generateContext: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMeetingContext(data.context);
        
        // Initialize checklist
        const initialChecklist: Record<string, boolean> = {};
        data.context.meetingPrep.suggestedTalkingPoints.forEach((point: string, index: number) => {
          initialChecklist[`talking_point_${index}`] = false;
        });
        data.context.aiInsights.followUpSuggestions.forEach((suggestion: string, index: number) => {
          initialChecklist[`follow_up_${index}`] = false;
        });
        setChecklistItems(initialChecklist);

        if (onContextLoaded) {
          onContextLoaded(data.context);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load meeting context');
      }
    } catch {
      setError('Network error loading meeting context');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChecklistItem = (key: string) => {
    setChecklistItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const formatMeetingTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    
    return {
      date: dateFormatter.format(start),
      time: `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`,
      duration: Math.round((end.getTime() - start.getTime()) / (1000 * 60))
    };
  };

  const getRelationshipHealthColor = (health: number): string => {
    if (health >= 8) return 'text-green-600 bg-green-100';
    if (health >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getImportanceIcon = (importance: number) => {
    if (importance >= 8) return <Target className="h-5 w-5 text-red-500" />;
    if (importance >= 6) return <Briefcase className="h-5 w-5 text-yellow-500" />;
    return <MessageCircle className="h-5 w-5 text-blue-500" />;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-lg text-gray-600">Generating AI meeting preparation...</span>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          Analyzing attendee relationships, recent interactions, and context...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-center text-red-600 mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">Error Loading Meeting Context</span>
        </div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadMeetingContext}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!meetingContext) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          No meeting context available for this event.
        </div>
      </div>
    );
  }

  const timeInfo = formatMeetingTime(
    meetingContext.attendees[0] ? new Date().toISOString() : new Date().toISOString(),
    meetingContext.attendees[0] ? new Date(Date.now() + 60 * 60 * 1000).toISOString() : new Date(Date.now() + 60 * 60 * 1000).toISOString()
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Calendar },
    { id: 'attendees', label: 'Attendees', icon: Users },
    { id: 'prep', label: 'Preparation', icon: Lightbulb },
    { id: 'insights', label: 'AI Insights', icon: TrendingUp }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {getImportanceIcon(meetingContext.aiInsights.meetingImportance)}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{meetingContext.title}</h2>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {timeInfo.date}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {timeInfo.time} ({timeInfo.duration}m)
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {meetingContext.attendees.length} attendees
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              meetingContext.aiInsights.meetingImportance >= 8 ? 'bg-red-100 text-red-800' :
              meetingContext.aiInsights.meetingImportance >= 6 ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {meetingContext.aiInsights.meetingImportance >= 8 ? 'High Priority' :
               meetingContext.aiInsights.meetingImportance >= 6 ? 'Medium Priority' : 'Standard'}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-900">{meetingContext.aiInsights.meetingImportance}/10</div>
                <div className="text-sm text-blue-700">Meeting Importance</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-900">
                  {Object.values(meetingContext.aiInsights.relationshipHealth).reduce((sum, health) => sum + health, 0) / Object.keys(meetingContext.aiInsights.relationshipHealth).length || 0}/10
                </div>
                <div className="text-sm text-green-700">Avg Relationship Health</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-900">{meetingContext.meetingPrep.suggestedTalkingPoints.length}</div>
                <div className="text-sm text-purple-700">Talking Points</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-900">{meetingContext.aiInsights.followUpSuggestions.length}</div>
                <div className="text-sm text-orange-700">Follow-up Actions</div>
              </div>
            </div>

            {/* Key Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Recent Interactions
                </h4>
                <ul className="space-y-2">
                  {meetingContext.meetingPrep.lastInteractions.map((interaction, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {interaction}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Company Updates
                </h4>
                <ul className="space-y-2">
                  {meetingContext.meetingPrep.companyUpdates.map((update, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {update}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendees' && (
          <div className="space-y-4">
            {meetingContext.attendees.map((attendee, index) => {
              const relationshipData = meetingContext.relationshipHistory.find(r => r.attendeeEmail === attendee.email);
              const relationshipHealth = meetingContext.aiInsights.relationshipHealth[attendee.email] || 5;

              return (
                <div key={attendee.email} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {(attendee.name || attendee.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{attendee.name || attendee.email}</div>
                        <div className="text-sm text-gray-600">{attendee.email}</div>
                      </div>
                      {attendee.organizer && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Organizer</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelationshipHealthColor(relationshipHealth)}`}>
                        Health: {relationshipHealth}/10
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        attendee.responseStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                        attendee.responseStatus === 'tentative' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {attendee.responseStatus}
                      </span>
                    </div>
                  </div>

                  {relationshipData && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Meetings:</span>
                        <span className="ml-2 font-medium">{relationshipData.totalMeetings}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Frequency:</span>
                        <span className="ml-2 font-medium">{relationshipData.avgMeetingFrequency}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Trend:</span>
                        <span className={`ml-2 font-medium ${
                          relationshipData.relationshipTrend === 'improving' ? 'text-green-600' :
                          relationshipData.relationshipTrend === 'declining' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {relationshipData.relationshipTrend}
                        </span>
                      </div>
                    </div>
                  )}

                  {relationshipData?.lastMeeting && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm">
                        <span className="text-gray-600">Last Meeting:</span>
                        <span className="ml-2 font-medium">{relationshipData.lastMeeting.title}</span>
                        <span className="ml-2 text-gray-500">
                          ({new Date(relationshipData.lastMeeting.date).toLocaleDateString()})
                        </span>
                      </div>
                      {relationshipData.lastMeeting.outcome && (
                        <div className="text-sm text-gray-700 mt-1">
                          Outcome: {relationshipData.lastMeeting.outcome}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'prep' && (
          <div className="space-y-6">
            {/* Talking Points Checklist */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Suggested Talking Points
              </h4>
              <div className="space-y-3">
                {meetingContext.meetingPrep.suggestedTalkingPoints.map((point, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleChecklistItem(`talking_point_${index}`)}
                      className={`mt-0.5 h-5 w-5 rounded flex items-center justify-center border-2 ${
                        checklistItems[`talking_point_${index}`]
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-blue-300 hover:border-blue-500'
                      }`}
                    >
                      {checklistItems[`talking_point_${index}`] && <CheckCircle className="h-3 w-3" />}
                    </button>
                    <span className={`text-sm ${
                      checklistItems[`talking_point_${index}`] ? 'line-through text-gray-500' : 'text-blue-900'
                    }`}>
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Topics */}
            <div className="bg-green-50 rounded-lg p-6">
              <h4 className="font-semibold text-green-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Key Topics to Cover
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {meetingContext.meetingPrep.keyTopics.map((topic, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    <span className="text-sm text-green-900">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mutual Connections */}
            {meetingContext.meetingPrep.mutualConnections.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-6">
                <h4 className="font-semibold text-purple-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Mutual Connections
                </h4>
                <div className="space-y-2">
                  {meetingContext.meetingPrep.mutualConnections.map((connection, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                      <span className="text-sm text-purple-900">{connection}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* Recommended Outcomes */}
            <div className="bg-orange-50 rounded-lg p-6">
              <h4 className="font-semibold text-orange-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Recommended Meeting Outcomes
              </h4>
              <div className="space-y-3">
                {meetingContext.aiInsights.recommendedOutcomes.map((outcome, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-sm text-orange-900">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up Actions */}
            <div className="bg-red-50 rounded-lg p-6">
              <h4 className="font-semibold text-red-900 mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Post-Meeting Follow-up Actions
              </h4>
              <div className="space-y-3">
                {meetingContext.aiInsights.followUpSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleChecklistItem(`follow_up_${index}`)}
                      className={`mt-0.5 h-5 w-5 rounded flex items-center justify-center border-2 ${
                        checklistItems[`follow_up_${index}`]
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'border-red-300 hover:border-red-500'
                      }`}
                    >
                      {checklistItems[`follow_up_${index}`] && <CheckCircle className="h-3 w-3" />}
                    </button>
                    <span className={`text-sm ${
                      checklistItems[`follow_up_${index}`] ? 'line-through text-gray-500' : 'text-red-900'
                    }`}>
                      {suggestion}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                AI Analysis Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Meeting Priority:</span>
                  <span className="ml-2 font-medium">{meetingContext.aiInsights.meetingImportance}/10</span>
                </div>
                <div>
                  <span className="text-gray-600">Preparation Time:</span>
                  <span className="ml-2 font-medium">
                    {meetingContext.aiInsights.meetingImportance >= 8 ? '30+ minutes' :
                     meetingContext.aiInsights.meetingImportance >= 6 ? '15-20 minutes' : '10-15 minutes'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Relationship Health:</span>
                  <span className="ml-2 font-medium">
                    {Object.values(meetingContext.aiInsights.relationshipHealth).every(h => h >= 7) ? 'Strong' :
                     Object.values(meetingContext.aiInsights.relationshipHealth).some(h => h < 5) ? 'Needs Attention' : 'Good'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Success Probability:</span>
                  <span className="ml-2 font-medium">
                    {meetingContext.aiInsights.meetingImportance >= 8 ? 'High' :
                     meetingContext.aiInsights.meetingImportance >= 6 ? 'Medium' : 'Standard'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 