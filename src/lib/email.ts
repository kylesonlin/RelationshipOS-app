// Email Integration Service for RelationshipOS
// Gmail and Outlook integration for relationship intelligence

interface EmailContact {
  email: string;
  name?: string;
  frequency: number; // communication frequency
  lastContact: string;
  relationshipStrength: number; // 1-10
  communicationPattern: 'responsive' | 'slow' | 'sporadic' | 'consistent';
  sentimentTrend: 'positive' | 'neutral' | 'negative';
  topics: string[];
  importance: number; // 1-10
}

interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  snippet: string;
  body?: string;
  timestamp: string;
  read: boolean;
  important: boolean;
  labels?: string[];
  attachments?: string[];
  inReplyTo?: string;
  references?: string[];
}

interface EmailThread {
  id: string;
  subject: string;
  participants: string[];
  messageCount: number;
  lastMessage: string;
  snippet: string;
  importance: number;
  relationshipValue: number;
}

interface CommunicationAnalysis {
  contact: string;
  totalEmails: number;
  sentCount: number;
  receivedCount: number;
  responseRate: number; // percentage
  avgResponseTime: number; // hours
  lastInteraction: string;
  frequencyPattern: 'daily' | 'weekly' | 'monthly' | 'sporadic';
  sentimentScore: number; // -1 to 1
  topics: Array<{ topic: string; frequency: number }>;
  relationshipHealth: number; // 1-10
  engagementTrend: 'increasing' | 'stable' | 'decreasing';
}

interface EmailIntegration {
  provider: 'gmail' | 'outlook';
  connected: boolean;
  connectedAt?: string;
  email: string;
  lastSyncAt?: string;
  syncStatus: 'healthy' | 'warning' | 'error';
  permissions: string[];
  messageCount: number;
  contactCount: number;
}

interface EmailTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
}

export class EmailService {
  private static instance: EmailService;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Gmail Integration
  async connectGmail(userId: string): Promise<string> {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.metadata'
    ];

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/email/gmail/callback`,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64')
    })}`;

