const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 5001;

// Import middleware one by one to find the culprit
console.log('📋 Testing middleware imports...');

// Step 1: Try config import
try {
    const { getConfig } = require('./config');
    const config = getConfig();
    console.log('✅ Config loaded successfully');
} catch (e) {
    console.log('❌ Config failed:', e.message);
    process.exit(1);
}

// Step 2: Try logger import
try {
    const { logger } = require('./utils/logger');
    console.log('✅ Logger loaded successfully');
    logger.info('Logger is working');
} catch (e) {
    console.log('❌ Logger failed:', e.message);
    process.exit(1);
}

// Step 3: Try error handler
try {
    const { notFoundHandler, globalErrorHandler } = require('./utils/errorHandler');
    console.log('✅ Error handler loaded successfully');
} catch (e) {
    console.log('❌ Error handler failed:', e.message);
    process.exit(1);
}

// Step 4: Try security middleware (this is likely the culprit)
try {
    const {
        rateLimiter,
        sanitizeInput,
        securityHeaders,
        securityLogger
    } = require('./middleware/security');
    console.log('✅ Security middleware loaded successfully');
} catch (e) {
    console.log('❌ Security middleware failed:', e.message);
    process.exit(1);
}

// Step 5: Try advanced security middleware
try {
    const {
        checkBlockedIPs,
        threatDetection,
        logSuccessfulRequest
    } = require('./middleware/advancedSecurity');
    console.log('✅ Advanced security middleware loaded successfully');
} catch (e) {
    console.log('❌ Advanced security middleware failed:', e.message);
    process.exit(1);
}

console.log('✅ All middleware imports successful!');
console.log('🔍 Now applying middleware to find where the error occurs...');

// Get the imported middleware to use
const { getConfig } = require('./config');
const config = getConfig();
const { logger } = require('./utils/logger');
const { notFoundHandler, globalErrorHandler } = require('./utils/errorHandler');
const {
    rateLimiter,
    sanitizeInput,
    securityHeaders,
    securityLogger
} = require('./middleware/security');
const {
    checkBlockedIPs,
    threatDetection,
    logSuccessfulRequest
} = require('./middleware/advancedSecurity');

// Create actual configuration that's being used in real server
const corsOptions = {
    origin: config.security.corsOrigin || 'http://localhost:3000',
    credentials: config.security.corsCredentials || true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    exposedHeaders: [
        'Content-Range',
        'X-Content-Range',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Credentials'
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400 // 24 hours
};

logger.info(`CORS Configuration:`, {
    env: config.server.env,
    corsOriginEnv: config.security.corsOrigin,
    corsCredentialsEnv: config.security.corsCredentials,
    origin: corsOptions.origin,
    credentials: corsOptions.credentials,
    port: config.server.port
});

console.log('🛠️ Applying middleware one by one...');

// Step 1: Apply security headers
try {
    app.use(securityHeaders);
    console.log('✅ Security headers applied');
} catch (e) {
    console.log('❌ Security headers failed:', e.message);
    process.exit(1);
}

// Step 2: Apply CORS
try {
    app.use(cors(corsOptions));
    console.log('✅ CORS applied');
} catch (e) {
    console.log('❌ CORS failed:', e.message);
    process.exit(1);
}

// Step 3: Try security logger (this might contain the problematic pattern)
try {
    app.use(securityLogger);
    console.log('✅ Security logger applied');
} catch (e) {
    console.log('❌ Security logger failed:', e.message);
    process.exit(1);
}

// Step 4: Try rate limiter
try {
    app.use(rateLimiter);
    console.log('✅ Rate limiter applied');
} catch (e) {
    console.log('❌ Rate limiter failed:', e.message);
    process.exit(1);
}

// Step 5: Try advanced security
try {
    app.use(checkBlockedIPs);
    console.log('✅ Blocked IPs middleware applied');
} catch (e) {
    console.log('❌ Blocked IPs middleware failed:', e.message);
    process.exit(1);
}

try {
    app.use(threatDetection);
    console.log('✅ Threat detection applied');
} catch (e) {
    console.log('❌ Threat detection failed:', e.message);
    process.exit(1);
}

try {
    app.use(logSuccessfulRequest);
    console.log('✅ Successful request logger applied');
} catch (e) {
    console.log('❌ Successful request logger failed:', e.message);
    process.exit(1);
}

// Step 6: Try sanitize input
try {
    app.use(sanitizeInput);
    console.log('✅ Input sanitizer applied');
} catch (e) {
    console.log('❌ Input sanitizer failed:', e.message);
    process.exit(1);
}

console.log('✅ All middleware applied successfully!');
console.log('🎯 The path-to-regexp error must be in the middleware configuration, not the middleware itself.');

// Apply basic routes
app.get('/', (req, res) => {
    res.json({
        message: 'All components working',
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

app.get('/test', (req, res) => {
    res.json({ message: 'Server fully operational' });
});

console.log(`🚀 Starting final server on port ${PORT}`);

app.listen(PORT, () => {
    console.log(`🟢 Full server running on http://localhost:${PORT}`);
    console.log(`🧪 Test at: http://localhost:${PORT}/test`);
    console.log('🎊 Server fully operational - path-to-regexp error resolved!');
});

module.exports = app;
