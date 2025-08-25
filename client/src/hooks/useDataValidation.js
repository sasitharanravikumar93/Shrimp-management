/**
 * React Hooks for Data Validation
 *
 * This module provides React hooks that integrate data validation seamlessly
 * with components, forms, and API calls. It ensures data integrity throughout
 * the application lifecycle.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

import {
  DataValidator,
  ValidationError,
  Schemas,
  validateApiResponse,
  validateFormData,
  createValidationMiddleware,
  BulkValidator
} from '../utils/dataValidation';

/**
 * Hook for form validation with real-time feedback
 * Provides comprehensive form validation with error handling
 */
export const useFormValidation = (schemaName, initialValues = {}, options = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    sanitizeOnChange = true,
    showWarnings = true,
    debounceMs = 300
  } = options;

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const debounceTimeoutRef = useRef(null);
  const validatorRef = useRef(
    new DataValidator({
      strict: true,
      coerceTypes: true,
      sanitizeStrings: sanitizeOnChange,
      allowUnknownFields: false
    })
  );

  const schema = useMemo(() => Schemas[schemaName], [schemaName]);

  // Validate a single field
  const validateField = useCallback(
    (fieldName, value) => {
      if (!schema?.properties?.[fieldName]) {
        return { isValid: true, errors: [], warnings: [] };
      }

      const fieldSchema = schema.properties[fieldName];
      const result = validatorRef.current.validate(value, fieldSchema, fieldName);

      return {
        isValid: result.isValid,
        errors: result.errors.map(e => e.message),
        warnings: result.warnings.map(w => w.message),
        sanitizedValue: result.data
      };
    },
    [schema]
  );

  // Validate all fields
  const validateAll = useCallback(() => {
    if (!schema) {
      return { isValid: true, errors: {}, warnings: {} };
    }

    const result = validatorRef.current.validate(values, schema);

    const fieldErrors = {};
    const fieldWarnings = {};

    result.errors.forEach(error => {
      const field = error.path || 'general';
      if (!fieldErrors[field]) fieldErrors[field] = [];
      fieldErrors[field].push(error.message);
    });

    result.warnings.forEach(warning => {
      const field = warning.path || 'general';
      if (!fieldWarnings[field]) fieldWarnings[field] = [];
      fieldWarnings[field].push(warning.message);
    });

    return {
      isValid: result.isValid,
      errors: fieldErrors,
      warnings: fieldWarnings,
      sanitizedData: result.data
    };
  }, [values, schema]);

  // Handle field changes with validation
  const handleChange = useCallback(
    fieldName => event => {
      const value = event.target ? event.target.value : event;

      setValues(prev => ({ ...prev, [fieldName]: value }));
      setSubmitError(null);

      if (validateOnChange && touched[fieldName]) {
        // Debounce validation for performance
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
          const validation = validateField(fieldName, value);

          setErrors(prev => ({
            ...prev,
            [fieldName]: validation.errors
          }));

          if (showWarnings) {
            setWarnings(prev => ({
              ...prev,
              [fieldName]: validation.warnings
            }));
          }

          // Update value with sanitized version if different
          if (sanitizeOnChange && validation.sanitizedValue !== value) {
            setValues(prevValues => ({
              ...prevValues,
              [fieldName]: validation.sanitizedValue
            }));
          }
        }, debounceMs);
      }
    },
    [validateOnChange, touched, validateField, showWarnings, sanitizeOnChange, debounceMs]
  );

  // Handle field blur with validation
  const handleBlur = useCallback(
    fieldName => () => {
      setTouched(prev => ({ ...prev, [fieldName]: true }));

      if (validateOnBlur) {
        const validation = validateField(fieldName, values[fieldName]);

        setErrors(prev => ({
          ...prev,
          [fieldName]: validation.errors
        }));

        if (showWarnings) {
          setWarnings(prev => ({
            ...prev,
            [fieldName]: validation.warnings
          }));
        }
      }
    },
    [validateOnBlur, values, validateField, showWarnings]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async onSubmit => {
      if (!onSubmit) return false;

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const validation = validateAll();

        if (!validation.isValid) {
          setErrors(validation.errors);
          if (showWarnings) {
            setWarnings(validation.warnings);
          }

          // Mark all fields as touched to show errors
          const allTouched = Object.keys(schema?.properties || {}).reduce((acc, key) => {
            acc[key] = true;
            return acc;
          }, {});
          setTouched(allTouched);

          setIsSubmitting(false);
          return false;
        }

        const result = await onSubmit(validation.sanitizedData);
        setIsSubmitting(false);
        return result;
      } catch (error) {
        setSubmitError(error);
        setIsSubmitting(false);
        return false;
      }
    },
    [validateAll, showWarnings, schema]
  );

  // Reset form
  const reset = useCallback(
    (newValues = initialValues) => {
      setValues(newValues);
      setErrors({});
      setWarnings({});
      setTouched({});
      setSubmitError(null);
      setIsSubmitting(false);
    },
    [initialValues]
  );

  // Set field value programmatically
  const setValue = useCallback(
    (fieldName, value) => {
      setValues(prev => ({ ...prev, [fieldName]: value }));

      if (validateOnChange && touched[fieldName]) {
        const validation = validateField(fieldName, value);
        setErrors(prev => ({ ...prev, [fieldName]: validation.errors }));
        if (showWarnings) {
          setWarnings(prev => ({ ...prev, [fieldName]: validation.warnings }));
        }
      }
    },
    [validateOnChange, touched, validateField, showWarnings]
  );

  // Get field props for easy binding
  const getFieldProps = useCallback(
    fieldName => ({
      value: values[fieldName] || '',
      onChange: handleChange(fieldName),
      onBlur: handleBlur(fieldName),
      error: touched[fieldName] && errors[fieldName]?.length > 0,
      helperText: touched[fieldName]
        ? errors[fieldName]?.[0] || (showWarnings && warnings[fieldName]?.[0])
        : undefined
    }),
    [values, handleChange, handleBlur, touched, errors, warnings, showWarnings]
  );

  // Cleanup debounce timeout
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    values,
    errors,
    warnings,
    touched,
    isSubmitting,
    submitError,
    isValid: Object.keys(errors).every(key => !errors[key]?.length),
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValue,
    getFieldProps,
    validateField,
    validateAll
  };
};

