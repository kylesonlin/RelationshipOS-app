// LinkedIn Integration Service for RelationshipOS
// Professional relationship data sync and monitoring

interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  summary?: string;
  industry: string;
  location: string;
  pictureUrl?: string;
  publicProfileUrl: string;
  emailAddress?: string;
  positions: LinkedInPosition[];
}

interface LinkedInPosition {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
    industry?: string;
    size?: string;
  };
  location?: string;
  startDate: {
    month: number;
    year: number;
  };
  endDate?: {
    month: number;
    year: number;
  };
  isCurrent: boolean;
  summary?: string;
}

interface LinkedInConnection {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  industry?: string;
  location?: string;
  pictureUrl?: string;
  publicProfileUrl: string;
  connectedAt: string;
  mutualConnections?: number;
}

interface LinkedInUpdate {
  id: string;
  type: 'job_change' | 'new_post' | 'connection_update' | 'company_update';
  personId: string;
  title: string;
  description: string;
  timestamp: string;
  url?: string;
  relevanceScore: number; // 1-10
}

interface LinkedInCompanyInfo {
  id: string;
  name: string;
  description?: string;
  industry: string;
  size: string;
  website?: string;
  headquarters?: {
    city: string;
    country: string;
  };
  foundedYear?: number;
  specialties?: string[];
}

interface LinkedInIntegrationConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

interface LinkedInTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope: string;
}

export class LinkedInService {
  private static instance: LinkedInService;
  private config: LinkedInIntegrationConfig;
  private baseUrl = 'https://api.linkedin.com/v2';

