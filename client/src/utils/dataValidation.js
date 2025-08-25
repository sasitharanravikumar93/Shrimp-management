/**
 * Comprehensive Data Validation System
 *
 * This module provides runtime data validation for API responses, user inputs,
 * and data transformations. It ensures data integrity and prevents runtime errors
 * caused by unexpected data structures.
 *
 * Features:
 * - Schema-based validation
 * - Type checking and coercion
 * - Custom validation rules
 * - Sanitization and transformation
 * - Error reporting and recovery
 * - Performance optimized validation
 */

// ===================
// VALIDATION TYPES
// ===================

export const ValidationTypes = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  ARRAY: 'array',
  OBJECT: 'object',
  DATE: 'date',
  EMAIL: 'email',
  URL: 'url',
  UUID: 'uuid',
  ENUM: 'enum',
  CURRENCY: 'currency',
  PHONE: 'phone',
  REQUIRED: 'required',
  OPTIONAL: 'optional',
  NULL: 'null',
  UNDEFINED: 'undefined'
};

export const ValidationSeverity = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// ===================
// CORE VALIDATION CLASS
// ===================

export class DataValidator {
  constructor(options = {}) {
    this.options = {
      strict: false,
      coerceTypes: true,
      sanitizeStrings: true,
      allowUnknownFields: false,
      dateFormat: 'ISO',
      logErrors: process.env.NODE_ENV === 'development',
      ...options
    };

    this.errors = [];
    this.warnings = [];
    this.cache = new Map();
  }

  /**
   * Validate data against a schema
   * @param {any} data - Data to validate
   * @param {Object} schema - Validation schema
   * @param {string} path - Current validation path for error reporting
   * @returns {Object} Validation result with data, errors, and warnings
   */
  validate(data, schema, path = '') {
    this.errors = [];
    this.warnings = [];

    const result = this._validateValue(data, schema, path);

    return {
      isValid: this.errors.length === 0,
      data: result,
      errors: [...this.errors],
      warnings: [...this.warnings],
      hasWarnings: this.warnings.length > 0
    };
  }

  /**
   * Validate and sanitize data in one step
   * @param {any} data - Data to process
   * @param {Object} schema - Validation schema
   * @returns {Object} Processed result
   */
  validateAndSanitize(data, schema) {
    const validation = this.validate(data, schema);

    if (!validation.isValid) {
      throw new ValidationError('Validation failed', validation.errors);
    }

    return {
      data: validation.data,
      warnings: validation.warnings
    };
  }

  /**
   * Internal validation method
   */
  _validateValue(value, schema, path) {
    // Handle null/undefined
    if (value == null) {
      return this._handleNullValue(value, schema, path);
    }

    // Handle array validation
    if (schema.type === ValidationTypes.ARRAY) {
      return this._validateArray(value, schema, path);
    }

    // Handle object validation
    if (schema.type === ValidationTypes.OBJECT) {
      return this._validateObject(value, schema, path);
    }

    // Handle primitive type validation
    return this._validatePrimitive(value, schema, path);
  }

  _handleNullValue(value, schema, path) {
    if (schema.required) {
      this._addError(`Required field is missing`, path);
      return schema.default !== undefined ? schema.default : value;
    }

    if (schema.nullable === false && value === null) {
      this._addError(`Field cannot be null`, path);
      return schema.default !== undefined ? schema.default : value;
    }

    return schema.default !== undefined ? schema.default : value;
  }

