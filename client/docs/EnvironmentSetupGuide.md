# Environment Setup Guide

This guide provides comprehensive instructions for setting up and configuring environment variables for the Fish Farm Management application.

## Quick Start

### 1. Copy Environment Template
```bash
# Copy the example environment file
cp .env.example .env.local

# For production setup
cp .env.production.example .env.production
```

### 2. Configure Required Variables
Edit `.env.local` and set these required variables:
```bash
# Required: API endpoint
REACT_APP_API_BASE_URL=http://localhost:5001/api

# Optional but recommended for development
REACT_APP_DEBUG_ENABLED=true
REACT_APP_ENABLE_VERBOSE_LOGGING=true
```

### 3. Validate Configuration
```bash
# Validate your environment configuration
npm run env:validate

# Generate documentation
npm run env:docs
```

### 4. Start Application
```bash
npm start
```

The application will validate your configuration on startup and provide detailed feedback.

---

## Environment Files Overview

### File Priority (highest to lowest)
1. `.env.local` - Local overrides (never committed)
2. `.env.development` - Development defaults
3. `.env.production` - Production defaults
4. `.env` - Shared defaults

### Environment File Usage
- **`.env.example`** - Template with all available variables and documentation
- **`.env.production.example`** - Production-optimized configuration template
- **`.env.local`** - Your personal development configuration (gitignored)
- **`.env.development`** - Committed development defaults
- **`.env.production`** - Committed production configuration

---

## Environment-Specific Setup

### Development Environment

**Recommended `.env.local` for development:**
```bash
# Core configuration
NODE_ENV=development

# API configuration
REACT_APP_API_BASE_URL=http://localhost:5001/api
REACT_APP_API_TIMEOUT=30000

# Debug features (enabled by default in development)
REACT_APP_DEBUG_ENABLED=true
REACT_APP_SHOW_PERFORMANCE_MONITOR=false
REACT_APP_ENABLE_VERBOSE_LOGGING=true

# Development features
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_ERROR_REPORTING=false

# Build configuration
GENERATE_SOURCEMAP=true
```

**Development Features:**
- ✅ Debug panel available
- ✅ Verbose logging enabled
- ✅ Performance monitoring available
- ✅ Source maps generated
- ✅ Hot reloading enabled

### Production Environment

**Required production configuration:**
```bash
# Core configuration
NODE_ENV=production

# API configuration (REQUIRED - update with your production API)
REACT_APP_API_BASE_URL=https://api.yourfishfarm.com/api
REACT_APP_API_TIMEOUT=45000

# External services (REQUIRED for production)
REACT_APP_ANALYTICS_ID=G-XXXXXXXXXX
REACT_APP_ERROR_REPORTING_DSN=https://your-dsn@sentry.io/project-id

# Security and performance
REACT_APP_ENABLE_CSP=true
REACT_APP_ENABLE_COMPRESSION=true
REACT_APP_ENABLE_CACHING=true
REACT_APP_SESSION_TIMEOUT=2700000

# Disable debug features
REACT_APP_DEBUG_ENABLED=false
REACT_APP_SHOW_PERFORMANCE_MONITOR=false
REACT_APP_ENABLE_VERBOSE_LOGGING=false

# Build optimization
GENERATE_SOURCEMAP=false
SKIP_PREFLIGHT_CHECK=true
```

**Production Features:**
- ✅ Analytics tracking enabled
- ✅ Error reporting to external services
- ✅ Performance monitoring
- ✅ Optimized builds
- ✅ Security enhancements
- ❌ Debug features disabled

### Staging Environment

**Staging configuration (similar to production but with debug options):**
```bash
NODE_ENV=staging

# Staging API
REACT_APP_API_BASE_URL=https://staging-api.yourfishfarm.com/api

# Enable some debug features for staging
REACT_APP_DEBUG_ENABLED=true
REACT_APP_ENABLE_ERROR_REPORTING=true

# Use staging external services
REACT_APP_ANALYTICS_ID=G-STAGING123456
REACT_APP_ERROR_REPORTING_DSN=https://staging-dsn@sentry.io/project-id
```

### Testing Environment

