import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getVectorStore } from '@/lib/vector-store';
import { getRelationshipInsights, SAMPLE_ORG_ID, SAMPLE_USER_ID } from '@/lib/sample-data';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Oracle Engine not configured. OpenAI API key required for full functionality.' },
        { status: 503 }
      );
    }

    // Initialize OpenAI client at runtime, not build time
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get relationship intelligence context using vector similarity
    const relationshipContext = await getRelationshipInsights(query);
    
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
      return NextResponse.json(
        { error: 'Oracle failed to generate intelligence report' },
        { status: 500 }
      );
    }

    const responseTime = Date.now() - startTime;

    // Store Oracle interaction for learning (async, don't await)
    try {
      const vectorStore = getVectorStore();
      vectorStore.storeOracleInteraction(
        SAMPLE_ORG_ID,
        SAMPLE_USER_ID,
        query,
        oracleResponse,
        determineQueryType(query)
      ).catch(err => console.error('Failed to store Oracle interaction:', err));
    } catch (err) {
      // Don't let analytics errors break the main flow
      console.error('Analytics error:', err);
    }

    return NextResponse.json({
      response: oracleResponse,
      query: query,
      timestamp: new Date().toISOString(),
      model: "gpt-4-turbo-preview",
      responseTime: responseTime,
      relationshipContextUsed: relationshipContext !== "No specific relationship context found. Providing general relationship intelligence.",
      metadata: {
        tokensUsed: completion.usage?.total_tokens || 0,
        hasRelationshipData: relationshipContext.includes("RELATIONSHIP CONTEXT:"),
        processingTime: responseTime
      }
    });

  } catch (error) {
    console.error('Oracle Engine Error:', error);
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json(
      { 
        error: 'Oracle Engine encountered an error processing your request',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        responseTime: responseTime,
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

export async function GET() {
  return NextResponse.json({
    message: 'Oracle Engine API',
    status: 'operational',
    version: '1.0.0',
    capabilities: [
      'Professional relationship analysis',
      'Networking opportunity identification',
      'Relationship prioritization',
      'Follow-up strategy recommendations',
      'Relationship health monitoring',
    ],
  })
} 