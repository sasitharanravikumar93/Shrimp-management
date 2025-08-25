/**
 * Custom hooks for async operations and error handling
 * Extracts common async operation patterns
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook for managing async operations with consistent loading/error states
 * @param {Function} asyncFunction - Async function to execute
 * @param {Object} options - Configuration options
 * @returns {Object} Async operation state and execute function
 */
export const useAsyncOperation = (asyncFunction, options = {}) => {
  const {
    immediate = false,
    dependencies = [],
    onSuccess = null,
    onError = null,
    retryCount = 0,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastExecuted, setLastExecuted] = useState(null);
  const retryTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup function
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const execute = useCallback(
    async (...args) => {
      const attemptOperation = async remainingRetries => {
        if (!isMountedRef.current) return null;

        try {
          setLoading(true);
          setError(null);

          const result = await asyncFunction(...args);

          if (!isMountedRef.current) return null;

          setData(result);
          setLastExecuted(new Date());

          if (onSuccess) {
            onSuccess(result);
          }

          return result;
        } catch (err) {
          if (!isMountedRef.current) return null;

          // Retry logic
          if (remainingRetries > 0) {
            retryTimeoutRef.current = setTimeout(() => {
              attemptOperation(remainingRetries - 1);
            }, retryDelay);
            return null;
          }

          setError(err);

          if (onError) {
            onError(err);
          }

          throw err;
        } finally {
          if (isMountedRef.current) {
            setLoading(false);
          }
        }
      };

      return attemptOperation(retryCount);
    },
    [asyncFunction, retryCount, retryDelay, onSuccess, onError]
  );

  // Auto-execute on mount if immediate flag is set
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setLastExecuted(null);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  const retry = useCallback(() => {
    return execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    lastExecuted,
    execute,
    reset,
    retry,
    isSuccess: !loading && !error && data !== null,
    isError: !loading && error !== null,
    isIdle: !loading && error === null && data === null
  };
};

/**
 * Hook for managing multiple async operations
 * @param {Object} operations - Object with named async operations
 * @param {Object} options - Configuration options
 * @returns {Object} State for all operations and control functions
 */
export const useAsyncOperations = (operations = {}, options = {}) => {
  const [states, setStates] = useState({});

  const updateState = useCallback((operationName, updates) => {
    setStates(prev => ({
      ...prev,
      [operationName]: {
        ...prev[operationName],
        ...updates
      }
    }));
  }, []);

  const executeOperation = useCallback(
    async (operationName, ...args) => {
      const operation = operations[operationName];
      if (!operation) {
        throw new Error(`Operation "${operationName}" not found`);
      }

      updateState(operationName, { loading: true, error: null });

      try {
        const result = await operation(...args);
        updateState(operationName, {
          data: result,
          loading: false,
          lastExecuted: new Date()
        });
        return result;
      } catch (error) {
        updateState(operationName, { error, loading: false });
        throw error;
      }
    },
    [operations, updateState]
  );

  const resetOperation = useCallback(operationName => {
    setStates(prev => ({
      ...prev,
      [operationName]: {
        data: null,
        loading: false,
        error: null,
        lastExecuted: null
      }
    }));
  }, []);

  const resetAll = useCallback(() => {
    setStates({});
  }, []);

  // Create individual operation executors
  const executors = Object.keys(operations).reduce((acc, operationName) => {
    acc[operationName] = (...args) => executeOperation(operationName, ...args);
    return acc;
  }, {});

  // Get state for specific operation
  const getOperationState = useCallback(
    operationName => {
      return (
        states[operationName] || {
          data: null,
          loading: false,
          error: null,
          lastExecuted: null
        }
      );
    },
    [states]
  );

  // Check if any operation is loading
  const anyLoading = Object.values(states).some(state => state.loading);

  return {
    states,
    executors,
    executeOperation,
    resetOperation,
    resetAll,
    getOperationState,
    anyLoading
  };
};

/**
 * Hook for handling API errors with retry and fallback mechanisms
 * @param {Object} options - Configuration options
 * @returns {Object} Error handling utilities
 */
export const useErrorHandler = (options = {}) => {
  const { defaultRetryCount = 3, defaultRetryDelay = 1000, onUnhandledError = null } = options;

  const [errorHistory, setErrorHistory] = useState([]);

  const logError = useCallback(
    (error, context = '') => {
      const errorEntry = {
        id: Date.now(),
        error,
        context,
        timestamp: new Date(),
        retryCount: 0
      };

      setErrorHistory(prev => [errorEntry, ...prev].slice(0, 50)); // Keep last 50 errors

      if (onUnhandledError) {
        onUnhandledError(error, context);
      }
    },
    [onUnhandledError]
  );

  const handleError = useCallback(
    async (error, operation, context = '') => {
      logError(error, context);

      // Determine if error is retryable
      const isRetryable = isRetryableError(error);

      if (isRetryable && operation) {
        // Implement exponential backoff retry
        for (let attempt = 1; attempt <= defaultRetryCount; attempt++) {
          try {
            await new Promise(resolve =>
              setTimeout(resolve, defaultRetryDelay * Math.pow(2, attempt - 1))
            );

            const result = await operation();
            return { success: true, data: result };
          } catch (retryError) {
            if (attempt === defaultRetryCount) {
              logError(retryError, `${context} (final retry attempt)`);
              return { success: false, error: retryError };
            }
          }
        }
      }

      return { success: false, error };
    },
    [defaultRetryCount, defaultRetryDelay, logError]
  );

  const clearErrorHistory = useCallback(() => {
    setErrorHistory([]);
  }, []);

  const getErrorStats = useCallback(() => {
    const now = new Date();
    const lastHour = errorHistory.filter(entry => now - entry.timestamp < 60 * 60 * 1000);

    return {
      total: errorHistory.length,
      lastHour: lastHour.length,
      mostRecent: errorHistory[0] || null
    };
  }, [errorHistory]);

  return {
    handleError,
    logError,
    clearErrorHistory,
    getErrorStats,
    errorHistory: errorHistory.slice(0, 10) // Return only last 10 for UI
  };
};

/**
 * Hook for managing request cancellation
 * @returns {Object} Cancellation utilities
 */
export const useCancellation = () => {
  const abortControllersRef = useRef(new Map());

  useEffect(() => {
    // Cleanup all controllers on unmount
    return () => {
      abortControllersRef.current.forEach(controller => controller.abort());
      abortControllersRef.current.clear();
    };
  }, []);

  const createCancellableRequest = useCallback((requestId, requestFunction) => {
    // Cancel previous request with same ID if exists
    if (abortControllersRef.current.has(requestId)) {
      abortControllersRef.current.get(requestId).abort();
    }

    const controller = new AbortController();
    abortControllersRef.current.set(requestId, controller);

    const cancellablePromise = requestFunction(controller.signal);

    // Clean up controller when request completes
    cancellablePromise.finally(() => {
      abortControllersRef.current.delete(requestId);
    });

    return {
      promise: cancellablePromise,
      cancel: () => {
        controller.abort();
        abortControllersRef.current.delete(requestId);
      }
    };
  }, []);

  const cancelRequest = useCallback(requestId => {
    const controller = abortControllersRef.current.get(requestId);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(requestId);
    }
  }, []);

  const cancelAllRequests = useCallback(() => {
    abortControllersRef.current.forEach(controller => controller.abort());
    abortControllersRef.current.clear();
  }, []);

  return {
    createCancellableRequest,
    cancelRequest,
    cancelAllRequests,
    hasActiveRequests: () => abortControllersRef.current.size > 0
  };
};

// Helper function to determine if an error is retryable
const isRetryableError = error => {
  // Network errors, timeouts, and 5xx server errors are typically retryable
  const retryableStatuses = [408, 429, 500, 502, 503, 504];

  if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
    return true;
  }

  if (error.status && retryableStatuses.includes(error.status)) {
    return true;
  }

  return false;
};