**Minimal test configuration:**
```bash
NODE_ENV=test

# Test API (often mocked)
REACT_APP_API_BASE_URL=http://localhost:5001/api

# Disable external services for testing
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_ERROR_REPORTING=false

# Fast build settings
GENERATE_SOURCEMAP=false
```

---

## Configuration Categories

### API Configuration
Variables controlling API communication:

```bash
# Required: Base API URL
REACT_APP_API_BASE_URL=https://api.yourfishfarm.com/api

# Optional: Request timeout (default: 30000ms)
REACT_APP_API_TIMEOUT=30000

# Optional: Retry attempts (default: 3)
REACT_APP_API_RETRY_COUNT=3
```

### Feature Flags
Control application features:

```bash
# Progressive Web App features
REACT_APP_ENABLE_PWA=true

# Analytics tracking
REACT_APP_ENABLE_ANALYTICS=true

# Error reporting to external services
REACT_APP_ENABLE_ERROR_REPORTING=true

# Performance monitoring
REACT_APP_ENABLE_PERFORMANCE_MONITORING=false
```

### Debug & Development
Development and debugging options:

```bash
# Enable debug utilities (auto-enabled in development)
REACT_APP_DEBUG_ENABLED=true

# Show performance monitor overlay
REACT_APP_SHOW_PERFORMANCE_MONITOR=false

# Enable verbose logging (auto-enabled in development)
REACT_APP_ENABLE_VERBOSE_LOGGING=true
```

### External Services
Third-party service integration:

```bash
# Google Analytics ID
REACT_APP_ANALYTICS_ID=G-XXXXXXXXXX

# Sentry error reporting DSN
REACT_APP_ERROR_REPORTING_DSN=https://your-dsn@sentry.io/project-id

# Remote logging endpoint
REACT_APP_LOGGING_ENDPOINT=https://logs.yourservice.com/api
```

### Security Configuration
Security-related settings:

```bash
# Enable Content Security Policy
REACT_APP_ENABLE_CSP=true

# Session timeout (in milliseconds)
REACT_APP_SESSION_TIMEOUT=1800000
```

---

## Best Practices

### Security Best Practices

1. **Never commit sensitive data**
   ```bash
   # ❌ Never do this
   REACT_APP_API_KEY=secret-key-123
   
   # ✅ Use build-time injection instead
   REACT_APP_API_KEY=${API_KEY}
   ```

2. **Use different configurations per environment**
   ```bash
   # Development
   REACT_APP_API_BASE_URL=http://localhost:5001/api
   
   # Production
   REACT_APP_API_BASE_URL=https://api.yourfishfarm.com/api
   ```

3. **Validate configuration in production**
   ```bash
   # Add to your CI/CD pipeline
   npm run env:validate
   ```

### Development Best Practices

1. **Use `.env.local` for personal settings**
   ```bash
   # .env.local (not committed)
   REACT_APP_DEBUG_ENABLED=true
   REACT_APP_SHOW_PERFORMANCE_MONITOR=true
   ```

2. **Document custom variables**
   ```bash
   # Custom feature flag for development
   REACT_APP_ENABLE_EXPERIMENTAL_FEATURE=true
   ```

3. **Validate early and often**
   ```bash
   # Run validation before committing
   npm run env:validate
   npm run quality
   ```

### Production Best Practices

1. **Use CI/CD environment injection**
   ```yaml
   # GitHub Actions example
   env:
     REACT_APP_API_BASE_URL: ${{ secrets.API_BASE_URL }}
     REACT_APP_ANALYTICS_ID: ${{ secrets.ANALYTICS_ID }}
   ```

2. **Monitor configuration health**
   ```bash
   # Include in health checks
   curl https://yourapp.com/health/config
   ```

3. **Use infrastructure as code**
   ```terraform
   # Terraform example
   resource "aws_s3_bucket_object" "env_config" {
     bucket = aws_s3_bucket.config.bucket
     key    = ".env.production"
     content = templatefile("env.production.tpl", {
       api_base_url = var.api_base_url
       analytics_id = var.analytics_id
     })
   }
   ```

---

## Troubleshooting

### Common Issues

