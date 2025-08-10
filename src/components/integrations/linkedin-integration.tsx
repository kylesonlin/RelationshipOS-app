'use client'

import { useState, useEffect } from 'react';
import { 
  Linkedin, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Users, 
  Building, 
  TrendingUp,
  Clock,
  Eye,
  Settings
} from 'lucide-react';

interface LinkedInIntegrationProps {
  organizationId?: string;
  userId?: string;
  onSyncComplete?: (results: Record<string, unknown>) => void;
}

interface LinkedInStatus {
  connected: boolean;
  connectedAt?: string;
  profile?: {
    name: string;
    headline: string;
    connections: number;
    lastSyncAt: string;
  };
  health: {
    status: 'healthy' | 'warning' | 'error';
    lastError?: string;
  };
  tokenStatus: {
    valid: boolean;
    expiresAt: string;
  };
}

interface SyncResults {
  connections: { total: number; new: number; updated: number };
  updates: { processed: number; jobChanges: number; newPosts: number };
  intelligence: { opportunitiesIdentified: number; relationshipsUpdated: number };
  recentUpdates?: Array<{
    type: string;
    person: string;
    description: string;
    relevanceScore: number;
    timestamp: string;
  }>;
}

export default function LinkedInIntegration({ onSyncComplete }: LinkedInIntegrationProps) {
  const [linkedinStatus, setLinkedinStatus] = useState<LinkedInStatus | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResults | null>(null);
  const [showSyncResults, setShowSyncResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncType, setLastSyncType] = useState<string>('');

  // Load LinkedIn integration status on component mount
  useEffect(() => {
    loadLinkedInStatus();
  }, []);

  const loadLinkedInStatus = async () => {
    try {
      const response = await fetch('/api/integrations/linkedin/sync');
      if (response.ok) {
        const data = await response.json();
        setLinkedinStatus(data.integration);
      } else {
        // Not connected or error
        setLinkedinStatus({
          connected: false,
          health: { status: 'error' },
          tokenStatus: { valid: false, expiresAt: '' }
        });
      }
    } catch {
      setLinkedinStatus({
        connected: false,
        health: { status: 'error', lastError: 'Failed to check connection status' },
        tokenStatus: { valid: false, expiresAt: '' }
      });
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch('/api/integrations/linkedin/connect');
      if (response.ok) {
        const data = await response.json();
        // Redirect to LinkedIn OAuth
        window.location.href = data.authUrl;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to initiate LinkedIn connection');
      }
    } catch {
      setError('Network error occurred. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async (syncType: string = 'full') => {
    setIsSyncing(true);
    setError(null);
    setLastSyncType(syncType);

    try {
      const response = await fetch('/api/integrations/linkedin/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ syncType })
      });

      if (response.ok) {
        const data = await response.json();
        setSyncResults(data.results);
        setShowSyncResults(true);
        
        // Refresh status after successful sync
        await loadLinkedInStatus();
        
        // Notify parent component
        if (onSyncComplete) {
          onSyncComplete(data.results);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Sync failed');
      }
    } catch {
      setError('Network error during sync. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReconnect = async () => {
    await handleConnect();
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  if (!linkedinStatus) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading LinkedIn integration status...</span>
        </div>
      </div>
    );
  }

  if (!linkedinStatus.connected) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Linkedin className="h-6 w-6 text-blue-600" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connect LinkedIn
          </h3>
          
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Sync your professional network to get AI-powered relationship intelligence and opportunity detection.
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Linkedin className="h-4 w-4 mr-2" />
                Connect LinkedIn
              </>
            )}
          </button>
          
          <div className="mt-6 text-xs text-gray-500">
            <p>✓ Secure OAuth connection</p>
            <p>✓ Read-only access to your professional network</p>
            <p>✓ No posting or messaging permissions required</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 mr-3">
              <Linkedin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">LinkedIn Integration</h3>
              <div className="flex items-center">
                {getStatusIcon(linkedinStatus.health.status)}
                <span className={`ml-1 text-sm font-medium ${getStatusColor(linkedinStatus.health.status)}`}>
                  {linkedinStatus.health.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleSync('updates')}
              disabled={isSyncing}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {isSyncing && lastSyncType === 'updates' ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Quick Sync
            </button>
            
            <button
              onClick={() => handleSync('full')}
              disabled={isSyncing}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isSyncing && lastSyncType === 'full' ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Full Sync
            </button>
          </div>
        </div>

        {/* Profile Summary */}
        {linkedinStatus.profile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{linkedinStatus.profile.connections}</div>
              <div className="text-sm text-gray-600">LinkedIn Connections</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{linkedinStatus.profile.name}</div>
              <div className="text-sm text-gray-600">{linkedinStatus.profile.headline}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                Last Sync: {formatTimeAgo(linkedinStatus.profile.lastSyncAt)}
              </div>
              <div className="text-xs text-gray-500">
                Token expires: {formatTimeAgo(linkedinStatus.tokenStatus.expiresAt)}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Sync Results Modal/Card */}
      {showSyncResults && syncResults && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sync Results</h3>
            <button
              onClick={() => setShowSyncResults(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{syncResults.connections.new}</div>
              <div className="text-sm text-blue-700">New Connections</div>
              <div className="text-xs text-blue-600 mt-1">
                {syncResults.connections.updated} updated
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{syncResults.updates.jobChanges}</div>
              <div className="text-sm text-green-700">Job Changes</div>
              <div className="text-xs text-green-600 mt-1">
                {syncResults.updates.newPosts} new posts
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Building className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">{syncResults.intelligence.opportunitiesIdentified}</div>
              <div className="text-sm text-purple-700">Opportunities</div>
              <div className="text-xs text-purple-600 mt-1">
                {syncResults.intelligence.relationshipsUpdated} relationships updated
              </div>
            </div>
          </div>

          {/* Recent Updates */}
          {syncResults.recentUpdates && syncResults.recentUpdates.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Recent Professional Updates</h4>
              <div className="space-y-3">
                {syncResults.recentUpdates.map((update, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{update.person}</div>
                      <div className="text-sm text-gray-600">{update.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(update.timestamp)} • Relevance: {update.relevanceScore}/10
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        update.type === 'job_change' ? 'bg-blue-100 text-blue-800' :
                        update.type === 'company_update' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {update.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">LinkedIn Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleSync('connections')}
            disabled={isSyncing}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Users className="h-4 w-4 mr-2" />
            Sync Connections Only
          </button>
          
          <button
            onClick={() => handleSync('updates')}
            disabled={isSyncing}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Check Updates Only
          </button>
          
          <button
            onClick={handleReconnect}
            disabled={isConnecting}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Reconnect Account
          </button>
          
          <button
            onClick={() => window.open('https://linkedin.com', '_blank')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Linkedin className="h-4 w-4 mr-2" />
            Open LinkedIn
          </button>
        </div>
      </div>
    </div>
  );
} 