// Production Database Service for RelationshipOS
// CRUD operations for people, relationships, and organizations

import { supabase } from './supabase';

// Database types
export interface Person {
  id: string;
  organizationId: string;
  createdBy: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
  company?: string;
  industry?: string;
  seniorityLevel?: 'entry' | 'mid' | 'senior' | 'executive' | 'c_level';
  department?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  location?: string;
  relationshipStrength?: number; // 1-10
  lastInteractionDate?: string;
  interactionFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'rarely';
  communicationPreferences: Record<string, unknown>;
  notes?: string;
  tags?: string[];
  personalityProfile: Record<string, unknown>;
  interests?: string[];
  mutualConnections?: number;
  influenceScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Relationship {
  id: string;
  organizationId: string;
  personId: string;
  userId: string;
  relationshipType: 'colleague' | 'client' | 'partner' | 'mentor' | 'investor' | 'friend' | 'family' | 'other';
  strengthScore: number; // 1-10 AI-calculated
  healthStatus: 'strong' | 'stable' | 'declining' | 'at_risk' | 'dormant';
  lastInteraction: string;
  interactionCount: number;
  interactionTypes: string[]; // ['email', 'meeting', 'linkedin', 'phone', 'text']
  contextNotes: string;
  priority: 'high' | 'medium' | 'low';
  followUpDate?: string;
  followUpNotes?: string;
  businessValue: 'high' | 'medium' | 'low' | 'unknown';
  collaborationHistory: Record<string, unknown>;
  meetingHistory: Array<{
    date: string;
    type: string;
    duration?: number;
    notes?: string;
    outcome?: string;
  }>;
  communicationHistory: Array<{
    date: string;
    type: string;
    direction: 'inbound' | 'outbound';
    subject?: string;
    summary?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface OracleQuery {
  id: string;
  organizationId: string;
  userId: string;
  query: string;
  queryType: 'search' | 'analysis' | 'prediction' | 'optimization' | 'insight';
  response: string;
  responseTime: number;
  fromCache: boolean;
  relatedPeople: string[]; // person IDs
  relatedRelationships: string[]; // relationship IDs
  confidence: number; // 0-100
  feedback?: 'helpful' | 'not_helpful' | 'partially_helpful';
  feedbackNotes?: string;
  createdAt: string;
}

export interface SearchFilters {
  query?: string;
  industry?: string;
  seniorityLevel?: string;
  relationshipStrength?: { min?: number; max?: number };
  lastInteractionDays?: number;
  tags?: string[];
  location?: string;
  relationshipType?: string;
  healthStatus?: string;
  priority?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'firstName' | 'lastName' | 'lastInteraction' | 'relationshipStrength' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Database service class
export class DatabaseService {
  private static instance: DatabaseService;
  
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // PEOPLE CRUD OPERATIONS

  // Create new person
  async createPerson(organizationId: string, createdBy: string, personData: Partial<Person>): Promise<Person> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const personId = `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const person = {
      id: personId,
      organization_id: organizationId,
      created_by: createdBy,
      first_name: personData.firstName || '',
      last_name: personData.lastName || '',
      email: personData.email,
      phone: personData.phone,
      title: personData.title,
      company: personData.company,
      industry: personData.industry,
      seniority_level: personData.seniorityLevel,
      department: personData.department,
      linkedin_url: personData.linkedinUrl,
      twitter_url: personData.twitterUrl,
      website_url: personData.websiteUrl,
      location: personData.location,
      relationship_strength: personData.relationshipStrength || 5,
      last_interaction_date: personData.lastInteractionDate,
      interaction_frequency: personData.interactionFrequency,
      communication_preferences: personData.communicationPreferences || {},
      notes: personData.notes,
      tags: personData.tags || [],
      personality_profile: personData.personalityProfile || {},
      interests: personData.interests || [],
      mutual_connections: personData.mutualConnections || 0,
      influence_score: personData.influenceScore || 0
    };

    try {
      const { data, error } = await supabase
        .from('people')
        .insert(person)
        .select()
        .single();

      if (error) throw error;

      return this.transformPersonFromDb(data);

    } catch (error) {
      console.error('Error creating person:', error);
      throw new Error('Failed to create person');
    }
  }

  // Get person by ID
  async getPerson(personId: string, organizationId: string): Promise<Person | null> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('id', personId)
        .eq('organization_id', organizationId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data ? this.transformPersonFromDb(data) : null;

    } catch (error) {
      console.error('Error fetching person:', error);
      throw new Error('Failed to fetch person');
    }
  }

  // Update person
  async updatePerson(personId: string, organizationId: string, updates: Partial<Person>): Promise<Person> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    // Map API fields to database fields
    if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
    if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.company !== undefined) updateData.company = updates.company;
    if (updates.industry !== undefined) updateData.industry = updates.industry;
    if (updates.seniorityLevel !== undefined) updateData.seniority_level = updates.seniorityLevel;
    if (updates.department !== undefined) updateData.department = updates.department;
    if (updates.linkedinUrl !== undefined) updateData.linkedin_url = updates.linkedinUrl;
    if (updates.twitterUrl !== undefined) updateData.twitter_url = updates.twitterUrl;
    if (updates.websiteUrl !== undefined) updateData.website_url = updates.websiteUrl;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.relationshipStrength !== undefined) updateData.relationship_strength = updates.relationshipStrength;
    if (updates.lastInteractionDate !== undefined) updateData.last_interaction_date = updates.lastInteractionDate;
    if (updates.interactionFrequency !== undefined) updateData.interaction_frequency = updates.interactionFrequency;
    if (updates.communicationPreferences !== undefined) updateData.communication_preferences = updates.communicationPreferences;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.personalityProfile !== undefined) updateData.personality_profile = updates.personalityProfile;
    if (updates.interests !== undefined) updateData.interests = updates.interests;
    if (updates.mutualConnections !== undefined) updateData.mutual_connections = updates.mutualConnections;
    if (updates.influenceScore !== undefined) updateData.influence_score = updates.influenceScore;

    try {
      const { data, error } = await supabase
        .from('people')
        .update(updateData)
        .eq('id', personId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) throw error;

      return this.transformPersonFromDb(data);

    } catch (error) {
      console.error('Error updating person:', error);
      throw new Error('Failed to update person');
    }
  }

  // Delete person
  async deletePerson(personId: string, organizationId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    try {
      // Also delete related relationships
      await supabase
        .from('relationships')
        .delete()
        .eq('person_id', personId)
        .eq('organization_id', organizationId);

      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', personId)
        .eq('organization_id', organizationId);

      if (error) throw error;

    } catch (error) {
      console.error('Error deleting person:', error);
      throw new Error('Failed to delete person');
    }
  }

  // Search people with filters
  async searchPeople(organizationId: string, filters: SearchFilters = {}): Promise<SearchResult<Person>> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const {
      query,
      industry,
      seniorityLevel,
      relationshipStrength,
      lastInteractionDays,
      tags,
      location,
      limit = 50,
      offset = 0,
      sortBy = 'firstName',
      sortOrder = 'asc'
    } = filters;

    try {
      let dbQuery = supabase
        .from('people')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId);

      // Apply filters
      if (query) {
        dbQuery = dbQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`);
      }

      if (industry) {
        dbQuery = dbQuery.eq('industry', industry);
      }

      if (seniorityLevel) {
        dbQuery = dbQuery.eq('seniority_level', seniorityLevel);
      }

      if (relationshipStrength) {
        if (relationshipStrength.min) {
          dbQuery = dbQuery.gte('relationship_strength', relationshipStrength.min);
        }
        if (relationshipStrength.max) {
          dbQuery = dbQuery.lte('relationship_strength', relationshipStrength.max);
        }
      }

      if (lastInteractionDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - lastInteractionDays);
        dbQuery = dbQuery.gte('last_interaction_date', cutoffDate.toISOString());
      }

      if (tags && tags.length > 0) {
        dbQuery = dbQuery.overlaps('tags', tags);
      }

      if (location) {
        dbQuery = dbQuery.ilike('location', `%${location}%`);
      }

      // Apply sorting
      const dbSortBy = this.mapSortField(sortBy);
      dbQuery = dbQuery.order(dbSortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      dbQuery = dbQuery.range(offset, offset + limit - 1);

      const { data, error, count } = await dbQuery;

      if (error) throw error;

      const people = data?.map(item => this.transformPersonFromDb(item)) || [];
      const total = count || 0;
      const page = Math.floor(offset / limit) + 1;
      const hasMore = offset + limit < total;

      return {
        data: people,
        total,
        page,
        pageSize: limit,
        hasMore
      };

    } catch (error) {
      console.error('Error searching people:', error);
      throw new Error('Failed to search people');
    }
  }

