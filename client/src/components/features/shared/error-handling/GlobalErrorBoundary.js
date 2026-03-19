import React from 'react';

import GlobalErrorModal from './GlobalErrorModal';

/**
 * Global Error Boundary Component
 * Catches any errors that bubble up and displays a generic error modal
 */
export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for development debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you might want to report this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: reportError(error, errorInfo);
    }
  }

  handleClose = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Sanitize the error to prevent showing raw technical details to users
      const sanitizedError = this.state.error instanceof Error 
        ? new Error('An unexpected error occurred. Please try again or refresh the page.')
        : new Error('An unexpected error occurred. Please try again or refresh the page.');

      // Add technical details only for development
      if (process.env.NODE_ENV === 'development') {
        sanitizedError.originalMessage = this.state.error?.message;
        sanitizedError.stack = this.state.error?.stack;
      }

      // Show the global error modal for any uncaught errors
      return (
        <GlobalErrorModal
          open={true}
          onClose={this.handleClose}
          error={sanitizedError}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Usage example:
 *
 * import { GlobalErrorBoundary } from './components/error-handling/GlobalErrorBoundary';
 *
 * function App() {
 *   return (
 *     <GlobalErrorBoundary>
 *       <YourAppComponents />
 *     </GlobalErrorBoundary>
 *   );
 * }
 */
