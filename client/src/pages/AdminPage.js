import React, { useState, useEffect, useMemo } from 'react';
import { 
  Typography, 
  Tabs, 
  Tab, 
  Box, 
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  MenuItem,
  InputAdornment,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  Event as EventIcon,
  Search as SearchIcon,
  Agriculture as SeasonIcon,
  Waves as PondIcon,
  CloudDownload as ExportIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import { useApiData, useApiMutation } from '../hooks/useApi';
import { 
  getSeasons, 
  createSeason, 
  updateSeason, 
  deleteSeason,
  getPonds,
  createPond,
  updatePond,
  deletePond,
  copyPondDetails
} from '../services/api';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import ResponsiveTable from '../components/ResponsiveTable';

const AdminPage = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'season', 'pond'
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [sourceSeason, setSourceSeason] = useState('');
  const [targetSeason, setTargetSeason] = useState('');
  const itemsPerPage = 5;
  const navigate = useNavigate();
  
  // Log component mount/unmount for debugging
  useEffect(() => {
    console.log('AdminPage mounted');
    
    return () => {
      console.log('AdminPage unmounted');
    };
  }, []);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: '',
    size: '',
    capacity: '',
    seasonId: ''
  });

  // Fetch seasons
  const { 
    data: seasonsData, 
    loading: seasonsLoading, 
    error: seasonsError,
    refetch: refetchSeasons
  } = useApiData(getSeasons, [], 'seasons', 1);

  // Fetch ponds
  const { 
    data: pondsData, 
    loading: pondsLoading, 
    error: pondsError,
    refetch: refetchPonds
  } = useApiData(getPonds, [], 'ponds', 1);

  // Mutations
  const { mutate: createSeasonMutation, loading: createSeasonLoading } = useApiMutation(createSeason);
  const { mutate: updateSeasonMutation, loading: updateSeasonLoading } = useApiMutation(updateSeason);
  const { mutate: deleteSeasonMutation, loading: deleteSeasonLoading } = useApiMutation(deleteSeason);
  const { mutate: createPondMutation, loading: createPondLoading } = useApiMutation(createPond);
  const { mutate: updatePondMutation, loading: updatePondLoading } = useApiMutation(updatePond);
  const { mutate: deletePondMutation, loading: deletePondLoading } = useApiMutation(deletePond);
  const { mutate: copyPondDetailsMutation, loading: copyPondDetailsLoading } = useApiMutation(copyPondDetails);

  const handleTabChange = (event, newValue) => {
    // If the removed tab (index 3) was selected, default to the first tab (index 0)
    if (newValue === 3) {
      setActiveTab(0);
    } else {
      setActiveTab(newValue);
    }
    // Reset filters when changing tabs
    setSearchTerm('');
    setFilter('all');
    setPage(1);
  };
  
  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    setEditingItem(item);
    
    if (item) {
        // Populate form with existing data
        if (type === 'season') {
          setFormData({
            name: typeof item.name === 'object' ? (item.name.en || '') : (item.name || ''),
            startDate: item.startDate ? format(new Date(item.startDate), 'yyyy-MM-dd') : '',
            endDate: item.endDate ? format(new Date(item.endDate), 'yyyy-MM-dd') : '',
            status: item.status || ''
          });
        } else if (type === 'pond') {
          setFormData({
            name: typeof item.name === 'object' ? (item.name.en || '') : (item.name || ''),
            size: item.size || '',
            capacity: item.capacity || '',
            seasonId: item.seasonId || item.season || '',
            status: item.status || ''
          });
        }
      } else {
        // Reset form for new item
        setFormData({
          name: '',
          startDate: '',
          endDate: '',
          status: '',
          size: '',
          capacity: '',
          seasonId: ''
        });
      }
    
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };
  
  // Filter and paginate data based on current tab
  const getFilteredData = useMemo(() => (data) => {
    // Apply search filter
    let filtered = data || [];
    if (searchTerm) {
      filtered = filtered.filter(item => 
        Object.values(item).some(val => 
          val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(item => 
        (item.status && item.status.toLowerCase() === filter) ||
        (item.type && item.type.toLowerCase() === filter)
      );
    }
    
    return filtered;
  }, [searchTerm, filter]);

  const getPagedData = useMemo(() => (data) => {
    const filtered = getFilteredData(data);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [getFilteredData, page, itemsPerPage]);

  const getTotalPages = useMemo(() => (data) => {
    const filtered = getFilteredData(data);
    return Math.ceil(filtered.length / itemsPerPage);
  }, [getFilteredData, itemsPerPage]);

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle filter change
  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  // Reset to first page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filter]);

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (dialogType === 'season') {
        const seasonData = {
          name: { en: formData.name },
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: formData.status
        };
        
        console.log('Submitting season data:', seasonData);
        
        if (editingItem) {
          // Update existing season
          console.log('Updating existing season:', editingItem._id || editingItem.id);
          await updateSeasonMutation(editingItem._id || editingItem.id, seasonData);
        } else {
          // Create new season
          console.log('Creating new season');
          await createSeasonMutation(seasonData);
        }
      } else if (dialogType === 'pond') {
        const pondData = {
          name: { en: formData.name },
          size: parseFloat(formData.size),
          capacity: parseInt(formData.capacity),
          seasonId: formData.seasonId,
          status: formData.status
        };
        
        console.log('Submitting pond data:', pondData);
        
        if (editingItem) {
          // Update existing pond
          console.log('Updating existing pond:', editingItem._id || editingItem.id);
          const result = await updatePondMutation(editingItem._id || editingItem.id, pondData);
          console.log('Pond update result:', result);
        } else {
          // Create new pond
          console.log('Creating new pond');
          const result = await createPondMutation(pondData);
          console.log('Pond creation result:', result);
          
          // Log the created pond details
          if (result && result.data) {
            console.log('Created pond details:', result.data);
          }
        }
      }
      
      // Refresh data
      console.log('Refreshing data after submission');
      if (dialogType === 'season') {
        console.log('Refetching seasons');
        refetchSeasons();
      } else if (dialogType === 'pond') {
        console.log('Refetching ponds');
        refetchPonds();
        
        // Also clear the cache for the specific season
        if (formData.seasonId) {
          console.log('Clearing cache for season-specific ponds:', formData.seasonId);
          // We don't have a direct way to clear the cache in useApiData, 
          // so we'll just log this for now
        }
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  // Handle delete
  const handleDelete = async (type, id) => {
    if (!id) {
      console.warn(`Attempted to delete ${type} with no ID.`);
      return;
    }
    if (window.confirm(`${t('areYouSure')} ${t('delete')} ${type}?`)) {
      try {
        if (type === 'season') {
          await deleteSeasonMutation(id);
          refetchSeasons();
        } else if (type === 'pond') {
          await deletePondMutation(id);
          refetchPonds();
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  // Handle copy pond details
  const handleCopyPondDetails = async () => {
    if (!sourceSeason || !targetSeason) {
      alert(t('select_source_target_seasons'));
      return;
    }
    
    try {
      await copyPondDetailsMutation(sourceSeason, targetSeason);
      alert(t('pond_details_copied_successfully'));
    } catch (error) {
      console.error('Error copying pond details:', error);
      alert(t('failed_to_copy_pond_details'));
    }
  };

  // Export data to CSV
  const exportToCSV = (data, filename) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Yield data for chart
  const yieldData = useMemo(() => (seasonsData || [])
    .filter(season => season.status === 'Completed')
    .map(season => ({
      name: typeof season.name === 'object' ? season.name.en : season.name,
      yield: season.yield ? parseFloat(season.yield.toString().replace(' tons', '')) || 0 : 0
    })), [seasonsData]);

  // Use real data or fallback to mock data
  const seasons = seasonsData || [];
  const ponds = pondsData ? pondsData.data : [];

  // Loading and error states
  const isLoading = seasonsLoading || pondsLoading;
  const hasError = seasonsError || pondsError;

  // Debugging: Log pond data to see what's being passed
  React.useEffect(() => {
    if (ponds && ponds.length > 0) {
      console.log('Pond data:', ponds[0]);
    }
  }, [ponds]);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (hasError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        <Alert severity="error">
          {t('error_loading_data')}: {seasonsError || pondsError}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<ExportIcon />} 
          onClick={() => exportToCSV(activeTab === 0 ? seasons : activeTab === 1 ? ponds : [], 'admin-data')}
        >
          {t('export_data')}
        </Button>
      </Box>
      
      <Card elevation={3}>
        <CardContent>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="admin tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              mb: 3,
              '& .MuiTab-root': {
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 60
              },
              '& .MuiTab-iconWrapper': {
                mb: '0 !important',
                mr: 1
              }
            }}
          >
            <Tab icon={<SeasonIcon />} label={t('seasons')} />
            <Tab icon={<PondIcon />} label={t('ponds')} />
            <Tab icon={<CopyIcon />} label={t('copy_pond_details')} />
          </Tabs>
          
          {/* Search and filter bar */}
          {activeTab !== 2 && (
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                placeholder={t('search')}
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 200 }}
              />
              
              <ToggleButtonGroup
                size="small"
                value={filter}
                exclusive
                onChange={handleFilterChange}
              >
                <ToggleButton value="all">{t('all')}</ToggleButton>
                {activeTab === 0 && (
                  <>
                    <ToggleButton value="active">{t('active')}</ToggleButton>
                    <ToggleButton value="planning">{t('planning')}</ToggleButton>
                    <ToggleButton value="completed">{t('completed')}</ToggleButton>
                  </>
                )}
                {activeTab === 1 && (
                  <>
                    <ToggleButton value="active">{t('active')}</ToggleButton>
                    <ToggleButton value="planning">{t('planning')}</ToggleButton>
                    <ToggleButton value="inactive">{t('inactive')}</ToggleButton>
                  </>
                )}
              </ToggleButtonGroup>
            </Box>
          )}
          
          <Box sx={{ p: 2 }}>
            {activeTab === 0 && (
              <Grid container spacing={3}> 
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader
                      title={t('manage_seasons')}
                      action={
                        <Button 
                          variant="contained" 
                          startIcon={<AddIcon />} 
                          onClick={() => handleOpenDialog('season')}
                        >
                          {t('add_new_season')}
                        </Button>
                      }
                    />
                    <CardContent>
                      {/* Yield Chart */}
                      <Box sx={{ height: 300, mb: 3 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={yieldData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis label={{ value: t('yield_tons'), angle: -90, position: 'insideLeft' }} />
                            <RechartsTooltip />
                            <Legend />
                            <Bar dataKey="yield" name={t('season_yield')} fill="#007BFF" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                      
                      {/* Seasons Table */}
                      <ResponsiveTable
                        columns={[
                          {
                            id: 'name',
                            label: t('name'),
                            render: (value) => typeof value === 'object' ? value[i18n.language] || value.en : value
                          },
                          {
                            id: 'startDate',
                            label: t('startDate'),
                            render: (value) => value ? format(new Date(value), 'yyyy-MM-dd') : 'N/A'
                          },
                          {
                            id: 'endDate',
                            label: t('endDate'),
                            render: (value) => value ? format(new Date(value), 'yyyy-MM-dd') : 'N/A'
                          },
                          {
                            id: 'status',
                            label: t('status'),
                            render: (value) => (
                              <Chip 
                                label={value || 'N/A'} 
                                size="small" 
                                color={
                                  (value || 'N/A') === 'Active' ? 'success' : 
                                  (value || 'N/A') === 'Planning' ? 'warning' : 
                                  'default'
                                } 
                              />
                            )
                          },
                          {
                            id: 'actions',
                            label: t('actions'),
                            render: (_, row) => (
                              <>
                                <Tooltip title={t('edit')}>
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenDialog('season', row);
                                    }}
                                    sx={{ 
                                      minWidth: 48, 
                                      minHeight: 48,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={t('delete')}>
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete('season', row._id || row.id);
                                    }}
                                    disabled={deleteSeasonLoading}
                                    sx={{ 
                                      minWidth: 48, 
                                      minHeight: 48,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )
                          }
                        ]}
                        data={getPagedData(seasons)}
                        rowKey="_id"
                      />
                      
                      {/* Pagination */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Pagination 
                          count={getTotalPages(seasons)} 
                          page={page} 
                          onChange={handlePageChange} 
                          color="primary" 
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            
            {activeTab === 1 && (
              <Grid container spacing={3}> 
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader
                      title={t('manage_ponds')}
                      action={
                        <Button 
                          variant="contained" 
                          startIcon={<AddIcon />} 
                          onClick={() => handleOpenDialog('pond')}
                        >
                          {t('add_new_pond')}
                        </Button>
                      }
                    />
                    <CardContent>
                      <ResponsiveTable
                        columns={[
                          {
                            id: 'name',
                            label: t('name'),
                            render: (value, row) => (
                              <Typography 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Navigating with pond ID:', row._id);
                                  navigate(`/pond/${row._id}`);
                                }}
                                sx={{ 
                                  cursor: 'pointer',
                                  color: 'text.primary',
                                  textDecoration: 'none',
                                  '&:hover': {
                                    textDecoration: 'underline'
                                  }
                                }}
                              >
                                {typeof value === 'object' ? value[i18n.language] || value.en : value}
                              </Typography>
                            )
                          },
                          {
                            id: 'size',
                            label: t('size_m2')
                          },
                          {
                            id: 'capacity',
                            label: t('capacity')
                          },
                          {
                            id: 'seasonId',
                            label: t('season'),
                            render: (value) => {
                              if (!value) return 'N/A';
                              if (typeof value === 'object') {
                                if (typeof value.name === 'object') {
                                  return value.name[i18n.language] || value.name.en;
                                }
                                return value.name;
                              }
                              return value;
                            }
                          },
                          {
                            id: 'status',
                            label: t('status'),
                            render: (value) => (
                              <Chip 
                                label={value || 'N/A'} 
                                size="small" 
                                color={
                                  (value || 'N/A') === 'Active' ? 'success' : 
                                  (value || 'N/A') === 'Planning' ? 'warning' : 
                                  'default'
                                } 
                              />
                            )
                          },
                          {
                            id: 'actions',
                            label: t('actions'),
                            render: (_, row) => (
                              <>
                                <Tooltip title={t('edit')}>
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenDialog('pond', row);
                                    }}
                                    sx={{ 
                                      minWidth: 48, 
                                      minHeight: 48,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={t('delete')}>
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete('pond', row._id);
                                    }}
                                    disabled={deletePondLoading}
                                    sx={{ 
                                      minWidth: 48, 
                                      minHeight: 48,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )
                          }
                        ]}
                        data={getPagedData(ponds)}
                        rowKey="_id"
                        onRowClick={(row) => {
                          console.log('Row clicked, pond ID:', row._id);
                          navigate(`/pond/${row._id}`);
                        }}
                      />
                      
                      {/* Pagination */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Pagination 
                          count={getTotalPages(ponds)} 
                          page={page} 
                          onChange={handlePageChange} 
                          color="primary" 
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            
            {activeTab === 2 && (
              <Grid container spacing={3}> 
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader title={t('copy_pond_details')} />
                    <CardContent>
                      <Typography variant="body1" paragraph>
                        {t('select_source_target_seasons_description')}
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel id="source-season-label">{t('source_season')}</InputLabel>
                            <Select
                              labelId="source-season-label"
                              value={sourceSeason}
                              onChange={(e) => setSourceSeason(e.target.value)}
                              label={t('source_season')}
                            >
                              {seasons.map((season) => (
                                <MenuItem key={season._id || season.id} value={season._id || season.id}>
                                  {typeof season.name === 'object' 
                                    ? season.name[i18n.language] || season.name.en 
                                    : season.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel id="target-season-label">{t('target_season')}</InputLabel>
                            <Select
                              labelId="target-season-label"
                              value={targetSeason}
                              onChange={(e) => setTargetSeason(e.target.value)}
                              label={t('target_season')}
                            >
                              {seasons.map((season) => (
                                <MenuItem key={season._id || season.id} value={season._id || season.id}>
                                  {typeof season.name === 'object' 
                                    ? season.name[i18n.language] || season.name.en 
                                    : season.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                      <Button 
                        variant="contained" 
                        startIcon={<CopyIcon />} 
                        onClick={handleCopyPondDetails}
                        disabled={copyPondDetailsLoading}
                      >
                        {copyPondDetailsLoading ? t('copying') : t('copy_pond_details')}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        </CardContent>
      </Card>
      
      {/* Dialog for adding/editing items */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? t('edit') : t('add_new')} 
          {dialogType === 'season' ? t('season') : t('pond')}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            {dialogType === 'season' && (
              <>
                <TextField
                  autoFocus
                  margin="dense"
                  label={t('name')}
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.name}
                  onChange={handleInputChange}
                  name="name"
                  required
                />
                <TextField
                  margin="dense"
                  name="startDate"
                  label={t('startDate')}
                  type="date"
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{ mt: 2 }}
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  margin="dense"
                  name="endDate"
                  label={t('endDate')}
                  type="date"
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{ mt: 2 }}
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  margin="dense"
                  name="status"
                  select
                  label={t('status')}
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="Planning">{t('planning')}</MenuItem>
                  <MenuItem value="Active">{t('active')}</MenuItem>
                  <MenuItem value="Completed">{t('completed')}</MenuItem>
                </TextField>
              </>
            )}
            
            {dialogType === 'pond' && (
              <>
                <TextField
                  autoFocus
                  margin="dense"
                  label={t('name')}
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.name}
                  onChange={handleInputChange}
                  name="name"
                  required
                />
                <TextField
                  margin="dense"
                  name="size"
                  label={`${t('size')} (m²)`}
                  type="number"
                  inputProps={{ inputMode: 'decimal', min: 0 }}
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  value={formData.size}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  margin="dense"
                  name="capacity"
                  label={t('capacity')}
                  type="number"
                  inputProps={{ inputMode: 'numeric', min: 0 }}
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  margin="dense"
                  name="seasonId"
                  select
                  label={t('season')}
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  value={formData.seasonId}
                  onChange={handleInputChange}
                  required
                >
                  {seasons.map((season) => (
                    <MenuItem key={season._id || season.id} value={season._id || season.id}>
                      {typeof season.name === 'object' 
                        ? (season.name[i18n.language] || season.name.en || season.name)
                        : season.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  margin="dense"
                  name="status"
                  select
                  label={t('status')}
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="Planning">{t('planning')}</MenuItem>
                  <MenuItem value="Active">{t('active')}</MenuItem>
                  <MenuItem value="Inactive">{t('inactive')}</MenuItem>
                  <MenuItem value="Completed">{t('completed')}</MenuItem>
                </TextField>
              </>
            )}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('cancel')}</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={createSeasonLoading || updateSeasonLoading || createPondLoading || updatePondLoading}
          >
            {createSeasonLoading || updateSeasonLoading || createPondLoading || updatePondLoading ? 
             t('saving') : 
             editingItem ? t('update') : t('save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPage;