import { ErrorOutline, Refresh } from '@mui/icons-material';
import { Container, Typography, Button, Box, Alert, AlertTitle } from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of the component tree that crashed
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString()
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', {
        error,
        errorInfo,
        errorId: this.state.errorId
      });
    }

    // In production, you would send this to your error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, {
      //   extra: errorInfo,
      //   tags: { errorBoundary: true, errorId: this.state.errorId }
      // });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
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
              We encountered an unexpected error. Don&apos;t worry, we&apos;re working to fix it.
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

export default ErrorBoundary;

// Add PropTypes validation
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.elementType
};
