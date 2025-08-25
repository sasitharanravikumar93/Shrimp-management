/**
 * Application Constants
 * Centralized constants to avoid magic numbers and strings
 */

// ===================
// TIME CONSTANTS
// ===================

export const TIME = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000
};

export const TIMEOUT = {
    DEFAULT: 3000,
    LONG: 5000,
    SHORT: 1000
};

// ===================
// SIZE CONSTANTS
// ===================

export const SIZES = {
    SMALL: 0.5,
    MEDIUM: 1,
    LARGE: 2,
    XLARGE: 3
};

export const SPACING = {
    XS: 3,
    SM: 4,
    MD: 6,
    LG: 8,
    XL: 12
};

export const BREAKPOINTS = {
    TABLET_THRESHOLD: 8,
    MOBILE_BREAKPOINT: 0.05
};

// ===================
// UI CONSTANTS
// ===================

export const PROGRESS = {
    MIN: 0,
    MAX: 100,
    QUARTER: 25,
    HALF: 50,
    THREE_QUARTERS: 75
};

export const OPACITY = {
    TRANSPARENT: 0,
    SEMI_TRANSPARENT: 0.05,
    VISIBLE: 1
};

export const DIMENSIONS = {
    BYTE_SIZE: 1024,
    MAX_PERCENTAGE: 100,
    MIN_PERCENTAGE: 0
};

// ===================
// TESTING CONSTANTS
// ===================

export const TEST = {
    RETRY_COUNT: 3,
    WAIT_TIME: 10,
    TIMEOUT_SHORT: 50,
    TIMEOUT_MEDIUM: 100,
    TIMEOUT_LONG: 3000
};

// ===================
// VALIDATION CONSTANTS
// ===================

export const VALIDATION = {
    MAX_STRING_LENGTH: 255,
    PASSWORD_MIN_LENGTH: 10,
    PASSWORD_MAX_LENGTH: 15,
    MAX_RETRY_ATTEMPTS: 3
};

// ===================
// FILE LIMITS
// ===================

export const FILE_LIMITS = {
    MAX_LINES: 500,
    MAX_FUNCTION_LINES: 100,
    MIN_LINES: 200
};

// ===================
// SECURITY CONSTANTS
// ===================

export const SECURITY = {
    SALT_ROUNDS: 12,
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    CACHE_TIMEOUT: 60 * 60 * 1000, // 1 hour
    SHORT_CACHE: 60 * 1000 // 1 minute
};

// ===================
// HTTP STATUS CODES
// ===================

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};

// ===================
// ERROR CODES
// ===================

export const ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    AUTHENTICATION_ERROR: 'AUTH_ERROR',
    PERMISSION_ERROR: 'PERMISSION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR'
};

// ===================
// CHART DEFAULTS
// ===================

export const CHART = {
    DEFAULT_HEIGHT: 300,
    DEFAULT_WIDTH: 400,
    MARGIN: {
        TOP: 20,
        RIGHT: 30,
        BOTTOM: 20,
        LEFT: 20
    }
};

// ===================
// EXPORT ALL
// ===================

export default {
    TIME,
    TIMEOUT,
    SIZES,
    SPACING,
    BREAKPOINTS,
    PROGRESS,
    OPACITY,
    DIMENSIONS,
    TEST,
    VALIDATION,
    FILE_LIMITS,
    SECURITY,
    HTTP_STATUS,
    ERROR_CODES,
    CHART
};