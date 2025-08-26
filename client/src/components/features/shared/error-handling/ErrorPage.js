import {
  BugReport as BugIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { API } from '../../../../constants';
import { safeExecute, safeNavigateHome, safeReload } from '../../../../utils/safeNavigation';

const MAX_RETRIES = API.MAX_RETRIES;

const ErrorPage = ({
  error,
  errorInfo,
  retryCount = 0,
  maxRetries = MAX_RETRIES,
  onRetry,
  onGoHome,
  onReload,
  showDetails = false,
  title = null,
  message = null
}) => {
  const { t } = useTranslation();
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const canRetry = retryCount < maxRetries && onRetry;
  const errorTitle = title || t('error_page_title', 'Oops! Something went wrong');
  const errorMessage =
    message ||
    t('error_page_message', 'We encountered an unexpected error. Our team has been notified.');

  // Safe handler for retry actions
  const handleSafeRetry = () => {
    safeExecute(
      () => onRetry(),
      () => handleSafeReload(),
      'Error page retry failed'
    );
  };

  // Safe handler for navigation actions
  const handleSafeGoHome = () => {
    safeExecute(
      () => onGoHome(),
      () => safeNavigateHome(),
      'Error page navigation failed'
    );
  };

  // Safe handler for reload actions
  const handleSafeReload = () => {
    safeExecute(
      () => onReload(),
      () => safeReload(),
      'Error page reload failed'
    );
  };

  const getErrorType = () => {
    if (!error) return 'unknown';

    const errorMessage = error.message?.toLowerCase() || '';
    const errorName = error.name?.toLowerCase() || '';

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'network';
    }

    if (errorMessage.includes('chunk') || errorMessage.includes('loading')) {
      return 'chunk';
    }

    if (errorName.includes('syntaxerror')) {
      return 'syntax';
    }

    return 'application';
  };

  const getErrorIcon = () => {
    const errorType = getErrorType();

    switch (errorType) {
      case 'network':
        return '🌐';
      case 'chunk':
        return '⚡';
      case 'syntax':
        return '💻';
      default:
        return '❌';
    }
  };

  const getSpecificMessage = () => {
    const errorType = getErrorType();

    switch (errorType) {
      case 'network':
        return t(
          'error_network_message',
          "It looks like there's a connection problem. Please check your internet connection and try again."
        );
      case 'chunk':
        return t(
          'error_chunk_message',
          'There was a problem loading part of the application. Please refresh the page.'
        );
      case 'syntax':
        return t(
          'error_syntax_message',
          "There's a technical issue with the application. Please refresh the page or contact support."
        );
      default:
        return errorMessage;
    }
  };

  const handleToggleDetails = () => {
    setShowErrorDetails(!showErrorDetails);
  };

  return (
    <Container maxWidth='md' sx={{ py: 8 }}>
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        minHeight='60vh'
      >
        <Card
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: 600,
            borderRadius: 2,
            overflow: 'visible'
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            {/* Error Icon */}
            <Box sx={{ fontSize: '4rem', mb: 2 }}>{getErrorIcon()}</Box>

            {/* Error Title */}
            <Typography variant='h4' component='h1' gutterBottom color='error'>
              {errorTitle}
            </Typography>

            {/* Error Message */}
            <Typography variant='body1' color='text.secondary' paragraph>
              {getSpecificMessage()}
            </Typography>

            {/* Retry Information */}
            {retryCount > 0 && (
              <Alert severity='info' sx={{ mb: 3 }}>
                {t('error_retry_info', 'Attempted {{count}} time(s)', { count: retryCount })}
              </Alert>
            )}

            {/* Action Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent='center'
              sx={{ mb: 3 }}
            >
              {canRetry && (
                <Button
                  variant='contained'
                  startIcon={<RefreshIcon />}
                  onClick={handleSafeRetry}
                  size='large'
                >
                  {t('error_retry_button', 'Try Again')}
                </Button>
              )}

              {onGoHome && (
                <Button
                  variant='outlined'
                  startIcon={<HomeIcon />}
                  onClick={handleSafeGoHome}
                  size='large'
                >
                  {t('error_home_button', 'Go to Dashboard')}
                </Button>
              )}

              {onReload && (
                <Button
                  variant='outlined'
                  startIcon={<RefreshIcon />}
                  onClick={handleSafeReload}
                  size='large'
                >
                  {t('error_reload_button', 'Reload Page')}
                </Button>
              )}
            </Stack>

            {/* Error Details Toggle */}
            {showDetails && error && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Button
                    startIcon={<BugIcon />}
                    onClick={handleToggleDetails}
                    color='inherit'
                    size='small'
                  >
                    {showErrorDetails
                      ? t('error_hide_details', 'Hide Error Details')
                      : t('error_show_details', 'Show Error Details')}
                  </Button>

                  <Collapse in={showErrorDetails}>
                    <Card
                      variant='outlined'
                      sx={{
                        mt: 2,
                        textAlign: 'left',
                        backgroundColor: 'grey.50'
                      }}
                    >
                      <CardContent>
                        <Typography variant='subtitle2' gutterBottom>
                          Error Message:
                        </Typography>
                        <Typography
                          variant='body2'
                          fontFamily='monospace'
                          color='error'
                          gutterBottom
                        >
                          {error.message || 'Unknown error'}
                        </Typography>

                        {error.stack && (
                          <>
                            <Typography variant='subtitle2' gutterBottom sx={{ mt: 2 }}>
                              Stack Trace:
                            </Typography>
                            <Typography
                              variant='body2'
                              fontFamily='monospace'
                              sx={{
                                whiteSpace: 'pre-wrap',
                                fontSize: '0.75rem',
                                backgroundColor: 'background.paper',
                                p: 1,
                                borderRadius: 1,
                                border: 1,
                                borderColor: 'divider'
                              }}
                            >
                              {error.stack}
                            </Typography>
                          </>
                        )}

                        {errorInfo?.componentStack && (
                          <>
                            <Typography variant='subtitle2' gutterBottom sx={{ mt: 2 }}>
                              Component Stack:
                            </Typography>
                            <Typography
                              variant='body2'
                              fontFamily='monospace'
                              sx={{
                                whiteSpace: 'pre-wrap',
                                fontSize: '0.75rem',
                                backgroundColor: 'background.paper',
                                p: 1,
                                borderRadius: 1,
                                border: 1,
                                borderColor: 'divider'
                              }}
                            >
                              {errorInfo.componentStack}
                            </Typography>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </Collapse>
                </Box>
              </>
            )}

            {/* Help Text */}
            <Typography variant='caption' color='text.secondary' sx={{ mt: 2, display: 'block' }}>
              {t('error_help_text', 'If this problem persists, please contact our support team.')}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

ErrorPage.propTypes = {
  error: PropTypes.object,
  errorInfo: PropTypes.object,
  retryCount: PropTypes.number,
  maxRetries: PropTypes.number,
  onRetry: PropTypes.func,
  onGoHome: PropTypes.func,
  onReload: PropTypes.func,
  showDetails: PropTypes.bool,
  title: PropTypes.string,
  message: PropTypes.string
};

export default ErrorPage;
