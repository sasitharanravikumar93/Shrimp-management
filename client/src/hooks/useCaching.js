/**
 * React Hooks for Cache Management
 *
 * This module provides React hooks that integrate with the CacheManager
 * to provide intelligent caching capabilities for components and API calls.
 *
 * Features:
 * - Automatic cache management for API calls
 * - Cache-aware data fetching with multiple strategies
 * - Cache invalidation and dependency management
 * - Performance monitoring and metrics
 * - Automatic cleanup on unmount
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import { globalCache, CacheStrategy, CacheConfig } from '../utils/cacheManager';
import logger from '../utils/logger';

/**
 * Hook for cached API data fetching with intelligent strategies
 *
 * @param {string} key - Unique cache key
 * @param {Function} fetcher - Function that returns a Promise with the data
 * @param {Object} options - Configuration options
 * @returns {Object} Data, loading state, error state, and control functions
 */
export const useCachedData = (key, fetcher, options = {}) => {
  const {
    strategy = CacheConfig.STRATEGIES.CACHE_FIRST,
    ttl = CacheConfig.DEFAULT_TTL,
    category = CacheConfig.CATEGORIES.API_RESPONSES,
    dependencies = [],
    enabled = true,
    _suspense = false,
    onSuccess = null,
    onError = null,
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const cacheStrategy = useRef(new CacheStrategy(globalCache, strategy));
  const retryTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Fetch data function with retry logic
  const fetchData = useCallback(
    async (currentRetryCount = retryCount) => {
      if (!enabled || !isMountedRef.current) return;

      try {
        setLoading(true);
        setError(null);

        const result = await cacheStrategy.current.execute(key, fetcher, {
          ttl,
          category,
          dependencies,
          level: CacheConfig.LEVELS.MEMORY
        });

        if (!isMountedRef.current) return;

        setData(result);
        setLastFetch(new Date());

        if (onSuccess) {
          onSuccess(result);
        }
      } catch (err) {
        if (!isMountedRef.current) return;

        if (currentRetryCount > 0) {
          retryTimeoutRef.current = setTimeout(() => {
            fetchData(currentRetryCount - 1);
          }, retryDelay * (retryCount - currentRetryCount + 1));
          return;
        }

        setError(err);

        if (onError) {
          onError(err);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [key, fetcher, enabled, ttl, category, dependencies, onSuccess, onError, retryCount, retryDelay]
  );

  // Fetch data when key or dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  // Manual refetch function
  const refetch = useCallback(() => {
    // Clear cache for this key and refetch
    globalCache.delete(key);
    return fetchData();
  }, [key, fetchData]);

  // Invalidate cache for this key
  const invalidate = useCallback(() => {
    globalCache.delete(key);
    setData(null);
    setError(null);
  }, [key]);

  return {
    data,
    loading,
    error,
    lastFetch,
    refetch,
    invalidate,
    isStale: data && globalCache.memoryCache.get(key)?.isStale(),
    isCached: globalCache.has(key)
  };
};

/**
 * Hook for caching computed values
 *
 * @param {Function} compute - Function that computes the value
 * @param {Array} deps - Dependencies array
 * @param {Object} options - Configuration options
 * @returns {any} Cached computed value
 */
export const useCachedComputation = (compute, deps = [], options = {}) => {
  const {
    ttl = 60 * 1000, // 1 minute for computed values
    category = CacheConfig.CATEGORIES.COMPUTED_DATA
  } = options;

  const key = useMemo(() => `computed_${JSON.stringify(deps)}`, [deps]);

  return useMemo(() => {
    // Check cache first
    const cached = globalCache.get(key);
    if (cached) {
      return cached;
    }

    // Compute value
    const result = compute();

    // Cache the result
    globalCache.set(key, result, { ttl, category });

    return result;
  }, [compute, key, ttl, category]);
};

/**
 * Hook for managing cache invalidation patterns
 *
 * @param {Array} patterns - Array of cache key patterns to manage
 * @returns {Object} Cache management functions
 */
export const useCacheInvalidation = (patterns = []) => {
  const invalidatePattern = useCallback(pattern => {
    if (typeof pattern === 'string') {
      // Simple string matching
      for (const [key] of globalCache.memoryCache) {
        if (key.includes(pattern)) {
          globalCache.delete(key);
        }
      }
    } else if (pattern instanceof RegExp) {
      // Regex pattern matching
      for (const [key] of globalCache.memoryCache) {
        if (pattern.test(key)) {
          globalCache.delete(key);
        }
      }
    }
  }, []);

  const invalidateAll = useCallback(() => {
    patterns.forEach(pattern => invalidatePattern(pattern));
  }, [patterns, invalidatePattern]);

  const invalidateCategory = useCallback(category => {
    globalCache.clear(category);
  }, []);

  return {
    invalidatePattern,
    invalidateAll,
    invalidateCategory,
    clearCache: () => globalCache.clear()
  };
};

/**
 * Hook for cache performance monitoring
 *
 * @returns {Object} Cache statistics and performance metrics
 */
export const useCacheMetrics = () => {
  const [metrics, setMetrics] = useState(globalCache.getStats());

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(globalCache.getStats());
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  const clearMetrics = useCallback(() => {
    globalCache.metrics.hits = 0;
    globalCache.metrics.misses = 0;
    globalCache.metrics.evictions = 0;
    setMetrics(globalCache.getStats());
  }, []);

  return {
    ...metrics,
    clearMetrics,
    refreshMetrics: () => setMetrics(globalCache.getStats())
  };
};

/**
 * Hook for cache warming and preloading
 *
 * @param {Array} warmupData - Array of data to preload
 * @returns {Object} Warmup functions and status
 */
export const useCacheWarmup = (warmupData = []) => {
  const [warming, setWarming] = useState(false);
  const [warmed, setWarmed] = useState(false);

  const warmCache = useCallback(
    async (data = warmupData) => {
      setWarming(true);
      try {
        await globalCache.warmCache(data);
        setWarmed(true);
      } catch (error) {
        logger.error('Cache warmup failed:', error);
      } finally {
        setWarming(false);
      }
    },
    [warmupData]
  );

  const preloadData = useCallback(async (key, fetcher, options = {}) => {
    return globalCache.preload(key, fetcher, options);
  }, []);

  return {
    warming,
    warmed,
    warmCache,
    preloadData
  };
};

/**
 * Hook for form data caching (draft saving)
 *
 * @param {string} formId - Unique form identifier
 * @param {Object} initialValues - Initial form values
 * @param {Object} options - Configuration options
 * @returns {Object} Form state management with caching
 */
export const useCachedForm = (formId, initialValues = {}, options = {}) => {
  const {
    autosave = true,
    autosaveInterval = 5000, // 5 seconds
    ttl = 24 * 60 * 60 * 1000 // 24 hours
  } = options;

  const cacheKey = `form_draft_${formId}`;

  // Load cached form data or use initial values
  const [values, setValues] = useState(() => {
    const cached = globalCache.get(cacheKey);
    return cached || initialValues;
  });

  const [isDirty, setIsDirty] = useState(false);

  // Auto-save timer
  const saveTimerRef = useRef(null);

  // Save form data to cache
  const saveToCache = useCallback(() => {
    globalCache.set(cacheKey, values, {
      ttl,
      category: CacheConfig.CATEGORIES.FORM_DATA,
      level: CacheConfig.LEVELS.LOCAL // Persist across sessions
    });
    setIsDirty(false);
  }, [cacheKey, values, ttl]);

  // Update form values
  const updateValues = useCallback(
    newValues => {
      setValues(newValues);
      setIsDirty(true);

      if (autosave) {
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
        }
        saveTimerRef.current = setTimeout(saveToCache, autosaveInterval);
      }
    },
    [autosave, autosaveInterval, saveToCache]
  );

  // Clear cached form data
  const clearCache = useCallback(() => {
    globalCache.delete(cacheKey);
    setValues(initialValues);
    setIsDirty(false);
  }, [cacheKey, initialValues]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      if (autosave && isDirty) {
        saveToCache();
      }
    };
  }, [autosave, isDirty, saveToCache]);

  return {
    values,
    updateValues,
    saveToCache,
    clearCache,
    isDirty,
    hasCachedData: globalCache.has(cacheKey)
  };
};

/**
 * Hook for managing cache dependencies and relationships
 *
 * @param {string} mainKey - Main cache key
 * @param {Array} dependentKeys - Keys that depend on the main key
 * @returns {Object} Dependency management functions
 */
export const useCacheDependencies = (mainKey, dependentKeys = []) => {
  const invalidateDependents = useCallback(() => {
    dependentKeys.forEach(key => {
      globalCache.delete(key);
    });
  }, [dependentKeys]);

  const refreshAll = useCallback(async () => {
    // This would need to be implemented with actual refresh logic
    // For now, just invalidate all dependent caches
    globalCache.delete(mainKey);
    invalidateDependents();
  }, [mainKey, invalidateDependents]);

  return {
    invalidateDependents,
    refreshAll,
    addDependency: key => {
      if (!dependentKeys.includes(key)) {
        dependentKeys.push(key);
      }
    }
  };
};

/**
 * Hook that provides a cache-aware version of useState
 *
 * @param {string} key - Cache key
 * @param {any} initialValue - Initial value
 * @param {Object} options - Configuration options
 * @returns {Array} [value, setValue] similar to useState
 */
export const useCachedState = (key, initialValue, options = {}) => {
  const {
    ttl = CacheConfig.DEFAULT_TTL,
    category = CacheConfig.CATEGORIES.USER_PREFERENCES,
    persist = false
  } = options;

  const [value, setValue] = useState(() => {
    const cached = globalCache.get(key);
    return cached !== null ? cached : initialValue;
  });

  const setCachedValue = useCallback(
    newValue => {
      const finalValue = typeof newValue === 'function' ? newValue(value) : newValue;
      setValue(finalValue);

      globalCache.set(key, finalValue, {
        ttl,
        category,
        level: persist ? CacheConfig.LEVELS.LOCAL : CacheConfig.LEVELS.MEMORY
      });
    },
    [key, value, ttl, category, persist]
  );

  return [value, setCachedValue];
};

const CachingHooks = {
  useCachedData,
  useCachedComputation,
  useCacheInvalidation,
  useCacheMetrics,
  useCacheWarmup,
  useCachedForm,
  useCacheDependencies,
  useCachedState
};

export default CachingHooks;