  constructor() {
    this.config = {
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      redirectUri: process.env.LINKEDIN_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/linkedin/callback`,
      scopes: [
        'r_liteprofile',
        'r_emailaddress',
        'r_network',
        'r_basicprofile'
      ]
    };
  }

  static getInstance(): LinkedInService {
    if (!LinkedInService.instance) {
      LinkedInService.instance = new LinkedInService();
    }
    return LinkedInService.instance;
  }

  // OAuth Authentication Flow
  generateAuthUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state,
      scope: this.config.scopes.join(' ')
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string, state: string): Promise<LinkedInTokens> {
    try {
      const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.config.redirectUri,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`LinkedIn OAuth error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        scope: data.scope
      };
    } catch (error) {
      console.error('LinkedIn token exchange error:', error);
      throw new Error('Failed to exchange LinkedIn authorization code');
    }
  }

  // Profile Data Retrieval
  async getProfile(accessToken: string): Promise<LinkedInProfile> {
    try {
      const [profileResponse, positionsResponse] = await Promise.all([
        this.makeLinkedInRequest('/people/~:(id,first-name,last-name,headline,summary,industry,location,picture-url,public-profile-url,email-address)', accessToken),
        this.makeLinkedInRequest('/people/~/positions:(id,title,company:(id,name,industry,size),location,start-date,end-date,is-current,summary)', accessToken)
      ]);

      return {
        id: profileResponse.id,
        firstName: profileResponse.firstName,
        lastName: profileResponse.lastName,
        headline: profileResponse.headline || '',
        summary: profileResponse.summary,
        industry: profileResponse.industry || '',
        location: profileResponse.location?.name || '',
        pictureUrl: profileResponse.pictureUrl,
        publicProfileUrl: profileResponse.publicProfileUrl,
        emailAddress: profileResponse.emailAddress,
        positions: positionsResponse.values?.map(this.transformPosition) || []
      };
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);
      throw new Error('Failed to fetch LinkedIn profile data');
    }
  }

  // Connection Data Sync
  async getConnections(accessToken: string, start = 0, count = 500): Promise<LinkedInConnection[]> {
    try {
      const response = await this.makeLinkedInRequest(
        `/people/~/connections:(id,first-name,last-name,headline,industry,location,picture-url,public-profile-url)?start=${start}&count=${count}`,
        accessToken
      );

      return response.values?.map((connection: any) => ({
        id: connection.id,
        firstName: connection.firstName,
        lastName: connection.lastName,
        headline: connection.headline || '',
        industry: connection.industry,
        location: connection.location?.name,
        pictureUrl: connection.pictureUrl,
        publicProfileUrl: connection.publicProfileUrl,
        connectedAt: new Date().toISOString(), // LinkedIn doesn't provide this in v2 API
        mutualConnections: 0 // Would need additional API calls
      })) || [];
    } catch (error) {
      console.error('Error fetching LinkedIn connections:', error);
      throw new Error('Failed to fetch LinkedIn connections');
    }
  }

  // Company Information Lookup
  async getCompanyInfo(companyId: string, accessToken: string): Promise<LinkedInCompanyInfo> {
    try {
      const response = await this.makeLinkedInRequest(
        `/companies/${companyId}:(id,name,description,industry,size,website,headquarters,founded-year,specialties)`,
        accessToken
      );

      return {
        id: response.id,
        name: response.name,
        description: response.description,
        industry: response.industry,
        size: response.size,
        website: response.website,
        headquarters: response.headquarters ? {
          city: response.headquarters.city,
          country: response.headquarters.country
        } : undefined,
        foundedYear: response.foundedYear,
        specialties: response.specialties?.values || []
      };
    } catch (error) {
      console.error('Error fetching company info:', error);
      throw new Error('Failed to fetch company information');
    }
  }

  // Professional Update Monitoring
  async getNetworkUpdates(accessToken: string, since?: string): Promise<LinkedInUpdate[]> {
    try {
      // Note: LinkedIn's real-time updates API is limited
      // This would require webhook setup for production
      const sinceParam = since ? `&since=${since}` : '';
      const response = await this.makeLinkedInRequest(
        `/people/~/network/updates?type=PROF&count=100${sinceParam}`,
        accessToken
      );

      return response.values?.map(this.transformUpdate).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching network updates:', error);
      // Return empty array instead of throwing - updates are non-critical
      return [];
    }
  }

  // Integration Health Check
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.makeLinkedInRequest('/people/~:(id)', accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Data Synchronization
  async syncConnectionData(organizationId: string, userId: string, accessToken: string): Promise<{
    profilesUpdated: number;
    connectionsAdded: number;
    companiesEnriched: number;
  }> {
    try {
      const [profile, connections] = await Promise.all([
        this.getProfile(accessToken),
        this.getConnections(accessToken)
      ]);

      // This would integrate with our database service
      // For now, return mock sync results
      return {
        profilesUpdated: 1,
        connectionsAdded: connections.length,
        companiesEnriched: profile.positions.length
      };
    } catch (error) {
      console.error('LinkedIn sync error:', error);
      throw new Error('Failed to sync LinkedIn data');
    }
  }

  // Utility Methods
  private async makeLinkedInRequest(endpoint: string, accessToken: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('LinkedIn access token expired');
      }
      throw new Error(`LinkedIn API error: ${response.status}`);
    }

    return response.json();
  }

  private transformPosition(position: any): LinkedInPosition {
    return {
      id: position.id,
      title: position.title,
      company: {
        id: position.company?.id || '',
        name: position.company?.name || '',
        industry: position.company?.industry,
        size: position.company?.size
      },
      location: position.location,
      startDate: position.startDate || { month: 1, year: new Date().getFullYear() },
      endDate: position.endDate,
      isCurrent: position.isCurrent || false,
      summary: position.summary
    };
  }

  private transformUpdate(update: any): LinkedInUpdate | null {
    if (!update.updateContent) return null;

    return {
      id: update.timestamp,
      type: this.determineUpdateType(update),
      personId: update.updateContent.person?.id || '',
      title: this.generateUpdateTitle(update),
      description: this.generateUpdateDescription(update),
      timestamp: new Date(update.timestamp).toISOString(),
      url: update.updateContent.person?.publicProfileUrl,
      relevanceScore: this.calculateRelevanceScore(update)
    };
  }

  private determineUpdateType(update: any): LinkedInUpdate['type'] {
    // Simplified type detection - would be more sophisticated in production
    if (update.updateContent.person?.headline) return 'job_change';
    if (update.updateContent.companyStatusUpdate) return 'company_update';
    return 'connection_update';
  }

  private generateUpdateTitle(update: any): string {
    const person = update.updateContent.person;
    if (!person) return 'Network Update';
    
    return `${person.firstName} ${person.lastName} - Professional Update`;
  }

  private generateUpdateDescription(update: any): string {
    // Simplified description generation
    return update.updateContent.person?.headline || 'Professional network activity';
  }

  private calculateRelevanceScore(update: any): number {
    // Simplified relevance scoring - would use ML in production
    return Math.floor(Math.random() * 10) + 1;
  }
}

// Singleton instance
export const linkedinService = LinkedInService.getInstance();

// Utility functions for UI integration
export function formatLinkedInUrl(profileUrl: string): string {
  if (!profileUrl) return '';
  return profileUrl.startsWith('http') ? profileUrl : `https://linkedin.com/in/${profileUrl}`;
}

export function getLinkedInProfileImage(pictureUrl?: string): string {
  return pictureUrl || '/api/placeholder/linkedin-avatar';
}

export function calculateConnectionStrength(connection: LinkedInConnection): number {
  // Simplified connection strength calculation
  let strength = 5; // Base strength
  
  if (connection.mutualConnections && connection.mutualConnections > 10) strength += 2;
  if (connection.industry) strength += 1;
  if (connection.headline.length > 50) strength += 1; // More detailed profile
  
  return Math.min(strength, 10);
}

export function isRecentConnection(connectedAt: string): boolean {
  const connectionDate = new Date(connectedAt);
  const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
  return connectionDate > thirtyDaysAgo;
} 