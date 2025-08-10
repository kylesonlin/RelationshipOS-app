'use client'

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, ChevronDown } from 'lucide-react';
import { SearchFilters } from '@/lib/database';

interface PeopleFiltersProps {
  filters: SearchFilters;
  totalResults: number;
}

export default function PeopleFilters({ filters, totalResults }: PeopleFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value !== '') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to first page when filtering
    params.delete('page');
    
    router.push(`/dashboard/people?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    
    // Keep search query if it exists
    if (searchParams.get('q')) {
      params.set('q', searchParams.get('q')!);
    }
    
    router.push(`/dashboard/people?${params.toString()}`);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.industry) count++;
    if (filters.seniorityLevel) count++;
    if (filters.location) count++;
    if (filters.relationshipStrength?.min || filters.relationshipStrength?.max) count++;
    if (filters.lastInteractionDays) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const industries = [
    'Technology',
    'Finance',
    'Healthcare',
    'Consulting',
    'Manufacturing',
    'Education',
    'Retail',
    'Media',
    'Real Estate',
    'Government',
  ];

  const seniorityLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'executive', label: 'Executive' },
    { value: 'c_level', label: 'C-Level' },
  ];

  const interactionPeriods = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '180', label: 'Last 6 months' },
    { value: '365', label: 'Last year' },
  ];

  return (
    <div className="space-y-4">
      {/* Filter Toggle and Active Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
              showFilters 
                ? 'border-blue-500 text-blue-700 bg-blue-50' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all
            </button>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          {totalResults.toLocaleString()} {totalResults === 1 ? 'person' : 'people'}
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.industry && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Industry: {filters.industry}
              <button
                onClick={() => updateFilter('industry', null)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.seniorityLevel && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              Level: {seniorityLevels.find(s => s.value === filters.seniorityLevel)?.label}
              <button
                onClick={() => updateFilter('seniority', null)}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.location && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              Location: {filters.location}
              <button
                onClick={() => updateFilter('location', null)}
                className="ml-2 text-purple-600 hover:text-purple-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {(filters.relationshipStrength?.min || filters.relationshipStrength?.max) && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
              Strength: {filters.relationshipStrength?.min || 0}-{filters.relationshipStrength?.max || 10}
              <button
                onClick={() => {
                  updateFilter('strength_min', null);
                  updateFilter('strength_max', null);
                }}
                className="ml-2 text-orange-600 hover:text-orange-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.lastInteractionDays && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-800">
              Contact: {interactionPeriods.find(p => p.value === filters.lastInteractionDays?.toString())?.label}
              <button
                onClick={() => updateFilter('last_interaction', null)}
                className="ml-2 text-pink-600 hover:text-pink-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Industry Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={filters.industry || ''}
                onChange={(e) => updateFilter('industry', e.target.value)}
                className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All industries</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry.toLowerCase()}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Seniority Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seniority Level
              </label>
              <select
                value={filters.seniorityLevel || ''}
                onChange={(e) => updateFilter('seniority', e.target.value)}
                className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All levels</option>
                {seniorityLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={filters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value)}
                placeholder="Enter city or region"
                className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Relationship Strength Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship Strength
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={filters.relationshipStrength?.min || ''}
                  onChange={(e) => updateFilter('strength_min', e.target.value)}
                  placeholder="Min"
                  className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="flex items-center text-gray-500">to</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={filters.relationshipStrength?.max || ''}
                  onChange={(e) => updateFilter('strength_max', e.target.value)}
                  placeholder="Max"
                  className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Last Interaction Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Contact
              </label>
              <select
                value={filters.lastInteractionDays?.toString() || ''}
                onChange={(e) => updateFilter('last_interaction', e.target.value)}
                className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any time</option>
                {interactionPeriods.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 