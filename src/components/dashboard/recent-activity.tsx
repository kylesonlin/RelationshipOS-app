'use client'

// import { formatDistanceToNow } from 'date-fns';
import { Search, Zap, Clock } from 'lucide-react';
import { OracleQuery } from '@/lib/database';

interface RecentActivityProps {
  queries: OracleQuery[];
}

export default function RecentActivity({ queries }: RecentActivityProps) {
  const getQueryTypeIcon = (type: string) => {
    switch (type) {
      case 'search':
        return Search;
      case 'analysis':
      case 'prediction':
      case 'optimization':
      case 'insight':
        return Zap;
      default:
        return Search;
    }
  };

  const getQueryTypeColor = (type: string) => {
    switch (type) {
      case 'search':
        return 'text-blue-600 bg-blue-100';
      case 'analysis':
        return 'text-purple-600 bg-purple-100';
      case 'prediction':
        return 'text-green-600 bg-green-100';
      case 'optimization':
        return 'text-orange-600 bg-orange-100';
      case 'insight':
        return 'text-pink-600 bg-pink-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (queries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Oracle Queries</h3>
        <div className="text-center py-8">
          <Search className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No queries yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by asking Oracle about your relationships above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Oracle Queries</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {queries.map((query) => {
          const Icon = getQueryTypeIcon(query.queryType);
          const colorClass = getQueryTypeColor(query.queryType);
          
          return (
            <div key={query.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {query.query}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {query.responseTime}ms
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {query.response.substring(0, 150)}
                    {query.response.length > 150 ? '...' : ''}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                        {query.queryType.charAt(0).toUpperCase() + query.queryType.slice(1)}
                      </span>
                      {query.fromCache && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
                          Cached
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {query.confidence}% confidence
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(query.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {queries.length >= 10 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all queries →
          </button>
        </div>
      )}
    </div>
  );
} 