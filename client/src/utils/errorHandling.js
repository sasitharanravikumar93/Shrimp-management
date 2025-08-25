/**
 * Enhanced Error Handling Utilities
 * Provides user-friendly error messages and recovery mechanisms
 */

import { useTranslation } from 'react-i18next';

// Error types and their user-friendly messages
export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// Error message mappings
export const getErrorMessage = (error, t) => {
  const errorMessages = {
    [ErrorTypes.NETWORK_ERROR]: {
      title: t('network_error_title', 'Connection Problem'),
      message: t('network_error_message', 'Please check your internet connection and try again.'),
      action: t('retry_action', 'Retry'),
      canRetry: true,
      severity: 'warning'
    },
    [ErrorTypes.API_ERROR]: {
      title: t('api_error_title', 'Service Unavailable'),
      message: t(
        'api_error_message',
        'Our service is temporarily unavailable. Please try again later.'
      ),
      action: t('retry_action', 'Retry'),
      canRetry: true,
      severity: 'error'
    },
    [ErrorTypes.VALIDATION_ERROR]: {
      title: t('validation_error_title', 'Invalid Input'),
      message: t('validation_error_message', 'Please check your input and try again.'),
      action: t('check_input_action', 'Check Input'),
      canRetry: false,
      severity: 'warning'
    },
    [ErrorTypes.AUTHENTICATION_ERROR]: {
      title: t('auth_error_title', 'Authentication Required'),
      message: t('auth_error_message', 'Please log in to continue.'),
      action: t('login_action', 'Log In'),
      canRetry: false,
      severity: 'error'
    },
    [ErrorTypes.PERMISSION_ERROR]: {
      title: t('permission_error_title', 'Access Denied'),
      message: t('permission_error_message', "You don't have permission to perform this action."),
      action: t('contact_admin_action', 'Contact Administrator'),
      canRetry: false,
      severity: 'error'
    },
    [ErrorTypes.NOT_FOUND_ERROR]: {
      title: t('not_found_error_title', 'Not Found'),
      message: t('not_found_error_message', 'The requested resource was not found.'),
      action: t('go_back_action', 'Go Back'),
      canRetry: false,
      severity: 'info'
    },
    [ErrorTypes.SERVER_ERROR]: {
      title: t('server_error_title', 'Server Error'),
      message: t(
        'server_error_message',
        "Something went wrong on our end. We're working to fix it."
      ),
      action: t('retry_later_action', 'Try Again Later'),
      canRetry: true,
      severity: 'error'
    },
    [ErrorTypes.CLIENT_ERROR]: {
      title: t('client_error_title', 'Application Error'),
      message: t('client_error_message', 'Something went wrong. Please refresh the page.'),
      action: t('refresh_action', 'Refresh Page'),
      canRetry: true,
      severity: 'error'
    },
    [ErrorTypes.TIMEOUT_ERROR]: {
      title: t('timeout_error_title', 'Request Timeout'),
      message: t('timeout_error_message', 'The request took too long. Please try again.'),
      action: t('retry_action', 'Retry'),
      canRetry: true,
      severity: 'warning'
    },
    [ErrorTypes.UNKNOWN_ERROR]: {
      title: t('unknown_error_title', 'Unexpected Error'),
      message: t('unknown_error_message', 'An unexpected error occurred. Please try again.'),
      action: t('retry_action', 'Retry'),
      canRetry: true,
      severity: 'error'
    }
  };

  return errorMessages[error.type] || errorMessages[ErrorTypes.UNKNOWN_ERROR];
};

// Classify errors based on status codes and error types
export const classifyError = error => {
  // Network errors
  if (!navigator.onLine) {
    return { ...error, type: ErrorTypes.NETWORK_ERROR };
  }

  // Check if it's a fetch error
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return { ...error, type: ErrorTypes.NETWORK_ERROR };
  }

  // Check HTTP status codes
  if (error.status || error.response?.status) {
    const status = error.status || error.response?.status;

    switch (true) {
      case status === 400:
        return { ...error, type: ErrorTypes.VALIDATION_ERROR };
      case status === 401:
        return { ...error, type: ErrorTypes.AUTHENTICATION_ERROR };
      case status === 403:
        return { ...error, type: ErrorTypes.PERMISSION_ERROR };
      case status === 404:
        return { ...error, type: ErrorTypes.NOT_FOUND_ERROR };
      case status === 408:
        return { ...error, type: ErrorTypes.TIMEOUT_ERROR };
      case status >= 400 && status < 500:
        return { ...error, type: ErrorTypes.CLIENT_ERROR };
      case status >= 500:
        return { ...error, type: ErrorTypes.SERVER_ERROR };
      default:
        return { ...error, type: ErrorTypes.API_ERROR };
    }
  }

  // Check error message content
  const message = error.message?.toLowerCase() || '';

  if (message.includes('timeout') || message.includes('aborted')) {
    return { ...error, type: ErrorTypes.TIMEOUT_ERROR };
  }

  if (message.includes('network') || message.includes('connection')) {
    return { ...error, type: ErrorTypes.NETWORK_ERROR };
  }

  if (message.includes('validation') || message.includes('invalid')) {
    return { ...error, type: ErrorTypes.VALIDATION_ERROR };
  }

  return { ...error, type: ErrorTypes.UNKNOWN_ERROR };
};

