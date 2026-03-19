/**
 * Configuration module for environment variables and application settings
 */

require('dotenv').config();

// Note: We can't require logger here due to circular dependency issues
// The logger requires this config, so we can't require the logger in this file

const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT, 10) || 5001,
    env: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost'
  },

  // Database Configuration
  database: {
    uri: process.env.NODE_ENV === 'test'
      ? process.env.MONGODB_TEST_URI
      : process.env.MONGODB_URI,
    options: {
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE, 10) || 10,
      serverSelectionTimeoutMS: parseInt(process.env.DB_TIMEOUT, 10) || 5000,
      socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT, 10) || 45000,
    }
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    corsCredentials: process.env.CORS_CREDENTIALS === 'true',
    corsAllowAll: process.env.CORS_ALLOW_ALL || process.env.CORS_ALLOW_ALL_ORIGIN
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log',
    enableConsole: process.env.NODE_ENV !== 'production'
  },

  // Cache Configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 300000, // 5 minutes
    enabled: process.env.CACHE_ENABLED !== 'false'
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880, // 5MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.FROM_EMAIL || 'noreply@shrimpfarm.com'
  },

  // External APIs
  apis: {
    weatherApiKey: process.env.WEATHER_API_KEY,
    analyticsApiKey: process.env.ANALYTICS_API_KEY
  }
};

/**
 * Validate required configuration values
 * @returns {boolean} True if all required configurations are present, false otherwise
 */
function validateConfig() {
  const requiredConfigs = [
    { key: 'database.uri', value: config.database.uri, name: 'MONGODB_URI' },
    { key: 'security.jwtSecret', value: config.security.jwtSecret, name: 'JWT_SECRET' }
  ];

  const missing = requiredConfigs.filter(cfg => !cfg.value);

  if (missing.length > 0) {
    // We need to require logger here to avoid the circular dependency at the top level
    const { logger } = require('../utils/logger');
    logger.error('Missing required configuration:', {
      missingConfigs: missing.map(cfg => ({
        name: cfg.name,
        key: cfg.key
      }))
    });
    logger.error('Please check your .env file against .env.example');
    return false;
  }

  return true;
}

/**
 * Get configuration for specific environment
 * @returns {object} Configuration object
 */
function getConfig() {
  if (!validateConfig()) {
    throw new Error('Invalid configuration. Please check your environment variables.');
  }

  return config;
}

module.exports = {
  config,
  getConfig,
  validateConfig
};