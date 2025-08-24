import React, { useState, useEffect } from 'react';
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
  Language as LanguageIcon,
  Inventory as InventoryIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSeason } from '../context/SeasonContext';
import LanguageSwitcher from './LanguageSwitcher';
import { useApiData } from '../hooks/useApi';
import { getSeasons } from '../services/api';
import { useTranslation } from 'react-i18next';

// Collapsible sidebar width constants
const drawerWidth = 240;
const collapsedDrawerWidth = 70;

const Layout = ({ children, toggleDarkMode, darkMode }) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [reportAnchorEl, setReportAnchorEl] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openPondMenu, setOpenPondMenu] = useState(false);
  const { selectedSeason, setSelectedSeason } = useSeason();
  const location = useLocation();
  const { data: seasons = [], loading: seasonsLoading, error: seasonsError } = useApiData(getSeasons, [], 'seasons');

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleReportMenuOpen = (event) => {
    setReportAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setReportAnchorEl(null);
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log('User logged out');
    handleMenuClose();
  };

  const expandSidebar = () => {
    if (!isMobile && isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
    }
  };

  const collapseSidebar = () => {
    if (!isMobile && !isSidebarCollapsed) {
      setIsSidebarCollapsed(true);
    }
  };

  const handlePondMenuToggle = () => {
    setOpenPondMenu(!openPondMenu);
  };

  // Main navigation items
  const mainMenuItems = [
    { text: t('dashboard'), icon: <DashboardIcon />, path: '/' },
    { 
      text: t('pond_management'), 
      icon: <PondIcon />, 
      path: '/pond'
    },
    { text: t('admin'), icon: <AdminIcon />, path: '/admin' },
    { text: t('nursery_management'), icon: <NurseryIcon />, path: '/nursery' },
    { text: t('inventory_management'), icon: <InventoryIcon />, path: '/inventory-management' },
    { text: t('historical_insights'), icon: <HistoryIcon />, path: '/historical-insights' },
    { text: t('expense_management'), icon: <AccountBalanceWalletIcon />, path: '/expense-management' },
  ];

  // Bottom menu items
  const bottomMenuItems = [
    { text: t('user_account'), icon: <AccountIcon />, action: handleMenuOpen },
  ];

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
      {/* Top Section - Logo and Search */}
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: isSidebarCollapsed ? 0 : 1 }}>
            <WavesIcon />
          </Avatar>
          {!isSidebarCollapsed && (
            <Typography variant="h6" noWrap component="div">
              {t('shrimp_farm')}
            </Typography>
          )}
        </Box>
      </Toolbar>
      
      {!isSidebarCollapsed && (
        <Box sx={{ px: 2, pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            select
            value={selectedSeason ? selectedSeason._id : ''}
            onChange={(e) => {
              const seasonId = e.target.value;
              const season = seasons.find(s => s._id === seasonId);
              if (season) {
                setSelectedSeason(season);
              }
            }}
            placeholder={t('select_season')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16 }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              }
            }}
          >
            {seasonsLoading ? (
              <MenuItem disabled>{t('loading_seasons')}</MenuItem>
            ) : seasonsError ? (
              <MenuItem disabled>{t('error_loading_seasons')}</MenuItem>
            ) : (
              Array.isArray(seasons) && seasons.map((season) => (
                <MenuItem key={season._id} value={season._id}>
                  {typeof season.name === 'object' ? (season.name[i18n.language] || season.name.en) : season.name}
                </MenuItem>
              ))
            )}
          </TextField>
        </Box>
      )}
      
      <Divider />
      
      {/* Main Navigation */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {mainMenuItems.map((item) => (
          <Box key={item.text}>
            <ListItem 
              button 
              component={item.path ? Link : 'div'} 
              to={item.path}
              selected={location.pathname === item.path || 
                        (item.path === '/admin' && location.pathname.startsWith('/pond/'))}
              onClick={item.subItems ? handlePondMenuToggle : undefined}
              sx={{ 
                borderRadius: '0 24px 24px 0',
                mx: 1,
                my: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: location.pathname === item.path || 
                         (item.path === '/admin' && location.pathname.startsWith('/pond/')) ? 
                         'inherit' : 'inherit',
                  minWidth: isSidebarCollapsed ? 'auto' : 40
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!isSidebarCollapsed && (
                <>
                  <ListItemText primary={item.text} />
                  {item.subItems && (
                    openPondMenu ? <ExpandLessIcon /> : <ExpandMoreIcon />
                  )}
                </>
              )}
            </ListItem>
            
            {/* Sub-menu for Pond Management */}
            {item.subItems && openPondMenu && !isSidebarCollapsed && (
              <List component="div" disablePadding>
                {item.subItems.map((subItem) => (
                  <ListItem
                    button
                    key={subItem.text}
                    component={Link}
                    to={subItem.path}
                    selected={location.pathname === subItem.path || 
                              (subItem.path === '/admin' && location.pathname.startsWith('/pond/'))}
                    sx={{
                      pl: 4,
                      borderRadius: '0 24px 24px 0',
                      mx: 1,
                      my: 0.25,
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: 40,
                      color: location.pathname === subItem.path ? 'inherit' : 'inherit'
                    }}>
                      {subItem.icon}
                    </ListItemIcon>
                    <ListItemText primary={subItem.text} />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        ))}
      </List>
      
      <Divider />
      
      {/* Bottom Section - User Account */}
      <List>
        {bottomMenuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={item.action}
            sx={{ 
              borderRadius: '0 24px 24px 0',
              mx: 1,
              my: 0.5
            }}
          >
            <ListItemIcon sx={{ minWidth: isSidebarCollapsed ? 'auto' : 40 }}>
              {item.icon}
            </ListItemIcon>
            {!isSidebarCollapsed && (
              <ListItemText primary={item.text} />
            )}
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          width: { 
            sm: isSidebarCollapsed ? `calc(100% - ${collapsedDrawerWidth}px)` : `calc(100% - ${drawerWidth}px)` 
          },
          ml: { 
            sm: isSidebarCollapsed ? `${collapsedDrawerWidth}px` : `${drawerWidth}px` 
          },
          bgcolor: 'background.paper',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {t('app_title')}
          </Typography>
          
          {/* Notifications */}
          <Tooltip title={t('notifications')}>
            <IconButton color="inherit">
              <Badge badgeContent={2} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Generate Report Button */}
          <Tooltip title={t('generate_report')}>
            <IconButton 
              color="inherit" 
              onClick={handleReportMenuOpen}
              sx={{ mx: 1 }}
            >
              <InsightsIcon />
            </IconButton>
          </Tooltip>
          
          {/* User Profile */}
          <Tooltip title={t('user_account')}>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      
      {/* Sidebar Navigation */}
      <Box
        component="nav"
        sx={{ 
          width: { sm: isSidebarCollapsed ? collapsedDrawerWidth : drawerWidth }, 
          flexShrink: { sm: 0 } 
        }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              width: isSidebarCollapsed ? collapsedDrawerWidth : drawerWidth, 
              boxSizing: 'border-box',
              borderRight: '1px solid rgba(0, 0, 0, 0.05)'
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { 
            sm: isSidebarCollapsed ? `calc(100% - ${collapsedDrawerWidth}px)` : `calc(100% - ${drawerWidth}px)` 
          },
          ml: { 
            sm: isSidebarCollapsed ? `${collapsedDrawerWidth}px` : `${drawerWidth}px` 
          },
          mt: 8,
          minHeight: '100vh',
          bgcolor: 'background.default',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {children}
      </Box>
      
      {/* User Account Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('profile')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={toggleDarkMode}>
          <ListItemIcon>
            {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {darkMode ? t('light_mode') : t('dark_mode')}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('settings')}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <LanguageIcon fontSize="small" />
          </ListItemIcon>
          <Box sx={{ width: 200 }}>
            <LanguageSwitcher />
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('logout')}</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Report Menu */}
      <Menu
        anchorEl={reportAnchorEl}
        open={Boolean(reportAnchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemText>{t('weekly_report')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemText>{t('monthly_report')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemText>{t('custom_report')}</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

// Simple wave icon for the avatar
const WavesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M3 3v16.978h17V3H3zm16 16H5V5h14v14z"/>
    <path d="M12 7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm8 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);

export default Layout;