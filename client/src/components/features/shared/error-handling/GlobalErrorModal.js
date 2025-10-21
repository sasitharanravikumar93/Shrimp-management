import { Close, ErrorOutline } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Global Error Modal Component
 * Shows a generic error message overlay for uncaught runtime errors
 */
const GlobalErrorModal = ({ open, onClose, error = null, showDetails = false, onRetry = null }) => {
  const { t } = useTranslation();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      onClose();
    }
  };

  const getErrorEmoji = () => {
    if (!error) return '❌';
    const message = error.message?.toLowerCase() || '';
    const status = error.status || 0;

    if (status >= 400 && status < 500) return '🔍';
    if (status >= 500) return '🔧';
    if (message.includes('network') || message.includes('fetch') || message.includes('connection'))
      return '🌐';
    if (message.includes('timeout')) return '⏱️';
    if (message.includes('unauthorized') || message.includes('login')) return '🔐';
    if (message.includes('forbidden')) return '🚫';
    if (message.includes('offline')) return '📡';

    return '⚠️';
  };

  const getErrorTitle = () => {
    if (!error) return t('error_modal_title', 'Something went wrong');

    const message = error.message?.toLowerCase() || '';
    const status = error.status || 0;

    if (status >= 400 && status < 500) return t('error_client_title', 'Request Error');
    if (status >= 500) return t('error_server_title', 'Server Error');
    if (message.includes('network') || message.includes('fetch') || message.includes('connection'))
      return t('error_network_title', 'Connection Problem');
    if (message.includes('timeout')) return t('error_timeout_title', 'Request Timeout');
    if (message.includes('unauthorized') || message.includes('login'))
      return t('error_auth_title', 'Authentication Required');
    if (message.includes('forbidden')) return t('error_forbidden_title', 'Access Denied');
    if (message.includes('offline')) return t('error_offline_title', 'Offline Mode');

    return t('error_modal_title', 'Something went wrong');
  };

  const isRetryableError = () => {
    if (!error) return false;
    const status = error.status || 0;
    const message = error.message?.toLowerCase() || '';

    // Retry for network and server errors
    return (
      status >= 500 ||
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('offline')
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          p: 2
        }
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          pb: 1,
          position: 'relative'
        }}
      >
        <IconButton onClick={onClose} size='small' sx={{ position: 'absolute', right: 8, top: 8 }}>
          <Close />
        </IconButton>
        <ErrorOutline sx={{ fontSize: '3rem', color: 'error.main', mb: 2 }} />
        <span style={{ fontSize: '2rem' }}>{getErrorEmoji()}</span>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <div style={{ marginBottom: '1rem' }}>
          <strong style={{ fontSize: '1.2rem' }}>{getErrorTitle()}</strong>
        </div>

        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          {(() => {
            if (!error)
              return t(
                'error_modal_message',
                "We've encountered an unexpected error. No need to worry - our team has been notified and is working on it."
              );

            const status = error.status || 0;
            const message = error.message?.toLowerCase() || '';

            if (status >= 400 && status < 500)
              return t(
                'error_client_message',
                'The request could not be processed. Please check your input and try again.'
              );
            if (status >= 500)
              return t(
                'error_server_message',
                'Our servers are experiencing issues. Please try again in a few moments.'
              );
            if (
              message.includes('network') ||
              message.includes('fetch') ||
              message.includes('connection')
            )
              return t(
                'error_network_message',
                'Unable to connect to our servers. Please check your internet connection.'
              );
            if (message.includes('unauthorized') || message.includes('login'))
              return t('error_auth_message', 'Please log in again to continue.');
            if (message.includes('forbidden'))
              return t(
                'error_forbidden_message',
                "You don't have permission to perform this action."
              );

            return t(
              'error_modal_message',
              "We've encountered an unexpected error. No need to worry - our team has been notified and is working on it."
            );
          })()}
        </p>

        {showDetails && error && process.env.NODE_ENV === 'development' && (
          <details
            style={{
              textAlign: 'left',
              marginTop: '1rem',
              backgroundColor: '#f5f5f5',
              padding: '1rem',
              borderRadius: '4px'
            }}
          >
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              {t('error_details', 'Error Details (Development Only)')}
            </summary>
            <pre
              style={{
                fontSize: '0.8rem',
                marginTop: '0.5rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}
            >
              {error.message || 'Unknown error'}
              {error.stack && `\n\nStack Trace:\n${error.stack}`}
            </pre>
          </details>
        )}

        <small style={{ color: '#999', display: 'block', marginTop: '1rem' }}>
          {t(
            'error_modal_help',
            'If this error persists, try refreshing the page or contact support.'
          )}
        </small>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
        <Button variant='outlined' onClick={onClose} size='medium'>
          {t('error_modal_close', 'Close')}
        </Button>
        {onRetry && isRetryableError() && (
          <Button variant='contained' onClick={handleRetry} size='medium' color='success'>
            {t('error_modal_retry', 'Try Again')}
          </Button>
        )}
        <Button variant='contained' onClick={handleRefresh} size='medium' color='primary'>
          {t('error_modal_refresh', 'Refresh Page')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GlobalErrorModal;
