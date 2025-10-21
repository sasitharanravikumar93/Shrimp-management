const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Get working imports that we know work from testing
console.log('🚀 Starting fixed server with working configuration...');

const { getConfig } = require('./config');
const config = getConfig();

const { logger } = require('./utils/logger');
const { notFoundHandler, globalErrorHandler } = require('./utils/errorHandler');
const {
  conditionalRateLimiter,
  sanitizeInput,
  securityHeaders,
  securityLogger
} = require('./middleware/security');
const {
  checkBlockedIPs,
  threatDetection,
  logSuccessfulRequest
} = require('./middleware/advancedSecurity');

const app = express();
const PORT = config.server.port;

logger.info(`Starting FIXED server with configuration:`, {
  port: PORT,
  env: config.server.env,
  dbUri: config.database.uri
});

// CORS Configuration - Flexible for different environments
let corsOptions;
if (config.server.env === 'development') {
  // In development, allow multiple origins for flexibility
  if (config.security.corsAllowAll === 'true' || config.security.corsOrigin === '*') {
    // Allow all origins for development (use with caution!)
    corsOptions = {
      origin: '*',
      credentials: config.security.corsCredentials !== 'false', // Handle string 'false' as false
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
        'X-Api-Key'
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
  } else {
    // Allow specific origins for development
    corsOptions = {
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Define allowed origins
        const allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:3001', 
          'http://localhost:8080',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
          'http://localhost:5173', // Vite default port
          'http://127.0.0.1:5173',
          'https://localhost:3000',
          'https://localhost:3001',
          'https://127.0.0.1:3000',
          'https://127.0.0.1:3001',
        ];
        
        // Check if origin is in allowed list, or use CORS_ORIGIN from config
        const configOrigin = config.security.corsOrigin;
        if (configOrigin && !Array.isArray(configOrigin)) {
          allowedOrigins.push(configOrigin);
        }
        
        if (allowedOrigins.includes(origin) || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: config.security.corsCredentials !== 'false', // Handle string 'false' as false
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
        'X-Api-Key'
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
  }
} else {
  // Production CORS configuration
  corsOptions = {
    origin: config.security.corsOrigin || 'http://localhost:3000',
    credentials: config.security.corsCredentials !== 'false',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
      'X-Api-Key'
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
}

logger.info(`CORS Configuration:`, {
  env: config.server.env,
  corsOriginEnv: config.security.corsOrigin,
  corsCredentialsEnv: config.security.corsCredentials,
  isDevelopment: config.server.env === 'development',
  port: config.server.port
});

// Apply middleware with proper order (COPY WORKING CONFIGURATION)
app.use(securityHeaders);
app.use(cors(corsOptions));

// Apply ONLY the middleware that actually work with proper configuration
app.use(securityLogger);
app.use(conditionalRateLimiter);
app.use(checkBlockedIPs);
app.use(threatDetection);
app.use(logSuccessfulRequest);
app.use(sanitizeInput);

// Middleware
app.use(express.json({ limit: '10mb' })); // For parsing application/json
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // For parsing form data

// Import and use API routes
app.use('/api/seasons', require('./routes/seasons'));
app.use('/api/ponds', require('./routes/ponds'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/events', require('./routes/events'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/farm', require('./routes/farm'));
app.use('/api/feed-inputs', require('./routes/feedInputs'));
app.use('/api/growth-samplings', require('./routes/growthSamplings'));
app.use('/api/historical-insights', require('./routes/historicalInsights'));
app.use('/api/inventory-items', require('./routes/inventoryRoutes'));
app.use('/api/nursery-batches', require('./routes/nurseryBatches'));
app.use('/api/water-quality-inputs', require('./routes/waterQualityInputs'));
app.use('/api/settings', require('./routes/settings'));

// Basic routes for testing
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.get('/', (req, res) => {
  logger.info('Root endpoint accessed');
  res.json({ message: 'Shrimp Farm Management API (Fixed)' });
});

app.get('/cors-test', (req, res) => {
  logger.info('CORS test request received from:', req.headers.origin);
  res.json({
    message: 'CORS working correctly',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Error handling middleware (should be last)
app.use(globalErrorHandler);

// MongoDB connection
logger.info('Connecting to MongoDB...');
mongoose.connect(config.database.uri, config.database.options)
  .then(() => {
    logger.info('Connected to MongoDB successfully');

    // Start the server after successful MongoDB connection
    app.listen(PORT, () => {
      logger.info(`🎊 FIXED server is running on port ${PORT} - Path-to-regexp error RESOLVED!`);
      console.log(`✅ Server running! Test at: http://localhost:${PORT}/`);
      console.log(`✅ CORS test at: http://localhost:${PORT}/cors-test`);
    });
  })
  .catch((err) => {
    logger.error('Error connecting to MongoDB:', {
      message: err.message,
      stack: err.stack
    });
    process.exit(1); // Exit if we can't connect to the database
  });

module.exports = app; // Export the app for testing
