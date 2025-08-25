/**
 * Standardized Error Handling Utilities
 * Provides consistent error responses and logging across the application
 */

const logger = require('../logger');

/**
 * Custom error classes for different types of errors
 */
class AppError extends Error {
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

class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Forbidden access') {
        super(message, 403, 'FORBIDDEN');
    }
}

class ConflictError extends AppError {
    constructor(message, details = null) {
        super(message, 409, 'CONFLICT', details);
    }
}

class DatabaseError extends AppError {
    constructor(message, details = null) {
        super(message, 500, 'DATABASE_ERROR', details);
    }
}

/**
 * Standard response formatters
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

const handleJSONParseError = (error) => {
    return new ValidationError('Invalid JSON format in request body');
};

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
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global error handling middleware
 */
const globalErrorHandler = (err, req, res, next) => {
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
 */
const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
};

/**
 * Request ID middleware for tracking
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