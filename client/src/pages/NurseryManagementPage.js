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
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const NurseryManagementPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Placeholder data
  const nurseryBatches = [
    { 
      id: 1, 
      batchName: 'Batch A', 
      startDate: '2023-01-15', 
      initialCount: 10000, 
      species: 'Vannamei', 
      source: 'ABC Hatchery',
      season: 'Season 2023',
      status: 'Active'
    },
    { 
      id: 2, 
      batchName: 'Batch B', 
      startDate: '2023-02-01', 
      initialCount: 12000, 
      species: 'Vannamei', 
      source: 'XYZ Hatchery',
      season: 'Season 2023',
      status: 'Completed'
    }
  ];
  
  // Placeholder data for seasons
  const seasons = [
    { id: 1, name: 'Season 2023' },
    { id: 2, name: 'Season 2024' }
  ];

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
                        onClick={handleOpenDialog}
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
                            <TableRow key={batch.id}>
                              <TableCell>{batch.batchName}</TableCell>
                              <TableCell>{batch.startDate}</TableCell>
                              <TableCell>{batch.initialCount}</TableCell>
                              <TableCell>{batch.species}</TableCell>
                              <TableCell>{batch.source}</TableCell>
                              <TableCell>{batch.season}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={batch.status} 
                                  size="small" 
                                  color={batch.status === 'Active' ? 'success' : 'default'} 
                                />
                              </TableCell>
                              <TableCell>
                                <Tooltip title="Edit">
                                  <IconButton size="small" onClick={handleOpenDialog}>
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
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
      
      {/* Dialog for adding/editing nursery batches */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add/Edit Nursery Batch</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TextField
              autoFocus
              margin="dense"
              label="Batch Name"
              type="text"
              fullWidth
              variant="outlined"
            />
            <DatePicker
              label="Start Date"
              renderInput={(params) => <TextField {...params} fullWidth variant="outlined" sx={{ mt: 2 }} />}
            />
            <TextField
              margin="dense"
              label="Initial Count"
              type="number"
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
            />
            <TextField
              margin="dense"
              label="Species"
              type="text"
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
            />
            <TextField
              margin="dense"
              label="Source"
              type="text"
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
            />
            <FormControl fullWidth variant="outlined" margin="dense" sx={{ mt: 2 }}>
              <InputLabel id="season-select-label">Season</InputLabel>
              <Select
                labelId="season-select-label"
                label="Season"
              >
                {seasons.map((season) => (
                  <MenuItem key={season.id} value={season.id}>{season.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCloseDialog} variant="contained">Save Batch</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NurseryManagementPage;