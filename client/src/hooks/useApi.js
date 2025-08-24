import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

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

  console.log('Making API call:', { url, method, data });
  
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    console.log('API response received:', { url, status: response.status, statusText: response.statusText });
    
    // Log response headers for debugging
    console.log('API response headers:', [...response.headers.entries()]);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', { url, status: response.status, errorText });
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
    console.log('API response content type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      console.log('API response JSON data:', { url, data: jsonData });
      
      // Add additional logging for pond-related responses
      if (url.includes('/ponds')) {
        console.log('Pond API response details:', { 
          url, 
          isArray: Array.isArray(jsonData),
          dataLength: Array.isArray(jsonData) ? jsonData.length : 'N/A',
          dataType: typeof jsonData,
          dataKeys: jsonData && typeof jsonData === 'object' ? Object.keys(jsonData) : 'N/A'
        });
      }
      
      return jsonData;
    } else {
      const textData = await response.text();
      console.log('API response text data:', { url, data: textData });
      return textData;
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
    
    // If apiFunction is null, don't make the request
    if (!apiFunction) {
      setData(null);
      setLoading(false);
      setError(null);
      return null;
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
      if (Array.isArray(result)) {
        setData(result);
      } else if (result && Array.isArray(result.data)) {
        setData(result.data);
      } else {
        setData([]); // Set to empty array if the result is not an array
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
export const useApiMutation = (apiFunction, maxRetryCount = 3) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const retryTimeoutRef = useRef(null);

  const mutate = async (...args) => {
    // Wrapper function that handles retries with decrementing count
    const attemptMutation = async (remainingRetries) => {
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
        if (remainingRetries > 0) {
          console.warn(`API mutation failed, retrying... (${maxRetryCount - remainingRetries + 1}/${maxRetryCount})`);
          retryTimeoutRef.current = setTimeout(() => {
            attemptMutation(remainingRetries - 1);
          }, 1000 * (maxRetryCount - remainingRetries)); // Exponential backoff
          return;
        }
        
        setError({ message: err.message || 'An unknown error occurred' });
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
  return useMemo(() => ({
    get: (endpoint) => apiCall(endpoint, 'GET'),
    post: (endpoint, data) => apiCall(endpoint, 'POST', data),
    put: (endpoint, data) => apiCall(endpoint, 'PUT', data),
    delete: (endpoint) => apiCall(endpoint, 'DELETE'),
  }), []);
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