  // RELATIONSHIP CRUD OPERATIONS

  // Create relationship
  async createRelationship(organizationId: string, userId: string, relationshipData: Partial<Relationship>): Promise<Relationship> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const relationshipId = `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const relationship = {
      id: relationshipId,
      organization_id: organizationId,
      person_id: relationshipData.personId,
      user_id: userId,
      relationship_type: relationshipData.relationshipType || 'colleague',
      strength_score: relationshipData.strengthScore || 5,
      health_status: relationshipData.healthStatus || 'stable',
      last_interaction: relationshipData.lastInteraction || new Date().toISOString(),
      interaction_count: relationshipData.interactionCount || 0,
      interaction_types: relationshipData.interactionTypes || [],
      context_notes: relationshipData.contextNotes || '',
      priority: relationshipData.priority || 'medium',
      follow_up_date: relationshipData.followUpDate,
      follow_up_notes: relationshipData.followUpNotes,
      business_value: relationshipData.businessValue || 'unknown',
      collaboration_history: relationshipData.collaborationHistory || {},
      meeting_history: relationshipData.meetingHistory || [],
      communication_history: relationshipData.communicationHistory || []
    };

    try {
      const { data, error } = await supabase
        .from('relationships')
        .insert(relationship)
        .select()
        .single();

      if (error) throw error;

      return this.transformRelationshipFromDb(data);

    } catch (error) {
      console.error('Error creating relationship:', error);
      throw new Error('Failed to create relationship');
    }
  }

  // Get relationships for person
  async getPersonRelationships(personId: string, organizationId: string): Promise<Relationship[]> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    try {
      const { data, error } = await supabase
        .from('relationships')
        .select('*')
        .eq('person_id', personId)
        .eq('organization_id', organizationId)
        .order('last_interaction', { ascending: false });

      if (error) throw error;

      return data?.map(item => this.transformRelationshipFromDb(item)) || [];

    } catch (error) {
      console.error('Error fetching relationships:', error);
      throw new Error('Failed to fetch relationships');
    }
  }

  // ORACLE QUERY OPERATIONS

  // Store Oracle query
  async storeOracleQuery(
    organizationId: string,
    userId: string,
    queryData: {
      query: string;
      queryType: string;
      response: string;
      responseTime: number;
      fromCache: boolean;
      relatedPeople?: string[];
      relatedRelationships?: string[];
      confidence?: number;
    }
  ): Promise<OracleQuery> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    const queryId = `oracle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const oracleQuery = {
      id: queryId,
      organization_id: organizationId,
      user_id: userId,
      query: queryData.query,
      query_type: queryData.queryType,
      response: queryData.response,
      response_time: queryData.responseTime,
      from_cache: queryData.fromCache,
      related_people: queryData.relatedPeople || [],
      related_relationships: queryData.relatedRelationships || [],
      confidence: queryData.confidence || 80
    };

