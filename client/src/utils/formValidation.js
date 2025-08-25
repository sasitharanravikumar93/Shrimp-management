/**
 * Form Validation System
 * Provides comprehensive validation rules and error handling for forms
 */

import React from 'react';

import { sanitizeText, sanitizeEmail, sanitizePhone, sanitizeNumber } from './sanitization';

// Validation rule definitions
export const validationRules = {
  required: (value, message = 'This field is required') => {
    const isEmpty =
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0);
    return isEmpty ? message : null;
  },

  minLength: (min, message) => value => {
    if (!value) return null; // Don't validate empty values here
    const length = typeof value === 'string' ? value.trim().length : value.toString().length;
    return length < min ? message || `Minimum length is ${min} characters` : null;
  },

  maxLength: (max, message) => value => {
    if (!value) return null;
    const length = typeof value === 'string' ? value.trim().length : value.toString().length;
    return length > max ? message || `Maximum length is ${max} characters` : null;
  },

  email: (value, message = 'Please enter a valid email address') => {
    if (!value) return null;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value.trim()) ? null : message;
  },

  phone: (value, message = 'Please enter a valid phone number') => {
    if (!value) return null;
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(value.trim()) ? null : message;
  },

  number:
    (options = {}, message) =>
    value => {
      if (!value && value !== 0) return null;
      const num = parseFloat(value);
      if (isNaN(num)) {
        return message || 'Please enter a valid number';
      }

      const { min, max, integer = false } = options;

      if (integer && !Number.isInteger(num)) {
        return message || 'Please enter a whole number';
      }

      if (typeof min === 'number' && num < min) {
        return message || `Value must be at least ${min}`;
      }

      if (typeof max === 'number' && num > max) {
        return message || `Value must be no more than ${max}`;
      }

      return null;
    },

  positive: (value, message = 'Value must be positive') => {
    if (!value && value !== 0) return null;
    const num = parseFloat(value);
    return !isNaN(num) && num > 0 ? null : message;
  },

  date:
    (options = {}, message) =>
    value => {
      if (!value) return null;

      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return message || 'Please enter a valid date';
      }

      const { minDate, maxDate, futureOnly, pastOnly } = options;
      const now = new Date();

      if (futureOnly && date <= now) {
        return message || 'Date must be in the future';
      }

      if (pastOnly && date >= now) {
        return message || 'Date must be in the past';
      }

      if (minDate && date < new Date(minDate)) {
        return message || `Date must be after ${new Date(minDate).toLocaleDateString()}`;
      }

      if (maxDate && date > new Date(maxDate)) {
        return message || `Date must be before ${new Date(maxDate).toLocaleDateString()}`;
      }

      return null;
    },

  pattern:
    (regex, message = 'Invalid format') =>
    value => {
      if (!value) return null;
      return regex.test(value) ? null : message;
    },

  oneOf: (allowedValues, message) => value => {
    if (!value) return null;
    return allowedValues.includes(value)
      ? null
      : message || `Value must be one of: ${allowedValues.join(', ')}`;
  },

  custom:
    (validatorFn, message = 'Invalid value') =>
    value => {
      if (!value) return null;
      try {
        const isValid = validatorFn(value);
        return isValid ? null : message;
      } catch (error) {
        return message;
      }
    }
};

