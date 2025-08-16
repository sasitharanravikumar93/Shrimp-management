import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InputIcon from '@mui/icons-material/Input';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SpaIcon from '@mui/icons-material/Spa';
import HistoryIcon from '@mui/icons-material/History';
import InventoryIcon from '@mui/icons-material/Inventory'; // New import
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const drawerWidth = 240;

const Sidebar = () => {
  const { t } = useTranslation();
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          {t('app_title')}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary={t('dashboard')} />
        </ListItem>
        <ListItem button component={Link} to="/feed-input">
          <ListItemIcon>
            <InputIcon />
          </ListItemIcon>
          <ListItemText primary={t('feed_inputs')} />
        </ListItem>
        <ListItem button component={Link} to="/growth-sampling">
          <ListItemIcon>
            <ShowChartIcon />
          </ListItemIcon>
          <ListItemText primary={t('growth_sampling')} />
        </ListItem>
        <ListItem button component={Link} to="/water-quality-input">
          <ListItemIcon>
            <WaterDropIcon />
          </ListItemIcon>
          <ListItemText primary={t('water_quality')} />
        </ListItem>
        <ListItem button component={Link} to="/nursery-management">
          <ListItemIcon>
            <SpaIcon />
          </ListItemIcon>
          <ListItemText primary={t('nursery_batches')} />
        </ListItem>
        <ListItem button component={Link} to="/inventory-management"> {/* New Inventory Management Link */}
          <ListItemIcon>
            <InventoryIcon />
          </ListItemIcon>
          <ListItemText primary={t('inventory')} />
        </ListItem>
        <ListItem button component={Link} to="/admin">
          <ListItemIcon>
            <AdminPanelSettingsIcon />
          </ListItemIcon>
          <ListItemText primary={t('admin')} />
        </ListItem>
        <ListItem button component={Link} to="/feed-view">
          <ListItemIcon>
            <HistoryIcon />
          </ListItemIcon>
          <ListItemText primary={t('feed_inputs')} />
        </ListItem>
        <ListItem button component={Link} to="/water-quality-view">
          <ListItemIcon>
            <HistoryIcon />
          </ListItemIcon>
          <ListItemText primary={t('water_quality')} />
        </ListItem>
        <ListItem button component={Link} to="/historical-insights">
          <ListItemIcon>
            <HistoryIcon />
          </ListItemIcon>
          <ListItemText primary={t('historical_insights')} />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
