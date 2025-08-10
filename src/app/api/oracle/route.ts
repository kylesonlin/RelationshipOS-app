import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getVectorStore } from '@/lib/vector-store';
import { getRelationshipInsights, SAMPLE_ORG_ID, SAMPLE_USER_ID } from '@/lib/sample-data';
import { getCache } from '@/lib/cache';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Oracle Engine not configured. OpenAI API key required for full functionality.' },
        { status: 503 }
      );
    }

    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get high-performance cache instance
    const cache = getCache();

    // Use cached Oracle response wrapper for performance optimization
    const result = await cache.getCachedOracleResponse(
      query,
      SAMPLE_ORG_ID,
      async () => {
        // This function only runs on cache miss
        const relationshipContext = await getRelationshipInsights(query);
        
        // Initialize OpenAI client at runtime, not build time
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        
        // Enhanced Oracle AI System Prompt with relationship context
        const systemPrompt = `You are the Oracle Engine for RelationshipOS - an AI that provides revolutionary relationship intelligence for professionals.

You have access to real professional relationship data and must provide insights that are 10x better than human VAs.

RELATIONSHIP CONTEXT DATA:
${relationshipContext}

Your capabilities:
1. Instant relationship analysis based on real professional network data
2. Strategic relationship recommendations with specific actions
3. Predictive relationship health assessment with risk analysis
4. ROI-optimized networking strategy with time investment guidance
5. Contextual intelligence synthesis combining all available data

Response format requirements:
- Provide specific, actionable insights based on the relationship context
- Include names, companies, and concrete recommendations when relevant
- Quantify opportunities (deal values, timelines, probability scores)
- Identify relationship health risks with specific mitigation actions
- Suggest optimal timing and communication strategies
- Format as professional relationship intelligence report

If no specific relationship context is available, provide strategic networking framework that demonstrates superior intelligence.

Remember: You're replacing $5K/month human VAs - your insights must be faster, more comprehensive, and more actionable than any human could provide.`;

        // Call OpenAI GPT-4 Turbo for intelligent relationship analysis
        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: query }
          ],
          max_tokens: 800,
          temperature: 0.7,
        });

        const oracleResponse = completion.choices[0]?.message?.content;

        if (!oracleResponse) {
          throw new Error('Oracle failed to generate intelligence report');
        }

        return {
          response: oracleResponse,
          query: query,
          timestamp: new Date().toISOString(),
          model: "gpt-4-turbo-preview",
          relationshipContextUsed: relationshipContext !== "No specific relationship context found. Providing general relationship intelligence.",
          metadata: {
            tokensUsed: completion.usage?.total_tokens || 0,
            hasRelationshipData: relationshipContext.includes("RELATIONSHIP CONTEXT:"),
          }
        };
      }
    );

    // Store Oracle interaction for learning (async, don't await)
    if (!result.fromCache) {
      try {
        const vectorStore = getVectorStore();
        const responseData = result.data as {
          response: string;
          query: string;
        };
        vectorStore.storeOracleInteraction(
          SAMPLE_ORG_ID,
          SAMPLE_USER_ID,
          responseData.query,
          responseData.response,
          determineQueryType(query)
        ).catch(err => console.error('Failed to store Oracle interaction:', err));
      } catch (err) {
        console.error('Analytics error:', err);
      }
    }

    // Get cache statistics for monitoring
    const cacheStats = cache.getStats();
    
    // Add performance metadata
    const responseData = result.data as Record<string, unknown>;
    
    return NextResponse.json({
      ...responseData,
      performance: {
        responseTime: result.responseTime,
        fromCache: result.fromCache,
        cacheHitRate: Math.round(cacheStats.cacheHitRate * 100) / 100,
        averageResponseTime: Math.round(cacheStats.averageResponseTime),
        cacheSize: cacheStats.size,
        totalQueries: cacheStats.totalQueries
      },
      guarantee: {
        targetResponseTime: "< 10 seconds",
        achieved: result.responseTime < 10000,
        performanceLevel: result.responseTime < 2000 ? "excellent" : 
                         result.responseTime < 5000 ? "good" : 
                         result.responseTime < 10000 ? "acceptable" : "needs optimization"
      }
    });

  } catch (error) {
    console.error('Oracle Engine Error:', error);
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json(
      { 
        error: 'Oracle Engine encountered an error processing your request',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        performance: {
          responseTime: responseTime,
          fromCache: false,
          error: true
        },
        suggestion: "Try rephrasing your query or check that the system is properly configured."
      },
      { status: 500 }
    );
  }
}

// Determine query type for analytics
function determineQueryType(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('risk') || lowerQuery.includes('deteriorat') || lowerQuery.includes('danger')) {
    return 'risk_assessment';
  }
  if (lowerQuery.includes('opportunit') || lowerQuery.includes('network') || lowerQuery.includes('meet')) {
    return 'networking_opportunity';
  }
  if (lowerQuery.includes('optim') || lowerQuery.includes('roi') || lowerQuery.includes('strategy')) {
    return 'strategy_optimization';
  }
  if (lowerQuery.includes('health') || lowerQuery.includes('status') || lowerQuery.includes('relation')) {
    return 'relationship_analysis';
  }
  if (lowerQuery.includes('follow') || lowerQuery.includes('contact') || lowerQuery.includes('reach')) {
    return 'follow_up_strategy';
  }
  
  return 'general_intelligence';
}

// Cache statistics endpoint
export async function GET() {
  try {
    const cache = getCache();
    const stats = cache.getStats();
    
    return NextResponse.json({
      service: 'Oracle Engine',
      status: 'operational',
      performance: {
        cacheHitRate: `${Math.round(stats.cacheHitRate * 100) / 100}%`,
        averageResponseTime: `${Math.round(stats.averageResponseTime)}ms`,
        totalQueries: stats.totalQueries,
        cacheSize: `${stats.size}/${stats.maxSize}`,
        guarantee: "< 10 second response time"
      },
      capabilities: [
        "Real-time relationship intelligence",
        "Vector similarity search",
        "Predictive relationship health",
        "Strategic networking optimization",
        "High-performance caching"
      ]
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get Oracle status' },
      { status: 500 }
    );
  }
} 