/**
 * Cached API Service Integration
 *
 * This service layer integrates the caching system with existing API calls,
 * providing a backward-compatible interface while adding intelligent caching.
 *
 * Benefits:
 * - Drop-in replacement for existing API calls
 * - Automatic cache management
 * - Configurable cache strategies per endpoint
 * - Built-in error handling and retries
 * - Performance monitoring
 */

import { globalCache, CacheStrategy, CacheConfig } from '../utils/cacheManager';

import api from './api';

// ===================
// CACHE CONFIGURATION
// ===================

// Time constants
const SECONDS = 1;
const MINUTES_TO_SECONDS = 60;
const MINUTES = MINUTES_TO_SECONDS * SECONDS;
const MILLISECONDS = 1000;

// Time values
const THIRTY = 30;
const FIFTEEN = 15;
const SIXTY = 60;
const FIVE = 5;
const THREE = 3;
const TWO = 2;
const FORTY_FIVE = 45;

/**
 * Endpoint-specific cache configurations
 * Customize TTL and strategy based on data characteristics
 */
const ENDPOINT_CONFIG = {
  // Static/Semi-static data - Cache aggressively
  '/seasons': {
    ttl: THIRTY * MINUTES * MILLISECONDS,
    strategy: CacheConfig.STRATEGIES.CACHE_FIRST,
    category: CacheConfig.CATEGORIES.API_RESPONSES
  },
  '/employees': {
    ttl: FIFTEEN * MINUTES * MILLISECONDS,
    strategy: CacheConfig.STRATEGIES.CACHE_FIRST,
    category: CacheConfig.CATEGORIES.API_RESPONSES
  },
  '/farm-settings': {
    ttl: SIXTY * MINUTES * MILLISECONDS,
    strategy: CacheConfig.STRATEGIES.CACHE_FIRST,
    category: CacheConfig.CATEGORIES.API_RESPONSES
  },

  // Dynamic data - Balance freshness and performance
  '/ponds': {
    ttl: FIVE * MINUTES * MILLISECONDS,
    strategy: CacheConfig.STRATEGIES.STALE_WHILE_REVALIDATE,
    category: CacheConfig.CATEGORIES.API_RESPONSES
  },
  '/expenses': {
    ttl: THREE * MINUTES * MILLISECONDS,
    strategy: CacheConfig.STRATEGIES.STALE_WHILE_REVALIDATE,
    category: CacheConfig.CATEGORIES.API_RESPONSES
  },
  '/inventory': {
    ttl: TWO * MINUTES * MILLISECONDS,
    strategy: CacheConfig.STRATEGIES.STALE_WHILE_REVALIDATE,
    category: CacheConfig.CATEGORIES.API_RESPONSES
  },

  // Real-time data - Prioritize freshness
  '/water-quality': {
    ttl: THIRTY * SECONDS * MILLISECONDS,
    strategy: CacheConfig.STRATEGIES.NETWORK_FIRST,
    category: CacheConfig.CATEGORIES.API_RESPONSES
  },
  '/feed-inputs': {
    ttl: SIXTY * SECONDS * MILLISECONDS,
    strategy: CacheConfig.STRATEGIES.NETWORK_FIRST,
    category: CacheConfig.CATEGORIES.API_RESPONSES
  },
  '/dashboard': {
    ttl: FORTY_FIVE * SECONDS * MILLISECONDS,
    strategy: CacheConfig.STRATEGIES.STALE_WHILE_REVALIDATE,
    category: CacheConfig.CATEGORIES.API_RESPONSES
  }
};

/**
 * Default cache configuration for unknown endpoints
 */
const DEFAULT_CONFIG = {
  ttl: FIVE * MINUTES * MILLISECONDS, // 5 minutes
  strategy: CacheConfig.STRATEGIES.CACHE_FIRST,
  category: CacheConfig.CATEGORIES.API_RESPONSES
};

// ===================
// CACHE INVALIDATION PATTERNS
// ===================

/**
 * Cache invalidation patterns for different entity types
 * When one entity is modified, related cached data should be invalidated
 */
const INVALIDATION_PATTERNS = {
  pond: ['ponds_list', 'dashboard_', 'pond_detail_', 'pond_summary_', 'farm_overview'],

  expense: ['expenses_', 'dashboard_', 'expense_summary_', 'farm_overview'],

  'feed-input': ['feed_inputs_', 'dashboard_', 'pond_detail_', 'feeding_summary_'],

  'water-quality': ['water_quality_', 'dashboard_', 'pond_detail_', 'water_summary_'],

  inventory: ['inventory_', 'dashboard_', 'inventory_summary_'],

  employee: ['employees_', 'hr_dashboard_', 'salary_summary_'],

  season: ['seasons_', 'farm_overview', 'dashboard_']
};

