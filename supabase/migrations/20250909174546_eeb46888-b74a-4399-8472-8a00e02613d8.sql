-- Create enhanced tables for Google Calendar and Gmail intelligence

-- Calendar events table for meeting tracking
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  attendees JSONB DEFAULT '[]'::jsonb,
  location TEXT,
  meeting_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Email interactions table enhancement (if not exists)
CREATE TABLE IF NOT EXISTS public.email_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID,
  email_id TEXT NOT NULL UNIQUE,
  subject TEXT,
  snippet TEXT,
  direction TEXT CHECK (direction IN ('sent', 'received')),
  sent_at TIMESTAMP WITH TIME ZONE,
  thread_id TEXT,
  sentiment_score DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI-generated relationship insights table
CREATE TABLE IF NOT EXISTS public.relationship_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID,
  insight_type TEXT NOT NULL, -- 'follow_up', 'meeting_prep', 'birthday', 'promotion', 'location_visit', etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  action_data JSONB DEFAULT '{}'::jsonb, -- store action-specific data
  is_dismissed BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contact activity tracking for stale relationship detection
CREATE TABLE IF NOT EXISTS public.contact_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'email', 'meeting', 'call', 'manual'
  activity_date TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calendar_events
CREATE POLICY "Users can view their own calendar events" 
ON public.calendar_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar events" 
ON public.calendar_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events" 
ON public.calendar_events 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events" 
ON public.calendar_events 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for email_interactions
CREATE POLICY "Users can view their own email interactions" 
ON public.email_interactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email interactions" 
ON public.email_interactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email interactions" 
ON public.email_interactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for relationship_insights
CREATE POLICY "Users can view their own relationship insights" 
ON public.relationship_insights 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own relationship insights" 
ON public.relationship_insights 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own relationship insights" 
ON public.relationship_insights 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own relationship insights" 
ON public.relationship_insights 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for contact_activities
CREATE POLICY "Users can view their own contact activities" 
ON public.contact_activities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contact activities" 
ON public.contact_activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact activities" 
ON public.contact_activities 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_start_time ON public.calendar_events(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_email_interactions_user_sent_at ON public.email_interactions(user_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_relationship_insights_user_priority ON public.relationship_insights(user_id, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_contact_activities_user_contact_date ON public.contact_activities(user_id, contact_id, activity_date);

-- Create updated_at triggers
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_interactions_updated_at
BEFORE UPDATE ON public.email_interactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_relationship_insights_updated_at
BEFORE UPDATE ON public.relationship_insights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();