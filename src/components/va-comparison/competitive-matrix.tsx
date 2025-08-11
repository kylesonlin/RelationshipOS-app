'use client'

import { CheckCircle, XCircle, Minus } from 'lucide-react';

export default function CompetitiveMatrix() {
  const features = [
    { name: 'Response Time', relationshipOS: '< 10 seconds', humanVA: '2-8 hours', advantage: 'ai' },
    { name: 'Cost', relationshipOS: '$299-2,499/mo', humanVA: '$4,000-10,000/mo', advantage: 'ai' },
    { name: 'Availability', relationshipOS: '24/7/365', humanVA: '8-10 hours/day', advantage: 'ai' },
    { name: 'Accuracy', relationshipOS: '94.5%', humanVA: '82.5%', advantage: 'ai' },
    { name: 'Scalability', relationshipOS: 'Unlimited', humanVA: 'Linear hiring', advantage: 'ai' },
    { name: 'Learning', relationshipOS: 'Continuous AI', humanVA: 'Limited human', advantage: 'ai' },
    { name: 'Setup Time', relationshipOS: 'Immediate', humanVA: '2-4 weeks', advantage: 'ai' },
    { name: 'Consistency', relationshipOS: '99% reliable', humanVA: '75% variable', advantage: 'ai' }
  ];

  const getIcon = (advantage: string) => {
    switch (advantage) {
      case 'ai': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'human': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Competitive Matrix</h3>
        <p className="text-sm text-gray-600 mt-1">Feature-by-feature comparison</p>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-700">Feature</th>
                <th className="text-center py-2 text-sm font-medium text-blue-700">RelationshipOS</th>
                <th className="text-center py-2 text-sm font-medium text-red-700">Human VA</th>
                <th className="text-center py-2 text-sm font-medium text-gray-700">Winner</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 text-sm font-medium text-gray-900">{feature.name}</td>
                  <td className="py-3 text-center text-sm text-blue-900">{feature.relationshipOS}</td>
                  <td className="py-3 text-center text-sm text-red-900">{feature.humanVA}</td>
                  <td className="py-3 text-center">{getIcon(feature.advantage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-center text-sm text-green-800">
            <strong>RelationshipOS wins in 8/8 categories</strong> - delivering superior value across every metric
          </div>
        </div>
      </div>
    </div>
  );
} 