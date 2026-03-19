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
  Chip,
  AlertProps
} from '@mui/material';
import React from 'react';

import { useErrorHandler } from '../../../../utils/errorHandling';

export interface ErrorDisplayProps extends Omit<AlertProps, 'error' | 'variant'> {
  error: any;
  context?: any;
  showDetails?: boolean;
  displayVariant?: 'standard' | 'minimal' | 'detailed';
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  context = {},
  showDetails: _showDetails = false,
  displayVariant = 'standard',
  onRetry,
  onDismiss,
  className,
  ...props
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = React.useState(false);
  const { handleError } = useErrorHandler();

  const errorInfo = React.useMemo(() => {
    if (!error) return null;
    return handleError(error, { ...context, onRetry });
  }, [error, context, onRetry, handleError]);

  if (!error || !errorInfo) return null;

  const getSeverityIcon = (severity: 'error' | 'warning' | 'info' | 'success') => {
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

  const getActionIcon = (actionName: string) => {
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

  const renderRecoveryActions = () => {
    if (!errorInfo.recoveryActions?.length) return null;

    return (
      <Stack direction='row' spacing={1} sx={{ mt: 2 }}>
        {errorInfo.recoveryActions.map((action: any) => (
          <Button
            key={action.name}
            variant={action.primary ? 'contained' : 'outlined'}
            size='small'
            onClick={() => {
              if (action.action) action.action();
              if (action.name === 'retry' && onRetry) {
                onRetry();
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

  if (displayVariant === 'minimal') {
    return (
      <Alert
        severity={errorInfo.severity as any}
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

  if (displayVariant === 'standard') {
    return (
      <Alert
        severity={errorInfo.severity as any}
        icon={getSeverityIcon(errorInfo.severity as any)}
        onClose={onDismiss}
        className={className}
        {...props}
      >
        <AlertTitle>{errorInfo.title}</AlertTitle>
        <Typography variant='body2' sx={{ mb: 1 }}>
          {errorInfo.message}
        </Typography>

        {errorInfo.errorId && (
          <Chip
            label={`Error ID: ${errorInfo.errorId}`}
            size='small'
            variant='outlined'
            sx={{ mb: 1 }}
          />
        )}

        {renderRecoveryActions()}

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
                  <strong>Error Type:</strong> {errorInfo.classifiedError?.type}
                  <br />
                  <strong>Original Message:</strong> {errorInfo.originalError?.message}
                  <br />
                  <strong>Stack:</strong>
                  <pre style={{ fontSize: '0.75em', overflow: 'auto', maxHeight: '100px' }}>
                    {errorInfo.originalError?.stack}
                  </pre>
                </Typography>
              </Box>
            </Collapse>
          </Box>
        )}
      </Alert>
    );
  }

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
    >
      <Box sx={{ mb: 3 }}>{getSeverityIcon(errorInfo.severity as any)}</Box>

      <Typography variant='h5' component='h2' gutterBottom>
        {errorInfo.title}
      </Typography>

      <Typography variant='body1' color='text.secondary' paragraph>
        {errorInfo.message}
      </Typography>

      {errorInfo.errorId && (
        <Box sx={{ mb: 3 }}>
          <Chip label={`Error ID: ${errorInfo.errorId}`} variant='outlined' />
        </Box>
      )}

      {renderRecoveryActions()}

      <Typography variant='caption' color='text.secondary' sx={{ mt: 3, display: 'block' }}>
        If this problem persists, please contact support with the Error ID above.
      </Typography>
    </Paper>
  );
};

export default ErrorDisplay;
