-- RelationshipOS Initial Database Schema
-- Relationship-centric design for AI Virtual Assistant

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Organizations table (CRITICAL MISSING COMPONENT)
CREATE TABLE organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    industry VARCHAR(100),
    size_category VARCHAR(50), -- startup, small, medium, large, enterprise
    description TEXT,
    website_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table (updated for multi-tenant support)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(100), -- admin, user, viewer
    avatar_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- People table (enhanced for relationship intelligence)
CREATE TABLE people (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Basic Information
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    title VARCHAR(255),
    company VARCHAR(255),
    
    -- Professional Details
    industry VARCHAR(100),
    seniority_level VARCHAR(50), -- junior, mid, senior, executive, c-level
    department VARCHAR(100),
    
    -- Social & Contact Info
    linkedin_url VARCHAR(500),
    twitter_url VARCHAR(500),
    website_url VARCHAR(500),
    location VARCHAR(255),
    
    -- Relationship Intelligence Fields
    relationship_strength INTEGER CHECK (relationship_strength >= 1 AND relationship_strength <= 10),
    last_interaction_date DATE,
    interaction_frequency VARCHAR(50), -- daily, weekly, monthly, quarterly, rarely
    communication_preferences JSONB DEFAULT '{}',
    notes TEXT,
    tags TEXT[],
    
    -- AI Enhancement Fields
    personality_profile JSONB DEFAULT '{}',
    interests TEXT[],
    mutual_connections INTEGER DEFAULT 0,
    influence_score INTEGER CHECK (influence_score >= 1 AND influence_score <= 100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Relationships table (enhanced for Oracle intelligence)
CREATE TABLE relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    person_id UUID REFERENCES people(id) ON DELETE CASCADE,
    
    -- Relationship Classification
    relationship_type VARCHAR(100) NOT NULL, -- colleague, client, prospect, partner, mentor, etc.
    relationship_status VARCHAR(50) DEFAULT 'active', -- active, dormant, ended
    priority_level VARCHAR(50) DEFAULT 'medium', -- high, medium, low
    
    -- Interaction Tracking
    first_met_date DATE,
    last_contact_date DATE,
    next_follow_up_date DATE,
    total_interactions INTEGER DEFAULT 0,
    
    -- Business Context
    business_value VARCHAR(50), -- high, medium, low
    deal_potential DECIMAL(12,2),
    collaboration_history TEXT,
    mutual_interests TEXT[],
    
    -- Oracle Intelligence Fields
    relationship_health_score INTEGER CHECK (relationship_health_score >= 1 AND relationship_health_score <= 100),
    engagement_trend VARCHAR(50), -- improving, stable, declining
    recommended_actions TEXT[],
    ai_insights JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, person_id)
);

-- Oracle queries table (enhanced for learning)
CREATE TABLE oracle_queries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    query_text TEXT NOT NULL,
    response_text TEXT,
    query_type VARCHAR(100), -- relationship_analysis, networking_opportunity, follow_up_strategy
    
    -- Performance Tracking
    response_time_ms INTEGER,
    model_used VARCHAR(100),
    tokens_used INTEGER,
    
    -- Context and Learning
    context_data JSONB DEFAULT '{}',
    user_feedback INTEGER CHECK (user_feedback >= 1 AND user_feedback <= 5),
    was_helpful BOOLEAN,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Intelligence cache table (enhanced for vector similarity)
CREATE TABLE intelligence_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    cache_type VARCHAR(100) NOT NULL, -- relationship_analysis, person_insights, network_mapping
    
    -- Vector Storage Preparation (for Pinecone integration)
    query_embedding VECTOR(1536), -- OpenAI embedding dimension
    similarity_threshold DECIMAL(4,3) DEFAULT 0.8,
    
    cache_data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    hit_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_organizations_domain ON organizations(domain);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_people_organization ON people(organization_id);
CREATE INDEX idx_people_name ON people(first_name, last_name);
CREATE INDEX idx_people_company ON people(company);
CREATE INDEX idx_people_relationship_strength ON people(relationship_strength);
CREATE INDEX idx_relationships_user_person ON relationships(user_id, person_id);
CREATE INDEX idx_relationships_organization ON relationships(organization_id);
CREATE INDEX idx_relationships_type ON relationships(relationship_type);
CREATE INDEX idx_relationships_health_score ON relationships(relationship_health_score);
CREATE INDEX idx_oracle_queries_user ON oracle_queries(user_id);
CREATE INDEX idx_oracle_queries_organization ON oracle_queries(organization_id);
CREATE INDEX idx_oracle_queries_type ON oracle_queries(query_type);
CREATE INDEX idx_intelligence_cache_key ON intelligence_cache(cache_key);
CREATE INDEX idx_intelligence_cache_type ON intelligence_cache(cache_type);

-- Updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON people
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relationships_updated_at BEFORE UPDATE ON relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intelligence_cache_updated_at BEFORE UPDATE ON intelligence_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) for multi-tenant isolation
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their organization's data)
CREATE POLICY "Users can view their organization" ON organizations
    FOR ALL USING (id = (SELECT organization_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Users can view their organization users" ON users
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Users can manage their organization people" ON people
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Users can manage their organization relationships" ON relationships
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Users can access their organization oracle queries" ON oracle_queries
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY "Users can access their organization cache" ON intelligence_cache
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE users.id = auth.uid())); 