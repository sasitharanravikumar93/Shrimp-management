/**
 * Enhanced Error Boundary with Debug Integration
 * Provides comprehensive error handling with debug context and recovery options
 */

import {
  ErrorOutline,
  Refresh,
  ExpandMore,
  BugReport,
  Download,
  Visibility,
  VisibilityOff,
  ContentCopy
} from '@mui/icons-material';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import React, { Component } from 'react';

import { ErrorContextEnhancer, debugStore } from '../../../utils/debugUtils';
import logger from '../../../utils/logger';

class EnhancedErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      enhancedError: null,
      showDebugDetails: false,
      showTechnicalDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    const { onError, context = {} } = this.props;

    // Enhance error with debug context
    const enhancedError = ErrorContextEnhancer.enhanceError(error, {
      ...context,
      errorBoundary: true,
      componentStack: errorInfo.componentStack
    });

    this.setState({
      error,
      errorInfo,
      enhancedError
    });

    // Log to our logging system
    logger.error(
      'Error Boundary caught an error',
      {
        errorId: this.state.errorId,
        component: context.component || 'Unknown',
        errorBoundary: true
      },
      enhancedError
    );

    // Call custom error handler
    if (onError) {
      onError(enhancedError, errorInfo, this.state.errorId);
    }

    // Report to external service in production
    if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_ERROR_REPORTING_ENABLED) {
      this.reportToExternalService(enhancedError);
    }
  }

  reportToExternalService = error => {
    // Implement external error reporting (e.g., Sentry, LogRocket, etc.)
    // This is a placeholder for the actual implementation
    console.log('Would report to external service:', error);
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      enhancedError: null,
      showDebugDetails: false,
      showTechnicalDetails: false
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleDownloadDebugData = () => {
    const debugData = {
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      error: {
        name: this.state.error?.name,
        message: this.state.error?.message,
        stack: this.state.error?.stack
      },
      errorInfo: this.state.errorInfo,
      debugContext: this.state.enhancedError?.debugContext,
      userAgent: navigator.userAgent,
      url: window.location.href,
      debugStore: {
        recentLogs: debugStore.getEntries({ limit: 50 }),
        componentStates: Object.fromEntries(debugStore.componentStates),
        renderCounts: Object.fromEntries(debugStore.renderCounts),
        userActions: debugStore.userActions.slice(-10),
        networkCalls: debugStore.networkCalls.slice(-5)
      }
    };

    const blob = new Blob([JSON.stringify(debugData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-debug-${this.state.errorId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  handleCopyErrorId = () => {
    navigator.clipboard.writeText(this.state.errorId);
  };

  toggleDebugDetails = () => {
    this.setState(prev => ({
      showDebugDetails: !prev.showDebugDetails
    }));
  };

  toggleTechnicalDetails = () => {
    this.setState(prev => ({
      showTechnicalDetails: !prev.showTechnicalDetails
    }));
  };

  renderErrorSummary() {
    const { error, errorId, enhancedError } = this.state;
    const debugContext = enhancedError?.debugContext;

    return (
      <Alert severity='error' sx={{ mb: 3, textAlign: 'left' }}>
        <AlertTitle>
          Application Error
          <Chip
            label={`ID: ${errorId}`}
            size='small'
            sx={{ ml: 2 }}
            onClick={this.handleCopyErrorId}
            icon={<ContentCopy fontSize='small' />}
          />
        </AlertTitle>

        <Typography variant='body2' sx={{ mt: 1 }}>
          <strong>Error:</strong> {error?.message || 'Unknown error occurred'}
        </Typography>

        {debugContext?.componentContext?.component && (
          <Typography variant='body2'>
            <strong>Component:</strong> {debugContext.componentContext.component}
          </Typography>
        )}

        <Typography variant='body2'>
          <strong>Time:</strong> {new Date(debugContext?.timestamp || Date.now()).toLocaleString()}
        </Typography>
      </Alert>
    );
  }

  renderRecoveryActions() {
    const { recoveryActions = [] } = this.props;

    return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mb: 3 }}>
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

        {recoveryActions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'outlined'}
            color={action.color || 'secondary'}
            onClick={action.handler}
            startIcon={action.icon}
          >
            {action.label}
          </Button>
        ))}

        {process.env.NODE_ENV === 'development' && (
          <Button
            variant='outlined'
            color='info'
            startIcon={<Download />}
            onClick={this.handleDownloadDebugData}
          >
            Download Debug Data
          </Button>
        )}
      </Box>
    );
  }

  renderDebugDetails() {
    const { enhancedError, showDebugDetails } = this.state;
    const debugContext = enhancedError?.debugContext;

    if (!debugContext || process.env.NODE_ENV !== 'development') {
      return null;
    }

    return (
      <Accordion expanded={showDebugDetails} onChange={this.toggleDebugDetails}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BugReport color='info' />
            Debug Information
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ textAlign: 'left' }}>
            {/* Recent User Actions */}
            {debugContext.recentUserActions?.length > 0 && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Recent User Actions
                </Typography>
                <List dense>
                  {debugContext.recentUserActions.slice(-5).map((action, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${action.data.action} in ${action.component}`}
                        secondary={new Date(action.data.timestamp).toLocaleTimeString()}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {/* Component States */}
            {Object.keys(debugContext.componentStates || {}).length > 0 && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Component States
                </Typography>
                {Object.entries(debugContext.componentStates).map(([component, state]) => (
                  <Box key={component} sx={{ mb: 1 }}>
                    <Typography variant='caption' color='text.secondary'>
                      {component}
                    </Typography>
                    <pre style={{ fontSize: '0.8em', margin: 0, overflow: 'auto' }}>
                      {JSON.stringify(state, null, 2)}
                    </pre>
                  </Box>
                ))}
              </Paper>
            )}

            {/* Render Counts */}
            {Object.keys(debugContext.renderCounts || {}).length > 0 && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Render Counts
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(debugContext.renderCounts).map(([component, count]) => (
                    <Chip
                      key={component}
                      label={`${component}: ${count}`}
                      size='small'
                      variant='outlined'
                    />
                  ))}
                </Box>
              </Paper>
            )}

            {/* Recent Network Calls */}
            {debugContext.recentNetworkCalls?.length > 0 && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Recent Network Calls
                </Typography>
                <List dense>
                  {debugContext.recentNetworkCalls.map((call, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${call.method || 'GET'} ${call.url}`}
                        secondary={
                          <Box>
                            <Typography variant='caption'>
                              Status: {call.status} | Duration: {call.duration?.toFixed(2)}ms
                            </Typography>
                            {call.error && (
                              <Typography variant='caption' color='error' display='block'>
                                Error: {call.error}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  }

  renderTechnicalDetails() {
    const { error, errorInfo, showTechnicalDetails } = this.state;

    if (process.env.NODE_ENV !== 'development') {
      return null;
    }

    return (
      <Accordion expanded={showTechnicalDetails} onChange={this.toggleTechnicalDetails}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant='h6'>Technical Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant='subtitle2' gutterBottom>
              Error Message:
            </Typography>
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
              <Typography variant='body2' component='pre' sx={{ whiteSpace: 'pre-wrap' }}>
                {error?.toString()}
              </Typography>
            </Paper>

            <Typography variant='subtitle2' gutterBottom>
              Component Stack:
            </Typography>
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
              <Typography
                variant='body2'
                component='pre'
                sx={{ whiteSpace: 'pre-wrap', fontSize: '0.8em' }}
              >
                {errorInfo?.componentStack}
              </Typography>
            </Paper>

            <Typography variant='subtitle2' gutterBottom>
              Error Stack:
            </Typography>
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
              <Typography
                variant='body2'
                component='pre'
                sx={{ whiteSpace: 'pre-wrap', fontSize: '0.8em' }}
              >
                {error?.stack}
              </Typography>
            </Paper>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  }

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent, title, message } = this.props;

      // If a custom fallback component is provided, render it
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.enhancedError || this.state.error}
            errorInfo={this.state.errorInfo}
            resetError={this.handleReset}
            refreshPage={this.handleRefresh}
            errorId={this.state.errorId}
          />
        );
      }

      // Default enhanced fallback UI
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
              {title || 'Oops! Something went wrong'}
            </Typography>

            <Typography variant='h6' color='text.secondary' paragraph>
              {message ||
                "We encountered an unexpected error. Don't worry, we're working to fix it."}
            </Typography>

            {this.renderErrorSummary()}
            {this.renderRecoveryActions()}
            {this.renderDebugDetails()}
            {this.renderTechnicalDetails()}

            <Divider sx={{ width: '100%', my: 2 }} />

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

export default EnhancedErrorBoundary;
