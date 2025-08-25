/**
 * Performance Optimization Utilities
 * Provides utilities for optimizing React component performance
 */

import React, { memo, useMemo, useCallback, useRef } from 'react';

/**
 * Enhanced memo with deep comparison for complex props
 */
export const deepMemo = (Component, customComparator) => {
  const defaultComparator = (prevProps, nextProps) => {
    // Basic shallow comparison
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);

    if (prevKeys.length !== nextKeys.length) {
      return false;
    }

    for (const key of prevKeys) {
      if (prevProps[key] !== nextProps[key]) {
        // Deep comparison for objects and arrays
        if (typeof prevProps[key] === 'object' && typeof nextProps[key] === 'object') {
          if (JSON.stringify(prevProps[key]) !== JSON.stringify(nextProps[key])) {
            return false;
          }
        } else {
          return false;
        }
      }
    }

    return true;
  };

  return memo(Component, customComparator || defaultComparator);
};

/**
 * Hook for stable callback references
 */
export const useStableCallback = (callback, dependencies = []) => {
  return useCallback(callback, dependencies);
};

/**
 * Hook for memoizing expensive calculations
 */
export const useStableMemo = (factory, dependencies = []) => {
  return useMemo(factory, dependencies);
};

/**
 * Hook for preventing unnecessary re-renders on object props
 */
export const useStableObject = obj => {
  return useMemo(() => obj, [JSON.stringify(obj)]);
};

/**
 * Hook for preventing unnecessary re-renders on array props
 */
export const useStableArray = arr => {
  return useMemo(() => arr, [JSON.stringify(arr)]);
};

/**
 * Hook for debouncing values to prevent excessive re-renders
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for throttling function calls
 */
export const useThrottle = (callback, delay) => {
  const throttleRef = useRef(false);

  return useCallback(
    (...args) => {
      if (!throttleRef.current) {
        throttleRef.current = true;
        callback(...args);
        setTimeout(() => {
          throttleRef.current = false;
        }, delay);
      }
    },
    [callback, delay]
  );
};

/**
 * Component wrapper for lazy loading
 */
export const LazyComponent = ({ children, fallback = null }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return <div ref={ref}>{isVisible ? children : fallback}</div>;
};

/**
 * HOC for preventing unnecessary re-renders
 */
export const withPerformanceOptimization = Component => {
  return memo(
    React.forwardRef((props, ref) => {
      const stableProps = useStableObject(props);
      return <Component {...stableProps} ref={ref} />;
    })
  );
};

/**
 * Hook for optimizing list rendering
 */
export const useOptimizedList = (items, keyExtractor, itemComparator) => {
  const stableItems = useMemo(() => {
    return (
      items?.map((item, index) => ({
        key: keyExtractor ? keyExtractor(item, index) : index,
        item,
        index
      })) || []
    );
  }, [items, keyExtractor]);

  const memoizedItems = useMemo(() => {
    return stableItems.map(({ key, item, index }) => ({
      key,
      item: itemComparator ? itemComparator(item) : item,
      index
    }));
  }, [stableItems, itemComparator]);

  return memoizedItems;
};

/**
 * Hook for stable event handlers
 */
export const useStableEventHandlers = handlers => {
  return useMemo(() => {
    const stableHandlers = {};
    Object.keys(handlers).forEach(key => {
      stableHandlers[key] = handlers[key];
    });
    return stableHandlers;
  }, Object.values(handlers));
};

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  measureRender: (componentName, callback) => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();
      const result = callback();
      const endTime = performance.now();
      console.log(`🚀 ${componentName} render time: ${endTime - startTime}ms`);
      return result;
    }
    return callback();
  },

  logRerender: (componentName, props) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 ${componentName} re-rendered with props:`, props);
    }
  }
};

export default {
  deepMemo,
  useStableCallback,
  useStableMemo,
  useStableObject,
  useStableArray,
  useDebounce,
  useThrottle,
  LazyComponent,
  withPerformanceOptimization,
  useOptimizedList,
  useStableEventHandlers,
  performanceMonitor
};
