/**
 * Comprehensive Logging Middleware
 * Automatically logs important application events and operations
 */

const { logger } = require('../utils/logger');

/**
 * HTTP Request/Response Logging Middleware
 * Logs all HTTP requests with detailed information
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const requestLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Extract user info if available
  const userId = req.user?.id || req.user?._id || 'anonymous';
  const requestId = res.locals.requestId || `req_${Date.now()}`;

  // Store request info for later logging
  req.logInfo = {
    requestId,
    userId,
    startTime,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer')
  };

  // Log incoming request
  logger.info('Incoming request', {
    requestId,
    userId,
    method: req.method,
    url: req.originalUrl,
    ip: req.logInfo.ip,
    userAgent: req.logInfo.userAgent,
    body: sanitizeRequestBody(req.body),
    query: req.query,
    params: req.params
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Log response
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms`,
      {
        requestId,
        userId,
        ip: req.logInfo.ip,
        contentLength: res.get('Content-Length'),
        success: res.statusCode < 400
      }
    );

    // Log slow requests
    if (responseTime > 1000) {
      logger.warn('Slow request detected', {
        requestId,
        userId,
        method: req.method,
        url: req.originalUrl,
        responseTime,
        statusCode: res.statusCode
      });
    }

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Authentication Event Logging
 * Logs authentication-related events
 */
