'use client'

import { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  Minus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Person, getFullName, getPersonDisplayTitle, formatRelationshipStrength } from '@/lib/database';

interface PeopleListProps {
  people: Person[];
  organizationId: string;
  currentPage: number;
  totalPages: number;
  totalResults: number;
}

export default function PeopleList({ 
  people, 
  organizationId, 
  currentPage, 
  totalPages, 
  totalResults 
}: PeopleListProps) {
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const toggleSelectPerson = (personId: string) => {
    setSelectedPeople(prev => 
      prev.includes(personId) 
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedPeople(prev => 
      prev.length === people.length 
        ? [] 
        : people.map(p => p.id)
    );
  };

  const getRelationshipStrengthColor = (strength?: number) => {
    if (!strength) return 'text-gray-400';
    if (strength >= 8) return 'text-green-600';
    if (strength >= 6) return 'text-blue-600';
    if (strength >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRelationshipStrengthIcon = (strength?: number) => {
    if (!strength) return Minus;
    if (strength >= 6) return TrendingUp;
    return TrendingDown;
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

  if (people.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-300">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No people found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding a person to your network.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard/people/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Add your first person
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Bulk Actions Bar */}
      {selectedPeople.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedPeople.length} selected
              </span>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                Export
              </button>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                Add Tags
              </button>
              <button className="text-sm text-red-600 hover:text-red-700">
                Delete
              </button>
            </div>
            <button 
              onClick={() => setSelectedPeople([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* People Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {people.map((person) => {
            const StrengthIcon = getRelationshipStrengthIcon(person.relationshipStrength);
            const strengthColor = getRelationshipStrengthColor(person.relationshipStrength);
            
            return (
              <div 
                key={person.id} 
                className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow relative ${
                  selectedPeople.includes(person.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-3 left-3">
                  <input
                    type="checkbox"
                    className="rounded text-blue-600 focus:ring-blue-500"
                    checked={selectedPeople.includes(person.id)}
                    onChange={() => toggleSelectPerson(person.id)}
                  />
                </div>

                {/* Actions Menu */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => setActionMenuOpen(actionMenuOpen === person.id ? null : person.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  
                  {actionMenuOpen === person.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        <Link
                          href={`/dashboard/people/${person.id}`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Eye className="mr-3 h-4 w-4" />
                          View Details
                        </Link>
                        <Link
                          href={`/dashboard/people/${person.id}/edit`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Edit className="mr-3 h-4 w-4" />
                          Edit
                        </Link>
                        <button className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100">
                          <Trash2 className="mr-3 h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Person Info */}
                <div className="mt-6">
                  {/* Avatar */}
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-xl font-medium">
                        {person.firstName.charAt(0)}{person.lastName.charAt(0)}
                      </span>
                    </div>
                  </div>

                  {/* Name and Title */}
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getFullName(person)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {getPersonDisplayTitle(person)}
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 space-y-2">
                    {person.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">{person.email}</span>
                      </div>
                    )}
                    {person.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{person.phone}</span>
                      </div>
                    )}
                    {person.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">{person.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Relationship Strength */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <StrengthIcon className={`h-4 w-4 mr-1 ${strengthColor}`} />
                      <span className={`text-sm font-medium ${strengthColor}`}>
                        {formatRelationshipStrength(person.relationshipStrength || 0)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {person.relationshipStrength || 0}/10
                    </span>
                  </div>

                  {/* Last Interaction */}
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatLastInteraction(person.lastInteractionDate)}</span>
                  </div>

                  {/* Tags */}
                  {person.tags && person.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {person.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {person.tags.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{person.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing {((currentPage - 1) * 24) + 1} to {Math.min(currentPage * 24, totalResults)} of {totalResults} results
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`px-3 py-1 rounded-md text-sm ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 