// Field validation function
export const validateField = (value, rules = []) => {
  const errors = [];

  for (const rule of rules) {
    const error = typeof rule === 'function' ? rule(value) : rule;
    if (error) {
      errors.push(error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Form validation function
export const validateForm = (formData, schema) => {
  const errors = {};
  const sanitizedData = {};
  let isValid = true;

  // Validate each field according to schema
  Object.keys(schema).forEach(fieldName => {
    const fieldConfig = schema[fieldName];
    const fieldValue = formData[fieldName];

    // Sanitize the value first
    let sanitizedValue = fieldValue;
    if (fieldConfig.sanitize !== false) {
      switch (fieldConfig.type) {
        case 'email':
          sanitizedValue = sanitizeEmail(fieldValue);
          break;
        case 'phone':
          sanitizedValue = sanitizePhone(fieldValue);
          break;
        case 'number':
          sanitizedValue = sanitizeNumber(fieldValue, fieldConfig.numberOptions);
          break;
        case 'text':
        default:
          sanitizedValue = sanitizeText(fieldValue);
          break;
      }
    }

    sanitizedData[fieldName] = sanitizedValue;

    // Validate the sanitized value
    const validation = validateField(sanitizedValue, fieldConfig.rules || []);

    if (!validation.isValid) {
      errors[fieldName] = validation.errors;
      isValid = false;
    }
  });

  return {
    isValid,
    errors,
    sanitizedData
  };
};

// React hook for form validation
export const useFormValidation = (initialValues = {}, schema = {}) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateSingleField = (fieldName, value) => {
    const fieldConfig = schema[fieldName];
    if (!fieldConfig) return { isValid: true, errors: [] };

    return validateField(value, fieldConfig.rules || []);
  };

  const handleChange = fieldName => event => {
    const value = event.target ? event.target.value : event;

    setValues(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Validate field if it has been touched
    if (touched[fieldName]) {
      const validation = validateSingleField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: validation.isValid ? [] : validation.errors
      }));
    }
  };

  const handleBlur = fieldName => () => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    const validation = validateSingleField(fieldName, values[fieldName]);
    setErrors(prev => ({
      ...prev,
      [fieldName]: validation.isValid ? [] : validation.errors
    }));
  };

  const validateAll = () => {
    const validation = validateForm(values, schema);
    setErrors(validation.errors);
    setTouched(
      Object.keys(schema).reduce(
        (acc, key) => ({
          ...acc,
          [key]: true
        }),
        {}
      )
    );
    return validation;
  };

  const reset = (newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  const submit = async onSubmit => {
    setIsSubmitting(true);
    const validation = validateAll();

    if (validation.isValid) {
      try {
        await onSubmit(validation.sanitizedData);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    setIsSubmitting(false);
    return validation;
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    submit,
    setFieldValue: (fieldName, value) => {
      setValues(prev => ({ ...prev, [fieldName]: value }));
    },
    setFieldError: (fieldName, error) => {
      setErrors(prev => ({ ...prev, [fieldName]: [error] }));
    }
  };
};

// Common validation schemas
export const commonSchemas = {
  pond: {
    name: {
      type: 'text',
      rules: [
        validationRules.required(),
        validationRules.minLength(2, 'Pond name must be at least 2 characters'),
        validationRules.maxLength(50, 'Pond name must be less than 50 characters')
      ]
    },
    size: {
      type: 'number',
      numberOptions: { min: 0, decimals: 2 },
      rules: [validationRules.required(), validationRules.positive('Pond size must be positive')]
    },
    depth: {
      type: 'number',
      numberOptions: { min: 0, decimals: 2 },
      rules: [validationRules.required(), validationRules.positive('Pond depth must be positive')]
    }
  },

  feedInput: {
    pondId: {
      type: 'text',
      rules: [validationRules.required('Please select a pond')]
    },
    feedType: {
      type: 'text',
      rules: [validationRules.required('Please select feed type')]
    },
    quantity: {
      type: 'number',
      numberOptions: { min: 0, decimals: 2 },
      rules: [
        validationRules.required(),
        validationRules.positive('Feed quantity must be positive')
      ]
    },
    date: {
      type: 'date',
      rules: [
        validationRules.required(),
        validationRules.date({ pastOnly: true }, 'Feed date cannot be in the future')
      ]
    }
  },

  employee: {
    name: {
      type: 'text',
      rules: [
        validationRules.required(),
        validationRules.minLength(2, 'Name must be at least 2 characters'),
        validationRules.maxLength(100, 'Name must be less than 100 characters')
      ]
    },
    email: {
      type: 'email',
      rules: [validationRules.email()]
    },
    phone: {
      type: 'phone',
      rules: [validationRules.phone()]
    },
    salary: {
      type: 'number',
      numberOptions: { min: 0, decimals: 2 },
      rules: [validationRules.required(), validationRules.positive('Salary must be positive')]
    }
  }
};

export default {
  validationRules,
  validateField,
  validateForm,
  useFormValidation,
  commonSchemas
};