  _validateArray(value, schema, path) {
    if (!Array.isArray(value)) {
      if (this.options.coerceTypes && typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch {
          this._addError(`Expected array, got ${typeof value}`, path);
          return [];
        }
      } else {
        this._addError(`Expected array, got ${typeof value}`, path);
        return [];
      }
    }

    // Validate array constraints
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      this._addError(`Array must have at least ${schema.minLength} items`, path);
    }

    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      this._addError(`Array must have at most ${schema.maxLength} items`, path);
    }

    // Validate array items
    if (schema.items) {
      return value.map((item, index) =>
        this._validateValue(item, schema.items, `${path}[${index}]`)
      );
    }

    return value;
  }

  _validateObject(value, schema, path) {
    if (typeof value !== 'object' || Array.isArray(value)) {
      this._addError(`Expected object, got ${typeof value}`, path);
      return {};
    }

    const result = {};
    const processedKeys = new Set();

    // Validate defined properties
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, propertySchema]) => {
        const propertyPath = path ? `${path}.${key}` : key;
        result[key] = this._validateValue(value[key], propertySchema, propertyPath);
        processedKeys.add(key);
      });
    }

    // Handle unknown properties
    Object.keys(value).forEach(key => {
      if (!processedKeys.has(key)) {
        if (this.options.allowUnknownFields) {
          result[key] = value[key];
        } else if (this.options.strict) {
          this._addError(`Unknown property: ${key}`, path);
        } else {
          this._addWarning(`Unknown property: ${key}`, path);
          result[key] = value[key];
        }
      }
    });

    return result;
  }

  _validatePrimitive(value, schema, path) {
    let result = value;

    // Type validation and coercion
    switch (schema.type) {
      case ValidationTypes.STRING:
        result = this._validateString(value, schema, path);
        break;
      case ValidationTypes.NUMBER:
        result = this._validateNumber(value, schema, path);
        break;
      case ValidationTypes.BOOLEAN:
        result = this._validateBoolean(value, schema, path);
        break;
      case ValidationTypes.DATE:
        result = this._validateDate(value, schema, path);
        break;
      case ValidationTypes.EMAIL:
        result = this._validateEmail(value, schema, path);
        break;
      case ValidationTypes.URL:
        result = this._validateUrl(value, schema, path);
        break;
      case ValidationTypes.UUID:
        result = this._validateUuid(value, schema, path);
        break;
      case ValidationTypes.ENUM:
        result = this._validateEnum(value, schema, path);
        break;
      case ValidationTypes.CURRENCY:
        result = this._validateCurrency(value, schema, path);
        break;
      default:
        this._addWarning(`Unknown validation type: ${schema.type}`, path);
    }

    // Custom validation function
    if (schema.validate && typeof schema.validate === 'function') {
      try {
        const customResult = schema.validate(result, value, path);
        if (customResult !== true) {
          this._addError(customResult || 'Custom validation failed', path);
        }
      } catch (error) {
        this._addError(`Custom validation error: ${error.message}`, path);
      }
    }

    return result;
  }

  _validateString(value, schema, path) {
    if (typeof value !== 'string') {
      if (this.options.coerceTypes) {
        value = String(value);
      } else {
        this._addError(`Expected string, got ${typeof value}`, path);
        return '';
      }
    }

    // Sanitize string
    if (this.options.sanitizeStrings) {
      value = value.trim();
    }

    // Length validation
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      this._addError(`String must be at least ${schema.minLength} characters`, path);
    }

    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      this._addError(`String must be at most ${schema.maxLength} characters`, path);
    }

    // Pattern validation
    if (schema.pattern && !schema.pattern.test(value)) {
      this._addError(`String does not match required pattern`, path);
    }

    return value;
  }

  _validateNumber(value, schema, path) {
    const numValue = Number(value);

    if (isNaN(numValue)) {
      this._addError(`Expected number, got ${typeof value}`, path);
      return 0;
    }

    // Range validation
    if (schema.min !== undefined && numValue < schema.min) {
      this._addError(`Number must be at least ${schema.min}`, path);
    }

    if (schema.max !== undefined && numValue > schema.max) {
      this._addError(`Number must be at most ${schema.max}`, path);
    }

    // Integer validation
    if (schema.integer && !Number.isInteger(numValue)) {
      this._addError(`Number must be an integer`, path);
    }

    return numValue;
  }

  _validateBoolean(value, schema, path) {
    if (typeof value === 'boolean') {
      return value;
    }

    if (this.options.coerceTypes) {
      if (value === 'true' || value === 1 || value === '1') return true;
      if (value === 'false' || value === 0 || value === '0') return false;
    }

    this._addError(`Expected boolean, got ${typeof value}`, path);
    return false;
  }

  _validateDate(value, schema, path) {
    let date;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      date = new Date(value);
    } else {
      this._addError(`Invalid date format`, path);
      return null;
    }

    if (isNaN(date.getTime())) {
      this._addError(`Invalid date`, path);
      return null;
    }

    return date;
  }

  _validateEmail(value, schema, path) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (typeof value !== 'string' || !emailPattern.test(value)) {
      this._addError(`Invalid email format`, path);
      return '';
    }

    return value.toLowerCase();
  }

  _validateUrl(value, schema, path) {
    try {
      new URL(value);
      return value;
    } catch {
      this._addError(`Invalid URL format`, path);
      return '';
    }
  }

  _validateUuid(value, schema, path) {
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (typeof value !== 'string' || !uuidPattern.test(value)) {
      this._addError(`Invalid UUID format`, path);
      return '';
    }

    return value.toLowerCase();
  }

  _validateEnum(value, schema, path) {
    if (!schema.values || !schema.values.includes(value)) {
      this._addError(`Value must be one of: ${schema.values?.join(', ')}`, path);
      return schema.values?.[0] || null;
    }

    return value;
  }

  _validateCurrency(value, schema, path) {
    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      this._addError(`Invalid currency amount`, path);
      return 0;
    }

    // Round to 2 decimal places for currency
    return Math.round(numValue * 100) / 100;
  }

  _addError(message, path) {
    this.errors.push({
      message,
      path,
      severity: ValidationSeverity.ERROR
    });

    if (this.options.logErrors) {
      console.error(`Validation Error at ${path}: ${message}`);
    }
  }

  _addWarning(message, path) {
    this.warnings.push({
      message,
      path,
      severity: ValidationSeverity.WARNING
    });

    if (this.options.logErrors) {
      console.warn(`Validation Warning at ${path}: ${message}`);
    }
  }
}