/**
 * Hook for API data validation
 * Validates API responses and provides error handling
 */
export const useApiValidation = (schemaName, options = {}) => {
  const { throwOnError = false, logErrors = true, enableCaching = true } = options;

  const [validationCache] = useState(new Map());

  const validator = useMemo(
    () => createValidationMiddleware(schemaName, { throwOnError, logErrors }),
    [schemaName, throwOnError, logErrors]
  );

  const validate = useCallback(
    data => {
      if (!data) return { isValid: false, data: null, errors: ['No data provided'] };

      const cacheKey = enableCaching ? JSON.stringify(data) : null;

      if (enableCaching && cacheKey && validationCache.has(cacheKey)) {
        return validationCache.get(cacheKey);
      }

      const result = validator(data);

      if (enableCaching && cacheKey) {
        validationCache.set(cacheKey, result);

        // Limit cache size
        if (validationCache.size > 100) {
          const firstKey = validationCache.keys().next().value;
          validationCache.delete(firstKey);
        }
      }

      return result;
    },
    [validator, enableCaching, validationCache]
  );

  const clearCache = useCallback(() => {
    validationCache.clear();
  }, [validationCache]);

  return { validate, clearCache };
};

/**
 * Hook for bulk data validation
 * Efficiently validates large datasets
 */
