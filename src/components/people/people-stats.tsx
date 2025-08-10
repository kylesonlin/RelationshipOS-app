'use client'

import { Users, TrendingUp, Clock, AlertTriangle, Building, Award } from 'lucide-react';

interface PeopleStatsProps {
  stats: {
    total: number;
    recentContacts: number;
    strongRelationships: number;
    needsFollowUp: number;
    averageStrength: number;
    topIndustries: Array<{ name: string; count: number }>;
    topSeniorities: Array<{ name: string; count: number }>;
  };
}

export default function PeopleStats({ stats }: PeopleStatsProps) {
  const mainStats = [
    {
      name: 'Total People',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'People in your network'
    },
    {
      name: 'Recent Contacts',
      value: stats.recentContacts,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Contacted in last 7 days'
    },
    {
      name: 'Strong Relationships',
      value: stats.strongRelationships,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Relationships rated 8+ strength'
    },
    {
      name: 'Needs Follow-up',
      value: stats.needsFollowUp,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'No contact in 30+ days'
    }
  ];

  const getProgressPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.min(100, (value / total) * 100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Stats Cards */}
      {mainStats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="ml-4 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {stat.name}
                </dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </dd>
                <dd className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}

      {/* Extended Stats - Show on larger screens */}
      <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Relationship Strength */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Average Strength</h3>
            <div className="text-2xl font-bold text-gray-900">
              {stats.averageStrength.toFixed(1)}/10
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(stats.averageStrength / 10) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Network relationship strength
          </p>
        </div>

        {/* Top Industries */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Building className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Top Industries</h3>
          </div>
          <div className="space-y-3">
            {stats.topIndustries.slice(0, 4).map((industry, index) => (
              <div key={industry.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' :
                    'bg-orange-500'
                  }`} />
                  <span className="text-sm text-gray-700">{industry.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${getProgressPercentage(industry.count, stats.total)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-6 text-right">
                    {industry.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Seniority Levels */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Award className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Seniority Levels</h3>
          </div>
          <div className="space-y-3">
            {stats.topSeniorities.slice(0, 4).map((seniority, index) => (
              <div key={seniority.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-purple-500' :
                    index === 1 ? 'bg-blue-500' :
                    index === 2 ? 'bg-green-500' :
                    'bg-yellow-500'
                  }`} />
                  <span className="text-sm text-gray-700">{seniority.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-purple-500' :
                        index === 1 ? 'bg-blue-500' :
                        index === 2 ? 'bg-green-500' :
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${getProgressPercentage(seniority.count, stats.total)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-6 text-right">
                    {seniority.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 