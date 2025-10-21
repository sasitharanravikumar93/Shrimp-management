import { Refresh, ExpandMore, ExpandLess } from '@mui/icons-material';
import { Box, Typography, Button, Alert, Collapse } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Section Error Boundary Component
 * A smaller error boundary for specific sections or components
 * Displays a compact error message without taking over the entire page
 */
class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorId: null
    };
  }

  static getDerivedStateFromError(_error) {
    return {
      hasError: true,
      errorId: Date.now().toString()
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error details
    if (process.env.NODE_ENV === 'development') {
      console.error('Section Error Boundary caught an error:', {
        section: this.props.section || 'Unknown',
        error,
        errorInfo,
        errorId: this.state.errorId
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorId: null
    });

    // Call optional onReset callback
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  toggleDetails = () => {
    this.setState(prev => ({
      showDetails: !prev.showDetails
    }));
  };

  render() {
    if (this.state.hasError) {
      const { section = 'Section' } = this.props;

      return (
        <Box sx={{ p: 2, border: 1, borderColor: 'error.main', borderRadius: 1 }}>
          <Alert
            severity='error'
            action={
              <Button
                size='small'
                startIcon={<Refresh />}
                onClick={this.handleReset}
                variant='outlined'
                color='error'
              >
                Retry
              </Button>
            }
          >
            <Typography variant='body2' component='div'>
              <strong>Error in {section}</strong>
              <br />
              Something went wrong while loading this section.
            </Typography>
          </Alert>

          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 1 }}>
              <Button
                size='small'
                onClick={this.toggleDetails}
                startIcon={this.state.showDetails ? <ExpandLess /> : <ExpandMore />}
                sx={{ textTransform: 'none' }}
              >
                {this.state.showDetails ? 'Hide' : 'Show'} Error Details
              </Button>

              <Collapse in={this.state.showDetails}>
                <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant='caption' component='div'>
                    <strong>Error ID:</strong> {this.state.errorId}
                    <br />
                    <strong>Error:</strong> {this.state.error?.toString()}
                    <br />
                    <strong>Component Stack:</strong>
                    <pre
                      style={{
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.7em',
                        margin: '4px 0',
                        overflow: 'auto',
                        maxHeight: '200px'
                      }}
                    >
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </Typography>
                </Box>
              </Collapse>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;

SectionErrorBoundary.propTypes = {
  children: PropTypes.node,
  section: PropTypes.string,
  onReset: PropTypes.func
};
