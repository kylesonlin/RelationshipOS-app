import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAnalyticsContext } from './AnalyticsProvider';

interface ABTest {
  name: string;
  variants: string[];
  traffic: number; // 0-1, percentage of users to include
}

interface ABTestContextType {
  getVariant: (testName: string) => string;
  isInTest: (testName: string) => boolean;
}

const ABTestContext = createContext<ABTestContextType | null>(null);

interface ABTestProviderProps {
  children: ReactNode;
}

// Define your A/B tests here
const AB_TESTS: Record<string, ABTest> = {
  'pricing_page_cta': {
    name: 'pricing_page_cta',
    variants: ['control', 'urgent', 'social_proof'],
    traffic: 1.0, // 100% of users
  },
  'onboarding_flow': {
    name: 'onboarding_flow',
    variants: ['control', 'simplified', 'gamified'],
    traffic: 0.5, // 50% of users
  },
  'dashboard_layout': {
    name: 'dashboard_layout',
    variants: ['control', 'sidebar', 'tabs'],
    traffic: 0.3, // 30% of users
  },
};

export const ABTestProvider = ({ children }: ABTestProviderProps) => {
  const { user } = useAuth();
  const { trackExperiment } = useAnalyticsContext();
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      // Generate consistent assignments based on user ID
      const newAssignments: Record<string, string> = {};
      
      Object.values(AB_TESTS).forEach(test => {
        // Use user ID to create consistent hash for assignment
        const hash = hashString(user.id + test.name);
        const normalizedHash = hash / 2147483647; // Normalize to 0-1
        
        // Check if user should be in test based on traffic percentage
        if (normalizedHash <= test.traffic) {
          // Assign variant based on hash
          const variantIndex = Math.floor((normalizedHash % 1) * test.variants.length);
          const variant = test.variants[variantIndex];
          
          newAssignments[test.name] = variant;
          
          // Track experiment view
          trackExperiment(test.name, variant);
        }
      });
      
      setAssignments(newAssignments);
    }
  }, [user, trackExperiment]);

  const getVariant = (testName: string): string => {
    return assignments[testName] || 'control';
  };

  const isInTest = (testName: string): boolean => {
    return testName in assignments;
  };

  return (
    <ABTestContext.Provider value={{ getVariant, isInTest }}>
      {children}
    </ABTestContext.Provider>
  );
};

export const useABTest = () => {
  const context = useContext(ABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within an ABTestProvider');
  }
  return context;
};

// Simple hash function for consistent user assignment
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}