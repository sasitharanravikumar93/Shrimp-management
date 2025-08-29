/**
 * Standardized Error Handling Utilities
 * Provides consistent error responses and logging across the application
 */

const { logger } = require('../utils/logger');

/**
 * Custom error classes for different types of errors
 */

/**
 * Base application error class
 * @extends Error
 */
class AppError extends Error {
  /**
   * Create an application error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string|null} errorCode - Application-specific error code
   * @param {object|null} details - Additional error details
   */
  constructor(message, statusCode, errorCode = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error class
 * @extends AppError
 */
class ValidationError extends AppError {
  /**
   * Create a validation error
   * @param {string} message - Error message
   * @param {object|null} details - Additional error details
   */
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * Not found error class
 * @extends AppError
 */
class NotFoundError extends AppError {
  /**
   * Create a not found error
   * @param {string} resource - Resource that was not found
   */
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/**
 * Unauthorized error class
 * @extends AppError
 */
class UnauthorizedError extends AppError {
  /**
   * Create an unauthorized error
   * @param {string} message - Error message
   */
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Forbidden error class
 * @extends AppError
 */
class ForbiddenError extends AppError {
  /**
   * Create a forbidden error
   * @param {string} message - Error message
   */
  constructor(message = 'Forbidden access') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Conflict error class
 * @extends AppError
 */
class ConflictError extends AppError {
  /**
   * Create a conflict error
   * @param {string} message - Error message
   * @param {object|null} details - Additional error details
   */
  constructor(message, details = null) {
    super(message, 409, 'CONFLICT', details);
  }
}

/**
 * Database error class
 * @extends AppError
 */
class DatabaseError extends AppError {
  /**
   * Create a database error
   * @param {string} message - Error message
   * @param {object|null} details - Additional error details
   */
  constructor(message, details = null) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

/**
 * Standard response formatters
 */

/**
 * Send error response to client
 * @param {object} res - Express response object
 * @param {Error} error - Error object
 * @returns {void}
 */
const sendErrorResponse = (res, error) => {
  const response = {
    status: error.status || 'error',
    message: error.message,
    timestamp: new Date().toISOString()
  };

  // Add error code if available
  if (error.errorCode) {
    response.errorCode = error.errorCode;
  }

  // Add details for client errors (4xx)
  if (error.statusCode < 500 && error.details) {
    response.details = error.details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    response.stack = error.stack;
  }

  // Add request ID for tracking
  if (res.locals.requestId) {
    response.requestId = res.locals.requestId;
  }

  res.status(error.statusCode || 500).json(response);
};

/**
 * Send success response to client
 * @param {object} res - Express response object
 * @param {object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @param {object|null} meta - Metadata (pagination, etc.)
 * @returns {void}
 */
const sendSuccessResponse = (res, data, message = 'Success', statusCode = 200, meta = null) => {
  const response = {
    status: 'success',
    message,
    data,
    timestamp: new Date().toISOString()
  };

  // Add metadata (pagination, etc.)
  if (meta) {
    response.meta = meta;
  }

  // Add request ID for tracking
  if (res.locals.requestId) {
    response.requestId = res.locals.requestId;
  }

  res.status(statusCode).json(response);
};

/**
 * Error handling utilities for common scenarios
 */

/**
 * Handle database errors and convert to appropriate error types
 * @param {Error} error - Database error
 * @returns {AppError} Appropriate error object
 */
const handleDatabaseError = (error) => {
  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return new ConflictError(
      `${field} already exists`,
      { field, value: error.keyValue[field] }
    );
  }

  // MongoDB validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    return new ValidationError('Validation failed', errors);
  }

  // MongoDB cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    return new ValidationError(`Invalid ${error.path}: ${error.value}`);
  }

  // Default database error
  return new DatabaseError('Database operation failed');
};

/**
 * Handle JSON parse errors
 * @param {Error} _error - JSON parse error (unused)
 * @returns {ValidationError} Validation error object
 */
const handleJSONParseError = (_error) => {
  return new ValidationError('Invalid JSON format in request body');
};

/**
 * Handle Multer file upload errors
 * @param {Error} error - Multer error
 * @returns {ValidationError} Validation error object
 */
const handleMulterError = (error) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new ValidationError('File size too large');
  }
  if (error.code === 'LIMIT_FILE_COUNT') {
    return new ValidationError('Too many files uploaded');
  }
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new ValidationError('Unexpected file field');
  }
  return new ValidationError('File upload error');
};

/**
 * Async error wrapper to avoid try-catch in every controller
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} _next - Express next middleware function (unused)
 * @returns {void}
 */
const globalErrorHandler = (err, req, res, _next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err.name === 'ValidationError' || err.name === 'CastError' || err.code === 11000) {
    error = handleDatabaseError(err);
  } else if (err.type === 'entity.parse.failed') {
    error = handleJSONParseError(err);
  } else if (err.name === 'MulterError') {
    error = handleMulterError(err);
  } else if (!err.isOperational) {
    // Programming errors - don't leak details to client
    error = new AppError('Something went wrong', 500, 'INTERNAL_ERROR');
  }

  sendErrorResponse(res, error);
};

/**
 * 404 handler for unmatched routes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

/**
 * Request ID middleware for tracking
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const requestIdMiddleware = (req, res, next) => {
  res.locals.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  next();
};

module.exports = {
  // Error classes
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  DatabaseError,

  // Response formatters
  sendErrorResponse,
  sendSuccessResponse,

  // Error handlers
  handleDatabaseError,
  handleJSONParseError,
  handleMulterError,

  // Middleware
  asyncHandler,
  globalErrorHandler,
  notFoundHandler,
  requestIdMiddleware
};