'use client'

import { Plus, Upload, Users, Search, Settings, BarChart3 } from 'lucide-react';

interface QuickActionsProps {
  organizationId: string;
}

export default function QuickActions({ organizationId }: QuickActionsProps) {
  const actions = [
    {
      name: 'Add Person',
      description: 'Add a new contact to your network',
      icon: Plus,
      href: '/dashboard/people/new',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Import Contacts',
      description: 'Import from CSV or email',
      icon: Upload,
      href: '/dashboard/import',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      name: 'View People',
      description: 'Browse your relationship network',
      icon: Users,
      href: '/dashboard/people',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      name: 'Oracle Search',
      description: 'Advanced relationship queries',
      icon: Search,
      href: '/dashboard/oracle',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      name: 'Analytics',
      description: 'Relationship insights & reports',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'bg-pink-600 hover:bg-pink-700',
    },
    {
      name: 'Settings',
      description: 'Account & preferences',
      icon: Settings,
      href: '/dashboard/settings',
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action) => (
          <a
            key={action.name}
            href={action.href}
            className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
          >
            <div className={`p-2 rounded-lg ${action.color} text-white mr-3`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                {action.name}
              </p>
              <p className="text-xs text-gray-500">
                {action.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
} 