import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import { deduplicatedApiCall, CacheStrategies, clearCache, getCacheStats } from '../utils/apiCache';

// Enhanced API call function with intelligent caching
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const options = { method, data };
  const cacheOptions = {
    useCache: method === 'GET',
    invalidatePatterns: getInvalidationPatterns(endpoint, method)
  };

  try {
    return await deduplicatedApiCall(endpoint, options, cacheOptions);
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Get cache invalidation patterns based on endpoint and method
const getInvalidationPatterns = (endpoint, method) => {
  if (method === 'GET') return [];

  const patterns = [];

  if (endpoint.includes('/ponds')) {
    patterns.push('/ponds');
    if (endpoint.includes('/')) {
      const pondId = endpoint.split('/').pop();
      if (pondId && pondId !== 'ponds') {
        patterns.push(`/feed-inputs/pond/${pondId}`);
        patterns.push(`/water-quality-inputs/pond/${pondId}`);
      }
    }
  }

  if (endpoint.includes('/seasons')) {
    patterns.push('/seasons', '/ponds');
  }

  if (endpoint.includes('/feed-inputs')) {
    patterns.push('/feed-inputs', '/ponds');
  }

  if (endpoint.includes('/water-quality-inputs')) {
    patterns.push('/water-quality-inputs', '/ponds');
  }

  return patterns;
};

// Custom hook for data fetching with loading and error states
export const useApiData = (apiFunction, dependencies = [], cacheKey = null, retryCount = 3) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const retryTimeoutRef = useRef(null);

  const fetchData = useCallback(
    async (useCache = true, retries = retryCount) => {
      // Clear any existing retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      // If apiFunction is null, don't make the request
      if (!apiFunction) {
        setData(null);
        setLoading(false);
        setError(null);
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        // Use the enhanced caching system through apiFunction
        const result = await apiFunction();

        // Handle different response formats
        if (Array.isArray(result)) {
          setData(result);
        } else if (result && Array.isArray(result.data)) {
          setData(result.data);
        } else if (result && typeof result === 'object') {
          setData(result);
        } else {
          setData(null);
        }

        return result;
      } catch (err) {
        // Retry logic
        if (retries > 0) {
          console.warn(`API call failed, retrying... (${retryCount - retries + 1}/${retryCount})`);
          retryTimeoutRef.current = setTimeout(() => {
            fetchData(useCache, retries - 1);
          }, 1000 * (retryCount - retries)); // Exponential backoff
          return;
        }

        setError({ message: err.message || 'An unknown error occurred' });
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, cacheKey, retryCount]
  );

  useEffect(() => {
    fetchData();

    // Cleanup function to clear any pending retries
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(async () => {
    return await fetchData(false); // Don't use cache when refetching
  }, [fetchData]);

  // Clear cache for this key using the enhanced cache system
  const clearCacheKey = useCallback(() => {
    if (cacheKey) {
      clearCache([cacheKey]);
    }
  }, [cacheKey]);

  return { data, loading, error, refetch, clearCache: clearCacheKey };
};

// Custom hook for API mutations (POST, PUT, DELETE)
export const useApiMutation = (apiFunction, options = {}) => {
  const { maxRetryCount = 3, invalidatePatterns = [], onSuccess = null, onError = null } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const retryTimeoutRef = useRef(null);

  const mutate = async (...args) => {
    // Wrapper function that handles retries with decrementing count
    const attemptMutation = async remainingRetries => {
      // Clear any existing retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);

        // Invalidate cache patterns after successful mutation
        if (invalidatePatterns.length > 0) {
          clearCache(invalidatePatterns);
        }

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result);
        }

        return { data: result, error: null };
      } catch (err) {
        // Retry logic
        if (remainingRetries > 0) {
          console.warn(
            `API mutation failed, retrying... (${
              maxRetryCount - remainingRetries + 1
            }/${maxRetryCount})`
          );
          retryTimeoutRef.current = setTimeout(() => {
            attemptMutation(remainingRetries - 1);
          }, 1000 * (maxRetryCount - remainingRetries)); // Exponential backoff
          return;
        }

        setError({ message: err.message || 'An unknown error occurred' });

        // Call error callback if provided
        if (onError) {
          onError(err);
        }

        return { data: null, error: err.message };
      } finally {
        setLoading(false);
      }
    };

    return await attemptMutation(maxRetryCount);
  };

  // Cleanup function to clear any pending retries
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, []);

  return { mutate, loading, error };
};

// Helper hook that provides API methods (backward compatibility)
const useApi = () => {
  return useMemo(
    () => ({
      get: endpoint => apiCall(endpoint, 'GET'),
      post: (endpoint, data) => apiCall(endpoint, 'POST', data),
      put: (endpoint, data) => apiCall(endpoint, 'PUT', data),
      delete: endpoint => apiCall(endpoint, 'DELETE')
    }),
    []
  );
};

export default useApi;

// Enhanced cache management functions
export const clearAllCache = () => {
  clearCache(); // Clear the enhanced cache system
};

export const getCacheSize = () => {
  const stats = getCacheStats();
  return stats.size;
};

export const getCacheStatistics = () => {
  return getCacheStats();
};

// Utility hook for cache management
export const useCacheManager = () => {
  return useMemo(
    () => ({
      clearAll: clearAllCache,
      clearPatterns: patterns => clearCache(patterns),
      getStats: getCacheStatistics,
      getSize: getCacheSize
    }),
    []
  );
};
