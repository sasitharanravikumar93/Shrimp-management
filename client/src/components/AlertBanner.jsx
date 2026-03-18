import React from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
  Paper,
  useTheme
} from '@mui/material';
import { 
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AlertBanner = ({ 
  severity = 'info', 
  message, 
  onClose,
  dismissible = false,
  sx = {}
}) => {
  const theme = useTheme();

  const getAlertStyles = () => {
    const isDark = theme.palette.mode === 'dark';
    switch (severity) {
      case 'error':
        return {
          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
          borderColor: theme.palette.error.main,
          color: isDark ? theme.palette.error.light : theme.palette.error.dark,
          icon: <ErrorIcon sx={{ color: theme.palette.error.main }} />
        };
      case 'warning':
        return {
          backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)',
          borderColor: theme.palette.warning.main,
          color: isDark ? theme.palette.warning.light : theme.palette.warning.dark,
          icon: <WarningIcon sx={{ color: theme.palette.warning.main }} />
        };
      case 'success':
        return {
          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
          borderColor: theme.palette.success.main,
          color: isDark ? theme.palette.success.light : theme.palette.success.dark,
          icon: <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
        };
      case 'info':
      default:
        return {
          backgroundColor: isDark ? 'rgba(124, 58, 237, 0.12)' : 'rgba(37, 99, 235, 0.08)',
          borderColor: theme.palette.primary.main,
          color: isDark ? theme.palette.primary.light : theme.palette.primary.dark,
          icon: <InfoIcon sx={{ color: theme.palette.primary.main }} />
        };
    }
  };

  const { backgroundColor, borderColor, color, icon } = getAlertStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        elevation={0}
        sx={{
          backgroundColor,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
          p: 2,
          mb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          ...sx
        }}
      >
        <Box sx={{ mr: 1.5, mt: 0.25 }}>
          {icon}
        </Box>
        <Typography 
          variant="body2" 
          sx={{ 
            color, 
            flexGrow: 1,
            pt: 0.25,
            fontWeight: 500
          }}
        >
          {message}
        </Typography>
        {dismissible && onClose && (
          <IconButton 
            size="small" 
            onClick={onClose}
            sx={{ ml: 1 }}
          >
            <CloseIcon sx={{ fontSize: 16, color }} />
          </IconButton>
        )}
      </Paper>
    </motion.div>
  );
};

export default AlertBanner;