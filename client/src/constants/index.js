/**
 * Application Constants
 *
 * This file contains all named constants to replace magic numbers and strings
 * throughout the application for better maintainability and readability.
 */

// ===================
// API CONSTANTS
// ===================

export const API = {
  // Timeouts
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_DELAY: 1000, // 1 second
  MAX_RETRIES: 3,

  // Cache durations (milliseconds)
  CACHE_DURATION: {
    SHORT: 30 * 1000, // 30 seconds
    MEDIUM: 5 * 60 * 1000, // 5 minutes
    LONG: 30 * 60 * 1000, // 30 minutes
    VERY_LONG: 24 * 60 * 60 * 1000 // 24 hours
  },

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Status codes
  STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  }
};

// ===================
// UI CONSTANTS
// ===================

export const UI = {
  // Dimensions
  SIDEBAR_WIDTH: 240,
  COLLAPSED_SIDEBAR_WIDTH: 64,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 40,

  // Breakpoints (matches Material-UI)
  BREAKPOINTS: {
    XS: 0,
    SM: 600,
    MD: 960,
    LG: 1280,
    XL: 1920
  },

  // Z-indices
  Z_INDEX: {
    DROPDOWN: 1000,
    MODAL: 1300,
    SNACKBAR: 1400,
    TOOLTIP: 1500
  },

  // Animation durations
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000
  },

  // Grid spacing
  SPACING: {
    TINY: 4,
    SMALL: 8,
    MEDIUM: 16,
    LARGE: 24,
    EXTRA_LARGE: 32
  }
};

// ===================
// FORM CONSTANTS
// ===================

export const FORM = {
  // Validation
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_COMMENT_LENGTH: 1000,

  // Input debounce
  DEBOUNCE_DELAY: 300,
  SEARCH_DEBOUNCE_DELAY: 500,

  // Auto-save
  AUTO_SAVE_INTERVAL: 5000, // 5 seconds
  AUTO_SAVE_DEBOUNCE: 2000, // 2 seconds

  // File upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/csv', 'application/vnd.ms-excel']
};

// ===================
// POND MANAGEMENT CONSTANTS
// ===================

export const POND = {
  // Status values
  STATUS: {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    MAINTENANCE: 'Maintenance',
    HARVESTED: 'Harvested'
  },

  // Default values
  DEFAULT_DEPTH: 1.5, // meters
  DEFAULT_AREA: 1000, // square meters
  MIN_AREA: 100,
  MAX_AREA: 10000,
  MIN_DEPTH: 0.5,
  MAX_DEPTH: 5.0,

  // Water quality ranges
  WATER_QUALITY: {
    PH: {
      MIN: 6.5,
      MAX: 8.5,
      OPTIMAL_MIN: 7.0,
      OPTIMAL_MAX: 8.0
    },
    DISSOLVED_OXYGEN: {
      MIN: 4.0, // mg/L
      OPTIMAL_MIN: 5.0,
      MAX: 15.0
    },
    TEMPERATURE: {
      MIN: 20, // Celsius
      MAX: 35,
      OPTIMAL_MIN: 25,
      OPTIMAL_MAX: 30
    },
    AMMONIA: {
      MAX: 0.5, // mg/L
      WARNING: 0.25
    }
  },

  // Stocking density
  STOCKING_DENSITY: {
    MIN: 1000, // fish per hectare
    MAX: 50000,
    RECOMMENDED: 15000
  }
};

// ===================
// FEED MANAGEMENT CONSTANTS
// ===================

export const FEED = {
  // Feed types
  TYPES: {
    STARTER: 'Starter',
    GROWER: 'Grower',
    FINISHER: 'Finisher',
    BREEDER: 'Breeder'
  },

  // Feed conversion ratio
  FCR: {
    EXCELLENT: 1.2,
    GOOD: 1.5,
    AVERAGE: 1.8,
    POOR: 2.5
  },

  // Feeding frequency
  FREQUENCY: {
    MIN_PER_DAY: 2,
    MAX_PER_DAY: 6,
    RECOMMENDED: 3
  },

  // Protein content (percentage)
  PROTEIN_CONTENT: {
    STARTER: 45,
    GROWER: 35,
    FINISHER: 30,
    BREEDER: 40
  }
};

