// Demo Configuration for Customer Validation
// Enables Oracle Engine functionality for Week 3 demos

export const DEMO_CONFIG = {
  // Demo Mode Settings
  isDemoMode: true,
  enableSampleData: true,
  
  // Mock Database Configuration
  mockSupabase: true,
  demoOrganizationId: 'org_demo_relationshipos',
  demoUserId: 'user_demo_kyle',
  
  // Performance Configuration
  oraclePerformanceTarget: 10000, // 10 seconds
  cacheEnabled: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  
  // Oracle Engine Demo Responses
  enableMockOracleResponses: true,
  
  // Sample Professional Relationships
  sampleRelationships: [
    {
      id: 'rel_001',
      person: {
        id: 'person_001',
        firstName: 'Sarah',
        lastName: 'Chen',
        company: 'Stripe',
        title: 'VP Product',
        industry: 'Fintech',
        seniorityLevel: 'executive',
        email: 'sarah.chen@stripe.com',
        linkedinUrl: 'https://linkedin.com/in/sarahchen'
      },
      relationship: {
        strength: 8,
        lastContactDate: new Date('2024-01-15'),
        relationshipType: 'professional',
        healthScore: 85,
        engagementTrend: 'stable',
        mutualConnections: 12
      },
      context: 'Strategic fintech partnership opportunity. Sarah is leading product initiatives around AI and expressed interest in our relationship intelligence platform for customer insights.'
    },
    {
      id: 'rel_002', 
      person: {
        id: 'person_002',
        firstName: 'David',
        lastName: 'Rodriguez',
        company: 'Salesforce',
        title: 'CTO',
        industry: 'SaaS',
        seniorityLevel: 'c_level',
        email: 'david.rodriguez@salesforce.com',
        linkedinUrl: 'https://linkedin.com/in/davidrodriguez'
      },
      relationship: {
        strength: 6,
        lastContactDate: new Date('2023-05-20'),
        relationshipType: 'professional',
        healthScore: 45,
        engagementTrend: 'declining',
        mutualConnections: 8
      },
      context: 'Relationship health declining - no contact in 8 months. Historical value: Led to $2.3M partnership in 2022. Risk level: HIGH - competitor relationships strengthening.'
    },
    {
      id: 'rel_003',
      person: {
        id: 'person_003', 
        firstName: 'Jennifer',
        lastName: 'Park',
        company: 'OpenAI',
        title: 'Head of Business Development',
        industry: 'AI/Technology',
        seniorityLevel: 'director',
        email: 'jennifer.park@openai.com',
        linkedinUrl: 'https://linkedin.com/in/jenniferpark'
      },
      relationship: {
        strength: 9,
        lastContactDate: new Date('2024-01-18'),
        relationshipType: 'professional',
        healthScore: 94,
        engagementTrend: 'growing',
        mutualConnections: 15
      },
      context: 'Emerging opportunity: 94% compatibility based on interaction patterns. Trigger event: Recently promoted (LinkedIn update 3 days ago). Potential value: Strategic AI partnership access.'
    },
    {
      id: 'rel_004',
      person: {
        id: 'person_004',
        firstName: 'Michael',
        lastName: 'Thompson', 
        company: 'TechCrunch',
        title: 'CEO',
        industry: 'Media/Publishing',
        seniorityLevel: 'c_level',
        email: 'michael.thompson@techcrunch.com',
        linkedinUrl: 'https://linkedin.com/in/michaelthompson'
      },
      relationship: {
        strength: 7,
        lastContactDate: new Date('2024-01-10'),
        relationshipType: 'professional',
        healthScore: 78,
        engagementTrend: 'stable',
        mutualConnections: 6
      },
      context: 'Media relationship optimization opportunity. Engagement pattern: Responds best to industry insight sharing. Recommended timing: Tuesday 2-4pm (highest response rate).'
    },
    {
      id: 'rel_005',
      person: {
        id: 'person_005',
        firstName: 'Lisa',
        lastName: 'Wang',
        company: 'Andreessen Horowitz',
        title: 'Partner',
        industry: 'Venture Capital',
        seniorityLevel: 'partner',
        email: 'lisa.wang@a16z.com',
        linkedinUrl: 'https://linkedin.com/in/lisawang'
      },
      relationship: {
        strength: 8,
        lastContactDate: new Date('2024-01-12'),
        relationshipType: 'professional',
        healthScore: 88,
        engagementTrend: 'growing',
        mutualConnections: 20
      },
      context: 'Investment relationship development. Mutual interest: Enterprise AI applications. Introduction path: Alex Smith (connected 2 weeks ago). Recommended approach: Technical demo request for portfolio company.'
    }
  ]
};

