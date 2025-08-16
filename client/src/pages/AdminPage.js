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
  Select
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

const AdminPage = () => {
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
          name: item.name || '',
          startDate: item.startDate ? format(new Date(item.startDate), 'yyyy-MM-dd') : '',
          endDate: item.endDate ? format(new Date(item.endDate), 'yyyy-MM-dd') : '',
          status: item.status || ''
        });
      } else if (type === 'pond') {
        setFormData({
          name: item.name || '',
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
          name: formData.name,
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: formData.status
        };
        
        if (editingItem) {
          // Update existing season
          await updateSeasonMutation(editingItem._id || editingItem.id, seasonData);
        } else {
          // Create new season
          await createSeasonMutation(seasonData);
        }
      } else if (dialogType === 'pond') {
        const pondData = {
          name: formData.name,
          size: parseFloat(formData.size),
          capacity: parseInt(formData.capacity),
          seasonId: formData.seasonId,
          status: formData.status
        };
        
        if (editingItem) {
          // Update existing pond
          await updatePondMutation(editingItem._id || editingItem.id, pondData);
        } else {
          // Create new pond
          await createPondMutation(pondData);
        }
      }
      
      // Refresh data
      if (dialogType === 'season') {
        refetchSeasons();
      } else if (dialogType === 'pond') {
        refetchPonds();
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  // Handle delete
  const handleDelete = async (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
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
      alert('Please select both source and target seasons');
      return;
    }
    
    try {
      await copyPondDetailsMutation(sourceSeason, targetSeason);
      alert('Pond details copied successfully');
    } catch (error) {
      console.error('Error copying pond details:', error);
      alert('Failed to copy pond details');
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
      name: season.name,
      yield: season.yield ? parseFloat(season.yield.toString().replace(' tons', '')) || 0 : 0
    })), [seasonsData]);

  // Loading and error states
  const isLoading = seasonsLoading || pondsLoading;
  const hasError = seasonsError || pondsError;

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
          Error loading data: {seasonsError || pondsError}
        </Alert>
      </Container>
    );
  }

  // Use real data or fallback to mock data
  const seasons = seasonsData || [];
  const ponds = pondsData || [];

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Administration
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ExportIcon />} 
          onClick={() => exportToCSV(activeTab === 0 ? seasons : activeTab === 1 ? ponds : [], 'admin-data')}
        >
          Export Data
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
            <Tab icon={<SeasonIcon />} label="Seasons" />
            <Tab icon={<PondIcon />} label="Ponds" />
            <Tab icon={<CopyIcon />} label="Copy Pond Details" />
          </Tabs>
          
          {/* Search and filter bar */}
          {activeTab !== 2 && (
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search..."
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
                <ToggleButton value="all">All</ToggleButton>
                {activeTab === 0 && (
                  <>
                    <ToggleButton value="active">Active</ToggleButton>
                    <ToggleButton value="planning">Planning</ToggleButton>
                    <ToggleButton value="completed">Completed</ToggleButton>
                  </>
                )}
                {activeTab === 1 && (
                  <>
                    <ToggleButton value="active">Active</ToggleButton>
                    <ToggleButton value="planning">Planning</ToggleButton>
                    <ToggleButton value="inactive">Inactive</ToggleButton>
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
                      title="Manage Seasons"
                      action={
                        <Button 
                          variant="contained" 
                          startIcon={<AddIcon />} 
                          onClick={() => handleOpenDialog('season')}
                        >
                          Add New Season
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
                            <YAxis label={{ value: 'Yield (tons)', angle: -90, position: 'insideLeft' }} />
                            <RechartsTooltip />
                            <Legend />
                            <Bar dataKey="yield" name="Season Yield" fill="#007BFF" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                      
                      {/* Seasons Table */}
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getPagedData(seasons).map((season) => (
                              <TableRow key={season._id || season.id}>
                                <TableCell>{season.name}</TableCell>
                                <TableCell>
                                  {season.startDate ? format(new Date(season.startDate), 'yyyy-MM-dd') : 'N/A'}
                                </TableCell>
                                <TableCell>
                                  {season.endDate ? format(new Date(season.endDate), 'yyyy-MM-dd') : 'N/A'}
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={season.status || 'N/A'} 
                                    size="small" 
                                    color={
                                      (season.status || 'N/A') === 'Active' ? 'success' : 
                                      (season.status || 'N/A') === 'Planning' ? 'warning' : 
                                      'default'
                                    } 
                                  />
                                </TableCell>
                                <TableCell>
                                  <Tooltip title="Edit">
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleOpenDialog('season', season)}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      onClick={() => handleDelete('season', season._id || season.id)}
                                      disabled={deleteSeasonLoading}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      
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
                      title="Manage Ponds"
                      action={
                        <Button 
                          variant="contained" 
                          startIcon={<AddIcon />} 
                          onClick={() => handleOpenDialog('pond')}
                        >
                          Add New Pond
                        </Button>
                      }
                    />
                    <CardContent>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Size (m²)</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Season</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getPagedData(ponds).map((pond) => (
                              <TableRow key={pond._id || pond.id}>
                                <TableCell>
                                  <Button 
                                    variant="text" 
                                    onClick={() => navigate(`/pond/${pond._id || pond.id}`)}
                                    sx={{ justifyContent: 'flex-start', padding: 0, minWidth: 0, textAlign: 'left' }}
                                  >
                                    {pond.name}
                                  </Button>
                                </TableCell>
                                <TableCell>{pond.size}</TableCell>
                                <TableCell>{pond.capacity}</TableCell>
                                <TableCell>
                                  {pond.seasonId ? 
                                    (typeof pond.seasonId === 'object' ? pond.seasonId.name : pond.seasonId) : 
                                    'N/A'
                                  }
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={pond.status || 'N/A'} 
                                    size="small" 
                                    color={
                                      (pond.status || 'N/A') === 'Active' ? 'success' : 
                                      (pond.status || 'N/A') === 'Planning' ? 'warning' : 
                                      'default'
                                    } 
                                  />
                                </TableCell>
                                <TableCell>
                                  <Tooltip title="Edit">
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleOpenDialog('pond', pond)}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      onClick={() => handleDelete('pond', pond._id || pond.id)}
                                      disabled={deletePondLoading}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      
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
                    <CardHeader title="Copy Pond Details" />
                    <CardContent>
                      <Typography variant="body1" paragraph>
                        Select a source season and a target season to copy pond configurations.
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel id="source-season-label">Source Season</InputLabel>
                            <Select
                              labelId="source-season-label"
                              value={sourceSeason}
                              onChange={(e) => setSourceSeason(e.target.value)}
                              label="Source Season"
                            >
                              {seasons.map((season) => (
                                <MenuItem key={season._id || season.id} value={season._id || season.id}>
                                  {season.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel id="target-season-label">Target Season</InputLabel>
                            <Select
                              labelId="target-season-label"
                              value={targetSeason}
                              onChange={(e) => setTargetSeason(e.target.value)}
                              label="Target Season"
                            >
                              {seasons.map((season) => (
                                <MenuItem key={season._id || season.id} value={season._id || season.id}>
                                  {season.name}
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
                        {copyPondDetailsLoading ? 'Copying...' : 'Copy Pond Details'}
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
          {editingItem ? 'Edit ' : 'Add New '}
          {dialogType === 'season' ? 'Season' : 'Pond'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            {dialogType === 'season' && (
              <>
                <TextField
                  autoFocus
                  margin="dense"
                  name="name"
                  label="Season Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  margin="dense"
                  name="startDate"
                  label="Start Date"
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
                  label="End Date"
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
                  label="Status"
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="Planning">Planning</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </TextField>
              </>
            )}
            
            {dialogType === 'pond' && (
              <>
                <TextField
                  autoFocus
                  margin="dense"
                  name="name"
                  label="Pond Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  margin="dense"
                  name="size"
                  label="Size (m²)"
                  type="number"
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
                  label="Capacity"
                  type="number"
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
                  label="Season"
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  value={formData.seasonId}
                  onChange={handleInputChange}
                  required
                >
                  {seasons.map((season) => (
                    <MenuItem key={season._id || season.id} value={season._id || season.id}>
                      {season.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  margin="dense"
                  name="status"
                  select
                  label="Status"
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="Planning">Planning</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </TextField>
              </>
            )}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={createSeasonLoading || updateSeasonLoading || createPondLoading || updatePondLoading}
          >
            {createSeasonLoading || updateSeasonLoading || createPondLoading || updatePondLoading ? 
             'Saving...' : 
             editingItem ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPage;