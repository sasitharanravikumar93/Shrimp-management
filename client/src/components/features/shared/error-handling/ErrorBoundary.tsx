import { ErrorOutline, Refresh } from '@mui/icons-material';
import { Container, Typography, Button, Box, Alert, AlertTitle } from '@mui/material';
import React, { Component, ReactNode, ErrorInfo } from 'react';

// Type definitions for ErrorBoundary
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
}

export interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
  refreshPage: () => void;
  errorId: string | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of the component tree that crashed
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    this.setState({
      error,
      errorInfo
    });

    const errorId = this.state.errorId || Date.now().toString();

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', {
        error,
        errorInfo,
        errorId
      });
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorId);
    }

    // In production, you would send this to your error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, {
      //   extra: errorInfo,
      //   tags: { errorBoundary: true, errorId }
      // });
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleRefresh = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { fallback: FallbackComponent } = this.props;

      // If a custom fallback component is provided, render it
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            resetError={this.handleReset}
            refreshPage={this.handleRefresh}
            errorId={this.state.errorId}
          />
        );
      }

      // Default fallback UI
      return (
        <Container maxWidth='md' sx={{ mt: 4, mb: 4 }}>
          <Box display='flex' flexDirection='column' alignItems='center' textAlign='center' gap={3}>
            <ErrorOutline
              sx={{
                fontSize: 80,
                color: 'error.main',
                mb: 2
              }}
            />

            <Typography variant='h4' component='h1' gutterBottom>
              Oops! Something went wrong
            </Typography>

            <Typography variant='h6' color='text.secondary' paragraph>
              We encountered an unexpected error. Don't worry, we're working to fix it.
            </Typography>

            <Alert severity='error' sx={{ width: '100%', textAlign: 'left' }}>
              <AlertTitle>Error ID: {this.state.errorId}</AlertTitle>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Typography variant='body2' component='div'>
                  <strong>Error:</strong> {this.state.error.toString()}
                  <br />
                  <strong>Component Stack:</strong>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8em' }}>
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </Typography>
              )}
            </Alert>

            <Box display='flex' gap={2} flexWrap='wrap' justifyContent='center'>
              <Button
                variant='contained'
                color='primary'
                startIcon={<Refresh />}
                onClick={this.handleReset}
                size='large'
              >
                Try Again
              </Button>

              <Button variant='outlined' color='primary' onClick={this.handleRefresh} size='large'>
                Refresh Page
              </Button>
            </Box>

            <Typography variant='body2' color='text.secondary'>
              If this problem persists, please contact support with Error ID: {this.state.errorId}
            </Typography>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>,
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void
) => {
  const WithErrorBoundaryComponent: React.FC<P> = props => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return WithErrorBoundaryComponent;
};

// Hook for handling errors in functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, errorInfo?: any) => {
    // In a real app, you might want to report this error to a service
    console.error('Handled error:', error, errorInfo);

    // You could throw the error to trigger the nearest error boundary
    // throw error;
  }, []);

  return handleError;
};

export default ErrorBoundary;
