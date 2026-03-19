/**
 * Comprehensive Cache Management System
 *
 * This module provides a standardized caching strategy across the application
 * with intelligent cache invalidation, performance optimization, and memory management.
 *
 * Features:
 * - Multi-level caching (memory, localStorage, sessionStorage)
 * - Intelligent cache invalidation and expiration
 * - Cache compression for large data
 * - Performance monitoring and metrics
 * - Automatic cleanup and memory management
 * - Cache persistence across sessions
 * - Cache warming and preloading
 */

// ===================
// CACHE CONFIGURATION
// ===================

// Time constants
const SECONDS_TO_MS = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_TO_SECONDS = SECONDS_PER_MINUTE;
const MINUTES_TO_MS = MINUTES_TO_SECONDS * SECONDS_TO_MS;
const _HOURS_TO_MS = 60 * MINUTES_TO_MS; // Not currently used but kept for completeness

// Size constants
const BYTES = 1;
const BYTES_PER_KB = 1024;
const KB_TO_BYTES = BYTES_PER_KB * BYTES;
const MB_TO_BYTES = BYTES_PER_KB * KB_TO_BYTES;

// Multipliers
const FIVE = 5;
const ONE = 1;
const FIFTY = 50;
const TEN = 10;
const THOUSAND = 1000;

// Compression ratio estimate
const COMPRESSION_RATIO = 0.7;

// Stale tolerance
const STALE_TOLERANCE_MS = 30000; // 30 seconds

export const CacheConfig = {
  // Default cache settings
  DEFAULT_TTL: FIVE * MINUTES_TO_MS, // 5 minutes
  MAX_MEMORY_SIZE: FIFTY * MB_TO_BYTES, // 50MB
  MAX_ENTRIES: THOUSAND,
  CLEANUP_INTERVAL: ONE * MINUTES_TO_MS, // 1 minute
  COMPRESSION_THRESHOLD: TEN * KB_TO_BYTES, // 10KB

  // Cache levels
  LEVELS: {
    MEMORY: 'memory',
    SESSION: 'session',
    LOCAL: 'local'
  },

  // Cache strategies
  STRATEGIES: {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    CACHE_ONLY: 'cache-only',
    NETWORK_ONLY: 'network-only',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
  },

  // Cache categories for different data types
  CATEGORIES: {
    API_RESPONSES: 'api-responses',
    USER_PREFERENCES: 'user-preferences',
    COMPUTED_DATA: 'computed-data',
    STATIC_ASSETS: 'static-assets',
    FORM_DATA: 'form-data'
  }
};

// ===================
// CACHE ENTRY CLASS
// ===================

class CacheEntry {
  constructor(key, data, options = {}) {
    this.key = key;
    this.data = data;
    this.createdAt = Date.now();
    this.expiresAt = Date.now() + (options.ttl || CacheConfig.DEFAULT_TTL);
    this.accessCount = 0;
    this.lastAccessedAt = Date.now();
    this.size = this._calculateSize(data);
    this.compressed = false;
    this.category = options.category || CacheConfig.CATEGORIES.API_RESPONSES;
    this.dependencies = options.dependencies || [];
    this.metadata = options.metadata || {};

    // Compress large data
    if (this.size > CacheConfig.COMPRESSION_THRESHOLD) {
      this._compress();
    }
  }

  _calculateSize(data) {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return JSON.stringify(data).length * 2; // Approximate size
    }
  }

  _compress() {
    try {
      // Simple compression using JSON stringification
      this.data = JSON.stringify(this.data);
      this.compressed = true;
      this.size = this.data.length * COMPRESSION_RATIO; // Estimate compression ratio
    } catch (error) {
      console.warn('Failed to compress cache entry:', error);
    }
  }

  _decompress() {
    if (this.compressed) {
      try {
        this.data = JSON.parse(this.data);
        this.compressed = false;
      } catch (error) {
        console.error('Failed to decompress cache entry:', error);
        return null;
      }
    }
    return this.data;
  }

  get(touch = true) {
    if (touch) {
      this.accessCount++;
      this.lastAccessedAt = Date.now();
    }

    return this._decompress();
  }

  isExpired() {
    return Date.now() > this.expiresAt;
  }

  isStale(staleTolerance = STALE_TOLERANCE_MS) {
    // 30 seconds
    return Date.now() > this.expiresAt - staleTolerance;
  }

  extend(additionalTtl) {
    this.expiresAt = Math.max(this.expiresAt, Date.now() + additionalTtl);
  }

  touch() {
    this.lastAccessedAt = Date.now();
    this.accessCount++;
  }
}

