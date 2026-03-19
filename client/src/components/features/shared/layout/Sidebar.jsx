import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import InputIcon from '@mui/icons-material/Input';
import InventoryIcon from '@mui/icons-material/Inventory'; // New import
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SpaIcon from '@mui/icons-material/Spa';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  MenuItem,
  Select,
  FormControl,
  Box
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useSeason } from '../../../context/SeasonContext';

const drawerWidth = 240;

const Sidebar = () => {
  const { t } = useTranslation();
  const { seasons, selectedSeason, selectSeason, loading } = useSeason();

  console.log('Sidebar: Rendering with:', {
    seasons: seasons?.length || 0,
    selectedSeason: selectedSeason?._id || 'none',
    loading,
    seasonsData: seasons
  });

  return (
    <Drawer
      variant='permanent'
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' }
      }}
    >
      <Toolbar>
        <Typography variant='h6' noWrap component='div'>
          {t('app_title')}
        </Typography>
      </Toolbar>
      <Divider />
      {/* Season Selector */}
      <Box sx={{ p: 2 }}>
        {!loading && seasons && seasons.length > 0 && (
          <FormControl fullWidth size='small'>
            <Select
              displayEmpty
              value={selectedSeason?._id || ''}
              onChange={e => {
                const selected = seasons.find(season => season._id === e.target.value);
                selectSeason(selected);
              }}
            >
              {seasons.map(season => (
                <MenuItem key={season._id} value={season._id}>
                  {typeof season.name === 'object' ? season.name.en : season.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
      <Divider />
      <List>
        <ListItem button component={Link} to='/'>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary={t('dashboard.title')} />
        </ListItem>
        <ListItem button component={Link} to='/feed-input'>
          <ListItemIcon>
            <InputIcon />
          </ListItemIcon>
          <ListItemText primary={t('feed_input_entry')} />
        </ListItem>
        <ListItem button component={Link} to='/growth-sampling'>
          <ListItemIcon>
            <ShowChartIcon />
          </ListItemIcon>
          <ListItemText primary={t('growth_sampling_entry')} />
        </ListItem>
        <ListItem button component={Link} to='/water-quality-input'>
          <ListItemIcon>
            <WaterDropIcon />
          </ListItemIcon>
          <ListItemText primary={t('water_quality_input_entry')} />
        </ListItem>
        <ListItem button component={Link} to='/nursery-management'>
          <ListItemIcon>
            <SpaIcon />
          </ListItemIcon>
          <ListItemText primary={t('nursery_management')} />
        </ListItem>
        <ListItem button component={Link} to='/inventory-management'>
          <ListItemIcon>
            <InventoryIcon />
          </ListItemIcon>
          <ListItemText primary={t('inventory_management')} />
        </ListItem>
        <ListItem button component={Link} to='/admin'>
          <ListItemIcon>
            <AdminPanelSettingsIcon />
          </ListItemIcon>
          <ListItemText primary={t('admin_settings')} />
        </ListItem>
        <ListItem button component={Link} to='/feed-view'>
          <ListItemIcon>
            <HistoryIcon />
          </ListItemIcon>
          <ListItemText primary={t('feed_data_view')} />
        </ListItem>
        <ListItem button component={Link} to='/water-quality-view'>
          <ListItemIcon>
            <HistoryIcon />
          </ListItemIcon>
          <ListItemText primary={t('water_quality_data_view')} />
        </ListItem>
        <ListItem button component={Link} to='/historical-insights'>
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

// Add PropTypes validation
Sidebar.propTypes = {
  // No props for this component
};
