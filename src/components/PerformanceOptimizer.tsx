import { memo, useMemo, ReactNode } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformance';

interface MemoizedComponentProps {
  children: ReactNode;
  deps?: any[];
  componentName?: string;
}

// Higher-order component for automatic memoization
export const MemoizedComponent = memo<MemoizedComponentProps>(({ 
  children, 
  deps = [], 
  componentName = 'MemoizedComponent' 
}) => {
  usePerformanceMonitor(componentName);
  
  return useMemo(() => children, deps);
});

// Performance boundary component
interface PerformanceBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName: string;
  timeout?: number;
}

export const PerformanceBoundary = memo<PerformanceBoundaryProps>(({ 
  children, 
  fallback = <div>Loading...</div>, 
  componentName,
  timeout = 5000 
}) => {
  usePerformanceMonitor(componentName);
  
  // TODO: Add timeout logic for slow components
  return <>{children}</>;
});

// Virtualized list component for large datasets
interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const VirtualizedList = memo(<T,>({ 
  items, 
  renderItem, 
  itemHeight, 
  containerHeight, 
  overscan = 5 
}: VirtualizedListProps<T>) => {
  const visibleItems = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = 0; // Simplified - would need scroll position
    const endIndex = Math.min(startIndex + visibleCount + overscan, items.length);
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%'
      }
    }));
  }, [items, itemHeight, containerHeight, overscan]);

  return (
    <div style={{ height: containerHeight, position: 'relative', overflow: 'auto' }}>
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';