// ===================
// VALIDATION ERROR CLASS
// ===================

export class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// ===================
// SCHEMA DEFINITIONS
// ===================

// Common schemas for the aquaculture application
export const Schemas = {
  // User/Employee schema
  User: {
    type: ValidationTypes.OBJECT,
    properties: {
      id: { type: ValidationTypes.UUID, required: true },
      name: { type: ValidationTypes.STRING, required: true, minLength: 1, maxLength: 100 },
      email: { type: ValidationTypes.EMAIL, required: true },
      phone: { type: ValidationTypes.STRING, pattern: /^\+?[\d\s-()]+$/ },
      role: {
        type: ValidationTypes.ENUM,
        values: ['admin', 'manager', 'employee'],
        required: true
      },
      isActive: { type: ValidationTypes.BOOLEAN, default: true },
      createdAt: { type: ValidationTypes.DATE, required: true },
      updatedAt: { type: ValidationTypes.DATE }
    }
  },

  // Pond schema
  Pond: {
    type: ValidationTypes.OBJECT,
    properties: {
      id: { type: ValidationTypes.UUID, required: true },
      name: { type: ValidationTypes.STRING, required: true, minLength: 1, maxLength: 50 },
      area: { type: ValidationTypes.NUMBER, required: true, min: 0 },
      depth: { type: ValidationTypes.NUMBER, required: true, min: 0 },
      status: {
        type: ValidationTypes.ENUM,
        values: ['Active', 'Inactive', 'Maintenance'],
        required: true
      },
      waterSource: { type: ValidationTypes.STRING },
      location: {
        type: ValidationTypes.OBJECT,
        properties: {
          latitude: { type: ValidationTypes.NUMBER, min: -90, max: 90 },
          longitude: { type: ValidationTypes.NUMBER, min: -180, max: 180 }
        }
      },
      capacity: { type: ValidationTypes.NUMBER, min: 0 },
      createdAt: { type: ValidationTypes.DATE, required: true }
    }
  },

  // Expense schema
  Expense: {
    type: ValidationTypes.OBJECT,
    properties: {
      id: { type: ValidationTypes.UUID, required: true },
      amount: { type: ValidationTypes.CURRENCY, required: true, min: 0 },
      category: {
        type: ValidationTypes.ENUM,
        values: ['Culture', 'Farm', 'Salary'],
        required: true
      },
      subcategory: { type: ValidationTypes.STRING },
      description: { type: ValidationTypes.STRING, required: true, minLength: 1 },
      date: { type: ValidationTypes.DATE, required: true },
      pondId: { type: ValidationTypes.UUID },
      employeeId: { type: ValidationTypes.UUID },
      seasonId: { type: ValidationTypes.UUID, required: true },
      receipt: { type: ValidationTypes.URL },
      tags: {
        type: ValidationTypes.ARRAY,
        items: { type: ValidationTypes.STRING }
      }
    }
  },

  // Inventory Item schema
  InventoryItem: {
    type: ValidationTypes.OBJECT,
    properties: {
      id: { type: ValidationTypes.UUID, required: true },
      name: { type: ValidationTypes.STRING, required: true, minLength: 1 },
      type: {
        type: ValidationTypes.ENUM,
        values: ['Feed', 'Chemical', 'Probiotic', 'Other'],
        required: true
      },
      quantity: { type: ValidationTypes.NUMBER, required: true, min: 0 },
      unit: {
        type: ValidationTypes.ENUM,
        values: ['kg', 'g', 'litre', 'ml', 'bag', 'bottle'],
        required: true
      },
      costPerUnit: { type: ValidationTypes.CURRENCY, required: true, min: 0 },
      supplier: { type: ValidationTypes.STRING },
      expiryDate: { type: ValidationTypes.DATE },
      batchNumber: { type: ValidationTypes.STRING },
      minStockLevel: { type: ValidationTypes.NUMBER, min: 0 },
      seasonId: { type: ValidationTypes.UUID, required: true }
    }
  },

  // Water Quality Reading schema
  WaterQuality: {
    type: ValidationTypes.OBJECT,
    properties: {
      id: { type: ValidationTypes.UUID, required: true },
      pondId: { type: ValidationTypes.UUID, required: true },
      temperature: { type: ValidationTypes.NUMBER, min: 0, max: 50 },
      ph: { type: ValidationTypes.NUMBER, min: 0, max: 14 },
      dissolvedOxygen: { type: ValidationTypes.NUMBER, min: 0 },
      ammonia: { type: ValidationTypes.NUMBER, min: 0 },
      nitrite: { type: ValidationTypes.NUMBER, min: 0 },
      nitrate: { type: ValidationTypes.NUMBER, min: 0 },
      salinity: { type: ValidationTypes.NUMBER, min: 0 },
      turbidity: { type: ValidationTypes.NUMBER, min: 0 },
      recordedAt: { type: ValidationTypes.DATE, required: true },
      recordedBy: { type: ValidationTypes.UUID, required: true },
      notes: { type: ValidationTypes.STRING }
    }
  },

  // Season schema
  Season: {
    type: ValidationTypes.OBJECT,
    properties: {
      id: { type: ValidationTypes.UUID, required: true },
      name: { type: ValidationTypes.STRING, required: true, minLength: 1 },
      startDate: { type: ValidationTypes.DATE, required: true },
      endDate: { type: ValidationTypes.DATE },
      status: {
        type: ValidationTypes.ENUM,
        values: ['Active', 'Completed', 'Planned'],
        required: true
      },
      targetProduction: { type: ValidationTypes.NUMBER, min: 0 },
      actualProduction: { type: ValidationTypes.NUMBER, min: 0 },
      budget: { type: ValidationTypes.CURRENCY, min: 0 }
    }
  }
};

