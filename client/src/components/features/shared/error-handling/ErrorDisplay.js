import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  ContactSupport as ContactIcon,
  BugReport as ReportIcon
} from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Collapse,
  IconButton,
  Chip
} from '@mui/material';
import React from 'react';

import { useErrorHandler } from '../../../../utils/errorHandling';

/**
 * Enhanced Error Display Component
 * Shows user-friendly error messages with recovery actions
 */
const ErrorDisplay = ({
  error,
  context = {},
  showDetails = false,
  variant = 'standard', // 'standard', 'minimal', 'detailed'
  onRetry,
  onDismiss,
  className,
  ...props
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = React.useState(false);
  const { handleError } = useErrorHandler();

  // Handle the error to get user-friendly information
  const errorInfo = React.useMemo(() => {
    if (!error) return null;
    return handleError(error, { ...context, onRetry });
  }, [error, context, onRetry, handleError]);

  if (!error || !errorInfo) return null;

  // Get appropriate icon based on severity
  const getSeverityIcon = severity => {
    switch (severity) {
      case 'error':
        return <ErrorIcon color='error' />;
      case 'warning':
        return <WarningIcon color='warning' />;
      case 'info':
        return <InfoIcon color='info' />;
      default:
        return <ErrorIcon color='error' />;
    }
  };

  // Render recovery action buttons
  const renderRecoveryActions = () => {
    if (!errorInfo.recoveryActions?.length) return null;

    return (
      <Stack direction='row' spacing={1} sx={{ mt: 2 }}>
        {errorInfo.recoveryActions.map((action, index) => (
          <Button
            key={action.name}
            variant={action.primary ? 'contained' : 'outlined'}
            size='small'
            onClick={() => {
              action.action?.();
              if (action.name === 'retry') {
                onRetry?.();
              }
            }}
            startIcon={getActionIcon(action.name)}
            color={action.primary ? 'primary' : 'inherit'}
          >
            {action.label}
          </Button>
        ))}
      </Stack>
    );
  };

  // Get icon for action
  const getActionIcon = actionName => {
    switch (actionName) {
      case 'retry':
        return <RefreshIcon />;
      case 'home':
        return <HomeIcon />;
      case 'back':
        return <ArrowBackIcon />;
      case 'contact':
        return <ContactIcon />;
      case 'report':
        return <ReportIcon />;
      default:
        return null;
    }
  };

  // Minimal variant for inline errors
  if (variant === 'minimal') {
    return (
      <Alert
        severity={errorInfo.severity}
        action={
          onRetry && (
            <Button size='small' onClick={onRetry} startIcon={<RefreshIcon />}>
              Retry
            </Button>
          )
        }
        onClose={onDismiss}
        className={className}
        {...props}
      >
        {errorInfo.message}
      </Alert>
    );
  }

  // Standard variant
  if (variant === 'standard') {
    return (
      <Alert
        severity={errorInfo.severity}
        icon={getSeverityIcon(errorInfo.severity)}
        onClose={onDismiss}
        className={className}
        {...props}
      >
        <AlertTitle>{errorInfo.title}</AlertTitle>
        <Typography variant='body2' sx={{ mb: 1 }}>
          {errorInfo.message}
        </Typography>

        {/* Error ID for support */}
        {errorInfo.errorId && (
          <Chip
            label={`Error ID: ${errorInfo.errorId}`}
            size='small'
            variant='outlined'
            sx={{ mb: 1 }}
          />
        )}

        {renderRecoveryActions()}

        {/* Technical details toggle (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 2 }}>
            <Button
              size='small'
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              startIcon={showTechnicalDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ textTransform: 'none' }}
            >
              {showTechnicalDetails ? 'Hide' : 'Show'} Technical Details
            </Button>

            <Collapse in={showTechnicalDetails}>
              <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant='caption' component='div'>
                  <strong>Error Type:</strong> {errorInfo.classifiedError.type}
                  <br />
                  <strong>Original Message:</strong> {errorInfo.originalError.message}
                  <br />
                  <strong>Stack:</strong>
                  <pre style={{ fontSize: '0.75em', overflow: 'auto', maxHeight: '100px' }}>
                    {errorInfo.originalError.stack}
                  </pre>
                </Typography>
              </Box>
            </Collapse>
          </Box>
        )}
      </Alert>
    );
  }

  // Detailed variant for full-page errors
  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 600,
        mx: 'auto',
        mt: 4,
        textAlign: 'center'
      }}
      className={className}
      {...props}
    >
      <Box sx={{ mb: 3 }}>{getSeverityIcon(errorInfo.severity)}</Box>

      <Typography variant='h5' component='h2' gutterBottom>
        {errorInfo.title}
      </Typography>

      <Typography variant='body1' color='text.secondary' paragraph>
        {errorInfo.message}
      </Typography>

      {/* Error ID for support */}
      {errorInfo.errorId && (
        <Box sx={{ mb: 3 }}>
          <Chip label={`Error ID: ${errorInfo.errorId}`} variant='outlined' />
        </Box>
      )}

      {renderRecoveryActions()}

      {/* Additional help text */}
      <Typography variant='caption' color='text.secondary' sx={{ mt: 3, display: 'block' }}>
        If this problem persists, please contact support with the Error ID above.
      </Typography>
    </Paper>
  );
};

/**
 * Error Fallback Component for use with Error Boundaries
 */
export const ErrorFallback = ({ error, resetErrorBoundary, context = {} }) => {
  return (
    <ErrorDisplay
      error={error}
      context={{ ...context, onRetry: resetErrorBoundary }}
      variant='detailed'
    />
  );
};

/**
 * Inline Error Component for form fields and small sections
 */
export const InlineError = ({ error, onRetry, ...props }) => {
  return <ErrorDisplay error={error} onRetry={onRetry} variant='minimal' {...props} />;
};

export default ErrorDisplay;
