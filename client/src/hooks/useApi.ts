import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import { deduplicatedApiCall, CacheStrategies, apiCache } from '../utils/apiCache';

// Type definitions for API utilities
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
  total?: number;
  page?: number;
  limit?: number;
}

export interface UseApiDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<T | null>;
  clearCache: () => void;
}

export interface UseApiMutationOptions {
  maxRetryCount?: number;
  invalidatePatterns?: string[];
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export interface MutationResult<T = any> {
  data: T | null;
  error: string | null;
}

export interface UseApiMutationReturn<T = any> {
  mutate: (...args: any[]) => Promise<MutationResult<T>>;
  loading: boolean;
  error: ApiError | null;
}

// Type for API function that can be passed to useApiData
export type ApiFunction<T = any> = () => Promise<T | ApiResponse<T>>;

// Type for mutation function
export type MutationFunction<TArgs extends any[] = any[], TReturn = any> = (
  ...args: TArgs
) => Promise<TReturn>;

// Enhanced API call function with intelligent caching
const apiCall = async <T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  data: any = null
): Promise<T> => {
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
const getInvalidationPatterns = (endpoint: string, method: string): string[] => {
  if (method === 'GET') return [];

  const patterns: string[] = [];

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
export const useApiData = <T = any>(
  apiFunction: ApiFunction<T> | null,
  dependencies: React.DependencyList = [],
  cacheKey: string | null = null,
  retryCount: number = 3
): UseApiDataReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(
    async (useCache: boolean = true, retries: number = retryCount): Promise<T | null> => {
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
        let processedData: T;
        if (Array.isArray(result)) {
          processedData = result as T;
        } else if (
          result &&
          typeof result === 'object' &&
          'data' in result &&
          Array.isArray((result as any).data)
        ) {
          processedData = (result as ApiResponse<T>).data;
        } else if (result && typeof result === 'object') {
          processedData = result as T;
        } else {
          processedData = null as T;
        }

        setData(processedData);
        return processedData;
      } catch (err) {
        // Retry logic
        if (retries > 0) {
          console.warn(`API call failed, retrying... (${retryCount - retries + 1}/${retryCount})`);
          retryTimeoutRef.current = setTimeout(() => {
            fetchData(useCache, retries - 1);
          }, 1000 * (retryCount - retries)); // Exponential backoff
          return null;
        }

        const apiError: ApiError = {
          message: err instanceof Error ? err.message : 'An unknown error occurred',
          status: (err as any)?.status,
          code: (err as any)?.code
        };
        setError(apiError);
        return null;
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

  const refetch = useCallback(async (): Promise<T | null> => {
    return await fetchData(false); // Don't use cache when refetching
  }, [fetchData]);

  // Clear cache for this key using the enhanced cache system
  const clearCacheKey = useCallback((): void => {
    if (cacheKey) {
      apiCache.delete(cacheKey);
    }
  }, [cacheKey]);

  return { data, loading, error, refetch, clearCache: clearCacheKey };
};

// Custom hook for API mutations (POST, PUT, DELETE)
export const useApiMutation = <TArgs extends any[] = any[], TReturn = any>(
  apiFunction: MutationFunction<TArgs, TReturn>,
  options: UseApiMutationOptions = {}
): UseApiMutationReturn<TReturn> => {
  const { maxRetryCount = 3, invalidatePatterns = [], onSuccess = null, onError = null } = options;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const mutate = useCallback(
    async (...args: TArgs): Promise<MutationResult<TReturn>> => {
      // Wrapper function that handles retries with decrementing count
      const attemptMutation = async (
        remainingRetries: number
      ): Promise<MutationResult<TReturn>> => {
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
            invalidatePatterns.forEach(pattern => apiCache.invalidatePattern(pattern));
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
            return { data: null, error: null }; // Return early for retry
          }

          const apiError: ApiError = {
            message: err instanceof Error ? err.message : 'An unknown error occurred',
            status: (err as any)?.status,
            code: (err as any)?.code
          };
          setError(apiError);

          // Call error callback if provided
          if (onError) {
            onError(err instanceof Error ? err : new Error('Unknown error'));
          }

          return { data: null, error: apiError.message };
        } finally {
          setLoading(false);
        }
      };

      return await attemptMutation(maxRetryCount);
    },
    [apiFunction, maxRetryCount, invalidatePatterns, onSuccess, onError]
  );

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

// Cache management utilities with TypeScript
export const useCacheManagement = () => {
  const clearSpecificCache = useCallback((patterns: string[]) => {
    patterns.forEach(pattern => apiCache.invalidatePattern(pattern));
  }, []);

  const getCacheStatistics = useCallback(() => {
    return apiCache.getStats();
  }, []);

  return {
    clearCache: clearSpecificCache,
    getCacheStats: getCacheStatistics
  };
};

// Utility hooks for common API patterns
export const usePaginatedApi = <T = any>(
  baseApiFunction: (page: number, limit: number) => Promise<ApiResponse<T[]>>,
  initialPage: number = 1,
  pageSize: number = 10
) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const apiFunction = useCallback(() => {
    return baseApiFunction(currentPage, pageSize);
  }, [baseApiFunction, currentPage, pageSize]);

  const { data, loading, error, refetch } = useApiData<ApiResponse<T[]>>(apiFunction, [
    currentPage,
    pageSize
  ]);

  useEffect(() => {
    if (data && Array.isArray(data.data)) {
      if (currentPage === 1) {
        setAllData(data.data);
      } else {
        setAllData(prev => [...prev, ...data.data]);
      }
      setHasMore(data.data.length === pageSize);
    }
  }, [data, currentPage, pageSize]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  const reset = useCallback(() => {
    setCurrentPage(1);
    setAllData([]);
    setHasMore(true);
  }, []);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    refetch,
    currentPage
  };
};

export { apiCall };
export default {
  useApiData,
  useApiMutation,
  useCacheManagement,
  usePaginatedApi,
  apiCall
};
