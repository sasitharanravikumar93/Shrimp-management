/**
 * Production-ready Logging Utility
 *
 * This logging system replaces console.log statements with a structured,
 * configurable logging solution that supports different environments,
 * log levels, and output formats.
 *
 * Features:
 * - Environment-aware logging (dev/prod modes)
 * - Configurable log levels
 * - Structured logging with metadata
 * - Performance monitoring
 * - Error tracking and reporting
 * - Local storage for log persistence
 * - Remote logging capabilities
 */

// ===================
// LOG LEVELS
// ===================

export const LogLevel = {
  TRACE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  FATAL: 5,
  OFF: 6
};

export const LogLevelNames = {
  [LogLevel.TRACE]: 'TRACE',
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL',
  [LogLevel.OFF]: 'OFF'
};

// ===================
// CONFIGURATION
// ===================

const DEFAULT_CONFIG = {
  // Environment-based log level
  logLevel: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,

  // Console output settings
  enableConsole: process.env.NODE_ENV === 'development',
  enableColors: true,
  enableTimestamps: true,
  enableStackTrace: process.env.NODE_ENV === 'development',

  // Persistence settings
  enableLocalStorage: true,
  maxLocalStorageEntries: 1000,

  // Remote logging settings
  enableRemoteLogging: process.env.NODE_ENV === 'production',
  remoteEndpoint: process.env.REACT_APP_LOGGING_ENDPOINT || null,

  // Performance monitoring
  enablePerformanceLogging: process.env.NODE_ENV === 'development',

  // Error reporting
  enableErrorReporting: true,
  maxErrorsPerSession: 50
};

// ===================
// LOG ENTRY CLASS
// ===================

class LogEntry {
  constructor(level, message, metadata = {}, error = null) {
    this.id = this._generateId();
    this.timestamp = new Date().toISOString();
    this.level = level;
    this.levelName = LogLevelNames[level];
    this.message = message;
    this.metadata = {
      ...metadata,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this._getSessionId()
    };
    this.error = error ? this._serializeError(error) : null;
    this.stackTrace = error && DEFAULT_CONFIG.enableStackTrace ? error.stack : null;
  }

  _generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  _getSessionId() {
    let sessionId = sessionStorage.getItem('log_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('log_session_id', sessionId);
    }
    return sessionId;
  }

  _serializeError(error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status
    };
  }

  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      level: this.level,
      levelName: this.levelName,
      message: this.message,
      metadata: this.metadata,
      error: this.error,
      stackTrace: this.stackTrace
    };
  }
}

// ===================
// LOGGER CLASS
// ===================

class Logger {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logs = [];
    this.errorCount = 0;

    // Color schemes for console output
    this.colors = {
      [LogLevel.TRACE]: '#6B7280',
      [LogLevel.DEBUG]: '#3B82F6',
      [LogLevel.INFO]: '#10B981',
      [LogLevel.WARN]: '#F59E0B',
      [LogLevel.ERROR]: '#EF4444',
      [LogLevel.FATAL]: '#DC2626'
    };

    // Initialize performance monitoring
    this.performanceMetrics = {
      startTime: performance.now(),
      logCounts: {},
      errorCounts: {}
    };

    // Load persisted logs
    this._loadPersistedLogs();

