'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Globe, 
  Calendar,
  Tag,
  FileText,
  Star,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { Person } from '@/lib/database';

interface PersonFormProps {
  mode: 'create' | 'edit';
  organizationId: string;
  person?: Person;
  onSuccess?: string;
  onCancel?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  company: string;
  industry: string;
  seniorityLevel: string;
  department: string;
  linkedinUrl: string;
  twitterUrl: string;
  websiteUrl: string;
  location: string;
  relationshipStrength: number;
  lastInteractionDate: string;
  interactionFrequency: string;
  notes: string;
  tags: string[];
  interests: string[];
}

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Consulting', 'Manufacturing',
  'Education', 'Retail', 'Media', 'Real Estate', 'Government', 'Non-profit',
  'Energy', 'Transportation', 'Hospitality', 'Legal', 'Other'
];

const SENIORITY_LEVELS = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'executive', label: 'Executive' },
  { value: 'c_level', label: 'C-Level' }
];

const INTERACTION_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'rarely', label: 'Rarely' }
];

export default function PersonForm({ mode, organizationId, person, onSuccess, onCancel }: PersonFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  const [formData, setFormData] = useState<FormData>({
    firstName: person?.firstName || '',
    lastName: person?.lastName || '',
    email: person?.email || '',
    phone: person?.phone || '',
    title: person?.title || '',
    company: person?.company || '',
    industry: person?.industry || '',
    seniorityLevel: person?.seniorityLevel || '',
    department: person?.department || '',
    linkedinUrl: person?.linkedinUrl || '',
    twitterUrl: person?.twitterUrl || '',
    websiteUrl: person?.websiteUrl || '',
    location: person?.location || '',
    relationshipStrength: person?.relationshipStrength || 5,
    lastInteractionDate: person?.lastInteractionDate 
      ? new Date(person.lastInteractionDate).toISOString().split('T')[0]
      : '',
    interactionFrequency: person?.interactionFrequency || '',
    notes: person?.notes || '',
    tags: person?.tags || [],
    interests: person?.interests || []
  });

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      handleInputChange('tags', [...formData.tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const addInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      handleInputChange('interests', [...formData.interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    handleInputChange('interests', formData.interests.filter(interest => interest !== interestToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Basic validation
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error('First name and last name are required');
      }

      // Prepare submission data
      const submitData = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        title: formData.title.trim() || undefined,
        company: formData.company.trim() || undefined,
        industry: formData.industry || undefined,
        seniorityLevel: formData.seniorityLevel || undefined,
        department: formData.department.trim() || undefined,
        linkedinUrl: formData.linkedinUrl.trim() || undefined,
        twitterUrl: formData.twitterUrl.trim() || undefined,
        websiteUrl: formData.websiteUrl.trim() || undefined,
        location: formData.location.trim() || undefined,
        lastInteractionDate: formData.lastInteractionDate || undefined,
        interactionFrequency: formData.interactionFrequency || undefined,
        notes: formData.notes.trim() || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        interests: formData.interests.length > 0 ? formData.interests : undefined
      };

      // Submit to API
      const url = mode === 'create' 
        ? '/api/people' 
        : `/api/people/${person?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save person');
      }

      // Success - redirect
      if (onSuccess) {
        router.push(onSuccess);
      } else {
        router.push('/dashboard/people');
      }

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      router.push(onCancel);
    } else {
      router.push('/dashboard/people');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline h-4 w-4 mr-1" />
            First Name *
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="John"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline h-4 w-4 mr-1" />
            Last Name *
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Smith"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="inline h-4 w-4 mr-1" />
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="john.smith@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline h-4 w-4 mr-1" />
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      {/* Professional Information */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Professional Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="inline h-4 w-4 mr-1" />
              Job Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Senior Software Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="inline h-4 w-4 mr-1" />
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="TechCorp Inc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <select
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map(industry => (
                <option key={industry} value={industry.toLowerCase()}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seniority Level
            </label>
            <select
              value={formData.seniorityLevel}
              onChange={(e) => handleInputChange('seniorityLevel', e.target.value)}
              className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select level</option>
              {SENIORITY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Engineering"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="San Francisco, CA"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Social & Web Presence</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="inline h-4 w-4 mr-1" />
              LinkedIn URL
            </label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
              className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://linkedin.com/in/johnsmith"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="inline h-4 w-4 mr-1" />
              Twitter URL
            </label>
            <input
              type="url"
              value={formData.twitterUrl}
              onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
              className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://twitter.com/johnsmith"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="inline h-4 w-4 mr-1" />
              Website URL
            </label>
            <input
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
              className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://johnsmith.com"
            />
          </div>
        </div>
      </div>

      {/* Relationship Details */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Relationship Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Star className="inline h-4 w-4 mr-1" />
              Relationship Strength: {formData.relationshipStrength}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.relationshipStrength}
              onChange={(e) => handleInputChange('relationshipStrength', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Weak</span>
              <span>Strong</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interaction Frequency
            </label>
            <select
              value={formData.interactionFrequency}
              onChange={(e) => handleInputChange('interactionFrequency', e.target.value)}
              className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select frequency</option>
              {INTERACTION_FREQUENCIES.map(freq => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Last Interaction Date
            </label>
            <input
              type="date"
              value={formData.lastInteractionDate}
              onChange={(e) => handleInputChange('lastInteractionDate', e.target.value)}
              className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Tags & Interests</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline h-4 w-4 mr-1" />
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interests
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                className="flex-1 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add an interest"
              />
              <button
                type="button"
                onClick={addInterest}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="border-t border-gray-200 pt-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            className="block w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any additional notes about this person, how you met, key conversation topics, etc."
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Create Person' : 'Update Person'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
} 