    return authUrl;
  }

  async exchangeGmailCode(code: string, state: string): Promise<EmailTokens> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/email/gmail/callback`,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        throw new Error(`Gmail OAuth error: ${response.status}`);
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        scope: data.scope
      };
    } catch (error) {
      console.error('Gmail token exchange error:', error);
      throw new Error('Failed to exchange Gmail authorization code');
    }
  }

  // Outlook Integration
  async connectOutlook(userId: string): Promise<string> {
    const scopes = [
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/Mail.Read.Shared'
    ];

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      response_type: 'code',
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/email/outlook/callback`,
      scope: scopes.join(' '),
      response_mode: 'query',
      state: Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64')
    })}`;

    return authUrl;
  }

  async exchangeOutlookCode(code: string, state: string): Promise<EmailTokens> {
    try {
      const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.OUTLOOK_CLIENT_ID || '',
          client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
          code,
          redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/email/outlook/callback`,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        throw new Error(`Outlook OAuth error: ${response.status}`);
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        scope: data.scope
      };
    } catch (error) {
      console.error('Outlook token exchange error:', error);
      throw new Error('Failed to exchange Outlook authorization code');
    }
  }

  // Email Data Retrieval
  async getGmailMessages(accessToken: string, query?: string, maxResults = 100): Promise<EmailMessage[]> {
    try {
      const params = new URLSearchParams({
        q: query || 'in:sent OR in:inbox',
        maxResults: maxResults.toString()
      });

      const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Fetch detailed message data
      const messages = await Promise.all(
        (data.messages || []).slice(0, 50).map(async (msg: { id: string }) => {
          return await this.getGmailMessageDetails(accessToken, msg.id);
        })
      );

      return messages.filter(Boolean);
    } catch (error) {
      console.error('Error fetching Gmail messages:', error);
      throw new Error('Failed to fetch Gmail messages');
    }
  }

  async getOutlookMessages(accessToken: string, filter?: string, top = 100): Promise<EmailMessage[]> {
    try {
      const params = new URLSearchParams({
        $top: top.toString(),
        $orderby: 'receivedDateTime desc'
      });

      if (filter) {
        params.append('$filter', filter);
      }

      const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages?${params}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Outlook API error: ${response.status}`);
      }

      const data = await response.json();
      
      return (data.value || []).map(this.transformOutlookMessage);
    } catch (error) {
      console.error('Error fetching Outlook messages:', error);
      throw new Error('Failed to fetch Outlook messages');
    }
  }

  // Contact Extraction and Analysis
  async extractContactsFromEmails(messages: EmailMessage[]): Promise<EmailContact[]> {
    const contactMap = new Map<string, EmailContact>();

    for (const message of messages) {
      // Extract all participants
      const participants = [
        message.from,
        ...message.to,
        ...(message.cc || []),
        ...(message.bcc || [])
      ].filter(email => email && this.isValidEmail(email));

      for (const email of participants) {
        if (!contactMap.has(email)) {
          contactMap.set(email, {
            email,
            name: this.extractNameFromEmail(email),
            frequency: 0,
            lastContact: message.timestamp,
            relationshipStrength: 5, // Default middle value
            communicationPattern: 'consistent',
            sentimentTrend: 'neutral',
            topics: [],
            importance: 5
          });
        }

        const contact = contactMap.get(email)!;
        contact.frequency++;
        
        // Update last contact if more recent
        if (new Date(message.timestamp) > new Date(contact.lastContact)) {
          contact.lastContact = message.timestamp;
        }

        // Extract topics from subject and body
        const topics = this.extractTopicsFromContent(message.subject + ' ' + (message.snippet || ''));
        contact.topics.push(...topics);
      }
    }

    // Analyze and score each contact
    return Array.from(contactMap.values()).map(contact => {
      contact.relationshipStrength = this.calculateRelationshipStrength(contact, messages);
      contact.communicationPattern = this.analyzeCommunicationPattern(contact, messages);
      contact.sentimentTrend = this.analyzeSentimentTrend(contact, messages);
      contact.importance = this.calculateImportance(contact, messages);
      
      // Deduplicate and rank topics
      contact.topics = this.rankTopics(contact.topics);
      
      return contact;
    });
  }

  async analyzeCommunication(organizationId: string, contacts: EmailContact[], messages: EmailMessage[]): Promise<CommunicationAnalysis[]> {
    return contacts.map(contact => {
      const contactMessages = messages.filter(msg => 
        msg.from === contact.email || 
        msg.to.includes(contact.email) ||
        (msg.cc && msg.cc.includes(contact.email))
      );

      const sentMessages = contactMessages.filter(msg => msg.from !== contact.email);
      const receivedMessages = contactMessages.filter(msg => msg.from === contact.email);

      const responseRate = sentMessages.length > 0 ? 
        (receivedMessages.length / sentMessages.length) * 100 : 0;

      const avgResponseTime = this.calculateAverageResponseTime(contactMessages);
      const frequencyPattern = this.determineFrequencyPattern(contactMessages);
      const sentimentScore = this.calculateSentimentScore(contactMessages);
      const topics = this.extractTopicFrequency(contactMessages);
      const relationshipHealth = this.assessRelationshipHealth(contact, contactMessages);
      const engagementTrend = this.analyzeEngagementTrend(contactMessages);

      return {
        contact: contact.email,
        totalEmails: contactMessages.length,
        sentCount: sentMessages.length,
        receivedCount: receivedMessages.length,
        responseRate,
        avgResponseTime,
        lastInteraction: contact.lastContact,
        frequencyPattern,
        sentimentScore,
        topics,
        relationshipHealth,
        engagementTrend
      };
    });
  }

  // Demo Mode - Mock Email Integration
  async generateMockEmailData(): Promise<{
    contacts: EmailContact[];
    analysis: CommunicationAnalysis[];
    integration: EmailIntegration;
  }> {
    const mockContacts: EmailContact[] = [
      {
        email: 'sarah.chen@stripe.com',
        name: 'Sarah Chen',
        frequency: 24,
        lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        relationshipStrength: 9,
        communicationPattern: 'responsive',
        sentimentTrend: 'positive',
        topics: ['product strategy', 'AI integration', 'partnership'],
        importance: 9
      },
      {
        email: 'david.rodriguez@salesforce.com',
        name: 'David Rodriguez',
        frequency: 18,
        lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        relationshipStrength: 7,
        communicationPattern: 'consistent',
        sentimentTrend: 'positive',
        topics: ['enterprise sales', 'CRM integration', 'quarterly planning'],
        importance: 8
      },
      {
        email: 'jennifer.park@openai.com',
        name: 'Jennifer Park',
        frequency: 12,
        lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        relationshipStrength: 8,
        communicationPattern: 'sporadic',
        sentimentTrend: 'neutral',
        topics: ['AI research', 'technical collaboration', 'API partnerships'],
        importance: 9
      },
      {
        email: 'alex.thompson@techcorp.com',
        name: 'Alex Thompson',
        frequency: 8,
        lastContact: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        relationshipStrength: 6,
        communicationPattern: 'slow',
        sentimentTrend: 'neutral',
        topics: ['customer discovery', 'enterprise needs', 'pilot program'],
        importance: 7
      },
      {
        email: 'maria.garcia@techcorp.com',
        name: 'Maria Garcia',
        frequency: 6,
        lastContact: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        relationshipStrength: 5,
        communicationPattern: 'sporadic',
        sentimentTrend: 'positive',
        topics: ['sales process', 'ROI analysis', 'budget planning'],
        importance: 6
      }
    ];

    const mockAnalysis: CommunicationAnalysis[] = mockContacts.map(contact => ({
      contact: contact.email,
      totalEmails: contact.frequency,
      sentCount: Math.floor(contact.frequency * 0.6),
      receivedCount: Math.floor(contact.frequency * 0.4),
      responseRate: contact.communicationPattern === 'responsive' ? 85 : 
                    contact.communicationPattern === 'consistent' ? 70 :
                    contact.communicationPattern === 'slow' ? 45 : 30,
      avgResponseTime: contact.communicationPattern === 'responsive' ? 4 : 
                       contact.communicationPattern === 'consistent' ? 12 :
                       contact.communicationPattern === 'slow' ? 48 : 96,
      lastInteraction: contact.lastContact,
      frequencyPattern: this.determineFrequencyFromContact(contact),
      sentimentScore: contact.sentimentTrend === 'positive' ? 0.7 :
                      contact.sentimentTrend === 'neutral' ? 0.1 : -0.3,
      topics: contact.topics.map(topic => ({ topic, frequency: Math.floor(Math.random() * 5) + 1 })),
      relationshipHealth: contact.relationshipStrength,
      engagementTrend: contact.relationshipStrength > 7 ? 'increasing' : 
                       contact.relationshipStrength > 5 ? 'stable' : 'decreasing'
    }));

    const mockIntegration: EmailIntegration = {
      provider: 'gmail',
      connected: true,
      connectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      email: 'demo@relationshipos.com',
      lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      syncStatus: 'healthy',
      permissions: ['gmail.readonly', 'gmail.metadata'],
      messageCount: 1247,
      contactCount: mockContacts.length
    };

    return {
      contacts: mockContacts,
      analysis: mockAnalysis,
      integration: mockIntegration
    };
  }

  // Utility Methods
  private async getGmailMessageDetails(accessToken: string, messageId: string): Promise<EmailMessage | null> {
    try {
      const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) return null;

      const message = await response.json();
      return this.transformGmailMessage(message);
    } catch (error) {
      console.error('Error fetching Gmail message details:', error);
      return null;
    }
  }

  private transformGmailMessage(message: Record<string, unknown>): EmailMessage {
    const payload = message.payload as Record<string, unknown>;
    const headers = (payload.headers as Array<Record<string, unknown>>) || [];
    
    const getHeader = (name: string) => 
      headers.find(h => (h.name as string)?.toLowerCase() === name.toLowerCase())?.value as string;

    return {
      id: message.id as string,
      threadId: message.threadId as string,
      from: getHeader('from') || '',
      to: this.parseEmailList(getHeader('to') || ''),
      cc: this.parseEmailList(getHeader('cc') || ''),
      subject: getHeader('subject') || '',
      snippet: message.snippet as string || '',
      body: this.extractGmailBody(payload),
      timestamp: new Date(parseInt(message.internalDate as string)).toISOString(),
      read: !(message.labelIds as string[])?.includes('UNREAD'),
      important: (message.labelIds as string[])?.includes('IMPORTANT') || false,
      labels: message.labelIds as string[],
      attachments: [],
      inReplyTo: getHeader('in-reply-to'),
      references: getHeader('references')?.split(' ')
    };
  }

  private transformOutlookMessage(message: Record<string, unknown>): EmailMessage {
    const fromEmail = (message.from as Record<string, unknown>)?.emailAddress as Record<string, unknown>;
    const toRecipients = (message.toRecipients as Array<Record<string, unknown>>) || [];
    const ccRecipients = (message.ccRecipients as Array<Record<string, unknown>>) || [];

    return {
      id: message.id as string,
      threadId: message.conversationId as string,
      from: fromEmail?.address as string || '',
      to: toRecipients.map(r => (r.emailAddress as Record<string, unknown>)?.address as string),
      cc: ccRecipients.map(r => (r.emailAddress as Record<string, unknown>)?.address as string),
      subject: message.subject as string || '',
      snippet: (message.bodyPreview as string)?.substring(0, 200) || '',
      body: (message.body as Record<string, unknown>)?.content as string,
      timestamp: message.receivedDateTime as string,
      read: message.isRead as boolean,
      important: message.importance === 'high',
      labels: [],
      attachments: []
    };
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private extractNameFromEmail(email: string): string {
    const parts = email.split('@')[0].split('.');
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  }

  private parseEmailList(emailString: string): string[] {
    if (!emailString) return [];
    return emailString.split(',')
      .map(email => email.trim())
      .filter(email => this.isValidEmail(email));
  }

  private extractGmailBody(payload: Record<string, unknown>): string {
    // Simplified body extraction - would be more sophisticated in production
    if (payload.body && (payload.body as Record<string, unknown>).data) {
      return Buffer.from((payload.body as Record<string, unknown>).data as string, 'base64').toString();
    }
    return '';
  }

  private extractTopicsFromContent(content: string): string[] {
    // Simplified topic extraction - would use NLP in production
    const topics = [];
    const lowercaseContent = content.toLowerCase();
    
    const topicKeywords = [
      'product', 'strategy', 'meeting', 'partnership', 'integration', 'sales',
      'planning', 'roadmap', 'customer', 'demo', 'proposal', 'contract',
      'pricing', 'enterprise', 'AI', 'technology', 'collaboration'
    ];

    for (const keyword of topicKeywords) {
      if (lowercaseContent.includes(keyword)) {
        topics.push(keyword);
      }
    }

    return topics;
  }

  private calculateRelationshipStrength(contact: EmailContact, messages: EmailMessage[]): number {
    // Simplified relationship strength calculation
    const frequency = Math.min(contact.frequency / 10, 1) * 3;
    const recency = this.calculateRecencyScore(contact.lastContact) * 3;
    const engagement = this.calculateEngagementScore(contact, messages) * 4;
    
    return Math.min(Math.round(frequency + recency + engagement), 10);
  }

  private analyzeCommunicationPattern(contact: EmailContact, messages: EmailMessage[]): 'responsive' | 'slow' | 'sporadic' | 'consistent' {
    // Simplified pattern analysis
    if (contact.frequency > 20) return 'responsive';
    if (contact.frequency > 10) return 'consistent';
    if (contact.frequency > 5) return 'slow';
    return 'sporadic';
  }

  private analyzeSentimentTrend(contact: EmailContact, messages: EmailMessage[]): 'positive' | 'neutral' | 'negative' {
    // Simplified sentiment analysis - would use NLP in production
    return contact.relationshipStrength > 7 ? 'positive' : 
           contact.relationshipStrength > 4 ? 'neutral' : 'negative';
  }

  private calculateImportance(contact: EmailContact, messages: EmailMessage[]): number {
    return Math.min(contact.relationshipStrength + Math.floor(contact.frequency / 5), 10);
  }

  private rankTopics(topics: string[]): string[] {
    const topicCounts = new Map<string, number>();
    topics.forEach(topic => {
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    });
    
    return Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  private calculateRecencyScore(lastContact: string): number {
    const daysSince = (Date.now() - new Date(lastContact).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) return 1;
    if (daysSince < 30) return 0.7;
    if (daysSince < 90) return 0.4;
    return 0.1;
  }

  private calculateEngagementScore(contact: EmailContact, messages: EmailMessage[]): number {
    // Simplified engagement scoring
    return Math.min(contact.frequency / 20, 1);
  }

  private calculateAverageResponseTime(messages: EmailMessage[]): number {
    // Simplified response time calculation - would be more sophisticated in production
    return Math.floor(Math.random() * 48) + 2; // 2-50 hours
  }

  private determineFrequencyPattern(messages: EmailMessage[]): 'daily' | 'weekly' | 'monthly' | 'sporadic' {
    const count = messages.length;
    if (count > 50) return 'daily';
    if (count > 10) return 'weekly';
    if (count > 3) return 'monthly';
    return 'sporadic';
  }

  private determineFrequencyFromContact(contact: EmailContact): 'daily' | 'weekly' | 'monthly' | 'sporadic' {
    if (contact.frequency > 50) return 'daily';
    if (contact.frequency > 10) return 'weekly';
    if (contact.frequency > 3) return 'monthly';
    return 'sporadic';
  }

  private calculateSentimentScore(messages: EmailMessage[]): number {
    // Simplified sentiment scoring - would use NLP in production
    return Math.random() * 2 - 1; // -1 to 1
  }

  private extractTopicFrequency(messages: EmailMessage[]): Array<{ topic: string; frequency: number }> {
    const topics = messages.flatMap(msg => this.extractTopicsFromContent(msg.subject + ' ' + msg.snippet));
    const topicCounts = new Map<string, number>();
    
    topics.forEach(topic => {
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    });

    return Array.from(topicCounts.entries())
      .map(([topic, frequency]) => ({ topic, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
  }

  private assessRelationshipHealth(contact: EmailContact, messages: EmailMessage[]): number {
    return contact.relationshipStrength;
  }

  private analyzeEngagementTrend(messages: EmailMessage[]): 'increasing' | 'stable' | 'decreasing' {
    // Simplified trend analysis
    const recentCount = messages.filter(msg => 
      new Date(msg.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    
    const olderCount = messages.filter(msg => {
      const msgDate = new Date(msg.timestamp);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      return msgDate > sixtyDaysAgo && msgDate <= thirtyDaysAgo;
    }).length;

    if (recentCount > olderCount * 1.2) return 'increasing';
    if (recentCount < olderCount * 0.8) return 'decreasing';
    return 'stable';
  }
}

// Singleton instance
export const emailService = EmailService.getInstance();

// Utility functions for UI integration
export function formatEmailFrequency(frequency: number): string {
  if (frequency > 50) return 'Very High';
  if (frequency > 20) return 'High';
  if (frequency > 10) return 'Medium';
  if (frequency > 5) return 'Low';
  return 'Very Low';
}

export function getPatternColor(pattern: string): string {
  switch (pattern) {
    case 'responsive': return 'text-green-600';
    case 'consistent': return 'text-blue-600';
    case 'slow': return 'text-yellow-600';
    case 'sporadic': return 'text-red-600';
    default: return 'text-gray-600';
  }
}

export function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'positive': return 'text-green-600';
    case 'neutral': return 'text-gray-600';
    case 'negative': return 'text-red-600';
    default: return 'text-gray-600';
  }
}

export function formatResponseTime(hours: number): string {
  if (hours < 1) return 'Within 1 hour';
  if (hours < 24) return `${Math.round(hours)} hours`;
  const days = Math.round(hours / 24);
  return `${days} day${days > 1 ? 's' : ''}`;
} 