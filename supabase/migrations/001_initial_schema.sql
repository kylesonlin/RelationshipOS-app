-- RelationshipOS Initial Database Schema
-- Relationship-centric design for AI Virtual Assistant

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  plan_type TEXT CHECK (plan_type IN ('personal', 'business', 'enterprise')) DEFAULT 'personal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- People table (contacts in professional network)
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  title TEXT,
  linkedin_url TEXT,
  relationship_strength INTEGER CHECK (relationship_strength >= 1 AND relationship_strength <= 10) DEFAULT 5,
  last_contact_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relationships table (connection metadata)
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  relationship_type TEXT CHECK (relationship_type IN ('colleague', 'client', 'partner', 'mentor', 'friend', 'other')) DEFAULT 'colleague',
  interaction_frequency INTEGER DEFAULT 0, -- interactions per month
  communication_channels TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['email', 'linkedin', 'phone', 'in-person']
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, person_id)
);

-- Oracle queries table (AI interaction history)
CREATE TABLE oracle_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  response_time_ms INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Intelligence cache table (performance optimization)
CREATE TABLE intelligence_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cache_key TEXT NOT NULL,
  cache_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, cache_key)
);

-- Indexes for performance optimization
CREATE INDEX idx_people_user_id ON people(user_id);
CREATE INDEX idx_people_email ON people(email);
CREATE INDEX idx_people_company ON people(company);
CREATE INDEX idx_people_relationship_strength ON people(relationship_strength DESC);
CREATE INDEX idx_people_last_contact ON people(last_contact_date DESC);

CREATE INDEX idx_relationships_user_id ON relationships(user_id);
CREATE INDEX idx_relationships_person_id ON relationships(person_id);
CREATE INDEX idx_relationships_type ON relationships(relationship_type);
CREATE INDEX idx_relationships_frequency ON relationships(interaction_frequency DESC);

CREATE INDEX idx_oracle_queries_user_id ON oracle_queries(user_id);
CREATE INDEX idx_oracle_queries_created_at ON oracle_queries(created_at DESC);
CREATE INDEX idx_oracle_queries_response_time ON oracle_queries(response_time_ms);

CREATE INDEX idx_intelligence_cache_user_id ON intelligence_cache(user_id);
CREATE INDEX idx_intelligence_cache_key ON intelligence_cache(cache_key);
CREATE INDEX idx_intelligence_cache_expires ON intelligence_cache(expires_at);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relationships_updated_at BEFORE UPDATE ON relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_cache ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own people" ON people
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own relationships" ON relationships
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own oracle queries" ON oracle_queries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own intelligence cache" ON intelligence_cache
  FOR ALL USING (auth.uid() = user_id); 