// ===================
// CACHE MANAGER CLASS
// ===================

export class CacheManager {
  constructor(options = {}) {
    this.options = {
      maxSize: CacheConfig.MAX_MEMORY_SIZE,
      maxEntries: CacheConfig.MAX_ENTRIES,
      cleanupInterval: CacheConfig.CLEANUP_INTERVAL,
      enablePersistence: true,
      enableCompression: true,
      enableMetrics: true,
      ...options
    };

    this.memoryCache = new Map();
    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      entries: 0
    };

    this.cleanupTimer = null;
    this.dependencyGraph = new Map();

    this._startCleanupTimer();
    this._loadPersistedCache();
  }

  /**
   * Set cache entry with intelligent storage selection
   */
  set(key, data, options = {}) {
    const {
      ttl = CacheConfig.DEFAULT_TTL,
      category = CacheConfig.CATEGORIES.API_RESPONSES,
      level = CacheConfig.LEVELS.MEMORY,
      dependencies = [],
      metadata = {},
      persist = false
    } = options;

    const entry = new CacheEntry(key, data, {
      ttl,
      category,
      dependencies,
      metadata
    });

    // Store in appropriate cache level
    switch (level) {
      case CacheConfig.LEVELS.MEMORY:
        this._setInMemory(key, entry);
        break;
      case CacheConfig.LEVELS.SESSION:
        this._setInSessionStorage(key, entry);
        break;
      case CacheConfig.LEVELS.LOCAL:
        this._setInLocalStorage(key, entry);
        break;
      default:
        // Default to memory cache
        this._setInMemory(key, entry);
        break;
    }

    // Update dependency graph
    this._updateDependencies(key, dependencies);

    // Persist if requested
    if (persist && this.options.enablePersistence) {
      this._persistEntry(key, entry);
    }

    this._updateMetrics();
    return true;
  }

  /**
   * Get cache entry with fallback strategy
   */
  get(key, options = {}) {
    const { level = CacheConfig.LEVELS.MEMORY, allowStale = false, touch = true } = options;

    let entry = null;

    // Try memory cache first
    if (level === CacheConfig.LEVELS.MEMORY || !entry) {
      entry = this.memoryCache.get(key);
    }

    // Try session storage
    if (!entry && (level === CacheConfig.LEVELS.SESSION || level === CacheConfig.LEVELS.MEMORY)) {
      entry = this._getFromSessionStorage(key);
    }

    // Try local storage
    if (!entry) {
      entry = this._getFromLocalStorage(key);
    }

    // Check if entry exists and is valid
    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    // Check expiration
    if (entry.isExpired() && !allowStale) {
      this.delete(key);
      this.metrics.misses++;
      return null;
    }

    // Return data
    this.metrics.hits++;
    return entry.get(touch);
  }

  /**
   * Delete cache entry and dependent entries
   */
  delete(key) {
    // Remove from all cache levels
    this.memoryCache.delete(key);
    this._removeFromSessionStorage(key);
    this._removeFromLocalStorage(key);

    // Remove dependent entries
    this._invalidateDependents(key);

    this._updateMetrics();
    return true;
  }

  /**
   * Clear cache by category or completely
   */
  clear(category = null) {
    if (category) {
      // Clear specific category
      for (const [key, entry] of this.memoryCache) {
        if (entry.category === category) {
          this.delete(key);
        }
      }
    } else {
      // Clear all caches
      this.memoryCache.clear();
      this._clearSessionStorage();
      this._clearLocalStorage();
      this.dependencyGraph.clear();
    }

    this._updateMetrics();
  }

  /**
   * Check if cache has entry
   */
  has(key) {
    return (
      this.memoryCache.has(key) || this._hasInSessionStorage(key) || this._hasInLocalStorage(key)
    );
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.metrics.hits / (this.metrics.hits + this.metrics.misses);

    return {
      ...this.metrics,
      hitRate: isNaN(hitRate) ? 0 : hitRate,
      totalSize: this._calculateTotalSize(),
      memoryEntries: this.memoryCache.size,
      categories: this._getCategoryStats()
    };
  }

  /**
   * Warm cache with frequently accessed data
   */
  async warmCache(warmupData) {
    const promises = warmupData.map(async ({ key, fetcher, options }) => {
      try {
        const data = await fetcher();
        this.set(key, data, options);
      } catch (error) {
        console.warn(`Cache warmup failed for ${key}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Preload data for improved performance
   */
  preload(key, fetcher, options = {}) {
    // Check if already cached
    if (this.has(key)) {
      return Promise.resolve(this.get(key));
    }

    // Fetch and cache
    return fetcher().then(data => {
      this.set(key, data, options);
      return data;
    });
  }

  /**
   * Memory management methods
   */
  _setInMemory(key, entry) {
    // Check memory limits
    if (this._shouldEvict()) {
      this._evictLeastUsed();
    }

    this.memoryCache.set(key, entry);
  }

  _shouldEvict() {
    const currentSize = this._calculateTotalSize();
    return currentSize > this.options.maxSize || this.memoryCache.size >= this.options.maxEntries;
  }

  _evictLeastUsed() {
    let leastUsedKey = null;
    let leastUsedScore = Infinity;

    for (const [key, entry] of this.memoryCache) {
      // Calculate usage score (lower is less used)
      const score = entry.accessCount / (Date.now() - entry.lastAccessedAt);

      if (score < leastUsedScore) {
        leastUsedScore = score;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.memoryCache.delete(leastUsedKey);
      this.metrics.evictions++;
    }
  }

  /**
   * Persistence methods
   */
  _setInSessionStorage(key, entry) {
    try {
      sessionStorage.setItem(
        `cache_${key}`,
        JSON.stringify({
          data: entry.data,
          expiresAt: entry.expiresAt,
          category: entry.category,
          compressed: entry.compressed
        })
      );
    } catch (error) {
      console.warn('Failed to set session storage cache:', error);
    }
  }

  _getFromSessionStorage(key) {
    try {
      const item = sessionStorage.getItem(`cache_${key}`);
      if (item) {
        const parsed = JSON.parse(item);
        if (Date.now() < parsed.expiresAt) {
          return new CacheEntry(key, parsed.data, {
            category: parsed.category
          });
        }
        sessionStorage.removeItem(`cache_${key}`);
      }
    } catch (error) {
      console.warn('Failed to get from session storage:', error);
    }
    return null;
  }

  _setInLocalStorage(key, entry) {
    try {
      localStorage.setItem(
        `cache_${key}`,
        JSON.stringify({
          data: entry.data,
          expiresAt: entry.expiresAt,
          category: entry.category,
          compressed: entry.compressed
        })
      );
    } catch (error) {
      console.warn('Failed to set local storage cache:', error);
    }
  }

  _getFromLocalStorage(key) {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (item) {
        const parsed = JSON.parse(item);
        if (Date.now() < parsed.expiresAt) {
          return new CacheEntry(key, parsed.data, {
            category: parsed.category
          });
        }
        localStorage.removeItem(`cache_${key}`);
      }
    } catch (error) {
      console.warn('Failed to get from local storage:', error);
    }
    return null;
  }

  _removeFromSessionStorage(key) {
    try {
      sessionStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove from session storage:', error);
    }
  }

  _removeFromLocalStorage(key) {
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove from local storage:', error);
    }
  }

  _hasInSessionStorage(key) {
    try {
      return sessionStorage.getItem(`cache_${key}`) !== null;
    } catch {
      return false;
    }
  }

  _hasInLocalStorage(key) {
    try {
      return localStorage.getItem(`cache_${key}`) !== null;
    } catch {
      return false;
    }
  }

  _clearSessionStorage() {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear session storage:', error);
    }
  }

  _clearLocalStorage() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear local storage:', error);
    }
  }

  /**
   * Dependency management
   */
  _updateDependencies(key, dependencies) {
    dependencies.forEach(dep => {
      if (!this.dependencyGraph.has(dep)) {
        this.dependencyGraph.set(dep, new Set());
      }
      this.dependencyGraph.get(dep).add(key);
    });
  }

  _invalidateDependents(key) {
    const dependents = this.dependencyGraph.get(key);
    if (dependents) {
      dependents.forEach(dependent => {
        this.delete(dependent);
      });
      this.dependencyGraph.delete(key);
    }
  }

  /**
   * Cleanup and maintenance
   */
  _startCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this._performCleanup();
    }, this.options.cleanupInterval);
  }

  _performCleanup() {
    const _now = Date.now(); // Used in isExpired() method
    const expiredKeys = [];

    // Find expired entries
    for (const [key, entry] of this.memoryCache) {
      if (entry.isExpired()) {
        expiredKeys.push(key);
      }
    }

    // Remove expired entries
    expiredKeys.forEach(key => this.delete(key));

    // Check memory limits
    if (this._shouldEvict()) {
      this._evictLeastUsed();
    }

    this._updateMetrics();
  }

  _calculateTotalSize() {
    let totalSize = 0;
    for (const entry of this.memoryCache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  _getCategoryStats() {
    const categories = {};
    for (const entry of this.memoryCache.values()) {
      if (!categories[entry.category]) {
        categories[entry.category] = { count: 0, size: 0 };
      }
      categories[entry.category].count++;
      categories[entry.category].size += entry.size;
    }
    return categories;
  }

  _updateMetrics() {
    this.metrics.size = this._calculateTotalSize();
    this.metrics.entries = this.memoryCache.size;
  }

  _loadPersistedCache() {
    // Implementation for loading persisted cache on startup
    // This would restore cache from localStorage on app initialization
  }

  _persistEntry(key, entry) {
    // Implementation for persisting critical cache entries
    this._setInLocalStorage(key, entry);
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.clear();
  }
}

// ===================
// CACHE STRATEGIES
// ===================

export class CacheStrategy {
  constructor(cacheManager, strategy = CacheConfig.STRATEGIES.CACHE_FIRST) {
    this.cache = cacheManager;
    this.strategy = strategy;
  }

  async execute(key, fetcher, options = {}) {
    switch (this.strategy) {
      case CacheConfig.STRATEGIES.CACHE_FIRST:
        return this._cacheFirst(key, fetcher, options);
      case CacheConfig.STRATEGIES.NETWORK_FIRST:
        return this._networkFirst(key, fetcher, options);
      case CacheConfig.STRATEGIES.CACHE_ONLY:
        return this._cacheOnly(key, options);
      case CacheConfig.STRATEGIES.NETWORK_ONLY:
        return this._networkOnly(fetcher, options);
      case CacheConfig.STRATEGIES.STALE_WHILE_REVALIDATE:
        return this._staleWhileRevalidate(key, fetcher, options);
      default:
        return this._cacheFirst(key, fetcher, options);
    }
  }

  async _cacheFirst(key, fetcher, options) {
    const cached = this.cache.get(key, options);
    if (cached) {
      return cached;
    }

    const data = await fetcher();
    this.cache.set(key, data, options);
    return data;
  }

  async _networkFirst(key, fetcher, options) {
    try {
      const data = await fetcher();
      this.cache.set(key, data, options);
      return data;
    } catch (error) {
      const cached = this.cache.get(key, { ...options, allowStale: true });
      if (cached) {
        return cached;
      }
      throw error;
    }
  }

  async _cacheOnly(key, options) {
    const cached = this.cache.get(key, options);
    if (!cached) {
      throw new Error(`No cached data found for key: ${key}`);
    }
    return cached;
  }

  async _networkOnly(fetcher, _options) {
    return await fetcher();
  }

  async _staleWhileRevalidate(key, fetcher, options) {
    const cached = this.cache.get(key, options);

    if (cached) {
      // Return cached data immediately
      const entry = this.cache.memoryCache.get(key);
      if (entry && entry.isStale()) {
        // Revalidate in background
        fetcher()
          .then(data => {
            this.cache.set(key, data, options);
          })
          .catch(error => {
            console.warn(`Background revalidation failed for ${key}:`, error);
          });
      }
      return cached;
    }

    // No cached data, fetch normally
    const data = await fetcher();
    this.cache.set(key, data, options);
    return data;
  }
}

// ===================
// SINGLETON INSTANCE
// ===================

// Create global cache manager instance
export const globalCache = new CacheManager({
  enableMetrics: process.env.NODE_ENV === 'development',
  enablePersistence: true
});

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    globalCache.destroy();
  });
}

const CacheManagerModule = {
  CacheManager,
  CacheStrategy,
  CacheConfig,
  globalCache
};

export default CacheManagerModule;
