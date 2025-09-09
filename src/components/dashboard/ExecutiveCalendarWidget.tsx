import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Video,
  Plus,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isTomorrow, addDays } from 'date-fns';

interface CalendarEvent {
  id: string;
  summary: string;
  start_time: string;
  end_time: string;
  attendees: any[];
  location?: string;
  meeting_link?: string;
  description?: string;
}

export const ExecutiveCalendarWidget = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow' | 'upcoming'>('today');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCalendarEvents();
  }, [selectedDay]);

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      
      const startDate = new Date();
      let endDate = new Date();
      
      if (selectedDay === 'today') {
        endDate.setHours(23, 59, 59, 999);
      } else if (selectedDay === 'tomorrow') {
        startDate.setDate(startDate.getDate() + 1);
        endDate.setDate(endDate.getDate() + 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      } else {
        endDate = addDays(startDate, 7);
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: true })
        .limit(5);

      if (error) throw error;
      setEvents((data || []).map(event => ({
        ...event,
        attendees: Array.isArray(event.attendees) ? event.attendees : []
      })));
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  };

  const getTimeUntilEvent = (startTime: string) => {
    const now = new Date();
    const eventStart = new Date(startTime);
    const diffMs = eventStart.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours < 0) return "In progress";
    if (diffHours === 0 && diffMins <= 15) return "Starting soon";
    if (diffHours === 0) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h ${diffMins}m`;
    return format(eventStart, 'MMM d');
  };

  const getEventTypeIcon = (event: CalendarEvent) => {
    if (event.meeting_link) return <Video className="h-4 w-4" />;
    if (event.location) return <MapPin className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  const getEventPriority = (event: CalendarEvent) => {
    const attendeeCount = event.attendees?.length || 0;
    if (attendeeCount > 5) return 'high';
    if (attendeeCount > 2) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card className="executive-card h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Executive Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading calendar...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="executive-card h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Executive Calendar
        </CardTitle>
        
        {/* Day selector */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
          {[
            { key: 'today', label: 'Today' },
            { key: 'tomorrow', label: 'Tomorrow' },
            { key: 'upcoming', label: 'Week' }
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={selectedDay === key ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedDay(key as any)}
              className="flex-1 h-8 text-xs"
            >
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">No meetings {selectedDay}</p>
              <p className="text-xs text-muted-foreground">Perfect time for strategic focus</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/meeting-prep')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Schedule Meeting
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => {
              const priority = getEventPriority(event);
              const timeUntil = getTimeUntilEvent(event.start_time);
              
              return (
                <div key={event.id} className="space-y-3">
                  <div 
                    className="metric-card p-4 cursor-pointer hover:shadow-soft transition-all"
                    onClick={() => navigate('/meeting-prep')}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getEventTypeIcon(event)}
                        <h4 className="font-medium text-sm line-clamp-1">{event.summary}</h4>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(priority)}`}
                      >
                        {timeUntil}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatEventTime(event.start_time, event.end_time)}
                      </div>
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.attendees.length} attendees
                        </div>
                      )}
                    </div>

                    {(event.location || event.meeting_link) && (
                      <div className="mt-2 text-xs text-muted-foreground line-clamp-1">
                        {event.meeting_link ? 'Virtual meeting' : event.location}
                      </div>
                    )}
                  </div>
                  
                  {index < events.length - 1 && <Separator className="opacity-50" />}
                </div>
              );
            })}
            
            {events.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => navigate('/meeting-prep')}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Meeting Prep for All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <Separator />
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/integrations')}
            className="text-xs"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Sync Calendar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/analytics')}
            className="text-xs"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Meeting Insights
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};