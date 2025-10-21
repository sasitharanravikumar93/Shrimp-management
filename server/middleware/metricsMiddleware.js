/**
 * Metrics Middleware
 * Automatically collects metrics for HTTP requests and other operations
 */

const metricsCollector = require('../utils/metricsCollector');

/**
 * HTTP request metrics middleware
 * Collects metrics for all HTTP requests
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const httpMetricsMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Increment active requests
  metricsCollector.updateActiveRequests(1);

  // Store start time on request object
  req.metricsStartTime = startTime;

  // Override res.end to capture response metrics
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Record the HTTP request metrics
    metricsCollector.recordHttpRequest(req, res, responseTime);

    // Decrement active requests
    metricsCollector.updateActiveRequests(-1);

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Database query metrics wrapper
 * Wraps database operations to collect metrics
 * @param {function} originalMethod - The original method to wrap
 * @param {string} collection - The name of the database collection
 * @param {string} operation - The type of database operation (e.g., 'find', 'create')
 * @returns {function} - The wrapped function
 */
const wrapDatabaseOperation = (originalMethod, collection, operation) => {
  return async function (...args) {
    const startTime = Date.now();
    let success = true;

    try {
      const result = await originalMethod.apply(this, args);
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      metricsCollector.recordDatabaseQuery(collection, operation, executionTime, success);
    }
  };
};

/**
 * Error tracking middleware
 * Records errors that occur during request processing
 * @param {Error} error - The error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const errorMetricsMiddleware = (error, req, res, next) => {
  const route = req.route?.path || req.path || 'unknown';
  const isCritical = res.statusCode >= 500;

  metricsCollector.recordError(error, route, isCritical);

  next(error);
};

/**
 * Business operation metrics decorator
 * Decorator function to automatically track business operations
 * @param {string} operationType - The type of business operation
 * @returns {function} - The decorator function
 */
const trackBusinessOperation = (operationType) => {
  return (target, propertyName, descriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      try {
        const result = await originalMethod.apply(this, args);

        // Record successful business operation
        metricsCollector.recordBusinessOperation(operationType, {
          timestamp: Date.now(),
          userId: args[0]?.user?.id, // Assuming first arg is req with user info
          success: true
        });

        return result;
      } catch (error) {
        // Record failed business operation
        metricsCollector.recordBusinessOperation(operationType, {
          timestamp: Date.now(),
          userId: args[0]?.user?.id,
          success: false,
          error: error.message
        });

        throw error;
      }
    };

    return descriptor;
  };
};

/**
 * Authentication metrics helper
 * Records authentication-related events
 */
const recordAuthMetrics = {
  login: (userId, success = true, details = {}) => {
    if (success) {
      metricsCollector.recordAuthEvent('login', { userId, ...details });
    } else {
      metricsCollector.recordAuthEvent('failed_login', { userId, ...details });
    }
  },

  register: (userId, details = {}) => {
    metricsCollector.recordAuthEvent('register', { userId, ...details });
  },

  logout: (userId, details = {}) => {
    metricsCollector.recordAuthEvent('logout', { userId, ...details });
  }
};

/**
 * Mongoose metrics plugin
 * Automatically tracks database operations for Mongoose models
 * @param {object} schema - Mongoose schema
 * @param {object} options - Plugin options
 */
const mongooseMetricsPlugin = function (schema, options) {
  const modelName = options?.modelName || 'Unknown';

  // Pre-hooks to track operation start time
  schema.pre(['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete', 'save', 'deleteOne', 'deleteMany'], function () {
    this._metricsStartTime = Date.now();
  });

  // Post-hooks to record metrics
  const recordMetrics = function (operation, success = true) {
    return function () {
      if (this._metricsStartTime) {
        const executionTime = Date.now() - this._metricsStartTime;
        metricsCollector.recordDatabaseQuery(modelName, operation, executionTime, success);
      }
    };
  };

  // Success hooks
  schema.post(['find', 'findOne'], recordMetrics('find', true));
  schema.post(['findOneAndUpdate'], recordMetrics('update', true));
  schema.post(['findOneAndDelete'], recordMetrics('delete', true));
  schema.post(['save'], recordMetrics('create', true));
  schema.post(['deleteOne', 'deleteMany'], recordMetrics('delete', true));

  // Error hooks
  schema.post('find', function (error) {
    if (error && this._metricsStartTime) {
      const executionTime = Date.now() - this._metricsStartTime;
      metricsCollector.recordDatabaseQuery(modelName, 'find', executionTime, false);
    }
  });

  schema.post('save', function (error) {
    if (error && this._metricsStartTime) {
      const executionTime = Date.now() - this._metricsStartTime;
      metricsCollector.recordDatabaseQuery(modelName, 'create', executionTime, false);
    }
  });
};

/**
 * Performance monitoring utilities
 */
const performanceMonitoring = {
  /**
     * Monitor memory usage spikes
     */
  checkMemoryUsage: () => {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
    const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;

    if (heapUsagePercent > 90) {
      // High memory usage detected
      // no-op
    }
  },

  /**
     * Monitor response time anomalies
     */
  checkResponseTimeAnomalies: () => {
    const httpMetrics = metricsCollector.getHttpMetricsSummary();

    if (httpMetrics.responseTime.p99 > 5000) { // 5 seconds
      // High response time detected
      // no-op
    }
  }
};

module.exports = {
  httpMetricsMiddleware,
  errorMetricsMiddleware,
  wrapDatabaseOperation,
  trackBusinessOperation,
  recordAuthMetrics,
  mongooseMetricsPlugin,
  performanceMonitoring
};