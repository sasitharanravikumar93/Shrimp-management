#!/usr/bin/env node

/**
 * Environment Configuration Documentation Generator
 * Generates comprehensive documentation for environment variables
 */

const fs = require('fs');
const path = require('path');

// Import the configuration schema (this would need to be adapted for Node.js)
const configSchema = {
    NODE_ENV: {
        required: true,
        type: 'string',
        enum: ['development', 'production', 'test', 'staging'],
        default: 'development',
        description: 'Application environment'
    },
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
    REACT_APP_VERSION: {
        required: false,
        type: 'string',
        default: '1.0.0',
        description: 'Application version'
    },
    REACT_APP_BUILD_DATE: {
        required: false,
        type: 'string',
        default: 'auto-generated',
        description: 'Build date timestamp'
    },
    REACT_APP_APP_NAME: {
        required: false,
        type: 'string',
        default: 'Fish Farm Management',
        description: 'Application name'
    },
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
    REACT_APP_DEBUG_ENABLED: {
        required: false,
        type: 'boolean',
        default: 'environment-dependent',
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
        default: 'environment-dependent',
        description: 'Enable verbose logging'
    },
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
    REACT_APP_STORAGE_PREFIX: {
        required: false,
        type: 'string',
        default: 'fishfarm_',
        description: 'Prefix for localStorage and sessionStorage keys'
    },
    REACT_APP_CACHE_TTL: {
        required: false,
        type: 'number',
        default: 300000,
        description: 'Default cache TTL in milliseconds'
    },
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
    REACT_APP_ENABLE_CSP: {
        required: false,
        type: 'boolean',
        default: true,
        description: 'Enable Content Security Policy'
    },
    REACT_APP_SESSION_TIMEOUT: {
        required: false,
        type: 'number',
        default: 1800000,
        description: 'Session timeout in milliseconds'
    },
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
    GENERATE_SOURCEMAP: {
        required: false,
        type: 'boolean',
        default: 'environment-dependent',
        description: 'Generate source maps'
    },
    SKIP_PREFLIGHT_CHECK: {
        required: false,
        type: 'boolean',
        default: false,
        description: 'Skip Create React App preflight checks'
    }
};

