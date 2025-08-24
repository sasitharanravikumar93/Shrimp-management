/**
 * Configuration module for environment variables and application settings
 */

require('dotenv').config();

const config = {
    // Server Configuration
    server: {
        port: parseInt(process.env.PORT) || 5001,
        env: process.env.NODE_ENV || 'development',
        host: process.env.HOST || 'localhost'
    },

    // Database Configuration
    database: {
        uri: process.env.NODE_ENV === 'test'
            ? process.env.MONGODB_TEST_URI
            : process.env.MONGODB_URI,
        options: {
            maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
            serverSelectionTimeoutMS: parseInt(process.env.DB_TIMEOUT) || 5000,
            socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
        }
    },

    // Security Configuration
    security: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
        bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        corsCredentials: process.env.CORS_CREDENTIALS === 'true'
    },

    // Rate Limiting Configuration
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        filePath: process.env.LOG_FILE_PATH || './logs/app.log',
        enableConsole: process.env.NODE_ENV !== 'production'
    },

    // Cache Configuration
    cache: {
        ttl: parseInt(process.env.CACHE_TTL) || 300000, // 5 minutes
        enabled: process.env.CACHE_ENABLED !== 'false'
    },

    // File Upload Configuration
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
        uploadPath: process.env.UPLOAD_PATH || './uploads',
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    },

    // Email Configuration
    email: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
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
 */
function validateConfig() {
    const requiredConfigs = [
        { key: 'database.uri', value: config.database.uri, name: 'MONGODB_URI' },
        { key: 'security.jwtSecret', value: config.security.jwtSecret, name: 'JWT_SECRET' }
    ];

    const missing = requiredConfigs.filter(cfg => !cfg.value);

    if (missing.length > 0) {
        console.error('Missing required configuration:');
        missing.forEach(cfg => {
            console.error(`- ${cfg.name} (${cfg.key})`);
        });
        console.error('Please check your .env file against .env.example');
        return false;
    }

    return true;
}

/**
 * Get configuration for specific environment
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