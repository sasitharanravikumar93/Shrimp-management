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

  // Clone the error to avoid modifying the original
  const sanitizedError = new Error(error.message);

  // Keep useful stack trace for development debugging
  if (process.env.NODE_ENV === 'development') {
    sanitizedError.stack = error.stack;
  }

  const message = error.message?.toLowerCase() || '';

  // Map technical errors to user-friendly messages
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('failed to fetch') ||
    message.includes('offline')
  ) {
    sanitizedError.message =
      'Unable to connect to the server. Please check your internet connection and try again.';
  } else if (message.includes('timeout')) {
    sanitizedError.message = 'The request timed out. Please try again.';
  } else if (
    message.includes('unauthorized') ||
    message.includes('401') ||
    message.includes('authentication') ||
    message.includes('login')
  ) {
    sanitizedError.message = 'Your session has expired. Please log in again.';
  } else if (
    message.includes('forbidden') ||
    message.includes('403') ||
    message.includes('access denied')
  ) {
    sanitizedError.message = 'You do not have permission to perform this action.';
  } else if (message.includes('not found') || message.includes('404')) {
    sanitizedError.message = 'The requested information could not be found.';
  } else if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('format') ||
    message.includes('required')
  ) {
    sanitizedError.message =
      'Some information you entered is not correct. Please check and try again.';
  } else if (
    message.includes('conflict') ||
    message.includes('409') ||
    message.includes('already exists') ||
    message.includes('duplicate')
  ) {
    sanitizedError.message =
      'This action would create a duplicate entry. Please use different information.';
  } else if (
    message.includes('server') ||
    message.includes('internal') ||
    message.includes('500') ||
    message.includes('unexpected')
  ) {
    sanitizedError.message =
      'A temporary server issue occurred. Please try again in a few minutes.';
  } else if (
    message.includes('quota') ||
    message.includes('limit') ||
    message.includes('too many requests')
  ) {
    sanitizedError.message = 'Too many requests. Please wait a moment and try again.';
  } else if (message.includes('file') && message.includes('size')) {
    sanitizedError.message = 'The file you selected is too large. Please choose a smaller file.';
  } else {
    // Default generic message for any other error
    sanitizedError.message =
      'Something went wrong. Please try again or contact support if the problem continues.';
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
            showError(errorArg);
          } else if (typeof errorArg === 'string' && errorArg.includes('Error')) {
            showError(new Error(errorArg));
          } else if (
            typeof errorArg === 'string' &&
            (errorArg.toLowerCase().includes('error') ||
              errorArg.toLowerCase().includes('failed') ||
              errorArg.toLowerCase().includes('exception') ||
              errorArg.toLowerCase().includes('network') ||
              errorArg.toLowerCase().includes('connection') ||
              errorArg.toLowerCase().includes('timeout'))
          ) {
            showError(new Error(errorArg));
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
