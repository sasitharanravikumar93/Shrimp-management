# Environment Variables Documentation

This document provides comprehensive documentation for all environment variables used in the Fish Farm Management application.

## Overview

The application uses a standardized environment configuration system that provides:

- ✅ Type validation and coercion
- ✅ Required field validation
- ✅ Environment-specific defaults
- ✅ Comprehensive error reporting
- ✅ Development-time validation

## Quick Start

1. Copy `.env.example` to `.env.local`
2. Configure required variables for your environment
3. Start the application - it will validate your configuration

## Environment Files

- `.env.example` - Template with all available variables
- `.env.production.example` - Production-optimized configuration
- `.env.local` - Your local development configuration (not committed)
- `.env.development` - Development defaults (committed)
- `.env.production` - Production configuration (environment-specific)

## Variables by Category

### Core Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NODE_ENV` | string (development, production, test, staging) | ✅ | `development` | Application environment |

### API Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `REACT_APP_API_BASE_URL` | url | ✅ | `http://localhost:5001/api` | Base URL for API endpoints |
| `REACT_APP_API_TIMEOUT` | number | ❌ | `30000` | API request timeout in milliseconds |
| `REACT_APP_API_RETRY_COUNT` | number | ❌ | `3` | Number of API retry attempts |

### Application Information

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `REACT_APP_VERSION` | string | ❌ | `1.0.0` | Application version |
| `REACT_APP_BUILD_DATE` | string | ❌ | `auto-generated` | Build date timestamp |
| `REACT_APP_APP_NAME` | string | ❌ | `Fish Farm Management` | Application name |

### Feature Flags

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `REACT_APP_ENABLE_PWA` | boolean | ❌ | `true` | Enable Progressive Web App features |
| `REACT_APP_ENABLE_ANALYTICS` | boolean | ❌ | `false` | Enable analytics tracking |
| `REACT_APP_ENABLE_ERROR_REPORTING` | boolean | ❌ | `true` | Enable error reporting to external services |
| `REACT_APP_ENABLE_PERFORMANCE_MONITORING` | boolean | ❌ | `false` | Enable performance monitoring |

### Debug & Development

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `REACT_APP_DEBUG_ENABLED` | boolean | ❌ | `environment-dependent` | Enable debug utilities |
| `REACT_APP_SHOW_PERFORMANCE_MONITOR` | boolean | ❌ | `false` | Show performance monitor overlay |
| `REACT_APP_ENABLE_VERBOSE_LOGGING` | boolean | ❌ | `environment-dependent` | Enable verbose logging |

### External Services

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `REACT_APP_ANALYTICS_ID` | string | ❌ | `none` | Analytics service ID (Google Analytics, etc.) |
| `REACT_APP_ERROR_REPORTING_DSN` | string | ❌ | `none` | Error reporting service DSN (Sentry, Bugsnag, etc.) |
| `REACT_APP_LOGGING_ENDPOINT` | url | ❌ | `none` | Remote logging endpoint |

### Storage Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `REACT_APP_STORAGE_PREFIX` | string | ❌ | `fishfarm_` | Prefix for localStorage and sessionStorage keys |
| `REACT_APP_CACHE_TTL` | number | ❌ | `300000` | Default cache TTL in milliseconds |

### Internationalization

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `REACT_APP_DEFAULT_LANGUAGE` | string | ❌ | `en` | Default application language |
| `REACT_APP_SUPPORTED_LANGUAGES` | string | ❌ | `en,es,fr,de,it,pt,hi,zh,ja` | Comma-separated list of supported languages |

### Security

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `REACT_APP_ENABLE_CSP` | boolean | ❌ | `true` | Enable Content Security Policy |
| `REACT_APP_SESSION_TIMEOUT` | number | ❌ | `1800000` | Session timeout in milliseconds |

### UI Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `REACT_APP_THEME_MODE` | string (light, dark, auto) | ❌ | `auto` | Default theme mode |
| `REACT_APP_DEFAULT_PAGE_SIZE` | number | ❌ | `25` | Default pagination page size |

### Performance

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `REACT_APP_ENABLE_COMPRESSION` | boolean | ❌ | `true` | Enable response compression |
| `REACT_APP_ENABLE_CACHING` | boolean | ❌ | `true` | Enable application caching |

### Build Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `GENERATE_SOURCEMAP` | boolean | ❌ | `environment-dependent` | Generate source maps |
| `SKIP_PREFLIGHT_CHECK` | boolean | ❌ | `false` | Skip Create React App preflight checks |

## Environment-Specific Configurations

### Development
- Debug utilities are enabled by default
- Verbose logging is enabled
- Source maps are generated
- API typically points to localhost

### Production
- Debug utilities are disabled
- Minimal logging
- No source maps for security
- External services are configured
- Performance optimizations enabled

### Testing
- Minimal configuration
- Fast execution settings
- Mock external services

## Validation

The application validates all environment variables on startup:

- **Type Checking**: Ensures variables match expected types
- **Required Fields**: Validates all required variables are present
- **Enum Validation**: Checks that values are within allowed options
- **URL Validation**: Validates URL format for URL-type variables
- **Environment Consistency**: Warns about development URLs in production

## Error Handling

If configuration validation fails:

1. **Development**: Warning messages are logged, application continues with defaults
2. **Production**: Application startup is blocked with detailed error messages
3. **Test**: Minimal validation to allow fast test execution

## Examples

### Basic Development Setup
```bash
NODE_ENV=development
REACT_APP_API_BASE_URL=http://localhost:5001/api
REACT_APP_DEBUG_ENABLED=true
```

### Production Setup
```bash
NODE_ENV=production
REACT_APP_API_BASE_URL=https://api.yourfishfarm.com/api
REACT_APP_ANALYTICS_ID=G-XXXXXXXXXX
REACT_APP_ERROR_REPORTING_DSN=https://your-dsn@sentry.io/project-id
REACT_APP_DEBUG_ENABLED=false
GENERATE_SOURCEMAP=false
```

### Feature Flag Usage
```bash
# Enable specific features
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true

# Disable debug features
REACT_APP_DEBUG_ENABLED=false
REACT_APP_SHOW_PERFORMANCE_MONITOR=false
```

## Troubleshooting

### Common Issues

**Configuration Validation Errors**
- Check that required variables are set
- Verify variable types match expectations
- Ensure enum values are within allowed options

**API Connection Issues**
- Verify `REACT_APP_API_BASE_URL` is correct
- Check network connectivity
- Validate API timeout settings

**Performance Issues**
- Enable compression with `REACT_APP_ENABLE_COMPRESSION=true`
- Enable caching with `REACT_APP_ENABLE_CACHING=true`
- Adjust `REACT_APP_CACHE_TTL` for your needs

### Debug Configuration

Use these environment variables for debugging:

```bash
REACT_APP_DEBUG_ENABLED=true
REACT_APP_SHOW_PERFORMANCE_MONITOR=true
REACT_APP_ENABLE_VERBOSE_LOGGING=true
```

### Getting Help

1. Check the configuration validation output on application startup
2. Review the examples in `.env.example`
3. Consult this documentation for variable descriptions
4. Use the debug panel in development mode for real-time configuration inspection

---

*Generated on 2025-08-25T15:01:02.964Z*
