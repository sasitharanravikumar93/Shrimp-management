const NodeCache = require('node-cache');

// Create a cache instance with a default TTL of 10 minutes
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Middleware to cache GET requests
const cacheMiddleware = (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }

  // Generate a cache key based on the URL and query parameters
  const key = req.originalUrl || req.url;
  
  // Try to get cached data
  const cachedData = cache.get(key);
  
  if (cachedData) {
    // Return cached data
    return res.json(cachedData);
  }
  
  // Override res.json to cache the response
  res.sendResponse = res.json;
  res.json = (body) => {
    // Cache the response for future requests
    cache.set(key, body);
    res.sendResponse(body);
  };
  
  next();
};

// Function to clear cache for a specific key
const clearCache = (key) => {
  cache.del(key);
};

// Function to clear all cache
const clearAllCache = () => {
  cache.flushAll();
};

module.exports = {
  cacheMiddleware,
  clearCache,
  clearAllCache
};