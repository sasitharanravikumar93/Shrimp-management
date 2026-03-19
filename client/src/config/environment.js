/**
 * Environment Configuration System
 * Centralized, type-safe, and validated environment configuration
 */

// ===================
// ENVIRONMENT TYPES
// ===================

export const Environment = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
  STAGING: 'staging'
};

// ===================
// CONFIGURATION SCHEMA
// ===================

const configSchema = {
  // Core application settings
  NODE_ENV: {
    required: true,
    type: 'string',
    enum: Object.values(Environment),
    default: Environment.DEVELOPMENT,
    description: 'Application environment'
  },

  // API Configuration
  REACT_APP_API_BASE_URL: {
    required: true,
    type: 'url',
    default: 'http://localhost:5001/api',
    description: 'Base URL for API endpoints'
  },

  REACT_APP_API_TIMEOUT: {
    required: false,
    type: 'number',
    default: 30000,
    description: 'API request timeout in milliseconds'
  },

  REACT_APP_API_RETRY_COUNT: {
    required: false,
    type: 'number',
    default: 3,
    description: 'Number of API retry attempts'
  },

  // Application Information
  REACT_APP_VERSION: {
    required: false,
    type: 'string',
    default: '1.0.0',
    description: 'Application version'
  },

  REACT_APP_BUILD_DATE: {
    required: false,
    type: 'string',
    default: () => new Date().toISOString(),
    description: 'Build date timestamp'
  },

  REACT_APP_APP_NAME: {
    required: false,
    type: 'string',
    default: 'Fish Farm Management',
    description: 'Application name'
  },

  // Feature Flags
  REACT_APP_ENABLE_PWA: {
    required: false,
    type: 'boolean',
    default: true,
    description: 'Enable Progressive Web App features'
  },

  REACT_APP_ENABLE_ANALYTICS: {
    required: false,
    type: 'boolean',
    default: false,
    description: 'Enable analytics tracking'
  },

  REACT_APP_ENABLE_ERROR_REPORTING: {
    required: false,
    type: 'boolean',
    default: true,
    description: 'Enable error reporting to external services'
  },

  REACT_APP_ENABLE_PERFORMANCE_MONITORING: {
    required: false,
    type: 'boolean',
    default: false,
    description: 'Enable performance monitoring'
  },

  // Debug and Development
  REACT_APP_DEBUG_ENABLED: {
    required: false,
    type: 'boolean',
    default: env => env === Environment.DEVELOPMENT,
    description: 'Enable debug utilities'
  },

  REACT_APP_SHOW_PERFORMANCE_MONITOR: {
    required: false,
    type: 'boolean',
    default: false,
    description: 'Show performance monitor overlay'
  },

  REACT_APP_ENABLE_VERBOSE_LOGGING: {
    required: false,
    type: 'boolean',
    default: env => env === Environment.DEVELOPMENT,
    description: 'Enable verbose logging'
  },

  // External Services
  REACT_APP_ANALYTICS_ID: {
    required: false,
    type: 'string',
    default: null,
    description: 'Analytics service ID (Google Analytics, etc.)'
  },

  REACT_APP_ERROR_REPORTING_DSN: {
    required: false,
    type: 'string',
    default: null,
    description: 'Error reporting service DSN (Sentry, Bugsnag, etc.)'
  },

  REACT_APP_LOGGING_ENDPOINT: {
    required: false,
    type: 'url',
    default: null,
    description: 'Remote logging endpoint'
  },

  // Storage Configuration
  REACT_APP_STORAGE_PREFIX: {
    required: false,
    type: 'string',
    default: 'fishfarm_',
    description: 'Prefix for localStorage and sessionStorage keys'
  },

  REACT_APP_CACHE_TTL: {
    required: false,
    type: 'number',
    default: 300000, // 5 minutes
    description: 'Default cache TTL in milliseconds'
  },

  // Internationalization
  REACT_APP_DEFAULT_LANGUAGE: {
    required: false,
    type: 'string',
    default: 'en',
    description: 'Default application language'
  },

  REACT_APP_SUPPORTED_LANGUAGES: {
    required: false,
    type: 'string',
    default: 'en,es,fr,de,it,pt,hi,zh,ja',
    description: 'Comma-separated list of supported languages'
  },

  // Security
  REACT_APP_ENABLE_CSP: {
    required: false,
    type: 'boolean',
    default: true,
    description: 'Enable Content Security Policy'
  },

  REACT_APP_SESSION_TIMEOUT: {
    required: false,
    type: 'number',
    default: 1800000, // 30 minutes
    description: 'Session timeout in milliseconds'
  },

  // UI Configuration
  REACT_APP_THEME_MODE: {
    required: false,
    type: 'string',
    enum: ['light', 'dark', 'auto'],
    default: 'auto',
    description: 'Default theme mode'
  },

  REACT_APP_DEFAULT_PAGE_SIZE: {
    required: false,
    type: 'number',
    default: 25,
    description: 'Default pagination page size'
  },

  // Performance
  REACT_APP_ENABLE_COMPRESSION: {
    required: false,
    type: 'boolean',
    default: true,
    description: 'Enable response compression'
  },

  REACT_APP_ENABLE_CACHING: {
    required: false,
    type: 'boolean',
    default: true,
    description: 'Enable application caching'
  },

  // Build Configuration
  GENERATE_SOURCEMAP: {
    required: false,
    type: 'boolean',
    default: env => env === Environment.DEVELOPMENT,
    description: 'Generate source maps'
  },

  SKIP_PREFLIGHT_CHECK: {
    required: false,
    type: 'boolean',
    default: false,
    description: 'Skip Create React App preflight checks'
  }
};

