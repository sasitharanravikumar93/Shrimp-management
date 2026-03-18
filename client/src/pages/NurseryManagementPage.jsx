import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useApiData, useApiMutation } from '../hooks/useApi';
import { 
  getNurseryBatches, 
  createNurseryBatch, 
  updateNurseryBatch, 
  deleteNurseryBatch,
  getSeasons
} from '../services/api';
import { format } from 'date-fns';

const NurseryManagementPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formData, setFormData] = useState({
    batchName: '',
    startDate: new Date(),
    initialCount: '',
    species: '',
    source: '',
    seasonId: '',
    status: 'Active'
  });

  // Fetch nursery batches
  const { 
    data: nurseryBatchesData, 
    loading: nurseryBatchesLoading, 
    error: nurseryBatchesError,
    refetch: refetchNurseryBatches
  } = useApiData(getNurseryBatches, []);

  // Fetch seasons
  const { 
    data: seasonsData, 
    loading: seasonsLoading, 
    error: seasonsError
  } = useApiData(getSeasons, []);

  // Mutations
  const { mutate: createBatchMutation, loading: createBatchLoading } = useApiMutation(createNurseryBatch);
  const { mutate: updateBatchMutation, loading: updateBatchLoading } = useApiMutation(updateNurseryBatch);
  const { mutate: deleteBatchMutation, loading: deleteBatchLoading } = useApiMutation(deleteNurseryBatch);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (batch = null) => {
    if (batch) {
      setEditingBatch(batch);
      setFormData({
        batchName: batch.batchName || batch.name || '',
        startDate: batch.startDate ? new Date(batch.startDate) : new Date(),
        initialCount: batch.initialCount || '',
        species: batch.species || '',
        source: batch.source || '',
        seasonId: batch.seasonId || '',
        status: batch.status || 'Active'
      });
    } else {
      setEditingBatch(null);
      setFormData({
        batchName: '',
        startDate: new Date(),
        initialCount: '',
        species: '',
        source: '',
        seasonId: '',
        status: 'Active'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBatch(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      startDate: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const batchData = {
        batchName: formData.batchName,
        startDate: formData.startDate,
        initialCount: parseInt(formData.initialCount),
        species: formData.species,
        source: formData.source,
        seasonId: formData.seasonId,
        status: formData.status
      };

      if (editingBatch) {
        // Update existing batch
        await updateBatchMutation(editingBatch._id || editingBatch.id, batchData);
      } else {
        // Create new batch
        await createBatchMutation(batchData);
      }
      
      handleCloseDialog();
      refetchNurseryBatches();
    } catch (error) {
      console.error('Error saving batch:', error);
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (window.confirm('Are you sure you want to delete this nursery batch?')) {
      try {
        await deleteBatchMutation(batchId);
        refetchNurseryBatches();
      } catch (error) {
        console.error('Error deleting batch:', error);
      }
    }
  };

  // Loading and error states
  const isLoading = nurseryBatchesLoading || seasonsLoading;
  const hasError = nurseryBatchesError || seasonsError;

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (hasError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Error loading data: {nurseryBatchesError || seasonsError}
        </Alert>
      </Container>
    );
  }

  // Use real data or fallback to mock data
  const nurseryBatches = nurseryBatchesData || [];
  const seasons = seasonsData || [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Nursery Management
      </Typography>
      
      <Card elevation={3}>
        <CardContent>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="nursery tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Nursery Batches" />
          </Tabs>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}> 
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardHeader
                    title="Manage Nursery Batches"
                    action={
                      <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={() => handleOpenDialog()}
                      >
                        Add New Batch
                      </Button>
                    }
                  />
                  <CardContent>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Batch Name</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>Initial Count</TableCell>
                            <TableCell>Species</TableCell>
                            <TableCell>Source</TableCell>
                            <TableCell>Season</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {nurseryBatches.map((batch) => (
                            <TableRow key={batch._id || batch.id}>
                              <TableCell>{batch.batchName || batch.name}</TableCell>
                              <TableCell>
                                {batch.startDate ? format(new Date(batch.startDate), 'yyyy-MM-dd') : 'N/A'}
                              </TableCell>
                              <TableCell>{batch.initialCount}</TableCell>
                              <TableCell>{batch.species}</TableCell>
                              <TableCell>{batch.source}</TableCell>
                              <TableCell>
                                {batch.seasonId ? 
                                  (typeof batch.seasonId === 'object' ? batch.seasonId.name : batch.seasonId) : 
                                  'N/A'
                                }
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={batch.status || 'Active'} 
                                  size="small" 
                                  color={
                                    (batch.status || 'Active') === 'Active' ? 'success' : 
                                    (batch.status || 'Active') === 'Completed' ? 'default' : 
                                    'warning'
                                  } 
                                />
                              </TableCell>
                              <TableCell>
                                <Tooltip title="Edit">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleOpenDialog(batch)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton 
                                    size="small" 
                                    color="error" 
                                    onClick={() => handleDeleteBatch(batch._id || batch.id)}
                                    disabled={deleteBatchLoading}
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
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
      
      {/* Dialog for adding/editing nursery batches */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBatch ? 'Edit Nursery Batch' : 'Add New Nursery Batch'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TextField
              autoFocus
              margin="dense"
              name="batchName"
              label="Batch Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.batchName}
              onChange={handleInputChange}
            />
            <DatePicker
              label="Start Date"
              value={formData.startDate}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth variant="outlined" sx={{ mt: 2 }} />}
            />
            <TextField
              margin="dense"
              name="initialCount"
              label="Initial Count"
              type="number"
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              value={formData.initialCount}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="species"
              label="Species"
              type="text"
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              value={formData.species}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="source"
              label="Source"
              type="text"
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              value={formData.source}
              onChange={handleInputChange}
            />
            <FormControl fullWidth variant="outlined" margin="dense" sx={{ mt: 2 }}>
              <InputLabel id="season-select-label">Season</InputLabel>
              <Select
                labelId="season-select-label"
                name="seasonId"
                value={formData.seasonId}
                onChange={handleInputChange}
                label="Season"
              >
                {seasons.map((season) => (
                  <MenuItem key={season._id || season.id} value={season._id || season.id}>
                    {season.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth variant="outlined" margin="dense" sx={{ mt: 2 }}>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Status"
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={createBatchLoading || updateBatchLoading}
          >
            {createBatchLoading || updateBatchLoading ? 'Saving...' : 
             editingBatch ? 'Update Batch' : 'Save Batch'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NurseryManagementPage;