// ===================
// CACHED API SERVICE CLASS
// ===================

class CachedApiService {
  constructor() {
    this.cache = globalCache;
    this.strategies = new Map();
    this.metrics = {
      requests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0
    };

    // Initialize cache strategies for each endpoint
    this._initializeStrategies();
  }

  _initializeStrategies() {
    Object.entries(ENDPOINT_CONFIG).forEach(([endpoint, config]) => {
      this.strategies.set(endpoint, new CacheStrategy(this.cache, config.strategy));
    });
  }

  /**
   * Get cache configuration for an endpoint
   */
  _getEndpointConfig(url) {
    // Find the most specific matching endpoint configuration
    const matchingEndpoint = Object.keys(ENDPOINT_CONFIG).find(endpoint => url.includes(endpoint));

    return matchingEndpoint ? ENDPOINT_CONFIG[matchingEndpoint] : DEFAULT_CONFIG;
  }

  /**
   * Generate cache key from URL and parameters
   */
  _generateCacheKey(method, url, params = {}) {
    const baseKey = `${method.toLowerCase()}_${url}`;

    if (Object.keys(params).length === 0) {
      return baseKey;
    }

    // Create deterministic key from parameters
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `${baseKey}?${paramString}`;
  }

  /**
   * Cached GET request
   */
  async get(url, params = {}, options = {}) {
    this.metrics.requests++;

    const cacheKey = this._generateCacheKey('GET', url, params);
    const config = this._getEndpointConfig(url);
    const strategy =
      this.strategies.get(Object.keys(ENDPOINT_CONFIG).find(e => url.includes(e))) ||
      new CacheStrategy(this.cache, config.strategy);

    const cacheOptions = {
      ...config,
      ...options,
      category: config.category
    };

    try {
      const data = await strategy.execute(
        cacheKey,
        () => api.get(url, { params }).then(response => response.data),
        cacheOptions
      );

      this.metrics.cacheHits++;
      return { data, cached: true };
    } catch (error) {
      this.metrics.errors++;

      // Try to return stale data if available
      const staleData = this.cache.get(cacheKey, { allowStale: true });
      if (staleData) {
        // eslint-disable-next-line no-console
        console.warn(`Returning stale data for ${url}:`, error);
        return { data: staleData, cached: true, stale: true };
      }

      throw error;
    }
  }