// Error recovery mechanisms
export const getRecoveryActions = (errorType, context = {}) => {
  const recoveryActions = {
    [ErrorTypes.NETWORK_ERROR]: [
      {
        name: 'retry',
        label: 'Retry',
        action: () => context.onRetry?.(),
        primary: true
      },
      {
        name: 'refresh',
        label: 'Refresh Page',
        action: () => window.location.reload(),
        primary: false
      }
    ],
    [ErrorTypes.API_ERROR]: [
      {
        name: 'retry',
        label: 'Retry',
        action: () => context.onRetry?.(),
        primary: true
      },
      {
        name: 'home',
        label: 'Go to Dashboard',
        action: () => context.navigate?.('/'),
        primary: false
      }
    ],
    [ErrorTypes.VALIDATION_ERROR]: [
      {
        name: 'edit',
        label: 'Edit Input',
        action: () => context.onEdit?.(),
        primary: true
      },
      {
        name: 'reset',
        label: 'Reset Form',
        action: () => context.onReset?.(),
        primary: false
      }
    ],
    [ErrorTypes.AUTHENTICATION_ERROR]: [
      {
        name: 'login',
        label: 'Log In',
        action: () => context.navigate?.('/login'),
        primary: true
      }
    ],
    [ErrorTypes.PERMISSION_ERROR]: [
      {
        name: 'home',
        label: 'Go to Dashboard',
        action: () => context.navigate?.('/'),
        primary: true
      },
      {
        name: 'contact',
        label: 'Contact Support',
        action: () => context.onContactSupport?.(),
        primary: false
      }
    ],
    [ErrorTypes.NOT_FOUND_ERROR]: [
      {
        name: 'back',
        label: 'Go Back',
        action: () => context.navigate?.(-1),
        primary: true
      },
      {
        name: 'home',
        label: 'Go to Dashboard',
        action: () => context.navigate?.('/'),
        primary: false
      }
    ],
    [ErrorTypes.SERVER_ERROR]: [
      {
        name: 'retry',
        label: 'Try Again',
        action: () => context.onRetry?.(),
        primary: true
      },
      {
        name: 'report',
        label: 'Report Issue',
        action: () => context.onReportIssue?.(),
        primary: false
      }
    ],
    [ErrorTypes.CLIENT_ERROR]: [
      {
        name: 'refresh',
        label: 'Refresh Page',
        action: () => window.location.reload(),
        primary: true
      },
      {
        name: 'home',
        label: 'Go to Dashboard',
        action: () => context.navigate?.('/'),
        primary: false
      }
    ],
    [ErrorTypes.TIMEOUT_ERROR]: [
      {
        name: 'retry',
        label: 'Retry',
        action: () => context.onRetry?.(),
        primary: true
      },
      {
        name: 'cancel',
        label: 'Cancel',
        action: () => context.onCancel?.(),
        primary: false
      }
    ]
  };

  return (
    recoveryActions[errorType] ||
    recoveryActions[ErrorTypes.UNKNOWN_ERROR] || [
      {
        name: 'retry',
        label: 'Retry',
        action: () => context.onRetry?.(),
        primary: true
      }
    ]
  );
};

// React hook for enhanced error handling
export const useErrorHandler = () => {
  const { t } = useTranslation();

  const handleError = (error, context = {}) => {
    // Classify the error
    const classifiedError = classifyError(error);

    // Get user-friendly message
    const errorInfo = getErrorMessage(classifiedError, t);

    // Get recovery actions
    const recoveryActions = getRecoveryActions(classifiedError.type, context);

    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', {
        original: error,
        classified: classifiedError,
        info: errorInfo,
        context
      });
    }

    return {
      ...errorInfo,
      originalError: error,
      classifiedError,
      recoveryActions,
      errorId: Date.now().toString()
    };
  };

  return { handleError };
};

// Centralized error reporting
export const reportError = (error, context = {}) => {
  // In production, send to error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error reporting service
    // errorReportingService.captureException(error, context);
  }

  // For now, just log
  console.error('Error reported:', { error, context });
};

export default {
  ErrorTypes,
  getErrorMessage,
  classifyError,
  getRecoveryActions,
  useErrorHandler,
  reportError
};
