'use client'

import { BarChart3, CheckCircle } from 'lucide-react';

export default function BenchmarkCard() {
  const comparisons = [
    { feature: 'Response Time', relationshipOS: '< 10s', humanVA: '2-8h', advantage: '1,440x faster' },
    { feature: 'Cost', relationshipOS: '$299/mo', humanVA: '$4,500/mo', advantage: '94% savings' },
    { feature: 'Availability', relationshipOS: '24/7/365', humanVA: '8-10h/day', advantage: '3x more' },
    { feature: 'Scalability', relationshipOS: 'Unlimited', humanVA: 'Sequential', advantage: 'Infinite' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Competitive Benchmark
        </h3>
        <p className="text-sm text-gray-600 mt-1">RelationshipOS vs Human VAs</p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {comparisons.map((comp, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="font-medium text-gray-900 mb-2">{comp.feature}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">RelationshipOS</div>
                  <div className="font-medium text-blue-900">{comp.relationshipOS}</div>
                </div>
                <div>
                  <div className="text-gray-600">Human VA</div>
                  <div className="font-medium text-red-900">{comp.humanVA}</div>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">{comp.advantage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 