    // Set up error handler
    this._setupGlobalErrorHandler();
  }

  /**
   * Main logging method
   */
  _log(level, message, metadata = {}, error = null) {
    // Check if logging is enabled for this level
    if (level < this.config.logLevel) {
      return;
    }

    // Create log entry
    const entry = new LogEntry(level, message, metadata, error);

    // Add to memory
    this.logs.push(entry);

    // Update metrics
    this._updateMetrics(level);

    // Console output
    if (this.config.enableConsole) {
      this._logToConsole(entry);
    }

    // Persist to local storage
    if (this.config.enableLocalStorage) {
      this._persistLog(entry);
    }

    // Send to remote endpoint
    if (this.config.enableRemoteLogging && level >= LogLevel.ERROR) {
      this._sendToRemote(entry);
    }

    // Cleanup old logs
    this._cleanupLogs();

    return entry;
  }

  /**
   * Public logging methods
   */
  trace(message, metadata = {}) {
    return this._log(LogLevel.TRACE, message, metadata);
  }

  debug(message, metadata = {}) {
    return this._log(LogLevel.DEBUG, message, metadata);
  }

  info(message, metadata = {}) {
    return this._log(LogLevel.INFO, message, metadata);
  }

  warn(message, metadata = {}, error = null) {
    return this._log(LogLevel.WARN, message, metadata, error);
  }

  error(message, metadata = {}, error = null) {
    this.errorCount++;
    return this._log(LogLevel.ERROR, message, metadata, error);
  }

  fatal(message, metadata = {}, error = null) {
    this.errorCount++;
    return this._log(LogLevel.FATAL, message, metadata, error);
  }

  /**
   * Performance logging
   */
  time(label) {
    if (!this.config.enablePerformanceLogging) return;

    const startTime = performance.now();
    return {
      end: () => {
        const duration = performance.now() - startTime;
        this.debug(`⏱️ ${label}: ${duration.toFixed(2)}ms`, {
          type: 'performance',
          label,
          duration
        });
        return duration;
      }
    };
  }

  /**
   * Feature-specific logging methods
   */
  apiCall(endpoint, method, duration, status, error = null) {
    const metadata = {
      type: 'api',
      endpoint,
      method,
      duration,
      status
    };

    if (error) {
      this.error(`API Error: ${method} ${endpoint} (${status})`, metadata, error);
    } else if (status >= 400) {
      this.warn(`API Warning: ${method} ${endpoint} (${status})`, metadata);
    } else {
      this.debug(`API Success: ${method} ${endpoint} (${status}) - ${duration}ms`, metadata);
    }
  }

  userAction(action, component, metadata = {}) {
    this.info(`User Action: ${action} in ${component}`, {
      type: 'user_action',
      action,
      component,
      ...metadata
    });
  }

  navigation(from, to, metadata = {}) {
    this.info(`Navigation: ${from} → ${to}`, {
      type: 'navigation',
      from,
      to,
      ...metadata
    });
  }

  formSubmission(formName, success, errors = null) {
    if (success) {
      this.info(`Form Submitted: ${formName}`, {
        type: 'form_submission',
        formName,
        success
      });
    } else {
      this.warn(`Form Submission Failed: ${formName}`, {
        type: 'form_submission',
        formName,
        success,
        errors
      });
    }
  }

  /**
   * Console output with formatting
   */
  _logToConsole(entry) {
    const { level, levelName, message, metadata, error } = entry;
    const timestamp = this.config.enableTimestamps ? `[${new Date().toLocaleTimeString()}]` : '';

    const color = this.colors[level];
    const prefix = `${timestamp} ${levelName}:`;

    if (this.config.enableColors && typeof console.groupCollapsed === 'function') {
      console.groupCollapsed(`%c${prefix} ${message}`, `color: ${color}; font-weight: bold`);

      if (Object.keys(metadata).length > 0) {
        console.log('Metadata:', metadata);
      }

      if (error) {
        console.error('Error:', error);
      }

      console.groupEnd();
    } else {
      // Fallback for environments without groupCollapsed
      console.log(`${prefix} ${message}`, metadata);
      if (error) {
        console.error(error);
      }
    }
  }

  /**
   * Local storage persistence
   */
  _persistLog(entry) {
    try {
      const stored = localStorage.getItem('app_logs') || '[]';
      const logs = JSON.parse(stored);

      logs.push(entry.toJSON());

      // Keep only recent logs
      if (logs.length > this.config.maxLocalStorageEntries) {
        logs.splice(0, logs.length - this.config.maxLocalStorageEntries);
      }

      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      // If localStorage is full or unavailable, fail silently
    }
  }

  _loadPersistedLogs() {
    try {
      const stored = localStorage.getItem('app_logs');
      if (stored) {
        const logs = JSON.parse(stored);
        this.logs = logs.slice(-100); // Load last 100 logs
      }
    } catch (error) {
      // Ignore errors when loading persisted logs
    }
  }

  /**
   * Remote logging
   */
  async _sendToRemote(entry) {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry.toJSON())
      });
    } catch (error) {
      // Fail silently for remote logging errors
    }
  }

  /**
   * Global error handler
   */
  _setupGlobalErrorHandler() {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.error(
        'Unhandled Promise Rejection',
        {
          type: 'unhandled_rejection',
          reason: event.reason
        },
        event.reason
      );
    });

    // JavaScript errors
    window.addEventListener('error', event => {
      this.error(
        'JavaScript Error',
        {
          type: 'javascript_error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        },
        event.error
      );
    });
  }

  /**
   * Metrics and cleanup
   */
  _updateMetrics(level) {
    const levelName = LogLevelNames[level];
    this.performanceMetrics.logCounts[levelName] =
      (this.performanceMetrics.logCounts[levelName] || 0) + 1;

    if (level >= LogLevel.ERROR) {
      this.performanceMetrics.errorCounts[levelName] =
        (this.performanceMetrics.errorCounts[levelName] || 0) + 1;
    }
  }

  _cleanupLogs() {
    // Keep only recent logs in memory
    if (this.logs.length > 500) {
      this.logs.splice(0, this.logs.length - 500);
    }
  }

  /**
   * Utility methods
   */
  getLogs(level = null, limit = 100) {
    const filteredLogs = level !== null ? this.logs.filter(log => log.level >= level) : this.logs;

    return filteredLogs.slice(-limit);
  }

  getMetrics() {
    return {
      ...this.performanceMetrics,
      totalLogs: this.logs.length,
      errorCount: this.errorCount,
      uptime: performance.now() - this.performanceMetrics.startTime
    };
  }

  setLogLevel(level) {
    this.config.logLevel = level;
    this.info(`Log level changed to ${LogLevelNames[level]}`);
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('app_logs');
    this.info('Logs cleared');
  }

  exportLogs() {
    const logs = this.getLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `app-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }
}

// ===================
// SINGLETON INSTANCE
// ===================

export const logger = new Logger();

// ===================
// CONVENIENCE FUNCTIONS
// ===================

// Drop-in replacements for console methods
export const log = {
  trace: (message, metadata) => logger.trace(message, metadata),
  debug: (message, metadata) => logger.debug(message, metadata),
  info: (message, metadata) => logger.info(message, metadata),
  warn: (message, metadata, error) => logger.warn(message, metadata, error),
  error: (message, metadata, error) => logger.error(message, metadata, error),
  fatal: (message, metadata, error) => logger.fatal(message, metadata, error)
};

// Feature-specific logging
export const logApiCall = (endpoint, method, duration, status, error) =>
  logger.apiCall(endpoint, method, duration, status, error);

export const logUserAction = (action, component, metadata) =>
  logger.userAction(action, component, metadata);

export const logNavigation = (from, to, metadata) => logger.navigation(from, to, metadata);

export const logFormSubmission = (formName, success, errors) =>
  logger.formSubmission(formName, success, errors);

export const logPerformance = label => logger.time(label);

// Development helpers
export const enableDebugMode = () => {
  logger.setLogLevel(LogLevel.DEBUG);
  logger.config.enableConsole = true;
  logger.config.enablePerformanceLogging = true;
};

export const enableProductionMode = () => {
  logger.setLogLevel(LogLevel.WARN);
  logger.config.enableConsole = false;
  logger.config.enablePerformanceLogging = false;
};

// Export the main logger instance
export default logger;
