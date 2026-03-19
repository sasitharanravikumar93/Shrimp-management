const NodeCache = require('node-cache');
const { logger } = require('../utils/logger');

// Create a cache instance with a default TTL of 10 minutes
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Middleware to cache GET requests
const cacheMiddleware = (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    logger.info('Skipping cache for non-GET request', { method: req.method, url: req.url });
    return next();
  }

  // Generate a cache key based on the URL and query parameters
  const key = req.originalUrl || req.url;
  logger.info('Checking cache for request', { key, method: req.method, url: req.url });

  // Try to get cached data
  const cachedData = cache.get(key);

  if (cachedData) {
    logger.info('Returning cached data', { key, cachedData: JSON.stringify(cachedData).substring(0, 200) + '...' });
    // Return cached data
    return res.json(cachedData);
  }

  logger.info('No cached data found, proceeding to controller', { key });

  // Override res.json to cache the response
  res.sendResponse = res.json;
  res.json = (body) => {
    // Cache the response for future requests
    logger.info('Caching response data', { key, body: JSON.stringify(body).substring(0, 200) + '...' });
    cache.set(key, body);
    res.sendResponse(body);
  };

  next();
};

// Function to clear cache for a specific key
const clearCache = (key) => {
  logger.info('Clearing cache for key', { key });
  const result = cache.del(key);
  logger.info('Cache clearing result', { key, result, hasKeyBefore: cache.has(key) });
};

// Function to clear all cache
const clearAllCache = () => {
  logger.info('Clearing all cache');
  cache.flushAll();
};

module.exports = {
  cacheMiddleware,
  clearCache,
  clearAllCache
};