// ===================
// VALIDATION UTILITIES
// ===================

class ConfigValidator {
  static validateType(value, type) {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return !isNaN(Number(value));
      case 'boolean':
        return ['true', 'false', '1', '0', 'yes', 'no'].includes(String(value).toLowerCase());
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      default:
        return true;
    }
  }

  static coerceValue(value, type) {
    if (value === null || value === undefined) return value;

    switch (type) {
      case 'string':
        return String(value);
      case 'number':
        return Number(value);
      case 'boolean':
        return ['true', '1', 'yes'].includes(String(value).toLowerCase());
      case 'url':
        return String(value);
      default:
        return value;
    }
  }

  static validateEnum(value, enumValues) {
    return enumValues.includes(value);
  }
}

// ===================
// CONFIGURATION MANAGER
// ===================

class EnvironmentConfig {
  constructor() {
    this.config = {};
    this.errors = [];
    this.warnings = [];
    this.isValid = true;

    this.load();
  }

  load() {
    const currentEnv = process.env.NODE_ENV || Environment.DEVELOPMENT;

    Object.entries(configSchema).forEach(([key, schema]) => {
      const envValue = process.env[key];
      let value = envValue;

      // Use default value if not provided
      if (value === undefined || value === null || value === '') {
        if (typeof schema.default === 'function') {
          value = schema.default(currentEnv);
        } else {
          value = schema.default;
        }
      }

      // Validate required fields
      if (schema.required && (value === undefined || value === null || value === '')) {
        this.errors.push({
          key,
          message: `Required environment variable ${key} is missing`,
          description: schema.description
        });
        this.isValid = false;
        return;
      }

      // Skip validation if value is null/undefined and not required
      if (value === null || value === undefined) {
        this.config[key] = value;
        return;
      }

      // Type validation
      if (schema.type && !ConfigValidator.validateType(value, schema.type)) {
        this.errors.push({
          key,
          message: `Environment variable ${key} must be of type ${
            schema.type
          }, got: ${typeof value}`,
          value,
          description: schema.description
        });
        this.isValid = false;
        return;
      }

      // Enum validation
      if (schema.enum && !ConfigValidator.validateEnum(value, schema.enum)) {
        this.errors.push({
          key,
          message: `Environment variable ${key} must be one of: ${schema.enum.join(
            ', '
          )}, got: ${value}`,
          value,
          description: schema.description
        });
        this.isValid = false;
        return;
      }

      // Coerce value to correct type
      const coercedValue = ConfigValidator.coerceValue(value, schema.type);
      this.config[key] = coercedValue;

      // Warn about default values in production
      if (currentEnv === Environment.PRODUCTION && envValue === undefined && schema.required) {
        this.warnings.push({
          key,
          message: `Using default value for ${key} in production`,
          defaultValue: value,
          description: schema.description
        });
      }
    });

    // Environment-specific validations
    this.validateEnvironmentSpecific();
  }

  validateEnvironmentSpecific() {
    const env = this.config.NODE_ENV;

    // Production-specific validations
    if (env === Environment.PRODUCTION) {
      if (this.config.REACT_APP_API_BASE_URL?.includes('localhost')) {
        this.warnings.push({
          key: 'REACT_APP_API_BASE_URL',
          message: 'Using localhost API URL in production',
          value: this.config.REACT_APP_API_BASE_URL
        });
      }

      if (this.config.REACT_APP_DEBUG_ENABLED) {
        this.warnings.push({
          key: 'REACT_APP_DEBUG_ENABLED',
          message: 'Debug mode is enabled in production'
        });
      }
    }

    // Development-specific validations
    if (env === Environment.DEVELOPMENT) {
      if (!this.config.REACT_APP_API_BASE_URL?.includes('localhost')) {
        this.warnings.push({
          key: 'REACT_APP_API_BASE_URL',
          message: 'Using non-localhost API URL in development',
          value: this.config.REACT_APP_API_BASE_URL
        });
      }
    }
  }

