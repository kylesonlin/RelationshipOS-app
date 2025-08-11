'use client'

import { useState, useEffect } from 'react';
import { 
  Users, 
  Crown, 
  Shield, 
  Eye,
  MoreVertical,
  UserPlus,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface TeamMember {
  id: string;
  userId: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  department?: string;
  title?: string;
  isActive: boolean;
  lastActive?: string;
  joinedAt: string;
}

interface TeamMembersCardProps {
  organizationId: string;
  currentUserId: string;
}

export default function TeamMembersCard({ organizationId, currentUserId }: TeamMembersCardProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);

  useEffect(() => {
    loadTeamMembers();
  }, [organizationId]);

  const loadTeamMembers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/team/members');
      
      if (response.ok) {
        const data = await response.json();
        setMembers(data.data.members || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load team members');
      }
    } catch {
      setError('Network error loading team members');
    } finally {
      setIsLoading(false);
    }
  };

  const getFullName = (member: TeamMember) => {
    return `${member.firstName} ${member.lastName}`.trim();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'member': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'viewer': return <Eye className="h-4 w-4 text-gray-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-yellow-100 text-yellow-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastActive = (lastActive?: string) => {
    if (!lastActive) return 'Never';
    
    const date = new Date(lastActive);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 5) return 'Active now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getActivityStatus = (member: TeamMember) => {
    if (!member.lastActive) return 'inactive';
    
    const date = new Date(member.lastActive);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 30) return 'active';
    if (diffInMinutes < 24 * 60) return 'recent';
    return 'inactive';
  };

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'recent': return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'inactive': return <AlertCircle className="h-3 w-3 text-gray-400" />;
      default: return <AlertCircle className="h-3 w-3 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Team Members
          </h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200">
        <div className="px-6 py-4 border-b border-red-200">
          <h3 className="text-lg font-semibold text-red-900 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error Loading Team Members
          </h3>
        </div>
        <div className="p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadTeamMembers}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team Members
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {members.length} active members
            </p>
          </div>
          
          <button
            onClick={() => setShowInviteForm(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Invite
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {members.map((member) => {
            const activityStatus = getActivityStatus(member);
            const isCurrentUser = member.userId === currentUserId;
            
            return (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      {getActivityIcon(activityStatus)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {getFullName(member)}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-blue-600">(You)</span>
                        )}
                      </p>
                      <div className="flex items-center space-x-1">
                        {getRoleIcon(member.role)}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-xs text-gray-500">{member.email}</p>
                      {member.department && (
                        <p className="text-xs text-gray-500">{member.department}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Active {formatLastActive(member.lastActive)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-1 rounded-full hover:bg-gray-200">
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Form Modal - Simple placeholder */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Invite Team Member</h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="colleague@company.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowInviteForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowInviteForm(false);
                  // In production, this would send the invitation
                }}
                className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            {members.filter(m => getActivityStatus(m) === 'active').length} active now
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
            <Settings className="h-4 w-4 mr-1" />
            Manage Permissions
          </button>
        </div>
      </div>
    </div>
  );
} 