// ===================
// VALIDATION UTILITIES
// ===================

/**
 * Quick validation function for single values
 */
export const validateValue = (value, type, constraints = {}) => {
  const validator = new DataValidator();
  const schema = { type, ...constraints };
  return validator.validate(value, schema);
};

/**
 * Validate API response data
 */
export const validateApiResponse = (data, schemaName) => {
  const schema = Schemas[schemaName];
  if (!schema) {
    throw new Error(`Unknown schema: ${schemaName}`);
  }

  const validator = new DataValidator({
    strict: false,
    coerceTypes: true,
    allowUnknownFields: true,
    logErrors: true
  });

  return validator.validate(data, schema);
};

/**
 * Validate and sanitize form data
 */
export const validateFormData = (data, schemaName, options = {}) => {
  const schema = Schemas[schemaName];
  if (!schema) {
    throw new Error(`Unknown schema: ${schemaName}`);
  }

  const validator = new DataValidator({
    strict: true,
    coerceTypes: true,
    sanitizeStrings: true,
    allowUnknownFields: false,
    logErrors: true,
    ...options
  });

  return validator.validateAndSanitize(data, schema);
};

/**
 * Create a validation middleware for API calls
 */
export const createValidationMiddleware = (schemaName, options = {}) => {
  return data => {
    const result = validateApiResponse(data, schemaName);

    if (!result.isValid) {
      console.error('API Response Validation Failed:', result.errors);

      if (options.throwOnError) {
        throw new ValidationError('API response validation failed', result.errors);
      }
    }

    if (result.warnings.length > 0) {
      console.warn('API Response Validation Warnings:', result.warnings);
    }

    return {
      ...result,
      originalData: data
    };
  };
};

/**
 * Performance-optimized validator for large datasets
 */
export class BulkValidator {
  constructor(schemaName, options = {}) {
    this.schema = Schemas[schemaName];
    this.validator = new DataValidator(options);
    this.results = [];
  }

  validateBatch(dataArray) {
    this.results = [];

    dataArray.forEach((item, index) => {
      const result = this.validator.validate(item, this.schema, `[${index}]`);
      this.results.push({
        index,
        ...result,
        originalData: item
      });
    });

    return {
      results: this.results,
      validItems: this.results.filter(r => r.isValid).map(r => r.data),
      invalidItems: this.results.filter(r => !r.isValid),
      totalErrors: this.results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: this.results.reduce((sum, r) => sum + r.warnings.length, 0)
    };
  }
}

export default {
  DataValidator,
  ValidationError,
  ValidationTypes,
  ValidationSeverity,
  Schemas,
  validateValue,
  validateApiResponse,
  validateFormData,
  createValidationMiddleware,
  BulkValidator
};
