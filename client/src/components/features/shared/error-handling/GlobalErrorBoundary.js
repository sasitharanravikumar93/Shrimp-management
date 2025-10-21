import React from 'react';

import GlobalErrorModal from './GlobalErrorModal';

/**
 * Global Error Boundary Component
 * Catches any errors that bubble up and displays a generic error modal
 */
export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for development debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // In production, you might want to report this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: reportError(error, errorInfo);
    }
  }

  handleClose = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Show the global error modal for any uncaught errors
      return (
        <GlobalErrorModal
          open={true}
          onClose={this.handleClose}
          error={this.state.error}
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
