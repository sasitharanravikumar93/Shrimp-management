import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Container,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Search as SearchIcon,
  Download as DownloadIcon,
  FilterAlt as FilterIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useApiData } from '../hooks/useApi';
import { 
  getWaterQualityInputs, 
  getPonds 
} from '../services/api';
import { useTranslation } from 'react-i18next';

const WaterQualityViewPage = () => {
  const { t, i18n } = useTranslation();
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago
  const [endDate, setEndDate] = useState(new Date());
  const [pond, setPond] = useState('');
  const [parameter, setParameter] = useState('');
  const [search, setSearch] = useState('');
  const [filteredWaterQualityEntries, setFilteredWaterQualityEntries] = useState([]);

  // Fetch all water quality entries
  const { 
    data: waterQualityEntriesData, 
    loading: waterQualityEntriesLoading, 
    error: waterQualityEntriesError,
    refetch: refetchWaterQualityEntries
  } = useApiData(getWaterQualityInputs, []);

  // Fetch ponds
  const { 
    data: pondsData, 
    loading: pondsLoading, 
    error: pondsError
  } = useApiData(getPonds, []);

  // Loading and error states
  const isLoading = waterQualityEntriesLoading || pondsLoading;
  const hasError = waterQualityEntriesError || pondsError;

  // Water quality parameters
  const parameters = [
    'pH',
    'Dissolved Oxygen',
    'Temperature',
    'Salinity',
    'Ammonia',
    'Nitrite',
    'Alkalinity'
  ];

  // Filter water quality entries based on search term
  useEffect(() => {
    if (waterQualityEntriesData && waterQualityEntriesData.data) {
      let filtered = waterQualityEntriesData.data;
      
      // Apply search filter
      if (search) {
        filtered = filtered.filter(entry => 
          (entry.pH && entry.pH.toString().includes(search)) ||
          (entry.dissolvedOxygen && entry.dissolvedOxygen.toString().includes(search)) ||
          (entry.temperature && entry.temperature.toString().includes(search)) ||
          (entry.salinity && entry.salinity.toString().includes(search))
        );
      }
      
      // Apply pond filter
      if (pond) {
        filtered = filtered.filter(entry => entry.pondId === pond);
      }
      
      setFilteredWaterQualityEntries(filtered);
    }
  }, [waterQualityEntriesData, search, pond]);

  const handleFilter = async () => {
    try {
      // If pond is selected, fetch water quality entries for that pond
      if (pond) {
        // Note: This would require a new API endpoint to filter by date range AND pond
        // For now, we'll filter client-side
        refetchWaterQualityEntries();
      } else {
        // Fetch water quality entries by date range
        // Note: This would require implementing the date range filter in the API
        refetchWaterQualityEntries();
      }
    } catch (error) {
      console.error('Error filtering water quality entries:', error);
    }
  };

  const handleExport = () => {
    // Implementation for exporting data would go here
    console.log('Exporting data');
  };

  const formatTime = (time) => {
    try {
      return new Date(time).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return t('invalid_time');
    }
  };

  const getPondName = (pondId) => {
    if (!pondsData || !pondsData.data) return 'Unknown Pond';
    const pond = pondsData.data.find(p => p._id === pondId || p.id === pondId);
    return pond ? pond.name : 'Unknown Pond';
  };

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
          Error loading data: {waterQualityEntriesError || pondsError}
        </Alert>
      </Container>
    );
  }

  // Use real data or fallback to mock data
  const waterQualityEntries = filteredWaterQualityEntries.length > 0 ? filteredWaterQualityEntries : (waterQualityEntriesData ? waterQualityEntriesData.data : []);
  const ponds = pondsData ? pondsData.data : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Water Quality History
        </Typography>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}>
          Export Data
        </Button>
      </Box>
      
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardHeader
          title="Filter Water Quality Data"
          subheader="Search and filter historical water quality entries"
          action={
            <IconButton>
              <FilterIcon />
            </IconButton>
          }
        />
        <CardContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="pond-select-label">Pond</InputLabel>
                  <Select
                    labelId="pond-select-label"
                    value={pond}
                    label="Pond"
                    onChange={(e) => setPond(e.target.value)}
                  >
                    <MenuItem value=""><em>All Ponds</em></MenuItem>
                    {ponds.map((p) => (
                      <MenuItem key={p._id || p.id} value={p._id || p.id}>{p.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="parameter-select-label">Parameter</InputLabel>
                  <Select
                    labelId="parameter-select-label"
                    value={parameter}
                    label="Parameter"
                    onChange={(e) => setParameter(e.target.value)}
                  >
                    <MenuItem value=""><em>All Parameters</em></MenuItem>
                    {parameters.map((param, index) => (
                      <MenuItem key={index} value={param}>{param}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <IconButton>
                        <SearchIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  startIcon={<SearchIcon />} 
                  onClick={handleFilter} 
                  size="large"
                  fullWidth
                >
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </CardContent>
      </Card>
      
      <Card elevation={3}>
        <CardHeader
          title="Water Quality Entries"
          subheader="Historical water quality records"
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Pond</TableCell>
                  <TableCell>pH</TableCell>
                  <TableCell>DO (mg/L)</TableCell>
                  <TableCell>Temp (°C)</TableCell>
                  <TableCell>Salinity (ppt)</TableCell>
                  <TableCell>Ammonia (mg/L)</TableCell>
                  <TableCell>Nitrite (mg/L)</TableCell>
                  <TableCell>Alkalinity (mg/L)</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {waterQualityEntries.map((entry) => (
                  <TableRow key={entry._id || entry.id}>
                    <TableCell>
                      {entry.date ? new Date(entry.date).toLocaleDateString(i18n.language) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {entry.time ? formatTime(entry.time) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {getPondName(entry.pondId)}
                    </TableCell>
                    <TableCell>{entry.pH !== undefined ? entry.pH : 'N/A'}</TableCell>
                    <TableCell>{entry.dissolvedOxygen !== undefined ? entry.dissolvedOxygen.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>{entry.temperature !== undefined ? entry.temperature.toFixed(1) : 'N/A'}</TableCell>
                    <TableCell>{entry.salinity !== undefined ? entry.salinity.toFixed(1) : 'N/A'}</TableCell>
                    <TableCell>{entry.ammonia !== undefined ? entry.ammonia.toFixed(3) : 'N/A'}</TableCell>
                    <TableCell>{entry.nitrite !== undefined ? entry.nitrite.toFixed(3) : 'N/A'}</TableCell>
                    <TableCell>{entry.alkalinity !== undefined ? entry.alkalinity.toFixed(1) : 'N/A'}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <SearchIcon />
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
    </Container>
  );
};

export default WaterQualityViewPage;