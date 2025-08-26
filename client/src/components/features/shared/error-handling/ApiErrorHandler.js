import ErrorIcon from '@mui/icons-material/Error';
import HomeIcon from '@mui/icons-material/Home';
import NetworkIcon from '@mui/icons-material/NetworkCheck';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import {
  Box,
  Alert,
  AlertTitle,
  Button,
  Typography,
  Stack,
  Collapse,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { API } from '../../../../constants';
import logger from '../../../../utils/logger';
import { safeExecute, safeNavigateHome } from '../../../../utils/safeNavigation';

const MAX_RETRIES = API.MAX_RETRIES;

const HTTP_STATUS_BAD_REQUEST = API.STATUS.BAD_REQUEST;
const HTTP_STATUS_UNAUTHORIZED = API.STATUS.UNAUTHORIZED;
const HTTP_STATUS_FORBIDDEN = API.STATUS.FORBIDDEN;
const HTTP_STATUS_NOT_FOUND = API.STATUS.NOT_FOUND;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = API.STATUS.INTERNAL_SERVER_ERROR;
const HTTP_STATUS_REQUEST_TIMEOUT = 408;
const HTTP_STATUS_TOO_MANY_REQUESTS = 429;
const HTTP_STATUS_BAD_GATEWAY = 502;
const HTTP_STATUS_SERVICE_UNAVAILABLE = 503;

const ApiErrorHandler = ({
  error,
  onRetry,
  onGoHome,
  showRetry = true,
  showDetails = false,
  variant = 'card',
  maxRetries = MAX_RETRIES,
  retryCount = 0
}) => {
  const { t } = useTranslation();
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  if (!error) return null;

  // Safe handler for retry actions
  const handleSafeRetry = () => {
    safeExecute(
      () => onRetry(),
      () => {
        logger.warn('Retry function not available or failed');
        // Show user that retry failed
        alert(t('retry_failed', 'Retry failed. Please refresh the page.'));
      },
      'API retry failed'
    );
  };

  // Safe handler for navigation actions
  const handleSafeGoHome = () => {
    safeExecute(
      () => onGoHome(),
      () => safeNavigateHome(),
      'API error navigation failed'
    );
  };

  const getErrorSeverity = () => {
    const status = error.status || error.response?.status;

    if (status >= HTTP_STATUS_INTERNAL_SERVER_ERROR) return 'error';
    if (status >= HTTP_STATUS_BAD_REQUEST) return 'warning';
    if (error.type === 'NETWORK_ERROR') return 'warning';
    return 'error';
  };

  const getErrorIcon = () => {
    const status = error.status || error.response?.status;
    const type = error.type;

    if (type === 'NETWORK_ERROR' || !navigator.onLine) {
      return <NetworkIcon />;
    }

    if (status >= HTTP_STATUS_INTERNAL_SERVER_ERROR) {
      return <ErrorIcon />;
    }

    return <WarningIcon />;
  };

  const getErrorTitle = () => {
    const status = error.status || error.response?.status;
    const type = error.type;

    if (type === 'NETWORK_ERROR' || !navigator.onLine) {
      return t('api_error_network_title', 'Connection Problem');
    }

    switch (status) {
      case HTTP_STATUS_BAD_REQUEST:
        return t('api_error_400_title', 'Invalid Request');
      case HTTP_STATUS_UNAUTHORIZED:
        return t('api_error_401_title', 'Authentication Required');
      case HTTP_STATUS_FORBIDDEN:
        return t('api_error_403_title', 'Access Denied');
      case HTTP_STATUS_NOT_FOUND:
        return t('api_error_404_title', 'Not Found');
      case HTTP_STATUS_REQUEST_TIMEOUT:
        return t('api_error_408_title', 'Request Timeout');
      case HTTP_STATUS_TOO_MANY_REQUESTS:
        return t('api_error_429_title', 'Too Many Requests');
      case HTTP_STATUS_INTERNAL_SERVER_ERROR:
        return t('api_error_500_title', 'Server Error');
      case HTTP_STATUS_BAD_GATEWAY:
        return t('api_error_502_title', 'Bad Gateway');
      case HTTP_STATUS_SERVICE_UNAVAILABLE:
        return t('api_error_503_title', 'Service Unavailable');
      default:
        return t('api_error_generic_title', 'Something went wrong');
    }
  };

  const getErrorMessage = () => {
    const status = error.status || error.response?.status;
    const type = error.type;

    if (type === 'NETWORK_ERROR' || !navigator.onLine) {
      return t('api_error_network_message', 'Please check your internet connection and try again.');
    }

    switch (status) {
      case HTTP_STATUS_BAD_REQUEST:
        return t(
          'api_error_400_message',
          'The request was invalid. Please check your input and try again.'
        );
      case HTTP_STATUS_UNAUTHORIZED:
        return t('api_error_401_message', 'Please log in to continue.');
      case HTTP_STATUS_FORBIDDEN:
        return t('api_error_403_message', "You don't have permission to perform this action.");
      case HTTP_STATUS_NOT_FOUND:
        return t('api_error_404_message', 'The requested resource was not found.');
      case HTTP_STATUS_REQUEST_TIMEOUT:
        return t('api_error_408_message', 'The request took too long. Please try again.');
      case HTTP_STATUS_TOO_MANY_REQUESTS:
        return t('api_error_429_message', 'Too many requests. Please wait a moment and try again.');
      case HTTP_STATUS_INTERNAL_SERVER_ERROR:
        return t(
          'api_error_500_message',
          "There's a problem with our server. We're working to fix it."
        );
      case HTTP_STATUS_BAD_GATEWAY:
        return t(
          'api_error_502_message',
          "There's a problem connecting to our service. Please try again."
        );
      case HTTP_STATUS_SERVICE_UNAVAILABLE:
        return t(
          'api_error_503_message',
          'Our service is temporarily unavailable. Please try again later.'
        );
      default:
        return (
          error.message ||
          t('api_error_generic_message', 'An unexpected error occurred. Please try again.')
        );
    }
  };

  const canRetry = () => {
    const status = error.status || error.response?.status;
    const type = error.type;

    // Don't retry client errors (4xx) except for timeout and network issues
    if (
      status >= HTTP_STATUS_BAD_REQUEST &&
      status < HTTP_STATUS_INTERNAL_SERVER_ERROR &&
      status !== HTTP_STATUS_REQUEST_TIMEOUT &&
      type !== 'NETWORK_ERROR'
    ) {
      return false;
    }

    return retryCount < maxRetries && showRetry && onRetry;
  };

  const handleToggleDetails = () => {
    setShowErrorDetails(!showErrorDetails);
  };

  const renderContent = () => (
    <Box>
      <Stack spacing={2}>
        {/* Main Error Display */}
        <Alert
          severity={getErrorSeverity()}
          icon={getErrorIcon()}
          action={
            canRetry() ? (
              <Button
                color='inherit'
                size='small'
                startIcon={<RefreshIcon />}
                onClick={handleSafeRetry}
                disabled={retryCount >= maxRetries}
              >
                {t('retry_button', 'Retry')}
              </Button>
            ) : null
          }
        >
          <AlertTitle>{getErrorTitle()}</AlertTitle>
          {getErrorMessage()}

          {/* Retry Information */}
          {retryCount > 0 && (
            <Typography variant='body2' sx={{ mt: 1, opacity: 0.8 }}>
              {t('api_error_retry_info', 'Attempted {{count}} time(s)', { count: retryCount })}
            </Typography>
          )}
        </Alert>

        {/* Action Buttons */}
        {(canRetry() || onGoHome) && (
          <Stack direction='row' spacing={1} justifyContent='flex-end'>
            {canRetry() && (
              <Button
                variant='outlined'
                size='small'
                startIcon={<RefreshIcon />}
                onClick={handleSafeRetry}
                disabled={retryCount >= maxRetries}
              >
                {retryCount >= maxRetries
                  ? t('max_retries_reached', 'Max retries reached')
                  : t('retry_button', 'Retry')}
              </Button>
            )}

            {onGoHome && (
              <Button variant='text' size='small' onClick={handleSafeGoHome} color='primary'>
                {t('go_to_dashboard', 'Go to Dashboard')}
              </Button>
            )}
          </Stack>
        )}

        {/* Error Details (Development) */}
        {showDetails && error && (
          <Box>
            <Button size='small' onClick={handleToggleDetails} color='inherit'>
              {showErrorDetails
                ? t('hide_error_details', 'Hide Details')
                : t('show_error_details', 'Show Details')}
            </Button>

            <Collapse in={showErrorDetails}>
              <Alert severity='info' sx={{ mt: 1 }}>
                <Typography variant='body2' component='div'>
                  <strong>Status:</strong> {error.status || 'Unknown'}
                  <br />
                  <strong>Type:</strong> {error.type || 'Unknown'}
                  <br />
                  <strong>Message:</strong> {error.message || 'No message'}
                  <br />
                  {error.retries !== undefined && (
                    <>
                      <strong>Retries:</strong> {error.retries}
                      <br />
                    </>
                  )}
                </Typography>
              </Alert>
            </Collapse>
          </Box>
        )}
      </Stack>
    </Box>
  );

  if (variant === 'card') {
    return (
      <Card variant='outlined' sx={{ my: 2 }}>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    );
  }

  return renderContent();
};

ApiErrorHandler.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string,
    status: PropTypes.number,
    type: PropTypes.string,
    retries: PropTypes.number,
    response: PropTypes.object
  }),
  onRetry: PropTypes.func,
  onGoHome: PropTypes.func,
  showRetry: PropTypes.bool,
  showDetails: PropTypes.bool,
  variant: PropTypes.oneOf(['card', 'inline']),
  maxRetries: PropTypes.number,
  retryCount: PropTypes.number
};

export default ApiErrorHandler;
