/**
 * Structured logging utility for the server side
 */

const winston = require('winston');
const { config } = require('../config');

// Define log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'shrimp-farm-api' },
  transports: [
    // File transport for all environments
    new winston.transports.File({
      filename: config.logging.filePath,
      level: config.logging.level
    })
  ]
});

// Add console transport for development and when explicitly enabled
if (config.logging.enableConsole || config.server.env === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create logger factory for specific contexts
const createLogger = (context) => {
  return winston.createLogger({
    level: config.logging.level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: 'shrimp-farm-api', context },
    transports: logger.transports
  });
};

module.exports = {
  logger,
  createLogger,
  LOG_LEVELS
};