// Team Relationship Sharing Service for RelationshipOS
// Enterprise collaboration and relationship intelligence sharing

import { supabase } from './supabase';
import { Person, Relationship } from './database';

// Team sharing types
export interface TeamMember {
  id: string;
  userId: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  department?: string;
  title?: string;
  permissions: TeamPermissions;
  isActive: boolean;
  lastActive?: string;
  joinedAt: string;
}

export interface TeamPermissions {
  canViewSharedRelationships: boolean;
  canEditSharedRelationships: boolean;
  canShareOwnRelationships: boolean;
  canViewTeamAnalytics: boolean;
  canManageTeamMembers: boolean;
  canExportData: boolean;
  accessLevel: 'full' | 'department' | 'restricted';
}

export interface SharedRelationship {
  id: string;
  personId: string;
  organizationId: string;
  sharedBy: string; // userId who shared it
  sharedWith: string[]; // userIds who have access
  shareType: 'individual' | 'department' | 'organization';
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canContact: boolean;
    canAddNotes: boolean;
  };
  shareReason?: string;
  sharedAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface TeamActivity {
  id: string;
  organizationId: string;
  userId: string;
  activityType: 'relationship_shared' | 'contact_made' | 'meeting_scheduled' | 'note_added' | 'opportunity_identified';
  entityType: 'person' | 'relationship' | 'meeting' | 'opportunity';
  entityId: string;
  description: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  isVisible: boolean;
}

export interface TeamInsight {
  type: 'network_overlap' | 'collaboration_opportunity' | 'relationship_gap' | 'warm_introduction';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  involvedMembers: string[]; // userIds
  suggestedAction: string;
  potentialValue: string;
  relatedPeople: string[]; // personIds
  generatedAt: string;
  status: 'new' | 'reviewed' | 'acted_upon' | 'dismissed';
}

export class TeamSharingService {
  private static instance: TeamSharingService;

  static getInstance(): TeamSharingService {
    if (!TeamSharingService.instance) {
      TeamSharingService.instance = new TeamSharingService();
    }
    return TeamSharingService.instance;
  }

