import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  Waves as PondIcon,
  Insights as InsightsIcon,
  WaterDrop as WaterIcon,
  CalendarMonth as NurseryIcon,
  History as HistoryIcon,
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Restaurant as FeedIcon,
  Science as GrowthIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Inventory as InventoryIcon,
  MonetizationOn as HarvestIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  LocalHospital as HealthIcon,
  TaskAlt as TaskIcon
} from '@mui/icons-material';
import {
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useTheme,
  useMediaQuery,
  CssBaseline,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  TextField,
  InputAdornment,
  Badge
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useSeason } from '../context/SeasonContext';

import AppBreadcrumbs from './Breadcrumbs';
import NotificationPanel from './NotificationPanel';

const drawerWidth = 260;
const collapsedDrawerWidth = 72;

const Layout = ({ children, toggleDarkMode, darkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [reportAnchorEl, setReportAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openPondMenu, setOpenPondMenu] = useState(false);
  const { seasons, selectedSeason, setSelectedSeason } = useSeason();
  const location = useLocation();

  useEffect(() => {
    if (isMobile) {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = event => setAnchorEl(event.currentTarget);
  const handleReportMenuOpen = event => setReportAnchorEl(event.currentTarget);
  const handleNotifOpen = event => setNotifAnchorEl(event.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);
  const handleMenuClose = () => {
    setAnchorEl(null);
    setReportAnchorEl(null);
  };
  const handleLogout = () => {
    console.log('User logged out');
    handleMenuClose();
  };
  const expandSidebar = () => {
    if (!isMobile && isSidebarCollapsed) setIsSidebarCollapsed(false);
  };
  const collapseSidebar = () => {
    if (!isMobile && !isSidebarCollapsed) setIsSidebarCollapsed(true);
  };
  const handlePondMenuToggle = () => setOpenPondMenu(!openPondMenu);

  const isActive = (path, item) => {
    if (path === '/') return location.pathname === '/';
    if (item?.subItems) {
      return (
        item.subItems.some(sub => location.pathname === sub.path) ||
        location.pathname.startsWith('/pond/')
      );
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const mainMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    {
      text: 'Pond Management',
      icon: <PondIcon />,
      path: '/pond'
    },
    { text: 'Admin', icon: <AdminIcon />, path: '/admin' },
    { text: 'Nursery', icon: <NurseryIcon />, path: '/nursery' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory-management' },
    { text: 'Expenses', icon: <ReceiptIcon />, path: '/expenses' },
    { text: 'Harvest & Sales', icon: <HarvestIcon />, path: '/harvest' },
    { text: 'Health Logs', icon: <HealthIcon />, path: '/health' },
    { text: 'Tasks', icon: <TaskIcon />, path: '/tasks' },
    { text: 'Alert Rules', icon: <SettingsIcon />, path: '/alert-rules' },
    { text: 'Post-Harvest Report', icon: <AssessmentIcon />, path: '/post-harvest-report' },
    { text: 'Historical Insights', icon: <HistoryIcon />, path: '/historical-insights' }
  ];

  const activeItemSx = {
    borderLeft: `3px solid ${theme.palette.primary.main}`,
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.08)',
    color: theme.palette.primary.main,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main
    },
    '&:hover': {
      bgcolor:
        theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.12)'
    }
  };

  const inactiveItemSx = {
    borderLeft: '3px solid transparent',
    '&:hover': {
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'
    }
  };

  const drawer = (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'inherit'
      }}
      onMouseEnter={!isMobile ? expandSidebar : undefined}
      onMouseLeave={!isMobile ? collapseSidebar : undefined}
    >
      {/* Logo */}
      <Toolbar sx={{ gap: 1 }}>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 36,
            height: 36,
            mr: isSidebarCollapsed ? 0 : 0.5
          }}
        >
          <WavesIcon />
        </Avatar>
        {!isSidebarCollapsed && (
          <Typography
            variant='h6'
            noWrap
            component='div'
            sx={{ fontWeight: 700, fontSize: '1.1rem' }}
          >
            ShrimpFarm
          </Typography>
        )}
      </Toolbar>

      {/* Season Selector */}
      {!isSidebarCollapsed && (
        <Box sx={{ px: 2, pb: 1.5 }}>
          <TextField
            fullWidth
            size='small'
            select
            value={selectedSeason ? selectedSeason.id || selectedSeason._id : ''}
            onChange={e => {
              const selected = seasons.find(s => (s.id || s._id) === e.target.value);
              setSelectedSeason(selected);
            }}
            placeholder='Select season...'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.03)'
              }
            }}
          >
            {seasons && seasons.length > 0 ? (
              seasons.map(season => (
                <MenuItem key={season.id || season._id} value={season.id || season._id}>
                  {season.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled value=''>
                No Seasons Found
              </MenuItem>
            )}
          </TextField>
        </Box>
      )}

      <Divider sx={{ opacity: 0.6 }} />

      {/* Main Navigation */}
      <List sx={{ flexGrow: 1, py: 1, px: 0.5 }}>
        {mainMenuItems.map(item => {
          const active = isActive(item.path, item);
          return (
            <Box key={item.text}>
              <Tooltip title={isSidebarCollapsed ? item.text : ''} placement='right' arrow>
                <ListItem
                  button
                  component={item.subItems ? 'div' : Link}
                  to={item.subItems ? undefined : item.path}
                  onClick={item.subItems ? handlePondMenuToggle : undefined}
                  sx={{
                    borderRadius: '0 8px 8px 0',
                    mx: 0.5,
                    my: 0.25,
                    py: 1,
                    transition: 'all 0.15s ease',
                    ...(active ? activeItemSx : inactiveItemSx)
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: active ? 'primary.main' : 'text.secondary',
                      minWidth: isSidebarCollapsed ? 'auto' : 40,
                      transition: 'color 0.15s ease'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!isSidebarCollapsed && (
                    <>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: active ? 600 : 400
                        }}
                      />
                      {item.subItems &&
                        (openPondMenu ? (
                          <ExpandLessIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <ExpandMoreIcon sx={{ fontSize: 18 }} />
                        ))}
                    </>
                  )}
                </ListItem>
              </Tooltip>

              {/* Sub-menu */}
              {item.subItems && openPondMenu && !isSidebarCollapsed && (
                <List component='div' disablePadding>
                  {item.subItems.map(subItem => {
                    const subActive = location.pathname === subItem.path;
                    return (
                      <ListItem
                        button
                        key={subItem.text}
                        component={Link}
                        to={subItem.path}
                        sx={{
                          pl: 4.5,
                          borderRadius: '0 8px 8px 0',
                          mx: 0.5,
                          my: 0.25,
                          py: 0.75,
                          transition: 'all 0.15s ease',
                          ...(subActive ? activeItemSx : inactiveItemSx)
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 36,
                            color: subActive ? 'primary.main' : 'text.secondary'
                          }}
                        >
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={subItem.text}
                          primaryTypographyProps={{
                            fontSize: '0.8rem',
                            fontWeight: subActive ? 600 : 400
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          );
        })}
      </List>

      <Divider sx={{ opacity: 0.6 }} />

      {/* Bottom: User Account */}
      <List sx={{ px: 0.5 }}>
        <Tooltip title={isSidebarCollapsed ? 'User Account' : ''} placement='right' arrow>
          <ListItem
            button
            onClick={handleMenuOpen}
            sx={{
              borderRadius: '0 8px 8px 0',
              mx: 0.5,
              my: 0.5,
              ...inactiveItemSx
            }}
          >
            <ListItemIcon
              sx={{ minWidth: isSidebarCollapsed ? 'auto' : 40, color: 'text.secondary' }}
            >
              <AccountIcon />
            </ListItemIcon>
            {!isSidebarCollapsed && (
              <ListItemText
                primary='User Account'
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
            )}
          </ListItem>
        </Tooltip>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Header */}
      <AppBar
        position='fixed'
        sx={{
          width: {
            sm: isSidebarCollapsed
              ? `calc(100% - ${collapsedDrawerWidth}px)`
              : `calc(100% - ${drawerWidth}px)`
          },
          ml: {
            sm: isSidebarCollapsed ? `${collapsedDrawerWidth}px` : `${drawerWidth}px`
          },
          bgcolor: 'background.paper',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color='inherit'
              aria-label='open drawer'
              edge='start'
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant='h6' noWrap component='div' sx={{ flexGrow: 1, fontWeight: 700 }}>
            Shrimp Farm Management
          </Typography>

          {/* Notifications */}
          <Tooltip title='Notifications'>
            <IconButton color='inherit' onClick={handleNotifOpen}>
              <Badge
                badgeContent={2}
                color='error'
                sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 18, minWidth: 18 } }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Generate Report */}
          <Tooltip title='Generate Report'>
            <IconButton color='inherit' onClick={handleReportMenuOpen} sx={{ mx: 0.5 }}>
              <InsightsIcon />
            </IconButton>
          </Tooltip>

          {/* User Profile */}
          <Tooltip title='User Account'>
            <IconButton color='inherit' onClick={handleMenuOpen}>
              <AccountIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Notification Panel */}
      <NotificationPanel
        anchorEl={notifAnchorEl}
        open={Boolean(notifAnchorEl)}
        onClose={handleNotifClose}
      />

      {/* Sidebar Navigation */}
      <Box
        component='nav'
        sx={{
          width: { sm: isSidebarCollapsed ? collapsedDrawerWidth : drawerWidth },
          flexShrink: { sm: 0 }
        }}
        aria-label='navigation'
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: isSidebarCollapsed ? collapsedDrawerWidth : drawerWidth,
              boxSizing: 'border-box',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen
              })
            }
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: 3,
          width: {
            sm: isSidebarCollapsed
              ? `calc(100% - ${collapsedDrawerWidth}px)`
              : `calc(100% - ${drawerWidth}px)`
          },
          mt: 8,
          minHeight: '100vh',
          bgcolor: 'background.default',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
          })
        }}
      >
        <AppBreadcrumbs />
        {children}
      </Box>

      {/* User Account Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              mt: 1,
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }
          }
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AccountIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={toggleDarkMode}>
          <ListItemIcon>
            {darkMode ? <LightModeIcon fontSize='small' /> : <DarkModeIcon fontSize='small' />}
          </ListItemIcon>
          <ListItemText>{darkMode ? 'Light Mode' : 'Dark Mode'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Report Menu */}
      <Menu
        anchorEl={reportAnchorEl}
        open={Boolean(reportAnchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        slotProps={{
          paper: {
            sx: { borderRadius: 2, mt: 1 }
          }
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemText>Weekly Report</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemText>Monthly Report</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemText>Custom Report</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

// Simple wave icon for the avatar
const WavesIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='white'>
    <path d='M3 3v16.978h17V3H3zm16 16H5V5h14v14z' />
    <path d='M12 7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm8 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z' />
  </svg>
);

export default Layout;
