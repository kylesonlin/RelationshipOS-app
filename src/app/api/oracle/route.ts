import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
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

    // Oracle AI System Prompt for Relationship Intelligence
    const systemPrompt = `You are the Oracle Engine for RelationshipOS - an AI that provides revolutionary relationship intelligence for professionals.

Your role: Analyze relationship queries and provide insights that are 10x better than human VAs by:
1. Identifying relationship patterns and opportunities
2. Suggesting strategic relationship moves
3. Providing actionable intelligence about professional networks
4. Offering relationship optimization recommendations

Respond with:
- Specific, actionable insights
- Strategic relationship recommendations  
- Professional networking opportunities
- Relationship health assessments
- Connection opportunity identification

Format responses as professional relationship intelligence, not generic advice.`;

    // Call OpenAI GPT-4 Turbo for real relationship analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const oracleResponse = completion.choices[0]?.message?.content;

    if (!oracleResponse) {
      return NextResponse.json(
        { error: 'Failed to generate Oracle response' },
        { status: 500 }
      );
    }

    // TODO: Store query and response in database for learning
    // TODO: Implement relationship context integration
    // TODO: Add vector similarity search with Pinecone

    return NextResponse.json({
      response: oracleResponse,
      query: query,
      timestamp: new Date().toISOString(),
      model: "gpt-4-turbo-preview"
    });

  } catch (error) {
    console.error('Oracle API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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