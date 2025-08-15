import React, { useState } from 'react';
import { 
  Typography, 
  Tabs, 
  Tab, 
  Box, 
  Paper, 
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
  ToggleButtonGroup
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

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'season', 'pond', 'event'
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset filters when changing tabs
    setSearchTerm('');
    setFilter('all');
    setPage(1);
  };
  
  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Placeholder data
  const seasons = [
    { id: 1, name: 'Season 2023', startDate: '2023-01-01', endDate: '2023-12-31', status: 'Active', yield: '45 tons' },
    { id: 2, name: 'Season 2024', startDate: '2024-01-01', endDate: '2024-12-31', status: 'Planning', yield: 'N/A' },
    { id: 3, name: 'Season 2022', startDate: '2022-01-01', endDate: '2022-12-31', status: 'Completed', yield: '38 tons' },
    { id: 4, name: 'Season 2021', startDate: '2021-01-01', endDate: '2021-12-31', status: 'Completed', yield: '42 tons' },
    { id: 5, name: 'Season 2020', startDate: '2020-01-01', endDate: '2020-12-31', status: 'Completed', yield: '39 tons' }
  ];
  
  const ponds = [
    { id: 1, name: 'Pond A', size: '1000 m²', capacity: '5000 shrimp', season: 'Season 2023', status: 'Active' },
    { id: 2, name: 'Pond B', size: '1200 m²', capacity: '6000 shrimp', season: 'Season 2023', status: 'Active' },
    { id: 3, name: 'Pond C', size: '800 m²', capacity: '4000 shrimp', season: 'Season 2023', status: 'Inactive' },
    { id: 4, name: 'Pond D', size: '1500 m²', capacity: '7500 shrimp', season: 'Season 2024', status: 'Planning' },
    { id: 5, name: 'Pond E', size: '1100 m²', capacity: '5500 shrimp', season: 'Season 2022', status: 'Completed' }
  ];
  
  const events = [
    { id: 1, title: 'Feeding', date: '2023-06-15', type: 'Routine', pond: 'Pond A' },
    { id: 2, title: 'Water Change', date: '2023-06-20', type: 'Maintenance', pond: 'Pond B' },
    { id: 3, title: 'Growth Sampling', date: '2023-06-25', type: 'Monitoring', pond: 'Pond A' },
    { id: 4, title: 'Harvest', date: '2023-07-10', type: 'Harvest', pond: 'Pond C' },
    { id: 5, title: 'Aeration Check', date: '2023-06-18', type: 'Maintenance', pond: 'Pond D' }
  ];

  // Filter and paginate data based on current tab
  const getFilteredData = (data) => {
    // Apply search filter
    let filtered = data;
    if (searchTerm) {
      filtered = data.filter(item => 
        Object.values(item).some(val => 
          val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(item => 
        item.status?.toLowerCase() === filter || 
        item.type?.toLowerCase() === filter
      );
    }
    
    return filtered;
  };

  const getPagedData = (data) => {
    const filtered = getFilteredData(data);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = (data) => {
    const filtered = getFilteredData(data);
    return Math.ceil(filtered.length / itemsPerPage);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Handle filter change
  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
      setPage(1); // Reset to first page when filtering
    }
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
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
  const yieldData = seasons
    .filter(season => season.status === 'Completed')
    .map(season => ({
      name: season.name,
      yield: parseFloat(season.yield.replace(' tons', '')) || 0
    }));

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Administration
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ExportIcon />} 
          onClick={() => exportToCSV(activeTab === 0 ? seasons : activeTab === 1 ? ponds : events, 'admin-data')}
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
            <Tab icon={<EventIcon />} label="Events" />
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
                {activeTab === 3 && (
                  <>
                    <ToggleButton value="routine">Routine</ToggleButton>
                    <ToggleButton value="maintenance">Maintenance</ToggleButton>
                    <ToggleButton value="monitoring">Monitoring</ToggleButton>
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
                              <TableCell sx={{ fontWeight: 'bold' }}>Yield</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getPagedData(seasons).map((season) => (
                              <TableRow key={season.id}>
                                <TableCell>{season.name}</TableCell>
                                <TableCell>{season.startDate}</TableCell>
                                <TableCell>{season.endDate}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={season.status} 
                                    size="small" 
                                    color={
                                      season.status === 'Active' ? 'success' : 
                                      season.status === 'Planning' ? 'warning' : 
                                      'default'
                                    } 
                                  />
                                </TableCell>
                                <TableCell>{season.yield}</TableCell>
                                <TableCell>
                                  <Tooltip title="Edit">
                                    <IconButton size="small" onClick={() => handleOpenDialog('season')}>
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton size="small" color="error">
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
                              <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Season</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getPagedData(ponds).map((pond) => (
                              <TableRow key={pond.id}>
                                <TableCell>
                                  <Button 
                                    variant="text" 
                                    onClick={() => navigate(`/pond/${pond.id}`)}
                                    sx={{ justifyContent: 'flex-start', padding: 0, minWidth: 0, textAlign: 'left' }}
                                  >
                                    {pond.name}
                                  </Button>
                                </TableCell>
                                <TableCell>{pond.size}</TableCell>
                                <TableCell>{pond.capacity}</TableCell>
                                <TableCell>{pond.season}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={pond.status} 
                                    size="small" 
                                    color={
                                      pond.status === 'Active' ? 'success' : 
                                      pond.status === 'Planning' ? 'warning' : 
                                      'default'
                                    } 
                                  />
                                </TableCell>
                                <TableCell>
                                  <Tooltip title="Edit">
                                    <IconButton size="small" onClick={() => handleOpenDialog('pond')}>
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton size="small" color="error">
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
                          <TextField
                            select
                            label="Source Season"
                            fullWidth
                            variant="outlined"
                          >
                            {seasons.map((season) => (
                              <MenuItem key={season.id} value={season.id}>
                                {season.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            select
                            label="Target Season"
                            fullWidth
                            variant="outlined"
                          >
                            {seasons.map((season) => (
                              <MenuItem key={season.id} value={season.id}>
                                {season.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                      </Grid>
                      <Button variant="contained" startIcon={<CopyIcon />}>
                        Copy Pond Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            
            {activeTab === 3 && (
              <Grid container spacing={3}> 
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader
                      title="Manage Events"
                      action={
                        <Button 
                          variant="contained" 
                          startIcon={<AddIcon />} 
                          onClick={() => handleOpenDialog('event')}
                        >
                          Add New Event
                        </Button>
                      }
                    />
                    <CardContent>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Pond</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getPagedData(events).map((event) => (
                              <TableRow key={event.id}>
                                <TableCell>{event.title}</TableCell>
                                <TableCell>{event.date}</TableCell>
                                <TableCell>{event.pond}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={event.type} 
                                    size="small" 
                                    color={
                                      event.type === 'Routine' ? 'primary' : 
                                      event.type === 'Maintenance' ? 'warning' : 
                                      event.type === 'Monitoring' ? 'success' : 
                                      'default'
                                    } 
                                  />
                                </TableCell>
                                <TableCell>
                                  <Tooltip title="Edit">
                                    <IconButton size="small" onClick={() => handleOpenDialog('event')}>
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton size="small" color="error">
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
                          count={getTotalPages(events)} 
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
          </Box>
        </CardContent>
      </Card>
      
      {/* Dialog for adding/editing items */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'season' && 'Add/Edit Season'}
          {dialogType === 'pond' && 'Add/Edit Pond'}
          {dialogType === 'event' && 'Add/Edit Event'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'season' && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Season Name"
                type="text"
                fullWidth
                variant="outlined"
              />
              <TextField
                margin="dense"
                label="Start Date"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ mt: 2 }}
              />
              <TextField
                margin="dense"
                label="End Date"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ mt: 2 }}
              />
              <TextField
                margin="dense"
                select
                label="Status"
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
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
                label="Pond Name"
                type="text"
                fullWidth
                variant="outlined"
              />
              <TextField
                margin="dense"
                label="Size (m²)"
                type="number"
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
              />
              <TextField
                margin="dense"
                label="Capacity"
                type="number"
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
              />
              <TextField
                margin="dense"
                select
                label="Season"
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
              >
                {seasons.map((season) => (
                  <MenuItem key={season.id} value={season.id}>
                    {season.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                margin="dense"
                select
                label="Status"
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
              >
                <MenuItem value="Planning">Planning</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
            </>
          )}
          
          {dialogType === 'event' && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Event Title"
                type="text"
                fullWidth
                variant="outlined"
              />
              <TextField
                margin="dense"
                label="Date"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ mt: 2 }}
              />
              <TextField
                margin="dense"
                select
                label="Type"
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
              >
                <MenuItem value="Routine">Routine</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Monitoring">Monitoring</MenuItem>
                <MenuItem value="Harvest">Harvest</MenuItem>
              </TextField>
              <TextField
                margin="dense"
                select
                label="Pond"
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
              >
                {ponds.map((pond) => (
                  <MenuItem key={pond.id} value={pond.id}>
                    {pond.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                margin="dense"
                label="Description"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCloseDialog} variant="contained">
            {dialogType === 'season' && 'Save Season'}
            {dialogType === 'pond' && 'Save Pond'}
            {dialogType === 'event' && 'Save Event'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPage;