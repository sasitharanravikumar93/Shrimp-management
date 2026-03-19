/**
 * Mobile-Optimized Components
 * Components specifically designed for mobile responsiveness and touch interactions
 */

import {
  Menu as MenuIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import {
  AppBar,
  Toolbar,
  IconButton,
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
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

const CARD_PADDING_MOBILE = 1.5;
const GRID_COLUMN_BASE = 12;
const SKELETON_CARD_HEIGHT = 120;
const KPI_CARD_HEIGHT_COMPACT = 80;
const KPI_CARD_HEIGHT_DEFAULT = 100;
const TOUCH_BUTTON_PADDING = 1.5;

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
          <IconButton
            key={action.name || index}
            color='inherit'
            onClick={action.onClick}
            size='small'
          >
            {action.icon}
          </IconButton>
        ))}
      </Toolbar>
    </AppBar>
  );
};

MobileNavBar.propTypes = {
  title: PropTypes.string,
  onMenuClick: PropTypes.func,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      icon: PropTypes.node,
      onClick: PropTypes.func
    })
  )
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
            key={item.text || index}
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

MobileDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      icon: PropTypes.node,
      onClick: PropTypes.func
    })
  ),
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string
  })
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
          key={item.value || index}
          label={item.label}
          icon={item.icon}
          value={item.value}
        />
      ))}
    </BottomNavigation>
  );
};

MobileBottomNav.propTypes = {
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      icon: PropTypes.node,
      value: PropTypes.any.isRequired
    })
  ),
  showLabels: PropTypes.bool
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
          key={action.name || index}
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

MobileSpeedDial.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      icon: PropTypes.node,
      onClick: PropTypes.func
    })
  )
};

// Mobile Card with touch-friendly interactions
const MobileCard = styled(Card)(({ theme }) => ({
  '& .MuiCardContent-root': {
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(CARD_PADDING_MOBILE)
    },

    '&:last-child': {
      paddingBottom: theme.spacing(2),
      [theme.breakpoints.down('sm')]: {
        paddingBottom: theme.spacing(CARD_PADDING_MOBILE)
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

ExpandableMobileCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node,
  defaultExpanded: PropTypes.bool,
  icon: PropTypes.node
};

// Mobile Grid with responsive columns
export const MobileGrid = ({ children, spacing = 2, columns = { xs: 1, sm: 2, md: 3 } }) => (
  <Grid container spacing={spacing}>
    {React.Children.map(children, (child, index) => (
      <Grid
        item
        xs={GRID_COLUMN_BASE / columns.xs}
        sm={GRID_COLUMN_BASE / (columns.sm || columns.xs)}
        md={GRID_COLUMN_BASE / (columns.md || columns.sm || columns.xs)}
        key={index}
      >
        {child}
      </Grid>
    ))}
  </Grid>
);

MobileGrid.propTypes = {
  children: PropTypes.node,
  spacing: PropTypes.number,
  columns: PropTypes.shape({
    xs: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number
  })
};

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

MobileDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  fullScreen: PropTypes.bool
};

// Touch-friendly button sizes
export const TouchButton = styled('button')(({ theme }) => ({
  minHeight: 44, // iOS recommended touch target size
  minWidth: 44,
  padding: theme.spacing(TOUCH_BUTTON_PADDING, 2),
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

// Skeleton Card for loading states
export const SkeletonCard = ({ height = SKELETON_CARD_HEIGHT, width = '100%' }) => (
  <Box
    sx={{
      height,
      width,
      bgcolor: 'grey.200',
      borderRadius: 1,
      animation: 'pulse 1.5s ease-in-out infinite'
    }}
  />
);

SkeletonCard.propTypes = {
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

// Mobile KPI Card
export const MobileKPICard = ({ title, value, icon, color, change, compact = false }) => (
  <Card
    sx={{
      height: compact ? KPI_CARD_HEIGHT_COMPACT : KPI_CARD_HEIGHT_DEFAULT,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      boxShadow: 2,
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)'
      }
    }}
  >
    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
        {icon &&
          React.cloneElement(icon, { sx: { color, fontSize: compact ? '1.2rem' : '1.5rem' } })}
      </Box>
      <Typography
        variant={compact ? 'h6' : 'h5'}
        component='div'
        sx={{ fontWeight: 'bold', mb: 0.5, fontSize: compact ? '1rem' : '1.25rem' }}
      >
        {value}
      </Typography>
      <Typography
        variant='caption'
        sx={{ color: 'text.secondary', fontSize: compact ? '0.7rem' : '0.75rem' }}
      >
        {title}
      </Typography>
      {change && (
        <Typography
          variant='caption'
          sx={{
            color: change > 0 ? 'success.main' : 'error.main',
            display: 'block',
            mt: 0.5,
            fontSize: compact ? '0.6rem' : '0.65rem'
          }}
        >
          {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
        </Typography>
      )}
    </CardContent>
  </Card>
);

MobileKPICard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  color: PropTypes.string,
  change: PropTypes.number,
  compact: PropTypes.bool
};

// Mobile Pond Card

const getPondStatusColor = status => {
  if (status === 'Active') {
    return 'success.main';
  }
  if (status === 'Maintenance') {
    return 'warning.main';
  }
  return 'grey.500';
};

// Mobile Pond Card
export const MobilePondCard = ({ pond, onPondClick }) => (
  <Card
    sx={{
      height: 120,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 2,
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        cursor: 'pointer'
      }
    }}
    onClick={() => onPondClick && onPondClick(pond._id)}
  >
    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant='subtitle2' sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {pond.name}
          </Typography>
          <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
            {pond.status}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: getPondStatusColor(pond.status),
            flexShrink: 0
          }}
        />
      </Box>
      <Box sx={{ mt: 1 }}>
        <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
          Health: {pond.health || 'Good'}
        </Typography>
        <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
          Progress: {pond.progress || pond.stockingDensity || 0}%
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

MobilePondCard.propTypes = {
  pond: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    health: PropTypes.string,
    progress: PropTypes.number,
    stockingDensity: PropTypes.number
  }).isRequired,
  onPondClick: PropTypes.func
};

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

const MobileOptimized = {
  MobileNavBar,
  MobileDrawer,
  MobileBottomNav,
  MobileSpeedDial,
  ExpandableMobileCard,
  MobileGrid,
  MobileDialog,
  TouchButton,
  useMobileViewport,
  SkeletonCard,
  MobileKPICard,
  MobilePondCard
};

export default MobileOptimized;
