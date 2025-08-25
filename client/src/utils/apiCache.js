/**
 * Advanced API Caching System
 * Provides intelligent caching with auto-invalidation and performance optimizations
 */

// Cache configuration
const CACHE_CONFIG = {
    // Default cache durations for different types of data
    DEFAULT_DURATION: 5 * 60 * 1000, // 5 minutes
    STATIC_DATA_DURATION: 30 * 60 * 1000, // 30 minutes for rarely changing data
    DYNAMIC_DATA_DURATION: 2 * 60 * 1000, // 2 minutes for frequently changing data
    REALTIME_DATA_DURATION: 30 * 1000, // 30 seconds for real-time data

    // Maximum cache size (number of entries)
    MAX_CACHE_SIZE: 100,

    // Performance monitoring
    ENABLE_METRICS: process.env.NODE_ENV === 'development'
};

// Cache storage with advanced features
class AdvancedCache {
    constructor() {
        this.cache = new Map();
        this.accessTimes = new Map();
        this.hitCount = 0;
        this.missCount = 0;
        this.totalRequests = 0;

        // Auto cleanup interval
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60 * 1000); // Cleanup every minute
    }

    // Generate cache key with parameters
    generateKey(endpoint, params = {}) {
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((result, key) => {
                result[key] = params[key];
                return result;
            }, {});

        return `${endpoint}:${JSON.stringify(sortedParams)}`;
    }

    // Get cache entry with access tracking
    get(key) {
        this.totalRequests++;

        const entry = this.cache.get(key);
        if (!entry) {
            this.missCount++;
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            this.accessTimes.delete(key);
            this.missCount++;
            return null;
        }

        // Update access time for LRU
        this.accessTimes.set(key, Date.now());
        this.hitCount++;

        return entry.data;
    }

    // Set cache entry with intelligent expiration
    set(key, data, customDuration = null) {
        const duration = customDuration || this.getDuration(key);
        const entry = {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + duration,
            size: this.estimateSize(data)
        };

        // Remove oldest entries if cache is full
        if (this.cache.size >= CACHE_CONFIG.MAX_CACHE_SIZE) {
            this.evictLRU();
        }

        this.cache.set(key, entry);
        this.accessTimes.set(key, Date.now());
    }

    // Intelligent duration based on endpoint pattern
    getDuration(key) {
        if (key.includes('/seasons') || key.includes('/employees')) {
            return CACHE_CONFIG.STATIC_DATA_DURATION;
        }

        if (key.includes('/water-quality') || key.includes('/feed-inputs')) {
            return CACHE_CONFIG.DYNAMIC_DATA_DURATION;
        }

        if (key.includes('/realtime') || key.includes('/status')) {
            return CACHE_CONFIG.REALTIME_DATA_DURATION;
        }

        return CACHE_CONFIG.DEFAULT_DURATION;
    }

    // Estimate data size for memory management
    estimateSize(data) {
        try {
            return JSON.stringify(data).length;
        } catch {
            return 1000; // Default estimate
        }
    }

    // LRU eviction
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Date.now();

        for (const [key, time] of this.accessTimes) {
            if (time < oldestTime) {
                oldestTime = time;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.accessTimes.delete(oldestKey);
        }
    }

    // Remove expired entries
    cleanup() {
        const now = Date.now();
        const expiredKeys = [];

        for (const [key, entry] of this.cache) {
            if (now > entry.expiresAt) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => {
            this.cache.delete(key);
            this.accessTimes.delete(key);
        });

        if (CACHE_CONFIG.ENABLE_METRICS && expiredKeys.length > 0) {
            console.log(`🧹 Cache cleanup: removed ${expiredKeys.length} expired entries`);
        }
    }

    // Invalidate cache by pattern
    invalidatePattern(pattern) {
        const keysToRemove = [];

        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => {
            this.cache.delete(key);
            this.accessTimes.delete(key);
        });

        if (CACHE_CONFIG.ENABLE_METRICS) {
            console.log(
                `🗑️ Invalidated ${keysToRemove.length} cache entries matching pattern: ${pattern}`
            );
        }
    }

    // Clear specific cache entry
    delete(key) {
        this.cache.delete(key);
        this.accessTimes.delete(key);
    }

    // Clear all cache
    clear() {
        this.cache.clear();
        this.accessTimes.clear();
        this.hitCount = 0;
        this.missCount = 0;
        this.totalRequests = 0;
    }

    // Get cache statistics
    getStats() {
        const hitRate = this.totalRequests > 0 ? (this.hitCount / this.totalRequests) * 100 : 0;
        const totalSize = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);

        return {
            size: this.cache.size,
            maxSize: CACHE_CONFIG.MAX_CACHE_SIZE,
            hitCount: this.hitCount,
            missCount: this.missCount,
            totalRequests: this.totalRequests,
            hitRate: Math.round(hitRate * 100) / 100,
            totalSizeBytes: totalSize,
            averageEntrySize: this.cache.size > 0 ? Math.round(totalSize / this.cache.size) : 0
        };
    }

    // Destroy cache and cleanup
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.clear();
    }
}

// Global cache instance
const globalCache = new AdvancedCache();

