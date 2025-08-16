import { useState, useEffect, useCallback } from 'react';

// Simple in-memory cache
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Custom hook for data fetching with loading and error states
export const useApiData = (apiFunction, dependencies = [], cacheKey = null, retryCount = 3) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (useCache = true, retries = retryCount) => {
    try {
      // Check cache first if cacheKey is provided
      if (cacheKey && useCache) {
        const cached = apiCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          setData(cached.data);
          setLoading(false);
          return cached.data;
        }
      }

      setLoading(true);
      setError(null);
      const result = await apiFunction();
      
      // Cache the result if cacheKey is provided
      if (cacheKey) {
        apiCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }
      
      setData(result);
      return result;
    } catch (err) {
      // Retry logic
      if (retries > 0) {
        console.warn(`API call failed, retrying... (${retryCount - retries + 1}/${retryCount})`);
        setTimeout(() => {
          fetchData(useCache, retries - 1);
        }, 1000 * (retryCount - retries)); // Exponential backoff
        return;
      }
      
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, cacheKey, retryCount]);

  useEffect(() => {
    fetchData();
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(async () => {
    return await fetchData(false); // Don't use cache when refetching
  }, [fetchData]);

  // Clear cache for this key
  const clearCache = useCallback(() => {
    if (cacheKey) {
      apiCache.delete(cacheKey);
    }
  }, [cacheKey]);

  return { data, loading, error, refetch, clearCache };
};

// Custom hook for API mutations (POST, PUT, DELETE)
export const useApiMutation = (apiFunction, retryCount = 3) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (data, retries = retryCount) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(data);
      return { data: result, error: null };
    } catch (err) {
      // Retry logic
      if (retries > 0) {
        console.warn(`API mutation failed, retrying... (${retryCount - retries + 1}/${retryCount})`);
        setTimeout(() => {
          mutate(data, retries - 1);
        }, 1000 * (retryCount - retries)); // Exponential backoff
        return;
      }
      
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};

// Function to clear all cache
export const clearAllCache = () => {
  apiCache.clear();
};

// Function to get cache size
export const getCacheSize = () => {
  return apiCache.size;
};