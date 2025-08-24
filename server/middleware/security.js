/**
 * Security Middleware
 * Handles input sanitization, rate limiting, and security headers
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { getConfig } = require('../config');

const config = getConfig();

/**
 * Rate limiting middleware
 */
const rateLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            message: 'Too many requests from this IP, please try again later.',
            retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
        });
    }
});

/**
 * Stricter rate limiting for authentication endpoints
 */
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    skipSuccessfulRequests: true,
    message: {
        status: 'error',
        message: 'Too many authentication attempts, please try again later.',
        retryAfter: 900 // 15 minutes in seconds
    }
});

/**
 * Input sanitization middleware
 */
const sanitizeInput = (req, res, next) => {
    // Sanitize against NoSQL injection
    mongoSanitize()(req, res, () => {
        // Additional custom sanitization
        const sanitizeValue = (value) => {
            if (typeof value === 'string') {
                // Remove or escape potentially dangerous characters
                return value
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
                    .replace(/javascript:/gi, '') // Remove javascript: protocol
                    .replace(/on\w+\s*=/gi, '') // Remove event handlers
                    .trim();
            }
            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    return value.map(sanitizeValue);
                }
                const sanitized = {};
                for (const [key, val] of Object.entries(value)) {
                    sanitized[key] = sanitizeValue(val);
                }
                return sanitized;
            }
            return value;
        };

        // Sanitize request body
        if (req.body) {
            req.body = sanitizeValue(req.body);
        }

        // Sanitize query parameters
        if (req.query) {
            req.query = sanitizeValue(req.query);
        }

        // Sanitize URL parameters
        if (req.params) {
            req.params = sanitizeValue(req.params);
        }

        next();
    });
};

/**
 * Security headers middleware
 */
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});

/**
 * Request logging middleware for security auditing
 */
const securityLogger = (req, res, next) => {
    const startTime = Date.now();

    // Log security-relevant request information
    const logData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        contentLength: req.get('content-length'),
        contentType: req.get('content-type')
    };

    // Log authentication attempts
    if (req.originalUrl.includes('/auth/') || req.originalUrl.includes('/login')) {
        console.log('Auth attempt:', logData);
    }

    // Log potentially suspicious requests
    const suspiciousPatterns = [
        /\.\./,  // Directory traversal
        /<script/i,  // Script injection
        /union.*select/i,  // SQL injection
        /javascript:/i,  // XSS
        /eval\(/i,  // Code injection
    ];

    const isSuspicious = suspiciousPatterns.some(pattern =>
        pattern.test(req.originalUrl) ||
        pattern.test(JSON.stringify(req.body)) ||
        pattern.test(JSON.stringify(req.query))
    );

    if (isSuspicious) {
        console.warn('Suspicious request detected:', {
            ...logData,
            body: req.body,
            query: req.query
        });
    }

    // Continue with request
    res.on('finish', () => {
        const duration = Date.now() - startTime;

        // Log slow requests (potential DoS)
        if (duration > 5000) {
            console.warn('Slow request detected:', {
                ...logData,
                duration,
                statusCode: res.statusCode
            });
        }
    });

    next();
};

/**
 * File upload security middleware
 */
const fileUploadSecurity = (req, res, next) => {
    if (req.files || req.file) {
        const files = req.files || [req.file];
        const allowedTypes = config.upload.allowedTypes;
        const maxSize = config.upload.maxFileSize;

        for (const file of files) {
            // Check file type
            if (!allowedTypes.includes(file.mimetype)) {
                return res.status(400).json({
                    status: 'error',
                    message: `File type ${file.mimetype} is not allowed`
                });
            }

            // Check file size
            if (file.size > maxSize) {
                return res.status(400).json({
                    status: 'error',
                    message: `File size exceeds maximum allowed size of ${maxSize} bytes`
                });
            }

            // Additional file name sanitization
            if (file.originalname) {
                file.originalname = file.originalname
                    .replace(/[^a-zA-Z0-9.-]/g, '_')
                    .substring(0, 100);
            }
        }
    }
    next();
};

module.exports = {
    rateLimiter,
    authRateLimiter,
    sanitizeInput,
    securityHeaders,
    securityLogger,
    fileUploadSecurity
};