// Cache invalidation strategies
export const CacheStrategies = {
    // Invalidate related data after mutations
    POND_UPDATED: pondId => {
        globalCache.invalidatePattern('/ponds');
        globalCache.invalidatePattern(`/feed-inputs/pond/${pondId}`);
        globalCache.invalidatePattern(`/water-quality-inputs/pond/${pondId}`);
        globalCache.invalidatePattern(`/growth-samplings/pond/${pondId}`);
    },

    SEASON_UPDATED: seasonId => {
        globalCache.invalidatePattern('/seasons');
        globalCache.invalidatePattern(`/ponds/season/${seasonId}`);
        globalCache.invalidatePattern('/nursery-batches');
    },

    FEED_INPUT_UPDATED: pondId => {
        globalCache.invalidatePattern('/feed-inputs');
        globalCache.invalidatePattern(`/feed-inputs/pond/${pondId}`);
        globalCache.invalidatePattern('/ponds'); // Update pond stats
    },

    WATER_QUALITY_UPDATED: pondId => {
        globalCache.invalidatePattern('/water-quality-inputs');
        globalCache.invalidatePattern(`/water-quality-inputs/pond/${pondId}`);
        globalCache.invalidatePattern('/ponds'); // Update pond stats
    },

    INVENTORY_UPDATED: () => {
        globalCache.invalidatePattern('/inventory-items');
        globalCache.invalidatePattern('/inventory-adjustments');
    },

    EXPENSE_UPDATED: () => {
        globalCache.invalidatePattern('/expenses');
    }
};

// Enhanced API call function with intelligent caching
export const cachedApiCall = async (endpoint, options = {}, cacheOptions = {}) => {
    const { method = 'GET', data = null, params = {}, headers = {} } = options;

    const {
        useCache = method === 'GET',
        cacheDuration = null,
        invalidatePatterns = [],
        bypassCache = false
    } = cacheOptions;

    // Generate cache key
    const cacheKey = globalCache.generateKey(endpoint, { ...params, method });

    // Check cache for GET requests
    if (useCache && method === 'GET' && !bypassCache) {
        const cachedData = globalCache.get(cacheKey);
        if (cachedData) {
            if (CACHE_CONFIG.ENABLE_METRICS) {
                console.log(`🎯 Cache hit: ${endpoint}`);
            }
            return cachedData;
        }
    }

    // Make API call
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

    // Build URL with params
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.set(key, params[key]);
        }
    });

    const fetchOptions = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        fetchOptions.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url.toString(), fetchOptions);

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP error! status: ${response.status}`;

            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                if (errorText.trim()) {
                    errorMessage = errorText;
                }
            }

            throw new Error(errorMessage);
        }

        const contentType = response.headers.get('content-type');
        let result;

        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            result = await response.text();
        }

        // Cache successful GET responses
        if (useCache && method === 'GET' && result) {
            globalCache.set(cacheKey, result, cacheDuration);
            if (CACHE_CONFIG.ENABLE_METRICS) {
                console.log(`💾 Cached: ${endpoint}`);
            }
        }

        // Invalidate related cache entries for mutations
        if (method !== 'GET' && invalidatePatterns.length > 0) {
            invalidatePatterns.forEach(pattern => {
                globalCache.invalidatePattern(pattern);
            });
        }

        return result;
    } catch (error) {
        console.error(`API call failed: ${endpoint}`, error);
        throw error;
    }
};

// Request deduplication for identical simultaneous requests
const pendingRequests = new Map();

export const deduplicatedApiCall = async (endpoint, options = {}, cacheOptions = {}) => {
    const requestKey = JSON.stringify({ endpoint, options });

    // If same request is already in progress, wait for it
    if (pendingRequests.has(requestKey)) {
        return await pendingRequests.get(requestKey);
    }

    // Make the request and store the promise
    const requestPromise = cachedApiCall(endpoint, options, cacheOptions);
    pendingRequests.set(requestKey, requestPromise);

    try {
        const result = await requestPromise;
        return result;
    } finally {
        // Remove from pending requests when done
        pendingRequests.delete(requestKey);
    }
};

// Batch API calls for multiple requests
export const batchApiCalls = async requests => {
    const promises = requests.map(({ endpoint, options, cacheOptions }) =>
        deduplicatedApiCall(endpoint, options, cacheOptions)
    );

    return await Promise.allSettled(promises);
};

// Preload data for performance
export const preloadData = async endpoints => {
    const requests = endpoints.map(endpoint => ({
        endpoint,
        options: { method: 'GET' },
        cacheOptions: { useCache: true }
    }));

    return batchApiCalls(requests);
};

// Export cache instance and utilities
export { globalCache as apiCache };

// Additional utility functions for useApi hook compatibility
export const clearCache = (patterns = []) => {
    if (patterns.length === 0) {
        globalCache.clear();
    } else {
        patterns.forEach(pattern => {
            globalCache.invalidatePattern(pattern);
        });
    }
};

export const getCacheStats = () => {
    return globalCache.getStats();
};

export default {
    cachedApiCall,
    deduplicatedApiCall,
    batchApiCalls,
    preloadData,
    apiCache: globalCache,
    CacheStrategies,
    CACHE_CONFIG,
    clearCache,
    getCacheStats
};
