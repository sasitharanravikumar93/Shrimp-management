import { useState, useEffect, useCallback, useRef } from 'react';

// Simple in-memory cache
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function for API calls with better error handling
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const API_BASE_URL = 'http://localhost:5001/api';
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If parsing fails, use the raw text if it's not empty
        if (errorText.trim()) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Custom hook for data fetching with loading and error states
export const useApiData = (apiFunction, dependencies = [], cacheKey = null, retryCount = 3) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const retryTimeoutRef = useRef(null);

  const fetchData = useCallback(async (useCache = true, retries = retryCount) => {
    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
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
        retryTimeoutRef.current = setTimeout(() => {
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
  const retryTimeoutRef = useRef(null);

  const mutate = async (...args) => {
    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      return { data: result, error: null };
    } catch (err) {
      // Retry logic
      if (retryCount > 0) {
        console.warn(`API mutation failed, retrying... (1/${retryCount})`);
        retryTimeoutRef.current = setTimeout(() => {
          mutate(...args);
        }, 1000); // Simple retry after 1 second
        return;
      }
      
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
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
  return {
    get: (endpoint) => apiCall(endpoint, 'GET'),
    post: (endpoint, data) => apiCall(endpoint, 'POST', data),
    put: (endpoint, data) => apiCall(endpoint, 'PUT', data),
    delete: (endpoint) => apiCall(endpoint, 'DELETE'),
  };
};

export default useApi;

// Function to clear all cache
export const clearAllCache = () => {
  apiCache.clear();
};

// Function to get cache size
export const getCacheSize = () => {
  return apiCache.size;
};