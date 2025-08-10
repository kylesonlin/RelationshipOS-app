import OpenAI from 'openai';
import { supabase } from './supabase';

// Vector Store for Relationship Intelligence
export class RelationshipVectorStore {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for vector operations');
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Generate embeddings for text using OpenAI
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  // Store relationship context with embedding
  async storeRelationshipContext(
    organizationId: string,
    contextKey: string,
    contextData: Record<string, unknown>,
    contextText: string
  ): Promise<void> {
    try {
      if (!supabase) {
        console.log('Supabase not configured, skipping relationship context storage');
        return;
      }

      const embedding = await this.generateEmbedding(contextText);
      
      const { error } = await supabase
        .from('intelligence_cache')
        .upsert({
          organization_id: organizationId,
          cache_key: contextKey,
          cache_type: 'relationship_context',
          query_embedding: embedding,
          cache_data: contextData,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error storing relationship context:', error);
      throw new Error('Failed to store relationship context');
    }
  }

  // Find similar relationship contexts using cosine similarity
  async findSimilarContexts(
    organizationId: string,
    queryText: string,
    limit: number = 5,
    threshold: number = 0.7
  ): Promise<Array<Record<string, unknown> & { similarity_score: number }>> {
    try {
      if (!supabase) {
        console.log('Supabase not configured, returning empty contexts');
        return [];
      }

      const queryEmbedding = await this.generateEmbedding(queryText);
      
      // Get all cached contexts for the organization
      const { data: contexts, error } = await supabase
        .from('intelligence_cache')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('cache_type', 'relationship_context')
        .not('query_embedding', 'is', null);

      if (error) throw error;

      // Calculate cosine similarity for each context
      const similarities = contexts?.map(context => {
        if (!context.query_embedding) return null;
        
        const similarity = this.cosineSimilarity(queryEmbedding, context.query_embedding);
        return {
          ...context,
          similarity_score: similarity
        };
      }).filter(item => item && item.similarity_score >= threshold)
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, limit) || [];

      return similarities;
    } catch (error) {
      console.error('Error finding similar contexts:', error);
      return [];
    }
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Get relationship intelligence context for Oracle
  async getRelationshipIntelligence(
    organizationId: string,
    query: string
  ): Promise<string> {
    try {
      const similarContexts = await this.findSimilarContexts(organizationId, query, 3, 0.6);
      
      if (similarContexts.length === 0) {
        return "No specific relationship context found. Providing general relationship intelligence.";
      }

      let contextSummary = "RELATIONSHIP CONTEXT:\n\n";
      
      similarContexts.forEach((context, index) => {
        const data = context.cache_data as Record<string, unknown>;
        contextSummary += `${index + 1}. ${(data.summary as string) || 'Relationship insight'}\n`;
        if (Array.isArray(data.key_points)) {
          contextSummary += `   Key Points: ${(data.key_points as string[]).join(', ')}\n`;
        }
        if (data.last_interaction) {
          contextSummary += `   Last Interaction: ${data.last_interaction as string}\n`;
        }
        contextSummary += `   Relevance: ${Math.round(context.similarity_score * 100)}%\n\n`;
      });

      return contextSummary;
    } catch (error) {
      console.error('Error getting relationship intelligence:', error);
      return "Unable to retrieve relationship context. Providing general analysis.";
    }
  }

  // Store Oracle query and response for learning
  async storeOracleInteraction(
    organizationId: string,
    userId: string,
    query: string,
    response: string,
    queryType: string = 'general'
  ): Promise<void> {
    try {
      // Generate embedding for future use
      await this.generateEmbedding(query);
      
      if (!supabase) {
        console.log('Supabase not configured, skipping Oracle interaction storage');
        return;
      }

      // Store in oracle_queries table
      const { error: oracleError } = await supabase
        .from('oracle_queries')
        .insert({
          organization_id: organizationId,
          user_id: userId,
          query_text: query,
          response_text: response,
          query_type: queryType,
          model_used: 'gpt-4-turbo-preview',
        });

      if (oracleError) throw oracleError;

      // Store query context for future similarity matching
      const contextKey = `oracle_query_${Date.now()}`;
      await this.storeRelationshipContext(
        organizationId,
        contextKey,
        {
          query,
          response,
          query_type: queryType,
          summary: `Oracle query about ${queryType}`,
          key_points: [query.substring(0, 100)],
          timestamp: new Date().toISOString()
        },
        query
      );

    } catch (error) {
      console.error('Error storing Oracle interaction:', error);
      // Don't throw - this is analytics, shouldn't break the main flow
    }
  }
}

// Singleton instance
let vectorStore: RelationshipVectorStore | null = null;

export function getVectorStore(): RelationshipVectorStore {
  if (!vectorStore) {
    vectorStore = new RelationshipVectorStore();
  }
  return vectorStore;
} 