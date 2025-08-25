const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { getConfig } = require('./config');
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
const {
  httpMetricsMiddleware,
  errorMetricsMiddleware
} = require('./middleware/metricsMiddleware');
const {
  requestLoggingMiddleware
} = require('./middleware/loggingMiddleware');
const {
  globalErrorHandler,
  notFoundHandler,
  requestIdMiddleware
} = require('./utils/errorHandler');

// Get validated configuration
const config = getConfig();

const app = express();
const PORT = config.server.port;

// Security middleware (applied early)
app.use(securityHeaders);
app.use(requestIdMiddleware); // Add request ID for tracking
app.use(requestLoggingMiddleware); // Comprehensive request logging
app.use(httpMetricsMiddleware); // Collect HTTP metrics
app.use(checkBlockedIPs); // Block known bad IPs
app.use(threatDetection); // Advanced threat detection
app.use(securityLogger);
app.use(rateLimiter);
app.use(logSuccessfulRequest); // Log successful requests

// CORS Configuration
const corsOptions = {
  origin: config.security.corsOrigin,
  credentials: config.security.corsCredentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // For parsing application/json
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // For parsing form data
app.use(sanitizeInput); // Sanitize all inputs

// MongoDB connection
mongoose.connect(config.database.uri, config.database.options)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1); // Exit if DB connection fails
  });

// Routes
app.use('/api/auth', require('./routes/auth')); // Authentication routes
app.use('/api/security', require('./routes/security')); // Security monitoring routes
app.use('/api/seasons', require('./routes/seasons'));
app.use('/api/ponds', require('./routes/ponds'));
app.use('/api/feed-inputs', require('./routes/feedInputs'));
app.use('/api/growth-samplings', require('./routes/growthSamplings'));
app.use('/api/water-quality-inputs', require('./routes/waterQualityInputs'));
app.use('/api/nursery-batches', require('./routes/nurseryBatches'));
app.use('/api/events', require('./routes/events'));
app.use('/api/inventory-items', require('./routes/inventoryRoutes')); // New inventory routes
app.use('/api/settings', require('./routes/settings')); // Settings route for user preferences
app.use('/api/historical-insights', require('./routes/historicalInsights')); // Historical insights routes
app.use('/api/employees', require('./routes/employees'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/farm', require('./routes/farm'));
app.use('/api/health', require('./routes/health')); // Comprehensive health monitoring
app.use('/api/metrics', require('./routes/metrics')); // Application metrics
// Add more route imports here

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Shrimp Farm Management API' });
});

// Legacy health check endpoint for backward compatibility
app.get('/api/health/legacy', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.server.env,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 404 handler for unmatched routes (should be before global error handler)
app.use(notFoundHandler);

// Error metrics middleware (should be before global error handler)
app.use(errorMetricsMiddleware);

// Global error handling middleware (should be last)
app.use(globalErrorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Export the app for testing