// ===================
// WATER QUALITY CONSTANTS
// ===================

export const WATER_QUALITY = {
  // Monitoring frequency
  MONITORING_FREQUENCY: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly'
  },

  // Alert thresholds
  ALERT_THRESHOLDS: {
    PH_LOW: 6.8,
    PH_HIGH: 8.2,
    DO_LOW: 4.5,
    TEMP_LOW: 22,
    TEMP_HIGH: 32,
    AMMONIA_HIGH: 0.3
  },

  // Test parameters
  PARAMETERS: {
    PH: 'pH',
    DISSOLVED_OXYGEN: 'dissolvedOxygen',
    TEMPERATURE: 'temperature',
    AMMONIA: 'ammonia',
    NITRITE: 'nitrite',
    NITRATE: 'nitrate',
    ALKALINITY: 'alkalinity',
    HARDNESS: 'hardness'
  }
};

// ===================
// INVENTORY CONSTANTS
// ===================

export const INVENTORY = {
  // Categories
  CATEGORIES: {
    FEED: 'Feed',
    MEDICINE: 'Medicine',
    EQUIPMENT: 'Equipment',
    CHEMICALS: 'Chemicals',
    SUPPLIES: 'Supplies'
  },

  // Units
  UNITS: {
    KG: 'kg',
    GRAMS: 'g',
    LITERS: 'L',
    PIECES: 'pcs',
    BOXES: 'boxes'
  },

  // Stock levels
  STOCK_LEVELS: {
    LOW_THRESHOLD: 10, // percentage
    CRITICAL_THRESHOLD: 5, // percentage
    REORDER_POINT: 20 // percentage
  }
};

// ===================
// FINANCIAL CONSTANTS
// ===================

export const FINANCE = {
  // Currencies
  DEFAULT_CURRENCY: 'USD',
  SUPPORTED_CURRENCIES: ['USD', 'EUR', 'INR', 'CNY'],

  // Expense categories
  EXPENSE_CATEGORIES: {
    FEED: 'Feed',
    LABOR: 'Labor',
    UTILITIES: 'Utilities',
    MEDICINE: 'Medicine',
    EQUIPMENT: 'Equipment',
    MAINTENANCE: 'Maintenance',
    OTHER: 'Other'
  },

  // Decimal places for currency
  CURRENCY_DECIMALS: 2,

  // Tax rates (percentage)
  DEFAULT_TAX_RATE: 0,
  MAX_TAX_RATE: 50
};

// ===================
// TIME CONSTANTS
// ===================

export const TIME = {
  // Durations in milliseconds
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,

  // Date formats
  DATE_FORMATS: {
    SHORT: 'MM/DD/YYYY',
    LONG: 'MMMM DD, YYYY',
    ISO: 'YYYY-MM-DD',
    DATETIME: 'MM/DD/YYYY HH:mm',
    TIME: 'HH:mm'
  },

  // Business hours
  BUSINESS_HOURS: {
    START: 8, // 8 AM
    END: 18 // 6 PM
  }
};

// ===================
// SEASON CONSTANTS
// ===================

export const SEASON = {
  // Status
  STATUS: {
    PLANNING: 'Planning',
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
  },

  // Default duration
  DEFAULT_DURATION_MONTHS: 6,
  MIN_DURATION_MONTHS: 3,
  MAX_DURATION_MONTHS: 18,

  // Growth stages
  GROWTH_STAGES: {
    NURSERY: 'Nursery',
    GROWING: 'Growing',
    HARVEST: 'Harvest'
  }
};

// ===================
// CHART CONSTANTS
// ===================

export const CHART = {
  // Colors
  COLORS: {
    PRIMARY: '#1976d2',
    SECONDARY: '#dc004e',
    SUCCESS: '#4caf50',
    WARNING: '#ff9800',
    ERROR: '#f44336',
    INFO: '#2196f3'
  },

  // Dimensions
  DEFAULT_HEIGHT: 300,
  DEFAULT_WIDTH: 600,
  MIN_HEIGHT: 200,
  MAX_HEIGHT: 800,

  // Animation
  ANIMATION_DURATION: 1000
};