  // Team member management
  async getTeamMembers(organizationId: string): Promise<TeamMember[]> {
    if (!supabase) {
      return this.getMockTeamMembers();
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          department,
          title,
          is_active,
          last_login_at,
          created_at
        `)
        .eq('organization_id', organizationId)
        .order('first_name');

      if (error) throw error;

      return (data || []).map(user => ({
        id: user.id,
        userId: user.id,
        organizationId,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email,
        role: user.role || 'member',
        department: user.department,
        title: user.title,
        permissions: this.getDefaultPermissions(user.role || 'member'),
        isActive: user.is_active || true,
        lastActive: user.last_login_at,
        joinedAt: user.created_at
      }));
    } catch (error) {
      console.error('Error fetching team members:', error);
      return this.getMockTeamMembers();
    }
  }

  async updateTeamMemberPermissions(
    organizationId: string, 
    userId: string, 
    permissions: Partial<TeamPermissions>
  ): Promise<TeamMember> {
    // In production, this would update the database
    // For now, return mock data
    const members = await this.getTeamMembers(organizationId);
    const member = members.find(m => m.userId === userId);
    
    if (!member) {
      throw new Error('Team member not found');
    }

    return {
      ...member,
      permissions: { ...member.permissions, ...permissions }
    };
  }

  // Relationship sharing
  async shareRelationship(
    organizationId: string,
    personId: string,
    sharedBy: string,
    shareConfig: {
      shareWith: string[];
      shareType: 'individual' | 'department' | 'organization';
      permissions: SharedRelationship['permissions'];
      shareReason?: string;
      expiresAt?: string;
    }
  ): Promise<SharedRelationship> {
    const sharedRelationship: SharedRelationship = {
      id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      personId,
      organizationId,
      sharedBy,
      sharedWith: shareConfig.shareWith,
      shareType: shareConfig.shareType,
      permissions: shareConfig.permissions,
      shareReason: shareConfig.shareReason,
      sharedAt: new Date().toISOString(),
      expiresAt: shareConfig.expiresAt,
      isActive: true
    };

    // In production, this would be stored in the database
    // For now, we'll track the activity
    await this.recordTeamActivity({
      organizationId,
      userId: sharedBy,
      activityType: 'relationship_shared',
      entityType: 'person',
      entityId: personId,
      description: `Shared relationship with ${shareConfig.shareWith.length} team member(s)`,
      metadata: {
        shareType: shareConfig.shareType,
        permissions: shareConfig.permissions,
        shareReason: shareConfig.shareReason
      }
    });

    return sharedRelationship;
  }

  async getSharedRelationships(
    organizationId: string, 
    userId: string
  ): Promise<Array<SharedRelationship & { person: Person }>> {
    // Mock shared relationships - in production this would query the database
    return [
      {
        id: 'share_001',
        personId: 'person_sarah_chen',
        organizationId,
        sharedBy: 'user_demo_kyle',
        sharedWith: [userId],
        shareType: 'individual',
        permissions: {
          canView: true,
          canEdit: false,
          canContact: true,
          canAddNotes: true
        },
        shareReason: 'Potential partnership opportunity - needs technical evaluation',
        sharedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
                 person: {
          id: 'person_sarah_chen',
          organizationId,
          firstName: 'Sarah',
          lastName: 'Chen',
          email: 'sarah.chen@stripe.com',
          company: 'Stripe',
          title: 'VP of Product',
          department: 'Product',
          industry: 'fintech',
          seniorityLevel: 'executive',
          relationshipStrength: 8,
          lastInteractionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          communicationPreferences: { preferredMethod: 'email', frequency: 'monthly' } as Record<string, unknown>,
          personalityProfile: { communication: 'direct', style: 'analytical', notes: 'data-driven decision maker' } as Record<string, unknown>,
          createdBy: 'user_demo_kyle',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    ];
  }

  async unshareRelationship(shareId: string): Promise<void> {
    // In production, this would update the database to mark as inactive
    console.log(`Unsharing relationship: ${shareId}`);
  }

  // Team activity tracking
  async recordTeamActivity(activity: Omit<TeamActivity, 'id' | 'timestamp' | 'isVisible'>): Promise<TeamActivity> {
    const teamActivity: TeamActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...activity,
      timestamp: new Date().toISOString(),
      isVisible: true
    };

    // In production, this would be stored in the database
    console.log('Team activity recorded:', teamActivity);
    
    return teamActivity;
  }

  async getTeamActivity(
    organizationId: string, 
    options: {
      userId?: string;
      activityTypes?: TeamActivity['activityType'][];
      limit?: number;
      since?: string;
    } = {}
  ): Promise<TeamActivity[]> {
    const { limit = 50 } = options;

    // Mock team activities - in production this would query the database
    const activities: TeamActivity[] = [
      {
        id: 'activity_001',
        organizationId,
        userId: 'user_demo_kyle',
        activityType: 'relationship_shared',
        entityType: 'person',
        entityId: 'person_sarah_chen',
        description: 'Shared Sarah Chen (Stripe VP Product) with Product Team',
        metadata: { shareType: 'department', reason: 'Partnership evaluation' },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isVisible: true
      },
      {
        id: 'activity_002',
        organizationId,
        userId: 'user_demo_kyle',
        activityType: 'meeting_scheduled',
        entityType: 'person',
        entityId: 'person_david_rodriguez',
        description: 'Scheduled follow-up meeting with David Rodriguez (Salesforce CTO)',
        metadata: { meetingType: 'follow_up', priority: 'high' },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        isVisible: true
      },
      {
        id: 'activity_003',
        organizationId,
        userId: 'user_jennifer_park',
        activityType: 'opportunity_identified',
        entityType: 'person',
        entityId: 'person_michael_thompson',
        description: 'Identified media opportunity with Michael Thompson (TechCrunch CEO)',
        metadata: { opportunityType: 'media_coverage', value: 'high' },
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        isVisible: true
      }
    ];

    return activities.slice(0, limit);
  }

  // Team insights and collaboration opportunities
  async generateTeamInsights(organizationId: string): Promise<TeamInsight[]> {
    // Mock team insights - in production this would use AI to analyze team relationships
    return [
      {
        type: 'warm_introduction',
        priority: 'high',
        title: 'Warm Introduction Opportunity',
        description: 'Kyle can introduce Jennifer to Sarah Chen at Stripe for potential partnership',
        involvedMembers: ['user_demo_kyle', 'user_jennifer_park'],
        suggestedAction: 'Schedule introduction call this week',
        potentialValue: 'Partnership worth $500K+ ARR',
        relatedPeople: ['person_sarah_chen'],
        generatedAt: new Date().toISOString(),
        status: 'new'
      },
      {
        type: 'network_overlap',
        priority: 'medium',
        title: 'Network Overlap Detected',
        description: 'Multiple team members connected to Salesforce - coordination opportunity',
        involvedMembers: ['user_demo_kyle', 'user_david_martinez'],
        suggestedAction: 'Align on Salesforce strategy and share context',
        potentialValue: 'Improved relationship coordination',
        relatedPeople: ['person_david_rodriguez', 'person_sarah_wilson'],
        generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'new'
      },
      {
        type: 'collaboration_opportunity',
        priority: 'medium',
        title: 'Joint Customer Success Opportunity',
        description: 'Cross-team collaboration could strengthen OpenAI relationship',
        involvedMembers: ['user_demo_kyle', 'user_product_team'],
        suggestedAction: 'Create shared context document and align on approach',
        potentialValue: 'Stronger strategic partnership',
        relatedPeople: ['person_jennifer_park'],
        generatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'reviewed'
      }
    ];
  }

  async updateInsightStatus(insightId: string, status: TeamInsight['status']): Promise<void> {
    // In production, this would update the database
    console.log(`Updated insight ${insightId} status to: ${status}`);
  }

  // Team relationship analytics
  async getTeamRelationshipAnalytics(organizationId: string): Promise<{
    totalSharedRelationships: number;
    activeCollaborations: number;
    networkOverlap: number;
    teamReachScore: number;
    departmentBreakdown: Record<string, number>;
    collaborationTrends: Array<{
      period: string;
      sharedRelationships: number;
      introductions: number;
      opportunities: number;
    }>;
  }> {
    // Mock analytics - in production this would aggregate real data
    return {
      totalSharedRelationships: 47,
      activeCollaborations: 12,
      networkOverlap: 23,
      teamReachScore: 85,
      departmentBreakdown: {
        'Sales': 18,
        'Product': 15,
        'Engineering': 8,
        'Marketing': 6
      },
      collaborationTrends: [
        { period: 'This Week', sharedRelationships: 5, introductions: 2, opportunities: 3 },
        { period: 'Last Week', sharedRelationships: 8, introductions: 3, opportunities: 4 },
        { period: '2 Weeks Ago', sharedRelationships: 6, introductions: 1, opportunities: 2 },
        { period: '3 Weeks Ago', sharedRelationships: 4, introductions: 2, opportunities: 1 }
      ]
    };
  }

  // Helper methods
  private getDefaultPermissions(role: string): TeamPermissions {
    switch (role) {
      case 'admin':
        return {
          canViewSharedRelationships: true,
          canEditSharedRelationships: true,
          canShareOwnRelationships: true,
          canViewTeamAnalytics: true,
          canManageTeamMembers: true,
          canExportData: true,
          accessLevel: 'full'
        };
      case 'member':
        return {
          canViewSharedRelationships: true,
          canEditSharedRelationships: false,
          canShareOwnRelationships: true,
          canViewTeamAnalytics: true,
          canManageTeamMembers: false,
          canExportData: false,
          accessLevel: 'department'
        };
      case 'viewer':
        return {
          canViewSharedRelationships: true,
          canEditSharedRelationships: false,
          canShareOwnRelationships: false,
          canViewTeamAnalytics: false,
          canManageTeamMembers: false,
          canExportData: false,
          accessLevel: 'restricted'
        };
      default:
        return {
          canViewSharedRelationships: false,
          canEditSharedRelationships: false,
          canShareOwnRelationships: false,
          canViewTeamAnalytics: false,
          canManageTeamMembers: false,
          canExportData: false,
          accessLevel: 'restricted'
        };
    }
  }

  private getMockTeamMembers(): TeamMember[] {
    return [
      {
        id: 'user_demo_kyle',
        userId: 'user_demo_kyle',
        organizationId: 'org_demo_relationshipos',
        firstName: 'Kyle',
        lastName: 'Demo',
        email: 'kyle@relationshipos.com',
        role: 'admin',
        department: 'Leadership',
        title: 'CEO',
        permissions: this.getDefaultPermissions('admin'),
        isActive: true,
        lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'user_jennifer_park',
        userId: 'user_jennifer_park',
        organizationId: 'org_demo_relationshipos',
        firstName: 'Jennifer',
        lastName: 'Park',
        email: 'jennifer@relationshipos.com',
        role: 'member',
        department: 'Business Development',
        title: 'Head of BD',
        permissions: this.getDefaultPermissions('member'),
        isActive: true,
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'user_david_martinez',
        userId: 'user_david_martinez',
        organizationId: 'org_demo_relationshipos',
        firstName: 'David',
        lastName: 'Martinez',
        email: 'david@relationshipos.com',
        role: 'member',
        department: 'Product',
        title: 'Product Manager',
        permissions: this.getDefaultPermissions('member'),
        isActive: true,
        lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        joinedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
}

// Export singleton instance
export const teamSharingService = TeamSharingService.getInstance();

// Utility functions
export function getFullMemberName(member: TeamMember): string {
  return `${member.firstName} ${member.lastName}`.trim();
}

export function getMemberDisplayTitle(member: TeamMember): string {
  if (member.title && member.department) {
    return `${member.title}, ${member.department}`;
  }
  return member.title || member.department || 'Team Member';
}

export function getPermissionLevel(permissions: TeamPermissions): 'Full Access' | 'Department Access' | 'View Only' {
  if (permissions.accessLevel === 'full') return 'Full Access';
  if (permissions.accessLevel === 'department') return 'Department Access';
  return 'View Only';
}

export function canUserShareWith(currentUser: TeamMember, targetUser: TeamMember): boolean {
  if (!currentUser.permissions.canShareOwnRelationships) return false;
  
  if (currentUser.permissions.accessLevel === 'full') return true;
  if (currentUser.permissions.accessLevel === 'department') {
    return currentUser.department === targetUser.department;
  }
  
  return false;
}

export function formatActivityTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
} 