  get(key) {
    return this.config[key];
  }

  getAll() {
    return { ...this.config };
  }

  isDevelopment() {
    return this.config.NODE_ENV === Environment.DEVELOPMENT;
  }

  isProduction() {
    return this.config.NODE_ENV === Environment.PRODUCTION;
  }

  isTest() {
    return this.config.NODE_ENV === Environment.TEST;
  }

  isStaging() {
    return this.config.NODE_ENV === Environment.STAGING;
  }

  getErrors() {
    return this.errors;
  }

  getWarnings() {
    return this.warnings;
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  hasWarnings() {
    return this.warnings.length > 0;
  }

  printReport() {
    // eslint-disable-next-line no-console
    console.group('🔧 Environment Configuration Report');

    // eslint-disable-next-line no-console
    console.log('Environment:', this.config.NODE_ENV);
    // eslint-disable-next-line no-console
    console.log('Valid:', this.isValid);

    if (this.errors.length > 0) {
      // eslint-disable-next-line no-console
      console.group('❌ Errors');
      this.errors.forEach(error => {
        // eslint-disable-next-line no-console
        console.error(`${error.key}: ${error.message}`);
        if (error.description) {
          // eslint-disable-next-line no-console
          console.log(`  Description: ${error.description}`);
        }
      });
      // eslint-disable-next-line no-console
      console.groupEnd();
    }

    if (this.warnings.length > 0) {
      // eslint-disable-next-line no-console
      console.group('⚠️ Warnings');
      this.warnings.forEach(warning => {
        // eslint-disable-next-line no-console
        console.warn(`${warning.key}: ${warning.message}`);
        if (warning.description) {
          // eslint-disable-next-line no-console
          console.log(`  Description: ${warning.description}`);
        }
      });
      // eslint-disable-next-line no-console
      console.groupEnd();
    }

    if (this.isDevelopment()) {
      // eslint-disable-next-line no-console
      console.group('📋 Current Configuration');
      Object.entries(this.config).forEach(([key, value]) => {
        // eslint-disable-next-line no-console
        console.log(`${key}:`, value);
      });
      // eslint-disable-next-line no-console
      console.groupEnd();
    }

    console.groupEnd();
  }

  exportDocumentation() {
    const docs = {
      title: 'Environment Variables Documentation',
      generatedAt: new Date().toISOString(),
      variables: {}
    };

    Object.entries(configSchema).forEach(([key, schema]) => {
      docs.variables[key] = {
        description: schema.description,
        type: schema.type,
        required: schema.required,
        default: typeof schema.default === 'function' ? 'dynamic' : schema.default,
        enum: schema.enum,
        example: this.generateExample(key, schema)
      };
    });

    return docs;
  }

  generateExample(key, schema) {
    if (schema.enum) {
      return schema.enum[0];
    }

    switch (schema.type) {
      case 'string':
        if (key.includes('URL')) return 'https://api.example.com';
        if (key.includes('ID')) return 'your-service-id';
        return 'example-value';
      case 'number':
        return '5000';
      case 'boolean':
        return 'true';
      case 'url':
        return 'https://api.example.com';
      default:
        return 'value';
    }
  }
}

// ===================
// CONFIGURATION INSTANCE
// ===================

const config = new EnvironmentConfig();

// Print configuration report in development
if (config.isDevelopment() && !config.isTest()) {
  config.printReport();
}

// Throw error if configuration is invalid
if (!config.isValid) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration');
  config.printReport();

  if (config.isProduction()) {
    throw new Error('Invalid environment configuration in production');
  }
}

// ===================
// EXPORTS
// ===================

export default config;

// Convenience exports
export const {
  NODE_ENV,
  REACT_APP_API_BASE_URL,
  REACT_APP_API_TIMEOUT,
  REACT_APP_VERSION,
  REACT_APP_DEBUG_ENABLED,
  REACT_APP_DEFAULT_LANGUAGE
} = config.getAll();

// Utility functions
export const isProduction = () => config.isProduction();
export const isDevelopment = () => config.isDevelopment();
export const isTest = () => config.isTest();
export const getConfig = key => config.get(key);
export const getAllConfig = () => config.getAll();
