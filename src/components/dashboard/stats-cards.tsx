'use client'

import { Users, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalPeople: number;
    recentInteractions: number;
    strongRelationships: number;
    needsFollowUp: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      name: 'Total People',
      value: stats.totalPeople,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'People in your network'
    },
    {
      name: 'Recent Interactions',
      value: stats.recentInteractions,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Interactions in last 30 days'
    },
    {
      name: 'Strong Relationships',
      value: stats.strongRelationships,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Relationships rated 7+ strength'
    },
    {
      name: 'Needs Follow-up',
      value: stats.needsFollowUp,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Relationships requiring attention'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.name} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {card.name}
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {card.value.toLocaleString()}
                  </dd>
                  <dd className="text-xs text-gray-500 mt-1">
                    {card.description}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 