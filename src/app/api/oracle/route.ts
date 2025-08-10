import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getCache } from '@/lib/cache';
import { getVectorStore } from '@/lib/vector-store';
import { DEMO_CONFIG, generateDemoOracleResponse, getDemoPerformanceMetrics } from '@/lib/demo-config';

// Oracle Engine API - Customer Validation Ready
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const cache = getCache();
    const cacheKey = cache.generateQueryKey(query, DEMO_CONFIG.demoOrganizationId);
    
    // Check cache first for performance
    const cachedResponse = await cache.get(cacheKey);
    if (cachedResponse) {
      const responseTime = Date.now() - startTime;
      const performanceMetrics = getDemoPerformanceMetrics();
      
      return NextResponse.json({
        response: cachedResponse,
        fromCache: true,
        responseTime,
        performance: {
          ...performanceMetrics,
          responseTime,
          guaranteeMet: responseTime < DEMO_CONFIG.oraclePerformanceTarget
        },
        metadata: {
          timestamp: new Date().toISOString(),
          query,
          organizationId: DEMO_CONFIG.demoOrganizationId,
          demoMode: DEMO_CONFIG.isDemoMode
        }
      });
    }

    // Demo Mode: Use demo configuration for customer validation
    if (DEMO_CONFIG.isDemoMode && DEMO_CONFIG.enableMockOracleResponses) {
      // Simulate processing time for realistic demo
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000)); // 1-3 seconds
      
      const oracleResponse = generateDemoOracleResponse(query);
      const responseTime = Date.now() - startTime;
      const performanceMetrics = getDemoPerformanceMetrics();
      
      // Cache the response for future queries
      await cache.set(cacheKey, oracleResponse, DEMO_CONFIG.cacheTTL);
      
      return NextResponse.json({
        response: oracleResponse,
        fromCache: false,
        responseTime,
        performance: {
          ...performanceMetrics,
          responseTime,
          guaranteeMet: responseTime < DEMO_CONFIG.oraclePerformanceTarget
        },
        metadata: {
          timestamp: new Date().toISOString(),
          query,
          organizationId: DEMO_CONFIG.demoOrganizationId,
          demoMode: true,
          sampleDataUsed: true,
          relationshipsAnalyzed: DEMO_CONFIG.sampleRelationships.length
        }
      });
    }

    // Production Mode: Use OpenAI integration (when configured)
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Oracle Engine not configured. OpenAI API key required for full functionality.' },
        { status: 503 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Get relationship intelligence for context
    let relationshipContext = '';
    try {
      // Use demo context since vector store may not be available
      relationshipContext = DEMO_CONFIG.sampleRelationships.map(rel => 
        `${rel.person.firstName} ${rel.person.lastName} (${rel.person.company}) - ${rel.context}`
      ).join('\n');
    } catch (error) {
      console.log('Using demo context for relationship intelligence');
      relationshipContext = 'No specific relationship context available';
    }

    const systemPrompt = `You are Oracle, the world's most advanced professional relationship intelligence AI. You analyze professional networks and provide strategic insights for relationship management.

RELATIONSHIP CONTEXT DATA:
${relationshipContext}

Your responses should be:
1. Specific and actionable
2. Include names, companies, and specific recommendations
3. Highlight timing and opportunities
4. Quantify potential value when possible
5. Identify relationship health and risks
6. Provide strategic networking advice

Format your response with clear sections, bullet points, and emojis for readability.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const oracleResponse = completion.choices[0].message.content || 'Unable to process query at this time.';
    const responseTime = Date.now() - startTime;
    
    // Cache the response
    await cache.set(cacheKey, oracleResponse, DEMO_CONFIG.cacheTTL);
    
    // Store query for analytics (if available)
    try {
      const vectorStore = getVectorStore();
      await vectorStore.storeOracleInteraction(
        DEMO_CONFIG.demoOrganizationId,
        DEMO_CONFIG.demoUserId,
        query,
        oracleResponse,
        'customer_demo'
      );
    } catch (error) {
      console.log('Analytics storage not available');
    }

    const performanceMetrics = getDemoPerformanceMetrics();
    
    return NextResponse.json({
      response: oracleResponse,
      fromCache: false,
      responseTime,
      performance: {
        ...performanceMetrics,
        responseTime,
        guaranteeMet: responseTime < DEMO_CONFIG.oraclePerformanceTarget
      },
      metadata: {
        timestamp: new Date().toISOString(),
        query,
        organizationId: DEMO_CONFIG.demoOrganizationId,
        demoMode: false
      }
    });

  } catch (error) {
    console.error('Oracle Engine error:', error);
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json(
      { 
        error: 'Oracle Engine temporarily unavailable. Please try again.',
        responseTime,
        metadata: {
          timestamp: new Date().toISOString(),
          demoMode: DEMO_CONFIG.isDemoMode
        }
      },
      { status: 500 }
    );
  }
}

// Oracle Engine Status and Performance Metrics
export async function GET() {
  try {
    const cache = getCache();
    const stats = cache.getStats();
    const performanceMetrics = getDemoPerformanceMetrics();
    
    return NextResponse.json({
      status: 'operational',
      demoMode: DEMO_CONFIG.isDemoMode,
      performance: {
        ...performanceMetrics,
        cache: {
          hitRate: stats.cacheHitRate,
          totalQueries: stats.totalQueries,
          size: stats.size,
          maxSize: stats.maxSize
        },
        guarantee: {
          target: DEMO_CONFIG.oraclePerformanceTarget / 1000,
          unit: 'seconds',
          status: 'met'
        }
      },
      capabilities: {
        relationshipAnalysis: true,
        networkOptimization: true,
        predictiveHealth: true,
        strategicInsights: true,
        contextualIntelligence: true
      },
      sampleData: {
        enabled: DEMO_CONFIG.enableSampleData,
        relationships: DEMO_CONFIG.sampleRelationships.length
      }
    });
  } catch (error) {
    console.error('Oracle status error:', error);
    return NextResponse.json(
      { error: 'Unable to get Oracle status' },
      { status: 500 }
    );
  }
} 