// ===================
// PERFORMANCE CONSTANTS
// ===================

export const PERFORMANCE = {
  // Thresholds
  FAST_RESPONSE_TIME: 100, // milliseconds
  SLOW_RESPONSE_TIME: 1000,
  VERY_SLOW_RESPONSE_TIME: 3000,

  // Bundle sizes
  MAX_BUNDLE_SIZE: 2 * 1024 * 1024, // 2MB
  WARNING_BUNDLE_SIZE: 1 * 1024 * 1024, // 1MB

  // Memory
  MAX_MEMORY_USAGE: 100 * 1024 * 1024, // 100MB

  // Cache limits
  MAX_CACHE_ENTRIES: 1000,
  MAX_CACHE_SIZE: 50 * 1024 * 1024 // 50MB
};

// ===================
// NOTIFICATION CONSTANTS
// ===================

export const NOTIFICATION = {
  // Types
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  },

  // Durations
  DURATION: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 8000,
    PERSISTENT: 0 // doesn't auto-hide
  },

  // Positions
  POSITIONS: {
    TOP_LEFT: 'top-left',
    TOP_RIGHT: 'top-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_RIGHT: 'bottom-right'
  }
};

// ===================
// SECURITY CONSTANTS
// ===================

export const SECURITY = {
  // Token expiry
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days

  // Password requirements
  MIN_PASSWORD_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,

  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes

  // Session
  SESSION_TIMEOUT: 30 * 60 * 1000 // 30 minutes
};

// ===================
// ERROR CONSTANTS
// ===================

export const ERROR = {
  // Error codes
  CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    AUTHENTICATION_ERROR: 'AUTH_ERROR',
    AUTHORIZATION_ERROR: 'AUTHZ_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    SERVER_ERROR: 'SERVER_ERROR',
    TIMEOUT: 'TIMEOUT'
  },

  // Retry configurations
  RETRY_COUNTS: {
    NETWORK: 3,
    AUTHENTICATION: 1,
    SERVER_ERROR: 2
  },

  // Error boundaries
  FALLBACK_RETRY_DELAY: 5000 // 5 seconds
};

// ===================
// DEFAULT VALUES
// ===================

export const DEFAULTS = {
  // Pagination
  PAGE: 1,
  PAGE_SIZE: 10,

  // Language
  LANGUAGE: 'en',

  // Theme
  THEME: 'light',

  // Currency
  CURRENCY: 'USD',

  // Timezone
  TIMEZONE: 'UTC',

  // Date range
  DATE_RANGE_DAYS: 30
};

// ===================
// REGEX PATTERNS
// ===================

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  NUMERIC: /^\d+$/,
  DECIMAL: /^\d+(\.\d+)?$/,
  ALPHA: /^[A-Za-z]+$/,
  ALPHANUMERIC: /^[A-Za-z0-9]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
};

// ===================
// MESSAGES
// ===================

export const MESSAGES = {
  // Success messages
  SUCCESS: {
    SAVE: 'Data saved successfully',
    UPDATE: 'Data updated successfully',
    DELETE: 'Data deleted successfully',
    UPLOAD: 'File uploaded successfully'
  },

  // Error messages
  ERROR: {
    GENERIC: 'An error occurred. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    VALIDATION: 'Please check your input and try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.'
  },

  // Loading messages
  LOADING: {
    GENERIC: 'Loading...',
    SAVING: 'Saving...',
    UPLOADING: 'Uploading...',
    DELETING: 'Deleting...'
  }
};

// ===================
// EXPORT ALL CONSTANTS
// ===================

export default {
  API,
  UI,
  FORM,
  POND,
  FEED,
  WATER_QUALITY,
  INVENTORY,
  FINANCE,
  TIME,
  SEASON,
  CHART,
  PERFORMANCE,
  NOTIFICATION,
  SECURITY,
  ERROR,
  DEFAULTS,
  REGEX,
  MESSAGES
};
