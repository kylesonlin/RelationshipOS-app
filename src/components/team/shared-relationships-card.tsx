'use client'

import { useState, useEffect } from 'react';
import { Share2, Eye, Edit, MessageCircle, Users, AlertCircle, ExternalLink } from 'lucide-react';

interface SharedRelationship {
  id: string;
  shareType: 'individual' | 'department' | 'organization';
  shareReason?: string;
  sharedAt: string;
  person: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    company?: string;
    title?: string;
    relationshipStrength?: number;
  };
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canContact: boolean;
    canAddNotes: boolean;
  };
}

interface SharedRelationshipsCardProps {
  organizationId: string;
  userId: string;
}

export default function SharedRelationshipsCard({ organizationId, userId }: SharedRelationshipsCardProps) {
  const [sharedRelationships, setSharedRelationships] = useState<SharedRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSharedRelationships();
  }, [organizationId, userId]);

  const loadSharedRelationships = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/team/sharing');
      
      if (response.ok) {
        const data = await response.json();
        setSharedRelationships(data.data.sharedRelationships || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load shared relationships');
      }
    } catch {
      setError('Network error loading shared relationships');
    } finally {
      setIsLoading(false);
    }
  };

  const getFullName = (person: SharedRelationship['person']) => {
    return `${person.firstName} ${person.lastName}`.trim();
  };

  const getPersonDisplayTitle = (person: SharedRelationship['person']) => {
    if (person.title && person.company) {
      return `${person.title} at ${person.company}`;
    }
    return person.title || person.company || 'Professional Contact';
  };

  const getShareTypeIcon = (shareType: string) => {
    switch (shareType) {
      case 'organization': return <Users className="h-4 w-4 text-blue-600" />;
      case 'department': return <Share2 className="h-4 w-4 text-green-600" />;
      case 'individual': return <Eye className="h-4 w-4 text-purple-600" />;
      default: return <Share2 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getShareTypeColor = (shareType: string) => {
    switch (shareType) {
      case 'organization': return 'bg-blue-100 text-blue-800';
      case 'department': return 'bg-green-100 text-green-800';
      case 'individual': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSharedTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const getRelationshipStrengthColor = (strength?: number) => {
    if (!strength) return 'bg-gray-200';
    if (strength >= 8) return 'bg-green-500';
    if (strength >= 6) return 'bg-yellow-500';
    if (strength >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            Shared Relationships
          </h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
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
            Error Loading Shared Relationships
          </h3>
        </div>
        <div className="p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadSharedRelationships}
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
              <Share2 className="h-5 w-5 mr-2" />
              Shared Relationships
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Relationships shared with you by team members
            </p>
          </div>
          
          <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </button>
        </div>
      </div>

      <div className="p-6">
        {sharedRelationships.length === 0 ? (
          <div className="text-center py-8">
            <Share2 className="mx-auto h-12 w-12 text-gray-300" />
            <h4 className="mt-2 text-sm font-medium text-gray-900">No shared relationships</h4>
            <p className="mt-1 text-sm text-gray-500">
              Relationships shared with you will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sharedRelationships.map((shared) => (
              <div key={shared.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {shared.person.firstName.charAt(0)}{shared.person.lastName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {getFullName(shared.person)}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {getShareTypeIcon(shared.shareType)}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getShareTypeColor(shared.shareType)}`}>
                            {shared.shareType}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {getPersonDisplayTitle(shared.person)}
                      </p>
                      
                      {shared.person.relationshipStrength && (
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs text-gray-500">Relationship Strength:</span>
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getRelationshipStrengthColor(shared.person.relationshipStrength)}`}
                                style={{ width: `${(shared.person.relationshipStrength / 10) * 100}%` }}
                              />
                            </div>
                            <span className="ml-2 text-xs text-gray-600">
                              {shared.person.relationshipStrength}/10
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {shared.shareReason && (
                        <p className="text-xs text-gray-600 bg-gray-100 rounded p-2 mb-2">
                          <span className="font-medium">Shared for:</span> {shared.shareReason}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Shared {formatSharedTime(shared.sharedAt)}</span>
                          <div className="flex items-center space-x-1">
                            {shared.permissions.canView && <Eye className="h-3 w-3" />}
                            {shared.permissions.canEdit && <Edit className="h-3 w-3" />}
                            {shared.permissions.canContact && <MessageCircle className="h-3 w-3" />}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                            View Profile
                          </button>
                          {shared.permissions.canContact && (
                            <button className="text-green-600 hover:text-green-700 text-xs font-medium flex items-center">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Contact
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {sharedRelationships.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              {sharedRelationships.filter(s => s.permissions.canEdit).length} editable relationships
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              View All Shared →
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 