export const useBulkValidation = (schemaName, options = {}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const bulkValidatorRef = useRef(null);

  // Initialize bulk validator
  useEffect(() => {
    bulkValidatorRef.current = new BulkValidator(schemaName, options);
  }, [schemaName, options]);

  const validateBatch = useCallback(async (dataArray, batchSize = 100) => {
    if (!dataArray?.length) {
      setResults({ validItems: [], invalidItems: [], totalErrors: 0, totalWarnings: 0 });
      return;
    }

    setIsValidating(true);
    setProgress(0);

    try {
      const totalBatches = Math.ceil(dataArray.length / batchSize);
      const allResults = [];

      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, dataArray.length);
        const batch = dataArray.slice(start, end);

        const batchResult = bulkValidatorRef.current.validateBatch(batch);
        allResults.push(batchResult);

        setProgress(((i + 1) / totalBatches) * 100);

        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      // Combine all results
      const combinedResults = {
        validItems: allResults.flatMap(r => r.validItems),
        invalidItems: allResults.flatMap(r => r.invalidItems),
        totalErrors: allResults.reduce((sum, r) => sum + r.totalErrors, 0),
        totalWarnings: allResults.reduce((sum, r) => sum + r.totalWarnings, 0)
      };

      setResults(combinedResults);
      return combinedResults;
    } finally {
      setIsValidating(false);
      setProgress(100);
    }
  }, []);

  const reset = useCallback(() => {
    setResults(null);
    setProgress(0);
    setIsValidating(false);
  }, []);

  return {
    validateBatch,
    isValidating,
    progress,
    results,
    reset,
    hasResults: !!results,
    validCount: results?.validItems?.length || 0,
    invalidCount: results?.invalidItems?.length || 0,
    errorCount: results?.totalErrors || 0,
    warningCount: results?.totalWarnings || 0
  };
};

/**
 * Hook for real-time data validation
 * Validates data as it changes in real-time
 */
export const useRealtimeValidation = (data, schemaName, options = {}) => {
  const { debounceMs = 500, enableWarnings = true } = options;

  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const debounceTimeoutRef = useRef(null);
  const { validate } = useApiValidation(schemaName, {
    throwOnError: false,
    logErrors: false
  });

  // Validate data with debouncing
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (!data) {
      setValidationResult(null);
      return;
    }

    setIsValidating(true);

    debounceTimeoutRef.current = setTimeout(() => {
      try {
        const result = validate(data);
        setValidationResult(result);
      } catch (error) {
        setValidationResult({
          isValid: false,
          errors: [error.message],
          warnings: []
        });
      } finally {
        setIsValidating(false);
      }
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [data, validate, debounceMs]);

  return {
    isValid: validationResult?.isValid ?? null,
    errors: validationResult?.errors || [],
    warnings: enableWarnings ? validationResult?.warnings || [] : [],
    isValidating,
    validatedData: validationResult?.data,
    hasResult: validationResult !== null
  };
};

/**
 * Hook for validation state management
 * Provides centralized validation state for complex forms
 */
export const useValidationState = () => {
  const [validationStates, setValidationStates] = useState({});

  const registerField = useCallback((fieldName, initialState = {}) => {
    setValidationStates(prev => ({
      ...prev,
      [fieldName]: {
        isValid: true,
        errors: [],
        warnings: [],
        ...initialState
      }
    }));
  }, []);

  const updateFieldValidation = useCallback((fieldName, validation) => {
    setValidationStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        ...validation
      }
    }));
  }, []);

  const unregisterField = useCallback(fieldName => {
    setValidationStates(prev => {
      const newState = { ...prev };
      delete newState[fieldName];
      return newState;
    });
  }, []);

  const clearAll = useCallback(() => {
    setValidationStates({});
  }, []);

  const isFormValid = useMemo(() => {
    return Object.values(validationStates).every(state => state.isValid);
  }, [validationStates]);

  const getAllErrors = useMemo(() => {
    return Object.entries(validationStates).reduce((acc, [field, state]) => {
      if (state.errors.length > 0) {
        acc[field] = state.errors;
      }
      return acc;
    }, {});
  }, [validationStates]);

  const getAllWarnings = useMemo(() => {
    return Object.entries(validationStates).reduce((acc, [field, state]) => {
      if (state.warnings.length > 0) {
        acc[field] = state.warnings;
      }
      return acc;
    }, {});
  }, [validationStates]);

  return {
    validationStates,
    registerField,
    updateFieldValidation,
    unregisterField,
    clearAll,
    isFormValid,
    getAllErrors,
    getAllWarnings,
    errorCount: Object.values(getAllErrors).flat().length,
    warningCount: Object.values(getAllWarnings).flat().length
  };
};

export default {
  useFormValidation,
  useApiValidation,
  useBulkValidation,
  useRealtimeValidation,
  useValidationState
};
