import React, { useState, useEffect } from 'react';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  Button,
  useTheme
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  NotificationsOff as EmptyIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';

const typeConfig = {
  Critical: { icon: <ErrorIcon />, color: 'error', label: 'Critical' },
  High: { icon: <WarningIcon />, color: 'warning', label: 'High' },
  Medium: { icon: <InfoIcon />, color: 'info', label: 'Medium' },
  Low: { icon: <InfoIcon />, color: 'info', label: 'Low' },
  success: { icon: <CheckIcon />, color: 'success', label: 'Success' },
};

const NotificationPanel = ({ anchorEl, open, onClose }) => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (open) {
      getNotifications(false).then(setNotifications).catch(console.error);
    }
  }, [open]);

  const handleDismiss = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: {
            width: 380,
            maxHeight: 480,
            borderRadius: 3,
            mt: 1,
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            border: `1px solid ${theme.palette.divider}`,
          }
        }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Chip 
              label={unreadCount} 
              size="small" 
              color="primary" 
              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
            />
          )}
        </Box>
        {unreadCount > 0 && (
          <Button size="small" onClick={handleMarkAllRead} sx={{ fontSize: '0.75rem' }}>
            Mark all read
          </Button>
        )}
      </Box>

      {/* Notification list */}
      <List sx={{ p: 0, maxHeight: 380, overflow: 'auto' }}>
        <AnimatePresence>
          {notifications.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <EmptyIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => {
              const config = typeConfig[notification.priority] || typeConfig.Medium;
              return (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ListItem
                    sx={{
                      px: 2,
                      py: 1.5,
                      bgcolor: notification.isRead ? 'transparent' : 
                        `rgba(37, 99, 235, 0.04)`,
                      borderLeft: notification.isRead ? 'none' : 
                        `3px solid ${theme.palette.primary.main}`,
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.02)',
                      },
                    }}
                    secondaryAction={
                      !notification.isRead && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleDismiss(notification._id)}
                          sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                        >
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Box sx={{ color: `${config.color}.main` }}>
                        {config.icon}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.825rem' }}>
                            {notification.title}
                          </Typography>
                          <Chip 
                            label={config.label} 
                            size="small"
                            color={config.color}
                            variant="outlined"
                            sx={{ height: 18, fontSize: '0.65rem' }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', opacity: 0.7 }}>
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </List>
    </Popover>
  );
};

export default NotificationPanel;