const authEventLogger = {
  loginAttempt: (username, ip, userAgent) => {
    logger.info('login_attempt', {
      username,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
  },

  loginSuccess: (userId, username, ip, userAgent) => {
    logger.info('login_success', {
      userId,
      username,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });

    logger.info('User logged in', {
      auditType: 'authentication',
      userId,
      username,
      ip,
      action: 'login'
    });
  },

  loginFailure: (username, reason, ip, userAgent) => {
    logger.warn('login_failed', {
      username,
      reason,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });

    logger.warn('Failed login attempt', {
      severity: 'medium',
      username,
      reason,
      ip,
      userAgent
    });
  },

  logout: (userId, username, ip) => {
    logger.info('logout', {
      userId,
      username,
      ip,
      timestamp: new Date().toISOString()
    });

    logger.info('User logged out', {
      auditType: 'authentication',
      userId,
      username,
      ip,
      action: 'logout'
    });
  },

  registration: (userId, username, email, ip) => {
    logger.info('registration', {
      userId,
      username,
      email,
      ip,
      timestamp: new Date().toISOString()
    });

    logger.info('New user registered', {
      auditType: 'user_management',
      userId,
      username,
      email,
      ip,
      action: 'register'
    });
  },

  passwordChange: (userId, username, ip) => {
    logger.info('password_change', {
      userId,
      username,
      ip,
      timestamp: new Date().toISOString()
    });

    logger.info('Password changed', {
      auditType: 'security',
      userId,
      username,
      ip,
      action: 'password_change'
    });
  }
};

/**
 * Business Operation Logging
 * Logs important business operations
 */
const businessOperationLogger = {
  pondOperation: (operation, pondId, pondName, userId, seasonId) => {
    logger.info(`Pond ${operation}`, {
      operation,
      pondId,
      pondName,
      userId,
      seasonId,
      timestamp: new Date().toISOString()
    });

    logger.info(`Pond ${operation}`, {
      auditType: 'pond_management',
      entityType: 'pond',
      entityId: pondId,
      entityName: pondName,
      operation,
      userId,
      seasonId
    });
  },

  seasonOperation: (operation, seasonId, seasonName, userId) => {
    logger.info(`Season ${operation}`, {
      operation,
      seasonId,
      seasonName,
      userId,
      timestamp: new Date().toISOString()
    });

    logger.info(`Season ${operation}`, {
      auditType: 'season_management',
      entityType: 'season',
      entityId: seasonId,
      entityName: seasonName,
      operation,
      userId
    });
  },

  feedInput: (operation, feedInputId, pondId, quantity, userId) => {
    logger.info(`Feed input ${operation}`, {
      operation,
      feedInputId,
      pondId,
      quantity,
      userId,
      timestamp: new Date().toISOString()
    });

    logger.info(`Feed input ${operation}`, {
      auditType: 'feeding',
      entityType: 'feed_input',
      entityId: feedInputId,
      operation,
      pondId,
      quantity,
      userId
    });
  },

  waterQualityInput: (operation, inputId, pondId, userId, parameters) => {
    logger.info(`Water quality input ${operation}`, {
      operation,
      inputId,
      pondId,
      userId,
      parameters: sanitizeWaterQualityData(parameters),
      timestamp: new Date().toISOString()
    });

    logger.info(`Water quality input ${operation}`, {
      auditType: 'water_management',
      entityType: 'water_quality_input',
      entityId: inputId,
      operation,
      pondId,
      userId
    });
  },

  inventoryOperation: (operation, itemId, itemName, quantityChange, userId) => {
    logger.info(`Inventory ${operation}`, {
      operation,
      itemId,
      itemName,
      quantityChange,
      userId,
      timestamp: new Date().toISOString()
    });

    logger.info(`Inventory ${operation}`, {
      auditType: 'inventory_management',
      entityType: 'inventory_item',
      entityId: itemId,
      entityName: itemName,
      operation,
      quantityChange,
      userId
    });
  }
};

/**
 * Error Logging with Context
 * Enhanced error logging with request context
 */
const errorLogger = {
  logError: (error, req, additionalContext = {}) => {
    const requestId = req?.logInfo?.requestId || 'unknown';
    const userId = req?.logInfo?.userId || req?.user?.id || 'anonymous';

    const errorContext = {
      requestId,
      userId,
      method: req?.method,
      url: req?.originalUrl,
      ip: req?.logInfo?.ip,
      userAgent: req?.logInfo?.userAgent,
      body: sanitizeRequestBody(req?.body),
      query: req?.query,
      params: req?.params,
      stack: error.stack,
      ...additionalContext
    };

    if (error.statusCode >= 500 || !error.statusCode) {
      logger.error(`Critical error: ${error.message}`, errorContext);
    } else {
      logger.warn(`Client error: ${error.message}`, errorContext);
    }
  },

  logDatabaseError: (error, operation, collection, query = {}) => {
    logger.error(`Database error during ${operation}`, {
      category: 'database_error',
      operation,
      collection,
      query: sanitizeQuery(query),
      stack: error.stack
    });
  },

  logValidationError: (errors, req) => {
    const requestId = req?.logInfo?.requestId || 'unknown';
    const userId = req?.logInfo?.userId || req?.user?.id || 'anonymous';

    logger.warn('Validation error', {
      requestId,
      userId,
      method: req?.method,
      url: req?.originalUrl,
      validationErrors: errors,
      body: sanitizeRequestBody(req?.body)
    });
  }
};

/**
 * Security Event Logging
 * Logs security-related events
 */
const securityLogger = {
  suspiciousActivity: (type, ip, userAgent, details = {}) => {
    logger.warn(`Suspicious activity: ${type}`, {
      severity: 'high',
      type,
      ip,
      userAgent,
      ...details,
      timestamp: new Date().toISOString()
    });
  },

  rateLimitExceeded: (ip, userAgent, endpoint) => {
    logger.warn('Rate limit exceeded', {
      severity: 'medium',
      ip,
      userAgent,
      endpoint,
      timestamp: new Date().toISOString()
    });
  },

  unauthorizedAccess: (ip, userAgent, endpoint, userId = null) => {
    logger.warn('Unauthorized access attempt', {
      severity: 'high',
      ip,
      userAgent,
      endpoint,
      userId,
      timestamp: new Date().toISOString()
    });
  },

  blockedRequest: (ip, reason, userAgent) => {
    logger.warn('Request blocked', {
      severity: 'medium',
      ip,
      reason,
      userAgent,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Performance Logging
 */
const performanceLogger = {
  slowQuery: (collection, operation, executionTime, query = {}) => {
    logger.warn('Slow database query', {
      collection,
      operation,
      executionTime,
      query: sanitizeQuery(query),
      threshold: 1000
    });
  },

  memoryUsageHigh: (memoryUsage) => {
    logger.warn('High memory usage detected', {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      usagePercent: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
    });
  }
};

/**
 * Utility functions for data sanitization
 * @param {object} body - The request body to sanitize
 * @returns {object} - The sanitized request body
 */
function sanitizeRequestBody(body) {
  if (!body) {
    return {};
  }

  const sanitized = { ...body };

  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Sanitizes a query object by removing sensitive data.
 * @param {object} query - The query object to sanitize.
 * @returns {object} The sanitized query object.
 */
function sanitizeQuery(query) {
  if (!query) {
    return {};
  }

  const sanitized = { ...query };

  // Remove sensitive query data
  if (sanitized.password) {
    sanitized.password = '[REDACTED]';
  }
  if (sanitized.$where) {
    sanitized.$where = '[REDACTED]';
  }

  return sanitized;
}

/**
 * Sanitizes water quality data by only logging non-sensitive parameters.
 * @param {object} parameters - The water quality parameters to sanitize.
 * @returns {object} The sanitized water quality parameters.
 */
function sanitizeWaterQualityData(parameters) {
  if (!parameters) {
    return {};
  }

  // Only log non-sensitive water quality parameters
  const { pH, dissolvedOxygen, temperature, salinity } = parameters;
  return { pH, dissolvedOxygen, temperature, salinity };
}

module.exports = {
  requestLoggingMiddleware,
  authEventLogger,
  businessOperationLogger,
  errorLogger,
  securityLogger,
  performanceLogger
};