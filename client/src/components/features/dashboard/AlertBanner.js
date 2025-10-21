import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import React from 'react';

const AlertBanner = ({ severity = 'info', message, onClose, dismissible = false, sx = {} }) => {
  // Define colors and icons based on severity
  const getAlertStyles = () => {
    switch (severity) {
      case 'error':
        return {
          backgroundColor: '#ffebee',
          borderColor: '#f44336',
          color: '#c62828',
          icon: <ErrorIcon sx={{ color: '#f44336' }} />
        };
      case 'warning':
        return {
          backgroundColor: '#fff3e0',
          borderColor: '#ff9800',
          color: '#ef6c00',
          icon: <WarningIcon sx={{ color: '#ff9800' }} />
        };
      case 'success':
        return {
          backgroundColor: '#e8f5e9',
          borderColor: '#4caf50',
          color: '#2e7d32',
          icon: <CheckCircleIcon sx={{ color: '#4caf50' }} />
        };
      case 'info':
      default:
        return {
          backgroundColor: '#e3f2fd',
          borderColor: '#2196f3',
          color: '#1565c0',
          icon: <InfoIcon sx={{ color: '#2196f3' }} />
        };
    }
  };

  const { backgroundColor, borderColor, color, icon } = getAlertStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        elevation={0}
        sx={{
          backgroundColor,
          border: `1px solid ${borderColor}`,
          borderRadius: 1,
          p: 2,
          mb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          ...sx
        }}
      >
        <Box sx={{ mr: 1.5, mt: 0.25 }}>{icon}</Box>
        <Typography
          variant='body2'
          sx={{
            color,
            flexGrow: 1,
            pt: 0.25
          }}
        >
          {message}
        </Typography>
        {dismissible && onClose && (
          <IconButton size='small' onClick={onClose} sx={{ ml: 1 }}>
            <CloseIcon sx={{ fontSize: 16, color }} />
          </IconButton>
        )}
      </Paper>
    </motion.div>
  );
};

export default AlertBanner;

// Add PropTypes validation
AlertBanner.propTypes = {
  severity: PropTypes.oneOf(['error', 'warning', 'success', 'info']),
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  dismissible: PropTypes.bool,
  sx: PropTypes.object
};

// Add default props
AlertBanner.defaultProps = {
  severity: 'info',
  dismissible: false,
  sx: {}
};
