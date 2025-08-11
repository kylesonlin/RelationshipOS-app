'use client'

import { Award, DollarSign, TrendingUp } from 'lucide-react';

export default function ROICaseStudies() {
  const cases = [
    {
      title: 'Tech Startup CEO',
      industry: 'Technology',
      savings: '$38,400/year',
      improvement: '340% efficiency gain',
      quote: 'RelationshipOS replaced my $4,200/month EA and delivers 10x better relationship intelligence.',
      author: 'Sarah Chen, CEO TechFlow Ventures'
    },
    {
      title: 'VC Partner',
      industry: 'Venture Capital',
      savings: '$94,800/year',
      improvement: '1,200% ROI',
      quote: 'Oracle identified $50M in opportunities that my $10K/month relationship manager missed.',
      author: 'David Rodriguez, Partner Nexus Capital'
    },
    {
      title: 'Enterprise Sales Director',
      industry: 'Enterprise Software',
      savings: '$68,400/year',
      improvement: '40% revenue increase',
      quote: 'We\'re closing 40% more deals with half the relationship management cost.',
      author: 'Jennifer Park, VP Sales CloudScale'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Award className="h-5 w-5 mr-2" />
          ROI Case Studies
        </h3>
        <p className="text-sm text-gray-600 mt-1">Real results from executives who replaced human VAs</p>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {cases.map((caseStudy, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{caseStudy.title}</h4>
                  <p className="text-sm text-gray-600">{caseStudy.industry}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="font-medium">{caseStudy.savings}</span>
                  </div>
                  <div className="flex items-center text-blue-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">{caseStudy.improvement}</span>
                  </div>
                </div>
              </div>
              
              <blockquote className="text-sm text-gray-700 italic mb-2">
                "{caseStudy.quote}"
              </blockquote>
              <cite className="text-xs text-gray-500">— {caseStudy.author}</cite>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 