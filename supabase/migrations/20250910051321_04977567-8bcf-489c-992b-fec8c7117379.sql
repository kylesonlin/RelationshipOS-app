-- Performance optimization: Add database indexes for frequently queried fields

-- Index for contacts table (frequently filtered by userId)
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts("userId");
CREATE INDEX IF NOT EXISTS idx_contacts_updated_at ON contacts(updated_at);
CREATE INDEX IF NOT EXISTS idx_contacts_user_updated ON contacts("userId", updated_at);

-- Index for tasks table 
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks("userId");
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks("userId", status);

-- Index for calendar_events table (filtered by user and date ranges)
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_time ON calendar_events(user_id, start_time);

-- Index for user_gamification (primary lookup table)
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON user_gamification(user_id);

-- Index for subscribers table
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON subscribers(user_id);

-- Index for user_google_tokens (auth lookup)
CREATE INDEX IF NOT EXISTS idx_user_google_tokens_user_id ON user_google_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_google_tokens_expires ON user_google_tokens(expires_at);

-- Index for email_interactions (analytics queries)
CREATE INDEX IF NOT EXISTS idx_email_interactions_user_id ON email_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_email_interactions_sent_at ON email_interactions(sent_at);

-- Index for contact_activities (relationship tracking)
CREATE INDEX IF NOT EXISTS idx_contact_activities_user_id ON contact_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_activities_contact_id ON contact_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_activities_date ON contact_activities(activity_date);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_contacts_user_company ON contacts("userId", company) WHERE company IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON tasks("userId", due_date) WHERE due_date IS NOT NULL;