const generateMarkdownDocs = () => {
    const categories = {
        'Core Configuration': ['NODE_ENV'],
        'API Configuration': [
            'REACT_APP_API_BASE_URL',
            'REACT_APP_API_TIMEOUT',
            'REACT_APP_API_RETRY_COUNT'
        ],
        'Application Information': [
            'REACT_APP_VERSION',
            'REACT_APP_BUILD_DATE',
            'REACT_APP_APP_NAME'
        ],
        'Feature Flags': [
            'REACT_APP_ENABLE_PWA',
            'REACT_APP_ENABLE_ANALYTICS',
            'REACT_APP_ENABLE_ERROR_REPORTING',
            'REACT_APP_ENABLE_PERFORMANCE_MONITORING'
        ],
        'Debug & Development': [
            'REACT_APP_DEBUG_ENABLED',
            'REACT_APP_SHOW_PERFORMANCE_MONITOR',
            'REACT_APP_ENABLE_VERBOSE_LOGGING'
        ],
        'External Services': [
            'REACT_APP_ANALYTICS_ID',
            'REACT_APP_ERROR_REPORTING_DSN',
            'REACT_APP_LOGGING_ENDPOINT'
        ],
        'Storage Configuration': [
            'REACT_APP_STORAGE_PREFIX',
            'REACT_APP_CACHE_TTL'
        ],
        'Internationalization': [
            'REACT_APP_DEFAULT_LANGUAGE',
            'REACT_APP_SUPPORTED_LANGUAGES'
        ],
        'Security': [
            'REACT_APP_ENABLE_CSP',
            'REACT_APP_SESSION_TIMEOUT'
        ],
        'UI Configuration': [
            'REACT_APP_THEME_MODE',
            'REACT_APP_DEFAULT_PAGE_SIZE'
        ],
        'Performance': [
            'REACT_APP_ENABLE_COMPRESSION',
            'REACT_APP_ENABLE_CACHING'
        ],
        'Build Configuration': [
            'GENERATE_SOURCEMAP',
            'SKIP_PREFLIGHT_CHECK'
        ]
    };

    let markdown = `# Environment Variables Documentation

This document provides comprehensive documentation for all environment variables used in the Fish Farm Management application.

## Overview

The application uses a standardized environment configuration system that provides:

- ✅ Type validation and coercion
- ✅ Required field validation
- ✅ Environment-specific defaults
- ✅ Comprehensive error reporting
- ✅ Development-time validation

## Quick Start

1. Copy \`.env.example\` to \`.env.local\`
2. Configure required variables for your environment
3. Start the application - it will validate your configuration

## Environment Files

- \`.env.example\` - Template with all available variables
- \`.env.production.example\` - Production-optimized configuration
- \`.env.local\` - Your local development configuration (not committed)
- \`.env.development\` - Development defaults (committed)
- \`.env.production\` - Production configuration (environment-specific)

## Variables by Category

`;

    Object.entries(categories).forEach(([category, variables]) => {
        markdown += `### ${category}\n\n`;
        markdown += '| Variable | Type | Required | Default | Description |\n';
        markdown += '|----------|------|----------|---------|-------------|\n';

        variables.forEach(variable => {
            const config = configSchema[variable];
            if (config) {
                const required = config.required ? '✅' : '❌';
                const type = config.type || 'string';
                const defaultValue = typeof config.default === 'function' ? 'dynamic' :
                    config.default === null ? 'none' :
                        String(config.default);
                const enumValues = config.enum ? ` (${config.enum.join(', ')})` : '';

                markdown += `| \`${variable}\` | ${type}${enumValues} | ${required} | \`${defaultValue}\` | ${config.description} |\n`;
            }
        });

        markdown += '\n';
    });

    markdown += `## Environment-Specific Configurations

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
\`\`\`bash
NODE_ENV=development
REACT_APP_API_BASE_URL=http://localhost:5001/api
REACT_APP_DEBUG_ENABLED=true
\`\`\`

### Production Setup
\`\`\`bash
NODE_ENV=production
REACT_APP_API_BASE_URL=https://api.yourfishfarm.com/api
REACT_APP_ANALYTICS_ID=G-XXXXXXXXXX
REACT_APP_ERROR_REPORTING_DSN=https://your-dsn@sentry.io/project-id
REACT_APP_DEBUG_ENABLED=false
GENERATE_SOURCEMAP=false
\`\`\`

### Feature Flag Usage
\`\`\`bash
# Enable specific features
REACT_APP_ENABLE_PWA=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true

# Disable debug features
REACT_APP_DEBUG_ENABLED=false
REACT_APP_SHOW_PERFORMANCE_MONITOR=false
\`\`\`

## Troubleshooting

### Common Issues

**Configuration Validation Errors**
- Check that required variables are set
- Verify variable types match expectations
- Ensure enum values are within allowed options

**API Connection Issues**
- Verify \`REACT_APP_API_BASE_URL\` is correct
- Check network connectivity
- Validate API timeout settings

**Performance Issues**
- Enable compression with \`REACT_APP_ENABLE_COMPRESSION=true\`
- Enable caching with \`REACT_APP_ENABLE_CACHING=true\`
- Adjust \`REACT_APP_CACHE_TTL\` for your needs

### Debug Configuration

Use these environment variables for debugging:

\`\`\`bash
REACT_APP_DEBUG_ENABLED=true
REACT_APP_SHOW_PERFORMANCE_MONITOR=true
REACT_APP_ENABLE_VERBOSE_LOGGING=true
\`\`\`

### Getting Help

1. Check the configuration validation output on application startup
2. Review the examples in \`.env.example\`
3. Consult this documentation for variable descriptions
4. Use the debug panel in development mode for real-time configuration inspection

---

*Generated on ${new Date().toISOString()}*
`;

    return markdown;
};

const generateJsonDocs = () => {
    return {
        title: 'Environment Variables Documentation',
        generatedAt: new Date().toISOString(),
        schema: configSchema,
        environments: {
            development: {
                description: 'Local development environment',
                recommendedVariables: [
                    'NODE_ENV',
                    'REACT_APP_API_BASE_URL',
                    'REACT_APP_DEBUG_ENABLED'
                ]
            },
            production: {
                description: 'Production environment',
                requiredVariables: [
                    'NODE_ENV',
                    'REACT_APP_API_BASE_URL',
                    'REACT_APP_ANALYTICS_ID',
                    'REACT_APP_ERROR_REPORTING_DSN'
                ]
            },
            test: {
                description: 'Testing environment',
                minimumVariables: [
                    'NODE_ENV',
                    'REACT_APP_API_BASE_URL'
                ]
            }
        }
    };
};

// Generate documentation
const markdownDocs = generateMarkdownDocs();
const jsonDocs = generateJsonDocs();

// Write files
const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}

fs.writeFileSync(
    path.join(docsDir, 'EnvironmentVariables.md'),
    markdownDocs,
    'utf8'
);

fs.writeFileSync(
    path.join(docsDir, 'environment-schema.json'),
    JSON.stringify(jsonDocs, null, 2),
    'utf8'
);

console.log('✅ Environment documentation generated:');
console.log('  📄 docs/EnvironmentVariables.md');
console.log('  📄 docs/environment-schema.json');

module.exports = {
    generateMarkdownDocs,
    generateJsonDocs,
    configSchema
};