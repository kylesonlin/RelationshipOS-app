'use client'

import { useState } from 'react';
import { Calculator, DollarSign } from 'lucide-react';

interface VAReplacementCalculatorProps {
  organizationId: string;
}

export default function VAReplacementCalculator({ organizationId }: VAReplacementCalculatorProps) {
  const [inputs, setInputs] = useState({
    currentVACost: 5000,
    numberOfVAs: 1,
    teamSize: 5
  });

  const calculateSavings = () => {
    const relationshipOSCost = inputs.teamSize <= 1 ? 299 : inputs.teamSize <= 10 ? 999 : 2499;
    const totalHumanCost = inputs.currentVACost * inputs.numberOfVAs;
    const monthlySavings = totalHumanCost - relationshipOSCost;
    const annualSavings = monthlySavings * 12;
    const roi = (annualSavings / (relationshipOSCost * 12)) * 100;

    return {
      relationshipOSCost,
      totalHumanCost,
      monthlySavings,
      annualSavings,
      roi
    };
  };

  const results = calculateSavings();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          VA Replacement Calculator
        </h3>
        <p className="text-sm text-gray-600 mt-1">Calculate your potential savings</p>
      </div>

      <div className="p-6">
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current VA Cost (monthly)
            </label>
            <div className="relative">
              <DollarSign className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="number"
                value={inputs.currentVACost}
                onChange={(e) => setInputs({...inputs, currentVACost: parseInt(e.target.value) || 0})}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of VAs
            </label>
            <input
              type="number"
              value={inputs.numberOfVAs}
              onChange={(e) => setInputs({...inputs, numberOfVAs: parseInt(e.target.value) || 1})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Size
            </label>
            <input
              type="number"
              value={inputs.teamSize}
              onChange={(e) => setInputs({...inputs, teamSize: parseInt(e.target.value) || 1})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              min="1"
            />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-3">Your Savings</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Current Cost:</span>
              <span className="font-medium">${results.totalHumanCost.toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between">
              <span>RelationshipOS Cost:</span>
              <span className="font-medium">${results.relationshipOSCost}/mo</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Monthly Savings:</span>
              <span className="font-bold text-green-600">${results.monthlySavings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Annual Savings:</span>
              <span className="font-bold text-green-600">${results.annualSavings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">ROI:</span>
              <span className="font-bold text-green-600">{results.roi.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 