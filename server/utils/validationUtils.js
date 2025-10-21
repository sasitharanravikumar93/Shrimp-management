/**
 * Common validation utilities for controllers
 * Eliminates code duplication and provides consistent validation patterns
 */

const mongoose = require('mongoose');
const { ValidationError, NotFoundError } = require('./errorHandler');

/**
 * Validates if a value is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @param {string} entityName - Name of the entity for error messages
 * @throws {ValidationError} If the ID is invalid
 */
const validateObjectId = (id, entityName = 'Entity') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError(`Invalid ${entityName} ID format`);
  }
};

/**
 * Validates and ensures an entity exists in the database
 * @param {object} Model - Mongoose model to query
 * @param {string} id - The ID to search for
 * @param {string} entityName - Name of the entity for error messages
 * @returns {Promise<object>} The found entity
 * @throws {ValidationError} If ID is invalid
 * @throws {NotFoundError} If entity is not found
 */
const validateEntityExists = async (Model, id, entityName = 'Entity') => {
  validateObjectId(id, entityName);

  const entity = await Model.findById(id);
  if (!entity) {
    throw new NotFoundError(entityName);
  }

  return entity;
};

/**
 * Validates required fields in request body
 * @param {object} body - Request body
 * @param {Array<string>} requiredFields - Array of required field names
 * @param {string} entityName - Name of the entity for error messages
 * @throws {ValidationError} If any required field is missing
 */
const validateRequiredFields = (body, requiredFields, entityName = 'Entity') => {
  const missingFields = requiredFields.filter(field => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });

  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields for ${entityName}: ${missingFields.join(', ')}`
    );
  }
};

/**
 * Validates date range (start date must be before end date)
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @throws {ValidationError} If date range is invalid
 */
const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    throw new ValidationError('Invalid start date format');
  }

  if (isNaN(end.getTime())) {
    throw new ValidationError('Invalid end date format');
  }

  if (start >= end) {
    throw new ValidationError('Start date must be before end date');
  }
};

/**
 * Validates numeric range
 * @param {number} value - The value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @throws {ValidationError} If value is outside the range
 */
const validateNumericRange = (value, fieldName, min, max) => {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a valid number`);
  }

  if (value < min || value > max) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max}`
    );
  }
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @throws {ValidationError} If email format is invalid
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
};

/**
 * Validates pagination parameters
 * @param {string|number} page - Page number
 * @param {string|number} limit - Items per page
 * @returns {object} Validated pagination object
 */
const validatePagination = (page = 1, limit = 25) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ValidationError('Page must be a positive number');
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw new ValidationError('Limit must be between 1 and 100');
  }

  return {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum
  };
};

/**
 * Common validation for pond and season relationship
 * @param {string} pondId - Pond ID
 * @param {string} seasonId - Season ID
 * @returns {Promise<object>} Object containing pond and season
 */
const validatePondSeasonRelationship = async (pondId, seasonId) => {
  const Pond = require('../models/Pond');
  const Season = require('../models/Season');

  const [pond, season] = await Promise.all([
    validateEntityExists(Pond, pondId, 'Pond'),
    validateEntityExists(Season, seasonId, 'Season')
  ]);

  // Verify pond belongs to the season
  if (pond.seasonId.toString() !== seasonId) {
    throw new ValidationError('Pond does not belong to the specified season');
  }

  return { pond, season };
};

/**
 * Validates multilingual name object
 * @param {object} nameObj - Name object with language keys
 * @param {string} entityName - Name of the entity for error messages
 * @throws {ValidationError} If name object is invalid
 */
const validateMultilingualName = (nameObj, entityName = 'Entity') => {
  if (!nameObj || typeof nameObj !== 'object') {
    throw new ValidationError(`${entityName} name must be an object`);
  }

  // Check if at least one language is provided
  const languages = Object.keys(nameObj);
  if (languages.length === 0) {
    throw new ValidationError(`${entityName} name must contain at least one language`);
  }

  // Validate each language name
  for (const [lang, name] of Object.entries(nameObj)) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError(`${entityName} name for language '${lang}' must be a non-empty string`);
    }
  }
};

/**
 * Validates GPS coordinates
 * @param {Array<number>} coordinates - [longitude, latitude]
 * @throws {ValidationError} If coordinates are invalid
 */
const validateGPSCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    throw new ValidationError('Coordinates must be an array of [longitude, latitude]');
  }

  const [longitude, latitude] = coordinates;

  if (typeof longitude !== 'number' || typeof latitude !== 'number') {
    throw new ValidationError('Coordinates must be numeric values');
  }

  if (longitude < -180 || longitude > 180) {
    throw new ValidationError('Longitude must be between -180 and 180');
  }

  if (latitude < -90 || latitude > 90) {
    throw new ValidationError('Latitude must be between -90 and 90');
  }
};

/**
 * Sanitizes query parameters for database operations
 * @param {object} query - Query object to sanitize
 * @returns {object} Sanitized query object
 */
const sanitizeQuery = (query) => {
  const sanitized = {};

  for (const [key, value] of Object.entries(query)) {
    // Skip empty values
    if (value === undefined || value === null || value === '') {
      continue;
    }

    // Convert ObjectId strings to proper ObjectIds
    if (key.endsWith('Id') && mongoose.Types.ObjectId.isValid(value)) {
      sanitized[key] = mongoose.Types.ObjectId(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

module.exports = {
  validateObjectId,
  validateEntityExists,
  validateRequiredFields,
  validateDateRange,
  validateNumericRange,
  validateEmail,
  validatePagination,
  validatePondSeasonRelationship,
  validateMultilingualName,
  validateGPSCoordinates,
  sanitizeQuery
};