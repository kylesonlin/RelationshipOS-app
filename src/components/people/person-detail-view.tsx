'use client'

import { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Globe, 
  Calendar, 
  Clock,
  Tag,
  FileText,
  TrendingUp,
  ExternalLink,
  MessageCircle,
  Users
} from 'lucide-react';
import { Person, Relationship, getRelationshipHealthColor } from '@/lib/database';

interface PersonDetailViewProps {
  person: Person;
  relationships: Relationship[];
  organizationId: string;
}

export default function PersonDetailView({ person, relationships, organizationId }: PersonDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'relationships' | 'interactions'>('overview');

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatLastInteraction = (dateString?: string) => {
    if (!dateString) return 'No recent contact';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const getContactMethods = () => {
    const methods = [];
    if (person.email) methods.push({ type: 'Email', value: person.email, icon: Mail, href: `mailto:${person.email}` });
    if (person.phone) methods.push({ type: 'Phone', value: person.phone, icon: Phone, href: `tel:${person.phone}` });
    if (person.linkedinUrl) methods.push({ type: 'LinkedIn', value: 'View Profile', icon: Globe, href: person.linkedinUrl });
    if (person.twitterUrl) methods.push({ type: 'Twitter', value: 'View Profile', icon: Globe, href: person.twitterUrl });
    if (person.websiteUrl) methods.push({ type: 'Website', value: 'Visit Site', icon: Globe, href: person.websiteUrl });
    return methods;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'relationships', label: 'Relationships', icon: TrendingUp },
    { id: 'interactions', label: 'Interactions', icon: MessageCircle }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            
            <div className="space-y-4">
              {getContactMethods().map((method) => (
                <div key={method.type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <method.icon className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{method.type}</div>
                      <div className="text-sm text-gray-600">{method.value}</div>
                    </div>
                  </div>
                  <a
                    href={method.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}

              {person.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Location</div>
                    <div className="text-sm text-gray-600">{person.location}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
            
            <div className="space-y-4">
              {person.company && (
                <div className="flex items-start">
                  <Building className="h-4 w-4 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Company</div>
                    <div className="text-sm text-gray-600">{person.company}</div>
                  </div>
                </div>
              )}

              {person.title && (
                <div className="flex items-start">
                  <Users className="h-4 w-4 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Title</div>
                    <div className="text-sm text-gray-600">{person.title}</div>
                  </div>
                </div>
              )}

              {person.industry && (
                <div className="flex items-start">
                  <Building className="h-4 w-4 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Industry</div>
                    <div className="text-sm text-gray-600 capitalize">{person.industry}</div>
                  </div>
                </div>
              )}

              {person.department && (
                <div className="flex items-start">
                  <Users className="h-4 w-4 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Department</div>
                    <div className="text-sm text-gray-600">{person.department}</div>
                  </div>
                </div>
              )}

              {person.seniorityLevel && (
                <div className="flex items-start">
                  <TrendingUp className="h-4 w-4 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Seniority Level</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {person.seniorityLevel.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Relationship Stats & Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Relationship Summary</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Contact</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatLastInteraction(person.lastInteractionDate)}
                </span>
              </div>

              {person.interactionFrequency && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Contact Frequency</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {person.interactionFrequency}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mutual Connections</span>
                <span className="text-sm font-medium text-gray-900">
                  {person.mutualConnections || 0}
                </span>
              </div>

              {person.influenceScore && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Influence Score</span>
                  <span className="text-sm font-medium text-gray-900">
                    {person.influenceScore}/10
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Added</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(person.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tags & Interests */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Tags
            </h3>
            
            {person.tags && person.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {person.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No tags added</p>
            )}
          </div>

          {/* Interests */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Interests
            </h3>
            
            {person.interests && person.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {person.interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No interests added</p>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {activeTab === 'overview' && person.notes && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Notes
          </h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{person.notes}</p>
          </div>
        </div>
      )}

      {/* Relationships Tab */}
      {activeTab === 'relationships' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Relationships</h3>
            <p className="text-sm text-gray-600 mt-1">
              Relationship connections and details for this person
            </p>
          </div>
          
          <div className="p-6">
            {relationships.length > 0 ? (
              <div className="space-y-4">
                {relationships.map((relationship) => (
                  <div key={relationship.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {relationship.relationshipType}
                        </span>
                        <span className={`text-sm font-medium ${getRelationshipHealthColor(relationship.healthStatus)}`}>
                          {relationship.healthStatus}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Strength: {relationship.strengthScore}/10
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      Last interaction: {formatLastInteraction(relationship.lastInteraction)}
                    </p>
                    
                    {relationship.contextNotes && (
                      <p className="text-sm text-gray-700">
                        {relationship.contextNotes}
                      </p>
                    )}
                    
                    {relationship.interactionTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {relationship.interactionTypes.map((type) => (
                          <span
                            key={type}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No relationships</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No relationship details have been recorded for this person yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactions Tab */}
      {activeTab === 'interactions' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Interaction History</h3>
            <p className="text-sm text-gray-600 mt-1">
              Recent communications and meetings with this person
            </p>
          </div>
          
          <div className="p-6">
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No interactions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Interaction history will appear here once integrations are connected.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 