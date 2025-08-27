/**
 * Structured Logging Utility
 * Provides consistent logging with different levels and context
 */

export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor(context = 'App') {
    this.context = context;
    // In production, only show errors; in development, show all logs
    this.level = process.env.NODE_ENV === 'production' ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG;
  }

  /**
   * Log an error message
   * @param {string} message - Error message
   * @param {any} data - Additional data to log
   */
  error(message, data = null) {
    if (this.level >= LOG_LEVELS.ERROR) {
      // In a real implementation, this would send to a logging service
      // For now, we'll use a more structured approach
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        context: this.context,
        message,
        data
      };

      // Only log in development or when explicitly enabled
      if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_LOGGING === 'true') {
        // We'll use console here but in a production system this would go to a logging service
        console.error(JSON.stringify(logEntry, null, 2));
      }
    }
  }

  /**
   * Log a warning message
   * @param {string} message - Warning message
   * @param {any} data - Additional data to log
   */
  warn(message, data = null) {
    if (this.level >= LOG_LEVELS.WARN) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'WARN',
        context: this.context,
        message,
        data
      };

      if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_LOGGING === 'true') {
        console.warn(JSON.stringify(logEntry, null, 2));
      }
    }
  }

  /**
   * Log an info message
   * @param {string} message - Info message
   * @param {any} data - Additional data to log
   */
  info(message, data = null) {
    if (this.level >= LOG_LEVELS.INFO) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        context: this.context,
        message,
        data
      };

      if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_LOGGING === 'true') {
        console.info(JSON.stringify(logEntry, null, 2));
      }
    }
  }

  /**
   * Log a debug message
   * @param {string} message - Debug message
   * @param {any} data - Additional data to log
   */
  debug(message, data = null) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'DEBUG',
        context: this.context,
        message,
        data
      };

      if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_LOGGING === 'true') {
        console.log(JSON.stringify(logEntry, null, 2));
      }
    }
  }

  /**
   * Set the logging level
   * @param {number} level - Log level from LOG_LEVELS
   */
  setLevel(level) {
    this.level = level;
  }

  /**
   * Set the context for the logger
   * @param {string} context - Context name
   */
  setContext(context) {
    this.context = context;
  }
}

// Create default logger instance
const defaultLogger = new Logger();

/**
 * Create a logger with a specific context
 * @param {string} context - Context name for the logger
 * @returns {Logger} Logger instance
 */
export const createLogger = context => new Logger(context);

export default defaultLogger;