#### Configuration Validation Errors
```bash
❌ Invalid environment configuration
Error: Required environment variable REACT_APP_API_BASE_URL is missing
```

**Solution:**
1. Check that all required variables are set
2. Verify variable names are spelled correctly
3. Ensure values match expected types

#### API Connection Issues
```bash
❌ Failed to connect to API
Error: Network request failed
```

**Solution:**
1. Verify `REACT_APP_API_BASE_URL` is correct
2. Check network connectivity
3. Validate API server is running
4. Check CORS configuration

#### Build Failures
```bash
❌ Build failed
Error: Environment variable validation failed
```

**Solution:**
1. Run `npm run env:validate` to see specific errors
2. Check for typos in variable names
3. Verify all required production variables are set

### Debug Configuration Issues

#### Enable Verbose Logging
```bash
# Add to .env.local
REACT_APP_ENABLE_VERBOSE_LOGGING=true
REACT_APP_DEBUG_ENABLED=true
```

#### Check Configuration at Runtime
```javascript
// In browser console
window.__DEBUG__.config()

// Or check specific values
console.log(process.env.REACT_APP_API_BASE_URL);
```

#### Validate Configuration
```bash
# Run validation
npm run env:validate

# Generate fresh documentation
npm run env:docs
```

### Getting Help

1. **Check startup logs** - Configuration validation runs on app start
2. **Use debug panel** - Available in development mode (bottom-right debug button)
3. **Review documentation** - Generated documentation is always up-to-date
4. **Validate configuration** - Use `npm run env:validate` for detailed checking

---

## Advanced Configuration

### Dynamic Configuration
For advanced use cases, you can use dynamic configuration:

```javascript
// src/config/dynamic.js
export const getDynamicConfig = () => {
  const baseConfig = {
    apiUrl: process.env.REACT_APP_API_BASE_URL,
    environment: process.env.NODE_ENV
  };

  // Override based on hostname
  if (window.location.hostname === 'staging.yourfishfarm.com') {
    baseConfig.features = { beta: true };
  }

  return baseConfig;
};
```

### Feature Flag Management
Implement feature flags for gradual rollouts:

```javascript
// src/config/features.js
export const featureFlags = {
  newDashboard: process.env.REACT_APP_ENABLE_NEW_DASHBOARD === 'true',
  advancedAnalytics: process.env.REACT_APP_ENABLE_ADVANCED_ANALYTICS === 'true',
  experimentalFeatures: process.env.NODE_ENV === 'development'
};
```

### Environment Detection
Detect environment context automatically:

```javascript
// src/config/environment.js
export const environmentInfo = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isStaging: process.env.REACT_APP_API_BASE_URL?.includes('staging'),
  isLocalhost: window.location.hostname === 'localhost'
};
```

---

## Migration Guide

### From Legacy Configuration

If migrating from a legacy configuration system:

1. **Audit existing configuration**
   ```bash
   # Find all process.env usage
   grep -r "process.env" src/
   ```

2. **Create migration mapping**
   ```javascript
   // Old -> New mapping
   const migrations = {
     'API_URL': 'REACT_APP_API_BASE_URL',
     'DEBUG': 'REACT_APP_DEBUG_ENABLED',
     'VERSION': 'REACT_APP_VERSION'
   };
   ```

3. **Update code gradually**
   ```javascript
   // Before
   const apiUrl = process.env.API_URL || 'http://localhost:5001/api';
   
   // After
   import config from 'src/config/environment';
   const apiUrl = config.get('REACT_APP_API_BASE_URL');
   ```

4. **Validate new configuration**
   ```bash
   npm run env:validate
   npm run quality
   ```

---

## Conclusion

This standardized environment configuration system provides:

- ✅ **Type Safety** - Automatic validation and coercion
- ✅ **Developer Experience** - Clear documentation and validation
- ✅ **Production Ready** - Robust error handling and validation
- ✅ **Maintainable** - Centralized configuration management
- ✅ **Flexible** - Support for multiple environments and feature flags

For questions or issues, refer to the auto-generated documentation in `docs/EnvironmentVariables.md` or use the debug utilities in development mode.