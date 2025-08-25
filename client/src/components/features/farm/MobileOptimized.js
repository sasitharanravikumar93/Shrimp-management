/**
 * Mobile-Optimized Components
 * Components specifically designed for mobile responsiveness and touch interactions
 */

import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  SwipeableDrawer,
  BottomNavigation,
  BottomNavigationAction,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  useMediaQuery,
  useTheme,
  Box,
  Typography,
  Card,
  CardContent,
  Collapse,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';

// Mobile Navigation Bar
export const MobileNavBar = ({ title, onMenuClick, actions = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!isMobile) return null;

  return (
    <AppBar position='fixed' sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ minHeight: 56, px: 2 }}>
        <IconButton edge='start' color='inherit' onClick={onMenuClick} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>

        <Typography variant='h6' sx={{ flexGrow: 1, fontSize: '1.1rem' }}>
          {title}
        </Typography>

        {actions.map((action, index) => (
          <IconButton key={index} color='inherit' onClick={action.onClick} size='small'>
            {action.icon}
          </IconButton>
        ))}
      </Toolbar>
    </AppBar>
  );
};

// Mobile Drawer with swipe support
export const MobileDrawer = ({ open, onClose, onOpen, menuItems = [], user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawerContent = (
    <Box sx={{ width: 280, pt: 2 }}>
      {user && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant='subtitle1' fontWeight='medium'>
            {user.name}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {user.email}
          </Typography>
        </Box>
      )}

      <List>
        {menuItems.map((item, index) => (
          <ListItem
            button
            key={index}
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
            sx={{
              minHeight: 48,
              px: 2,
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.95rem' }} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (!isMobile) return null;

  return (
    <SwipeableDrawer
      anchor='left'
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableSwipeToOpen={false}
      ModalProps={{
        keepMounted: true // Better mobile performance
      }}
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: 280
        }
      }}
    >
      {drawerContent}
    </SwipeableDrawer>
  );
};

// Mobile Bottom Navigation
export const MobileBottomNav = ({ value, onChange, items = [], showLabels = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!isMobile) return null;

  return (
    <BottomNavigation
      value={value}
      onChange={onChange}
      showLabels={showLabels}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}
    >
      {items.map((item, index) => (
        <BottomNavigationAction
          key={index}
          label={item.label}
          icon={item.icon}
          value={item.value}
        />
      ))}
    </BottomNavigation>
  );
};

// Mobile Speed Dial for quick actions
export const MobileSpeedDial = ({ actions = [] }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!isMobile || actions.length === 0) return null;

  return (
    <SpeedDial
      ariaLabel='Quick actions'
      sx={{
        position: 'fixed',
        bottom: 80,
        right: 16
      }}
      icon={<SpeedDialIcon />}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
    >
      {actions.map((action, index) => (
        <SpeedDialAction
          key={index}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={() => {
            action.onClick?.();
            setOpen(false);
          }}
        />
      ))}
    </SpeedDial>
  );
};

// Mobile Card with touch-friendly interactions
const MobileCard = styled(Card)(({ theme }) => ({
  '& .MuiCardContent-root': {
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.5)
    },

    '&:last-child': {
      paddingBottom: theme.spacing(2),
      [theme.breakpoints.down('sm')]: {
        paddingBottom: theme.spacing(1.5)
      }
    }
  }
}));

// Expandable Mobile Card
export const ExpandableMobileCard = ({
  title,
  subtitle,
  children,
  defaultExpanded = false,
  icon
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <MobileCard>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={() => setExpanded(!expanded)}
        >
          {icon && <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>{icon}</Box>}

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='subtitle1' fontWeight='medium'>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant='body2' color='text.secondary'>
                {subtitle}
              </Typography>
            )}
          </Box>

          <IconButton size='small'>{expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>{children}</Box>
        </Collapse>
      </CardContent>
    </MobileCard>
  );
};

// Mobile Grid with responsive columns
export const MobileGrid = ({ children, spacing = 2, columns = { xs: 1, sm: 2, md: 3 } }) => (
  <Grid container spacing={spacing}>
    {React.Children.map(children, (child, index) => (
      <Grid
        item
        xs={12 / columns.xs}
        sm={12 / (columns.sm || columns.xs)}
        md={12 / (columns.md || columns.sm || columns.xs)}
        key={index}
      >
        {child}
      </Grid>
    ))}
  </Grid>
);

// Mobile-optimized dialog
export const MobileDialog = ({ open, onClose, title, children, fullScreen = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const shouldBeFullScreen = isMobile || fullScreen;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={shouldBeFullScreen}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          ...(shouldBeFullScreen && {
            margin: 0,
            borderRadius: 0
          })
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1
        }}
      >
        <Typography variant='h6'>{title}</Typography>
        <IconButton onClick={onClose} size='small'>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers={shouldBeFullScreen}>{children}</DialogContent>
    </Dialog>
  );
};

// Touch-friendly button sizes
export const TouchButton = styled('button')(({ theme }) => ({
  minHeight: 44, // iOS recommended touch target size
  minWidth: 44,
  padding: theme.spacing(1.5, 2),
  fontSize: '1rem',
  fontWeight: 500,
  border: 'none',
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  transition: theme.transitions.create(['background-color', 'transform'], {
    duration: theme.transitions.duration.short
  }),

  '&:active': {
    transform: 'scale(0.98)'
  },

  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed'
  }
}));

// Mobile viewport helper
export const useMobileViewport = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const [orientation, setOrientation] = useState(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    window.addEventListener('resize', handleOrientationChange);
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop,
    orientation,
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait'
  };
};

export default {
  MobileNavBar,
  MobileDrawer,
  MobileBottomNav,
  MobileSpeedDial,
  ExpandableMobileCard,
  MobileGrid,
  MobileDialog,
  TouchButton,
  useMobileViewport
};