    try {
      const { data, error } = await supabase
        .from('oracle_queries')
        .insert(oracleQuery)
        .select()
        .single();

      if (error) throw error;

      return this.transformOracleQueryFromDb(data);

    } catch (error) {
      console.error('Error storing Oracle query:', error);
      throw new Error('Failed to store Oracle query');
    }
  }

  // Get Oracle query history
  async getOracleHistory(organizationId: string, userId?: string, limit: number = 50): Promise<OracleQuery[]> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    try {
      let query = supabase
        .from('oracle_queries')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(item => this.transformOracleQueryFromDb(item)) || [];

    } catch (error) {
      console.error('Error fetching Oracle history:', error);
      throw new Error('Failed to fetch Oracle history');
    }
  }

  // UTILITY METHODS

  private transformPersonFromDb(dbPerson: Record<string, unknown>): Person {
    return {
      id: dbPerson.id as string,
      organizationId: dbPerson.organization_id as string,
      createdBy: dbPerson.created_by as string,
      firstName: dbPerson.first_name as string,
      lastName: dbPerson.last_name as string,
      email: dbPerson.email as string | undefined,
      phone: dbPerson.phone as string | undefined,
      title: dbPerson.title as string | undefined,
      company: dbPerson.company as string | undefined,
      industry: dbPerson.industry as string | undefined,
      seniorityLevel: dbPerson.seniority_level,
      department: dbPerson.department,
      linkedinUrl: dbPerson.linkedin_url,
      twitterUrl: dbPerson.twitter_url,
      websiteUrl: dbPerson.website_url,
      location: dbPerson.location,
      relationshipStrength: dbPerson.relationship_strength,
      lastInteractionDate: dbPerson.last_interaction_date,
      interactionFrequency: dbPerson.interaction_frequency,
      communicationPreferences: dbPerson.communication_preferences || {},
      notes: dbPerson.notes,
      tags: dbPerson.tags || [],
      personalityProfile: dbPerson.personality_profile || {},
      interests: dbPerson.interests || [],
      mutualConnections: dbPerson.mutual_connections,
      influenceScore: dbPerson.influence_score,
      createdAt: dbPerson.created_at,
      updatedAt: dbPerson.updated_at
    };
  }

  private transformRelationshipFromDb(dbRelationship: any): Relationship {
    return {
      id: dbRelationship.id,
      organizationId: dbRelationship.organization_id,
      personId: dbRelationship.person_id,
      userId: dbRelationship.user_id,
      relationshipType: dbRelationship.relationship_type,
      strengthScore: dbRelationship.strength_score,
      healthStatus: dbRelationship.health_status,
      lastInteraction: dbRelationship.last_interaction,
      interactionCount: dbRelationship.interaction_count,
      interactionTypes: dbRelationship.interaction_types || [],
      contextNotes: dbRelationship.context_notes,
      priority: dbRelationship.priority,
      followUpDate: dbRelationship.follow_up_date,
      followUpNotes: dbRelationship.follow_up_notes,
      businessValue: dbRelationship.business_value,
      collaborationHistory: dbRelationship.collaboration_history || {},
      meetingHistory: dbRelationship.meeting_history || [],
      communicationHistory: dbRelationship.communication_history || [],
      createdAt: dbRelationship.created_at,
      updatedAt: dbRelationship.updated_at
    };
  }

  private transformOracleQueryFromDb(dbQuery: any): OracleQuery {
    return {
      id: dbQuery.id,
      organizationId: dbQuery.organization_id,
      userId: dbQuery.user_id,
      query: dbQuery.query,
      queryType: dbQuery.query_type,
      response: dbQuery.response,
      responseTime: dbQuery.response_time,
      fromCache: dbQuery.from_cache,
      relatedPeople: dbQuery.related_people || [],
      relatedRelationships: dbQuery.related_relationships || [],
      confidence: dbQuery.confidence,
      feedback: dbQuery.feedback,
      feedbackNotes: dbQuery.feedback_notes,
      createdAt: dbQuery.created_at
    };
  }

  private mapSortField(sortBy: string): string {
    const fieldMap: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      lastInteraction: 'last_interaction_date',
      relationshipStrength: 'relationship_strength',
      createdAt: 'created_at'
    };
    return fieldMap[sortBy] || 'first_name';
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();

// Utility functions
export function getFullName(person: Person): string {
  return `${person.firstName} ${person.lastName}`.trim();
}

export function getPersonDisplayTitle(person: Person): string {
  const parts = [];
  if (person.title) parts.push(person.title);
  if (person.company) parts.push(person.company);
  return parts.join(' at ') || 'No title specified';
}

export function getRelationshipHealthColor(status: string): string {
  const colors: Record<string, string> = {
    strong: 'text-green-600',
    stable: 'text-blue-600',
    declining: 'text-yellow-600',
    at_risk: 'text-orange-600',
    dormant: 'text-red-600'
  };
  return colors[status] || 'text-gray-600';
}

export function formatRelationshipStrength(strength: number): string {
  if (strength >= 9) return 'Excellent';
  if (strength >= 7) return 'Strong';
  if (strength >= 5) return 'Good';
  if (strength >= 3) return 'Developing';
  return 'Weak';
} 