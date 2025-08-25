/**
 * Lazy Loading Utilities
 * Provides utilities for code splitting and lazy loading components
 */

import { CircularProgress, Box } from '@mui/material';
import React, { Suspense, lazy } from 'react';

// Default loading component
const DefaultLoader = ({ size = 40, text = 'Loading...' }) => (
  <Box
    display='flex'
    flexDirection='column'
    alignItems='center'
    justifyContent='center'
    minHeight='200px'
    gap={2}
  >
    <CircularProgress size={size} />
    {text && <div>{text}</div>}
  </Box>
);

// Enhanced lazy loading with error boundary and custom loader
export const createLazyComponent = (importFunc, options = {}) => {
  const {
    loader = <DefaultLoader />,
    fallback = null,
    errorBoundary = true,
    preload = false,
    retryCount = 3
  } = options;

  // Create the lazy component with retry logic
  const LazyComponent = lazy(() => {
    let retries = 0;

    const loadWithRetry = async () => {
      try {
        return await importFunc();
      } catch (error) {
        retries++;
        if (retries <= retryCount) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          return loadWithRetry();
        }
        throw error;
      }
    };

    return loadWithRetry();
  });

  // Preload the component if requested
  if (preload) {
    importFunc().catch(() => {
      // Silently fail preloading
    });
  }

  // Wrapper component with suspense and error handling
  const WrappedComponent = props => {
    if (errorBoundary) {
      return (
        <LazyErrorBoundary fallback={fallback}>
          <Suspense fallback={loader}>
            <LazyComponent {...props} />
          </Suspense>
        </LazyErrorBoundary>
      );
    }

    return (
      <Suspense fallback={loader}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };

  // Add preload method to component
  WrappedComponent.preload = () => {
    return importFunc();
  };

  return WrappedComponent;
};

// Error boundary for lazy loaded components
class LazyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          minHeight='200px'
          gap={2}
        >
          <div>Failed to load component</div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Route-based code splitting utilities
export const createLazyRoute = (importFunc, options = {}) => {
  return createLazyComponent(importFunc, {
    loader: <DefaultLoader text='Loading page...' />,
    ...options
  });
};

// Component-based code splitting for large components
export const createLazyModal = (importFunc, options = {}) => {
  return createLazyComponent(importFunc, {
    loader: <DefaultLoader size={30} text='Loading...' />,
    ...options
  });
};

// Chunk-based code splitting for feature modules
export const createLazyFeature = (importFunc, options = {}) => {
  return createLazyComponent(importFunc, {
    loader: <DefaultLoader text='Loading feature...' />,
    preload: true, // Preload features for better UX
    ...options
  });
};

// Hook for preloading components
export const usePreload = lazyComponents => {
  React.useEffect(() => {
    const preloadComponents = async () => {
      const preloadPromises = lazyComponents
        .filter(component => component && typeof component.preload === 'function')
        .map(component =>
          component.preload().catch(() => {
            // Silently fail preloading
          })
        );

      await Promise.allSettled(preloadPromises);
    };

    preloadComponents();
  }, [lazyComponents]);
};

// Bundle optimization utilities
export const bundleOptimization = {
  // Dynamic import with chunk naming
  dynamicImport: (chunkName, importFunc) => {
    return import(
      /* webpackChunkName: "[request]" */
      importFunc
    );
  },

  // Prefetch resources
  prefetchResource: (href, as = 'script') => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },

  // Preload critical resources
  preloadResource: (href, as = 'script') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },

  // Check if component is in viewport for lazy loading
  isInViewport: element => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
};

// Tree shaking optimization utilities
export const optimizeImports = {
  // Import only specific functions from large libraries
  importSpecific: (library, functions) => {
    return functions.reduce((acc, func) => {
      acc[func] = require(`${library}/${func}`);
      return acc;
    }, {});
  },

  // Dynamic import for conditional features
  conditionalImport: async (condition, importFunc) => {
    if (condition) {
      return await importFunc();
    }
    return null;
  }
};

export default {
  createLazyComponent,
  createLazyRoute,
  createLazyModal,
  createLazyFeature,
  usePreload,
  bundleOptimization,
  optimizeImports,
  DefaultLoader
};
