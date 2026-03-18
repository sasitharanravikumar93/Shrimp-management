import React, { useState, useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';

const GlobalNotification = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('error');

  useEffect(() => {
    const handleApiError = (event) => {
      setMessage(event.detail || 'An unexpected server error occurred.');
      setSeverity('error');
      setOpen(true);
    };
    
    const handleApiSuccess = (event) => {
      setMessage(event.detail || 'Operation successful.');
      setSeverity('success');
      setOpen(true);
    };

    window.addEventListener('api-error', handleApiError);
    window.addEventListener('api-success', handleApiSuccess);

    return () => {
      window.removeEventListener('api-error', handleApiError);
      window.removeEventListener('api-success', handleApiSuccess);
    };
  }, []);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <Snackbar 
      open={open} 
      autoHideDuration={5000} 
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalNotification;
