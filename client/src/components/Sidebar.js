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

const drawerWidth = 240;

const Sidebar = () => {
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
          Shrimp Farm
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/feed-input">
          <ListItemIcon>
            <InputIcon />
          </ListItemIcon>
          <ListItemText primary="Feed Input" />
        </ListItem>
        <ListItem button component={Link} to="/growth-sampling">
          <ListItemIcon>
            <ShowChartIcon />
          </ListItemIcon>
          <ListItemText primary="Growth Sampling" />
        </ListItem>
        <ListItem button component={Link} to="/water-quality-input">
          <ListItemIcon>
            <WaterDropIcon />
          </ListItemIcon>
          <ListItemText primary="Water Quality Input" />
        </ListItem>
        <ListItem button component={Link} to="/nursery-management">
          <ListItemIcon>
            <SpaIcon />
          </ListItemIcon>
          <ListItemText primary="Nursery Management" />
        </ListItem>
        <ListItem button component={Link} to="/inventory-management"> {/* New Inventory Management Link */}
          <ListItemIcon>
            <InventoryIcon />
          </ListItemIcon>
          <ListItemText primary="Inventory Management" />
        </ListItem>
        <ListItem button component={Link} to="/admin">
          <ListItemIcon>
            <AdminPanelSettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Admin" />
        </ListItem>
        <ListItem button component={Link} to="/feed-view">
          <ListItemIcon>
            <HistoryIcon />
          </ListItemIcon>
          <ListItemText primary="Feed History" />
        </ListItem>
        <ListItem button component={Link} to="/water-quality-view">
          <ListItemIcon>
            <HistoryIcon />
          </ListItemIcon>
          <ListItemText primary="Water Quality History" />
        </ListItem>
        <ListItem button component={Link} to="/historical-insights">
          <ListItemIcon>
            <HistoryIcon />
          </ListItemIcon>
          <ListItemText primary="Historical Insights" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
