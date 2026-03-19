/**
 * Custom hooks for common UI patterns
 * Extracts reusable logic to reduce code duplication
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Hook for managing modal states (open/close/reset)
 * @param {Function} onReset - Optional callback when modal closes/resets
 * @returns {Object} Modal state and control functions
 */
export const useModal = (onReset = null) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);

  const open = useCallback((initialData = null) => {
    setData(initialData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
    if (onReset) {
      onReset();
    }
  }, [onReset]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Auto-cleanup when component unmounts
  useEffect(() => {
    return () => {
      setIsOpen(false);
      setData(null);
    };
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle
  };
};

/**
 * Hook for managing form states with validation
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Form submission handler
 * @param {Function} validate - Optional validation function
 * @returns {Object} Form state and handlers
 */
export const useFormState = (initialValues = {}, onSubmit = null, validate = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const setValue = useCallback(
    (name, value) => {
      setValues(prev => ({ ...prev, [name]: value }));

      // Clear error for this field if it exists
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    },
    [errors]
  );

  const handleChange = useCallback(
    e => {
      const { name, value, type, checked } = e.target;
      const newValue = type === 'checkbox' ? checked : value;
      setValue(name, newValue);
    },
    [setValue]
  );

  const handleBlur = useCallback(
    e => {
      const { name } = e.target;
      setTouched(prev => ({ ...prev, [name]: true }));

      // Validate field if validation function provided
      if (validate && touched[name]) {
        const fieldErrors = validate({ [name]: values[name] });
        if (fieldErrors[name]) {
          setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
        }
      }
    },
    [validate, touched, values]
  );

  const reset = useCallback(
    (newValues = initialValues) => {
      setValues(newValues);
      setErrors({});
      setTouched({});
      setSubmitError(null);
      setIsSubmitting(false);
    },
    [initialValues]
  );

  const handleSubmit = useCallback(
    async e => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        // Validate all fields if validator provided
        if (validate) {
          const validationErrors = validate(values);
          if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSubmitting(false);
            return false;
          }
        }

        if (onSubmit) {
          const result = await onSubmit(values);
          setIsSubmitting(false);
          return result;
        }

        setIsSubmitting(false);
        return true;
      } catch (error) {
        setSubmitError(error);
        setIsSubmitting(false);
        return false;
      }
    },
    [values, validate, onSubmit]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setError: (name, error) => setErrors(prev => ({ ...prev, [name]: error })),
    clearError: name => setErrors(prev => ({ ...prev, [name]: null })),
    clearSubmitError: () => setSubmitError(null)
  };
};

/**
 * Hook for managing confirmation dialogs
 * @returns {Object} Confirmation state and handlers
 */
export const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  });

  const confirm = useCallback(options => {
    setConfig({
      title: options.title || 'Confirm Action',
      message: options.message || 'Are you sure?',
      onConfirm: options.onConfirm || (() => {}),
      onCancel: options.onCancel || (() => {})
    });
    setIsOpen(true);
  }, []);

  const handleConfirm = useCallback(() => {
    if (config.onConfirm) {
      config.onConfirm();
    }
    setIsOpen(false);
  }, [config]);

  const handleCancel = useCallback(() => {
    if (config.onCancel) {
      config.onCancel();
    }
    setIsOpen(false);
  }, [config]);

  return {
    isOpen,
    config,
    confirm,
    handleConfirm,
    handleCancel
  };
};

/**
 * Hook for managing toggle states (boolean flags)
 * @param {boolean} initialValue - Initial toggle state
 * @returns {Array} [value, toggle, setTrue, setFalse]
 */
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(prev => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, toggle, setTrue, setFalse];
};

/**
 * Hook for managing local storage state
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {Array} [value, setValue]
 */
export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback(
    newValue => {
      try {
        setValue(newValue);
        if (newValue === undefined) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [value, setStoredValue];
};
