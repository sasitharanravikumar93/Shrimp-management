import React, { createContext, useContext, useState, useCallback } from 'react';

import GlobalErrorModal from './GlobalErrorModal';

/**
 * Global Error Context
 * Manages global error state and modal visibility
 */
const GlobalErrorContext = createContext({
  showError: () => {},
  hideError: () => {},
  isErrorModalOpen: false
});

/**
 * Custom hook to use global error context
 */
export const useGlobalError = () => {
  const context = useContext(GlobalErrorContext);
  if (!context) {
    throw new Error('useGlobalError must be used within a GlobalErrorProvider');
  }
  return context;
};

/**
 * Global Error Provider Component
 * Provides global error handling context to the app
 */
/**
 * Sanitizes error messages to show generic, user-friendly messages
 * instead of technical details that could confuse users or leak information
 */
const sanitizeErrorForUser = error => {
  if (!error) {
    return new Error('An unexpected error occurred. Please try again later.');
  }

  // Always return a generic error message to prevent technical details from being shown to users
  const sanitizedError = new Error('An unexpected error occurred. Please try again or refresh the page.');

  // Keep useful original error for development debugging only
  if (process.env.NODE_ENV === 'development') {
    sanitizedError.originalMessage = error.message;
    sanitizedError.stack = error.stack;
  }

  return sanitizedError;
};

export const GlobalErrorProvider = ({ children, showDetails = false }) => {
  const [errorModalState, setErrorModalState] = useState({
    open: false,
    error: null,
    retryCount: 0,
    lastErrorTime: null
  });

  const showError = useCallback(
    (error, maxRetries = 3) => {
      const now = Date.now();
      const timeSinceLastError = errorModalState.lastErrorTime
        ? now - errorModalState.lastErrorTime
        : Infinity;

      // Prevent error spam - don't show modal more than once every 2 seconds
      if (timeSinceLastError < 2000 && errorModalState.open) {
        return;
      }

      // Log error for debugging
      console.error('Global error caught:', error);

      // Don't show modal for development errors unless explicitly enabled
      if (process.env.NODE_ENV === 'development' && !window.__DEV_ERROR_MODAL__) {
        // In development, only log errors without showing modal
        return;
      }

      // Sanitize error message to always show generic message to users
      const sanitizedError = sanitizeErrorForUser(error);

      setErrorModalState(prev => ({
        ...prev,
        open: true,
        error: sanitizedError,
        lastErrorTime: now
      }));
    },
    [errorModalState]
  );

  const hideError = useCallback(() => {
    setErrorModalState(prev => ({
      ...prev,
      open: false,
      error: null
    }));
  }, []);

  // Register the showError function globally for use by error handlers
  React.useEffect(() => {
    window.__GLOBAL_ERROR_HANDLER__ = { showError, hideError };

    // Also register on window object with a simpler name
    window.showGlobalError = showError;
    window.hideGlobalError = hideError;

    // Register hideGlobalError as well
    window.hideGlobalError = hideError;

    return () => {
      delete window.__GLOBAL_ERROR_HANDLER__;
      delete window.showGlobalError;
      delete window.hideGlobalError;
    };
  }, [showError, hideError]);

  const contextValue = {
    showError,
    hideError,
    isErrorModalOpen: errorModalState.open
  };

  return (
    <GlobalErrorContext.Provider value={contextValue}>
      {children}
      <GlobalErrorModal
        open={errorModalState.open}
        onClose={hideError}
        error={errorModalState.error}
        showDetails={showDetails}
      />
    </GlobalErrorContext.Provider>
  );
};

/**
 * Higher-order component to wrap components with global error handling
 */
export const withGlobalErrorHandling = (Component, options = {}) => {
  const WrappedComponent = props => {
    const { showError } = useGlobalError();

    // Override console.error in production to capture additional errors
    React.useEffect(() => {
      if (process.env.NODE_ENV === 'production') {
        const originalConsoleError = console.error;

        console.error = (...args) => {
          // Call original console.error for logging
          originalConsoleError(...args);

          // Check if this looks like an error (has Error object or error-like string)
          const errorArg = args.find(arg => arg instanceof Error || arg?.message || arg?.stack);

          if (errorArg instanceof Error) {
            // Sanitize error before showing
            const sanitizedError = new Error('An unexpected error occurred. Please try again or refresh the page.');
            showError(sanitizedError);
          } else if (typeof errorArg === 'string' && errorArg.includes('Error')) {
            // Show generic message instead of the actual error
            const sanitizedError = new Error('An unexpected error occurred. Please try again or refresh the page.');
            showError(sanitizedError);
          } else if (
            typeof errorArg === 'string' &&
            (errorArg.toLowerCase().includes('error') ||
              errorArg.toLowerCase().includes('failed') ||
              errorArg.toLowerCase().includes('exception') ||
              errorArg.toLowerCase().includes('network') ||
              errorArg.toLowerCase().includes('connection') ||
              errorArg.toLowerCase().includes('timeout'))
          ) {
            // Show generic message instead of the actual error
            const sanitizedError = new Error('An unexpected error occurred. Please try again or refresh the page.');
            showError(sanitizedError);
          }
        };

        return () => {
          console.error = originalConsoleError;
        };
      }
    }, [showError]);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withGlobalErrorHandling(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
};

export default GlobalErrorProvider;
