/**
 * API Cache System Tests
 * Comprehensive test coverage for the advanced API caching implementation
 */

import { deduplicatedApiCall, clearCache, getCacheStats, CacheStrategies } from '../apiCache';
import { mockUtils, waitUtils } from '../testUtils';

// Mock fetch for testing
global.fetch = jest.fn();

describe('API Cache System', () => {
  let mockStorage;

  beforeEach(() => {
    // Reset cache and mocks
    clearCache();
    jest.clearAllMocks();

    // Mock localStorage
    mockStorage = mockUtils.createMockLocalStorage();

    // Reset fetch mock
    global.fetch.mockReset();
  });

  afterEach(() => {
    mockStorage.cleanup();
  });

  describe('Basic Caching Functionality', () => {
    it('caches GET requests by default', async () => {
      const mockResponse = { data: 'test data' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      // First call
      const result1 = await deduplicatedApiCall('/api/test', { method: 'GET' });

      // Second call (should use cache)
      const result2 = await deduplicatedApiCall('/api/test', { method: 'GET' });

      expect(result1).toEqual(mockResponse);
      expect(result2).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('does not cache POST requests by default', async () => {
      const mockResponse = { data: 'test data' };
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });

      // First call
      await deduplicatedApiCall('/api/test', { method: 'POST', data: { test: 'data' } });

      // Second call (should not use cache)
      await deduplicatedApiCall('/api/test', { method: 'POST', data: { test: 'data' } });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('respects cache duration settings', async () => {
      const mockResponse = { data: 'test data' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      // First call with short cache duration
      await deduplicatedApiCall(
        '/api/test',
        { method: 'GET' },
        { useCache: true, cacheDuration: 100 }
      );

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Second call (should fetch again due to expired cache)
      await deduplicatedApiCall('/api/test', { method: 'GET' });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Request Deduplication', () => {
    it('deduplicates identical concurrent requests', async () => {
      const mockResponse = { data: 'test data' };

      // Mock a slow response
      global.fetch.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve(mockResponse)
                }),
              100
            )
          )
      );

      // Make multiple concurrent requests
      const promises = [
        deduplicatedApiCall('/api/test', { method: 'GET' }),
        deduplicatedApiCall('/api/test', { method: 'GET' }),
        deduplicatedApiCall('/api/test', { method: 'GET' })
      ];

      const results = await Promise.all(promises);

      // Should all return the same result
      results.forEach(result => {
        expect(result).toEqual(mockResponse);
      });

      // But fetch should only be called once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('does not deduplicate requests with different parameters', async () => {
      const mockResponse = { data: 'test data' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      // Make requests with different parameters
      await Promise.all([
        deduplicatedApiCall('/api/test', { method: 'GET', data: { param: 'a' } }),
        deduplicatedApiCall('/api/test', { method: 'GET', data: { param: 'b' } })
      ]);

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Cache Invalidation', () => {
    it('invalidates cache based on patterns', async () => {
      const mockResponse = { data: 'test data' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      // Cache some data
      await deduplicatedApiCall('/api/users', { method: 'GET' });
      await deduplicatedApiCall('/api/users/123', { method: 'GET' });
      await deduplicatedApiCall('/api/posts', { method: 'GET' });

      expect(global.fetch).toHaveBeenCalledTimes(3);

      // Clear cache for users endpoints
      clearCache(['/api/users']);

      // These should fetch again
      await deduplicatedApiCall('/api/users', { method: 'GET' });
      await deduplicatedApiCall('/api/users/123', { method: 'GET' });

      // This should still use cache
      await deduplicatedApiCall('/api/posts', { method: 'GET' });

      expect(global.fetch).toHaveBeenCalledTimes(5); // 3 initial + 2 refetched
    });

    it('supports wildcard pattern invalidation', async () => {
      const mockResponse = { data: 'test data' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      // Cache some data
      await deduplicatedApiCall('/api/v1/users', { method: 'GET' });
      await deduplicatedApiCall('/api/v1/posts', { method: 'GET' });
      await deduplicatedApiCall('/api/v2/users', { method: 'GET' });

      expect(global.fetch).toHaveBeenCalledTimes(3);

      // Clear all v1 endpoints
      clearCache(['/api/v1/*']);

      // These should fetch again
      await deduplicatedApiCall('/api/v1/users', { method: 'GET' });
      await deduplicatedApiCall('/api/v1/posts', { method: 'GET' });

      // This should still use cache
      await deduplicatedApiCall('/api/v2/users', { method: 'GET' });

      expect(global.fetch).toHaveBeenCalledTimes(5);
    });
  });

  describe('LRU Cache Eviction', () => {
    it('evicts least recently used items when cache is full', async () => {
      const mockResponse = { data: 'test data' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      // Set a small cache size for testing
      const originalCacheSize = process.env.REACT_APP_CACHE_MAX_SIZE;
      process.env.REACT_APP_CACHE_MAX_SIZE = '2';

      try {
        // Fill cache to capacity
        await deduplicatedApiCall('/api/endpoint1', { method: 'GET' });
        await deduplicatedApiCall('/api/endpoint2', { method: 'GET' });

        // Add one more (should evict least recently used)
        await deduplicatedApiCall('/api/endpoint3', { method: 'GET' });

        // First endpoint should be evicted, so this should fetch again
        await deduplicatedApiCall('/api/endpoint1', { method: 'GET' });

        expect(global.fetch).toHaveBeenCalledTimes(4);
      } finally {
        process.env.REACT_APP_CACHE_MAX_SIZE = originalCacheSize;
      }
    });

    it('updates access time when cache items are accessed', async () => {
      const mockResponse = { data: 'test data' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const originalCacheSize = process.env.REACT_APP_CACHE_MAX_SIZE;
      process.env.REACT_APP_CACHE_MAX_SIZE = '2';

      try {
        // Fill cache
        await deduplicatedApiCall('/api/endpoint1', { method: 'GET' });
        await deduplicatedApiCall('/api/endpoint2', { method: 'GET' });

        // Access first endpoint again (should update its access time)
        await deduplicatedApiCall('/api/endpoint1', { method: 'GET' });

        // Add new endpoint (should evict endpoint2, not endpoint1)
        await deduplicatedApiCall('/api/endpoint3', { method: 'GET' });

        // endpoint1 should still be cached
        await deduplicatedApiCall('/api/endpoint1', { method: 'GET' });

        // endpoint2 should be evicted
        await deduplicatedApiCall('/api/endpoint2', { method: 'GET' });

        expect(global.fetch).toHaveBeenCalledTimes(5);
      } finally {
        process.env.REACT_APP_CACHE_MAX_SIZE = originalCacheSize;
      }
    });
  });

  describe('Cache Strategies', () => {
    it('applies cache-first strategy correctly', async () => {
      const cachedData = { data: 'cached' };
      const freshData = { data: 'fresh' };

      // Pre-populate cache
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(cachedData)
      });

      await deduplicatedApiCall('/api/test', { method: 'GET' });

      // Reset mock for fresh data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(freshData)
      });

      // Use cache-first strategy
      const result = await deduplicatedApiCall(
        '/api/test',
        { method: 'GET' },
        { strategy: CacheStrategies.CACHE_FIRST }
      );

      expect(result).toEqual(cachedData);
      expect(global.fetch).toHaveBeenCalledTimes(1); // Only initial call
    });

    it('applies network-first strategy correctly', async () => {
      const cachedData = { data: 'cached' };
      const freshData = { data: 'fresh' };

      // Pre-populate cache
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(cachedData)
      });

      await deduplicatedApiCall('/api/test', { method: 'GET' });

      // Mock fresh data
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(freshData)
      });

      // Use network-first strategy
      const result = await deduplicatedApiCall(
        '/api/test',
        { method: 'GET' },
        { strategy: CacheStrategies.NETWORK_FIRST }
      );

      expect(result).toEqual(freshData);
      expect(global.fetch).toHaveBeenCalledTimes(2); // Initial + fresh call
    });

    it('falls back to cache when network fails in network-first strategy', async () => {
      const cachedData = { data: 'cached' };

      // Pre-populate cache
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(cachedData)
      });

      await deduplicatedApiCall('/api/test', { method: 'GET' });

      // Mock network failure
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      // Use network-first strategy
      const result = await deduplicatedApiCall(
        '/api/test',
        { method: 'GET' },
        { strategy: CacheStrategies.NETWORK_FIRST }
      );

      expect(result).toEqual(cachedData);
    });
  });

  describe('Cache Statistics', () => {
    it('provides accurate cache statistics', async () => {
      const mockResponse = { data: 'test data' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      // Initial stats
      let stats = getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);

      // Make some requests
      await deduplicatedApiCall('/api/test1', { method: 'GET' });
      await deduplicatedApiCall('/api/test2', { method: 'GET' });

      // Cache miss stats
      stats = getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.misses).toBe(2);

      // Make cached requests
      await deduplicatedApiCall('/api/test1', { method: 'GET' });
      await deduplicatedApiCall('/api/test2', { method: 'GET' });

      // Cache hit stats
      stats = getCacheStats();
      expect(stats.hits).toBe(2);
      expect(stats.hitRate).toBeCloseTo(0.5); // 2 hits out of 4 total requests
    });
  });

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(deduplicatedApiCall('/api/test', { method: 'GET' })).rejects.toThrow(
        'Network error'
      );
    });

    it('handles malformed responses', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(deduplicatedApiCall('/api/test', { method: 'GET' })).rejects.toThrow(
        'Invalid JSON'
      );
    });

    it('handles HTTP error responses', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(deduplicatedApiCall('/api/test', { method: 'GET' })).rejects.toThrow(
        'HTTP error! status: 404'
      );
    });

    it('does not cache error responses', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: 'success' })
        });

      // First call should fail
      await expect(deduplicatedApiCall('/api/test', { method: 'GET' })).rejects.toThrow();

      // Second call should try again (not use cached error)
      const result = await deduplicatedApiCall('/api/test', { method: 'GET' });
      expect(result).toEqual({ data: 'success' });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('handles null/undefined endpoints', async () => {
      await expect(deduplicatedApiCall(null, { method: 'GET' })).rejects.toThrow();

      await expect(deduplicatedApiCall(undefined, { method: 'GET' })).rejects.toThrow();
    });

    it('handles empty cache clearing', () => {
      expect(() => clearCache()).not.toThrow();
      expect(() => clearCache([])).not.toThrow();
      expect(() => clearCache(['non-existent'])).not.toThrow();
    });

    it('handles invalid cache options gracefully', async () => {
      const mockResponse = { data: 'test data' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      // Should not crash with invalid options
      const result = await deduplicatedApiCall(
        '/api/test',
        { method: 'GET' },
        {
          useCache: 'invalid',
          cacheDuration: 'not-a-number',
          strategy: 'unknown-strategy'
        }
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Memory Management', () => {
    it('cleans up expired cache entries', async () => {
      const mockResponse = { data: 'test data' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      // Cache with very short duration
      await deduplicatedApiCall(
        '/api/test',
        { method: 'GET' },
        { useCache: true, cacheDuration: 10 }
      );

      let stats = getCacheStats();
      expect(stats.size).toBe(1);

      // Wait for expiration and trigger cleanup
      await new Promise(resolve => setTimeout(resolve, 50));

      // Make another request to trigger cleanup
      await deduplicatedApiCall('/api/other', { method: 'GET' });

      stats = getCacheStats();
      // Should have cleaned up expired entry
      expect(stats.size).toBe(1); // Only the new entry
    });
  });
});
