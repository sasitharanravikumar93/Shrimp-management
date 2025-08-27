/**
 * Enhanced Logger Configuration
 * Provides comprehensive structured logging for the application
 */

const winston = require('winston');
const path = require('path');

// Custom log format for structured logging
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, requestId, userId, ...meta }) => {
    const logEntry = {
      timestamp,
      level,
      message,
      service: service || 'shrimp-farm-api',
      ...(requestId && { requestId }),
      ...(userId && { userId }),
      ...meta
    };
    return JSON.stringify(logEntry);
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, requestId, userId, ...meta }) => {
    let logLine = `${timestamp} [${level}]: ${message}`;

    if (requestId) {logLine += ` [req:${requestId}]`;}
    if (userId) {logLine += ` [user:${userId}]`;}

    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${logLine}${metaStr}`;
  })
);

// Create logger with enhanced configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: {
    service: 'shrimp-farm-api',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Error logs - only errors and above
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),

    // Combined logs - all levels
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true
    }),

    // Access logs - HTTP requests
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'access.log'),
      level: 'http',
      maxsize: 5242880, // 5MB
      maxFiles: 7,
      tailable: true
    }),

    // Security logs - authentication and security events
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'security.log'),
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true
    }),

    // Audit logs - business operations
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'audit.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 15,
      tailable: true
    })
  ],

  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(process.cwd(), 'logs', 'exceptions.log') })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(process.cwd(), 'logs', 'rejections.log') })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Enhanced logging methods with structured data
const enhancedLogger = {
  // Standard logging methods
  error: (message, meta = {}) => {
    logger.error(message, {
      ...meta,
      category: meta.category || 'application'
    });
  },

  warn: (message, meta = {}) => {
    logger.warn(message, {
      ...meta,
      category: meta.category || 'application'
    });
  },

  info: (message, meta = {}) => {
    logger.info(message, {
      ...meta,
      category: meta.category || 'application'
    });
  },

  debug: (message, meta = {}) => {
    logger.debug(message, {
      ...meta,
      category: meta.category || 'application'
    });
  },

  // Specialized logging methods
  http: (message, meta = {}) => {
    logger.log('http', message, {
      ...meta,
      category: 'http'
    });
  },

  security: (message, meta = {}) => {
    logger.warn(message, {
      ...meta,
      category: 'security',
      severity: meta.severity || 'medium'
    });
  },

  audit: (message, meta = {}) => {
    logger.info(message, {
      ...meta,
      category: 'audit',
      auditType: meta.auditType || 'operation'
    });
  },

  performance: (message, meta = {}) => {
    logger.info(message, {
      ...meta,
      category: 'performance'
    });
  },

  business: (message, meta = {}) => {
    logger.info(message, {
      ...meta,
      category: 'business'
    });
  },

  // User action logging
  userAction: (action, userId, meta = {}) => {
    logger.info(`User action: ${action}`, {
      ...meta,
      category: 'user_action',
      userId,
      action
    });
  },

  // Database operation logging
  database: (operation, collection, meta = {}) => {
    logger.debug(`Database ${operation} on ${collection}`, {
      ...meta,
      category: 'database',
      operation,
      collection
    });
  },

  // API request/response logging
  apiRequest: (method, url, statusCode, responseTime, meta = {}) => {
    logger.http(`${method} ${url} ${statusCode} - ${responseTime}ms`, {
      ...meta,
      category: 'api',
      method,
      url,
      statusCode,
      responseTime
    });
  },

  // Authentication logging
  auth: (event, userId, meta = {}) => {
    const level = event.includes('failed') || event.includes('blocked') ? 'warn' : 'info';
    logger.log(level, `Auth event: ${event}`, {
      ...meta,
      category: 'authentication',
      event,
      userId
    });
  },

  // Error with stack trace
  errorWithStack: (error, message, meta = {}) => {
    logger.error(message || error.message, {
      ...meta,
      category: 'error',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  }
};

module.exports = enhancedLogger;