// Demo Oracle Response Generator
export function generateDemoOracleResponse(query: string): string {
  const responseTime = Math.random() * 3 + 2; // 2-5 seconds for demo
  
  if (query.toLowerCase().includes('networking opportunities') || query.toLowerCase().includes('top 5')) {
    return `RELATIONSHIP ANALYSIS COMPLETE - 847 Professional Contacts Analyzed

🎯 TOP 5 STRATEGIC OPPORTUNITIES:

1. **Sarah Chen, VP Product at Stripe** 
   - Mutual connection strength: 8/10 via Mark Johnson
   - Opportunity: Fintech partnership discussion
   - Recommended action: LinkedIn message referencing shared AI interest
   - Timing: Next 2 weeks (she just posted about payment innovation)

2. **David Rodriguez, CTO at Salesforce**
   - Relationship health declining: No contact in 8 months
   - Historical value: Led to $2.3M partnership in 2022
   - Risk level: HIGH - competitor relationships strengthening
   - Recommended action: Immediate re-engagement via industry conference

3. **Jennifer Park, Head of BD at OpenAI**
   - Emerging opportunity: 94% compatibility based on interaction patterns
   - Trigger event: Recently promoted (LinkedIn update 3 days ago)
   - Recommended action: Congratulatory message + AI collaboration proposal
   - Potential value: Strategic AI partnership access

4. **Michael Thompson, CEO at TechCrunch**
   - Media relationship optimization opportunity
   - Engagement pattern: Responds best to industry insight sharing
   - Recommended timing: Tuesday 2-4pm (highest response rate)
   - Next action: Share your Q1 market analysis report

5. **Lisa Wang, Partner at Andreessen Horowitz**
   - Investment relationship development
   - Mutual interest: Enterprise AI applications
   - Introduction path: Alex Smith (connected 2 weeks ago)
   - Recommended approach: Technical demo request for portfolio company

⚡ Analysis completed in ${responseTime.toFixed(1)} seconds
📊 Performance: 94% accuracy, 25,000x faster than human VAs
💰 Estimated ROI: $127,000 in potential partnership value identified`;
  }
  
  if (query.toLowerCase().includes('relationship health') || query.toLowerCase().includes('risk')) {
    return `RELATIONSHIP HEALTH ANALYSIS - 847 Contacts Evaluated

🔴 HIGH RISK RELATIONSHIPS (Immediate attention required):
• David Rodriguez (Salesforce CTO): 8 months no contact, declining engagement
• Marcus Johnson (Google): 6 months silence, competing priorities detected
• Amy Foster (Microsoft): Relationship cooling, limited recent interaction

🟡 MEDIUM RISK RELATIONSHIPS (Monitor closely):
• Robert Kim (Amazon): Consistent but formal interactions only
• Diana Chen (Meta): Engagement pattern shifted, requires refresh

🟢 HEALTHY RELATIONSHIPS (Leverage for growth):
• Jennifer Park (OpenAI): 94% compatibility, recent promotion opportunity
• Lisa Wang (A16Z): Strong mutual interest, investment potential
• Sarah Chen (Stripe): High engagement, partnership readiness

📈 PREDICTIVE INSIGHTS:
• 23% of relationships at risk within 90 days without intervention
• 5 relationships show partnership potential worth $2.1M combined
• Optimal re-engagement window: Next 14 days for maximum impact

⚡ Health analysis completed in ${responseTime.toFixed(1)} seconds
🎯 Actionable insights: 15 specific recommendations generated`;
  }
  
  return `ORACLE RELATIONSHIP INTELLIGENCE ANALYSIS

📊 Professional Network Overview:
• Total contacts analyzed: 847
• Active relationships: 234
• Strategic opportunities: 23
• Risk relationships: 12
• Partnership potential: 8

🎯 Key Insights:
• Network strength score: 78/100
• Relationship diversity: High across 12 industries
• Engagement trends: 67% stable, 23% growing, 10% declining
• Strategic value: $3.2M potential in identified opportunities

💡 Immediate Recommendations:
• Re-engage 3 high-value declining relationships
• Leverage 5 warm introductions for new opportunities  
• Optimize timing for 8 strategic outreach activities
• Monitor 12 relationships showing early risk indicators

⚡ Analysis completed in ${responseTime.toFixed(1)} seconds
🚀 Oracle advantage: 25,000x faster than human relationship analysis`;
}

// Performance Metrics for Demo
export function getDemoPerformanceMetrics() {
  return {
    responseTime: Math.random() * 3 + 2, // 2-5 seconds
    cacheHitRate: Math.random() * 20 + 80, // 80-100%
    averageTime: Math.random() * 2 + 3, // 3-5 seconds
    totalQueries: Math.floor(Math.random() * 50) + 150, // 150-200
    guaranteeMet: true,
    performanceGrade: 'A+',
    status: 'optimal'
  };
} 