  /**
   * POST request with cache invalidation
   */
  async post(url, data, options = {}) {
    this.metrics.requests++;

    try {
      const response = await api.post(url, data, options);

      // Invalidate related caches
      this._invalidateRelatedCaches(url, 'POST');

      return response;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  /**
   * PUT request with cache invalidation
   */
  async put(url, data, options = {}) {
    this.metrics.requests++;

    try {
      const response = await api.put(url, data, options);

      // Invalidate related caches
      this._invalidateRelatedCaches(url, 'PUT');

      return response;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  /**
   * DELETE request with cache invalidation
   */
  async delete(url, options = {}) {
    this.metrics.requests++;

    try {
      const response = await api.delete(url, options);

      // Invalidate related caches
      this._invalidateRelatedCaches(url, 'DELETE');

      return response;
    } catch (error) {
      this.metrics.errors++;
      throw error;
    }
  }

  /**
   * Invalidate caches related to the modified entity
   */
  _invalidateRelatedCaches(url, method) {
    // Extract entity type from URL
    const entityType = this._extractEntityType(url);

    if (entityType && INVALIDATION_PATTERNS[entityType]) {
      const patterns = INVALIDATION_PATTERNS[entityType];

      patterns.forEach(pattern => {
        // Remove all cache entries matching the pattern
        for (const [key] of this.cache.memoryCache) {
          if (key.includes(pattern)) {
            this.cache.delete(key);
          }
        }
      });

      // eslint-disable-next-line no-console
      console.log(`Cache invalidated for ${entityType} after ${method} ${url}`);
    }
  }

  /**
   * Extract entity type from URL
   */
  _extractEntityType(url) {
    const segments = url.split('/').filter(Boolean);

    // Handle common URL patterns
    if (segments.length > 0) {
      const firstSegment = segments[0];

      // Map plural to singular for consistency
      const entityMapping = {
        ponds: 'pond',
        expenses: 'expense',
        'feed-inputs': 'feed-input',
        'water-quality': 'water-quality',
        'water-quality-inputs': 'water-quality',
        inventory: 'inventory',
        employees: 'employee',
        seasons: 'season'
      };

      return entityMapping[firstSegment] || firstSegment;
    }

    return null;
  }

  /**
   * Preload critical data
   */
  async preloadCriticalData() {
    const criticalEndpoints = [
      { url: '/ponds', key: 'ponds_list' },
      { url: '/seasons', key: 'seasons_list' },
      { url: '/dashboard', key: 'dashboard_overview' }
    ];

    const preloadPromises = criticalEndpoints.map(async ({ url, key }) => {
      try {
        await this.get(url, {}, { forceRefresh: false });
        // eslint-disable-next-line no-console
        console.log(`Preloaded: ${key}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to preload ${key}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const cacheStats = this.cache.getStats();

    return {
      ...this.metrics,
      cache: cacheStats,
      hitRate: this.metrics.cacheHits / this.metrics.requests || 0
    };
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    this.cache.clear();
    // eslint-disable-next-line no-console
    console.log('All caches cleared');
  }

  /**
   * Clear caches by category
   */
  clearCachesByCategory(category) {
    this.cache.clear(category);
    // eslint-disable-next-line no-console
    console.log(`Cleared caches for category: ${category}`);
  }
}

// ===================
// SINGLETON INSTANCE
// ===================

const cachedApiService = new CachedApiService();

// ===================
// CONVENIENCE FUNCTIONS
// ===================

/**
 * Pre-configured API methods with caching
 */
export const cachedApi = {
  // GET methods with caching
  get: (url, params, options) => cachedApiService.get(url, params, options),

  // Mutation methods with cache invalidation
  post: (url, data, options) => cachedApiService.post(url, data, options),
  put: (url, data, options) => cachedApiService.put(url, data, options),
  delete: (url, options) => cachedApiService.delete(url, options),

  // Cache management
  clearCache: () => cachedApiService.clearAllCaches(),
  clearCachesByCategory: category => cachedApiService.clearCachesByCategory(category),
  getStats: () => cachedApiService.getStats(),
  preload: () => cachedApiService.preloadCriticalData()
};

/**
 * Entity-specific API methods with optimized caching
 */
export const cachedEntityApi = {
  ponds: {
    list: () => cachedApi.get('/ponds'),
    get: id => cachedApi.get(`/ponds/${id}`),
    create: data => cachedApi.post('/ponds', data),
    update: (id, data) => cachedApi.put(`/ponds/${id}`, data),
    delete: id => cachedApi.delete(`/ponds/${id}`)
  },

  expenses: {
    list: (params = {}) => cachedApi.get('/expenses', params),
    get: id => cachedApi.get(`/expenses/${id}`),
    create: data => cachedApi.post('/expenses', data),
    update: (id, data) => cachedApi.put(`/expenses/${id}`, data),
    delete: id => cachedApi.delete(`/expenses/${id}`)
  },

  inventory: {
    list: () => cachedApi.get('/inventory'),
    get: id => cachedApi.get(`/inventory/${id}`),
    create: data => cachedApi.post('/inventory', data),
    update: (id, data) => cachedApi.put(`/inventory/${id}`, data),
    delete: id => cachedApi.delete(`/inventory/${id}`)
  },

  waterQuality: {
    list: (params = {}) => cachedApi.get('/water-quality-inputs', params),
    get: id => cachedApi.get(`/water-quality-inputs/${id}`),
    create: data => cachedApi.post('/water-quality-inputs', data),
    update: (id, data) => cachedApi.put(`/water-quality-inputs/${id}`, data),
    delete: id => cachedApi.delete(`/water-quality-inputs/${id}`)
  },

  feedInputs: {
    list: (params = {}) => cachedApi.get('/feed-inputs', params),
    get: id => cachedApi.get(`/feed-inputs/${id}`),
    create: data => cachedApi.post('/feed-inputs', data),
    update: (id, data) => cachedApi.put(`/feed-inputs/${id}`, data),
    delete: id => cachedApi.delete(`/feed-inputs/${id}`)
  }
};

/**
 * Migration helper - drop-in replacement for existing api calls
 */
export const migrateToCache = {
  /**
   * Replace existing api.get calls
   * Before: const response = await api.get('/ponds');
   * After:  const response = await migrateToCache.get('/ponds');
   */
  get: async (url, config = {}) => {
    const { params = {}, ...options } = config;
    const result = await cachedApi.get(url, params, options);
    return { data: result.data }; // Maintain backward compatibility
  },

  post: cachedApi.post,
  put: cachedApi.put,
  delete: cachedApi.delete
};

export default cachedApiService;
export { cachedApiService, ENDPOINT_CONFIG, INVALIDATION_PATTERNS };
