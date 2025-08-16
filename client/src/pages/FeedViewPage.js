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
  Divider,
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
import { getFeedInputs, getFeedInputsByDateRange, getFeedInputsByPondId, getPonds } from '../services/api';
import { useTranslation } from 'react-i18next';

const FeedViewPage = () => {
  const { t, i18n } = useTranslation();
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago
  const [endDate, setEndDate] = useState(new Date());
  const [pond, setPond] = useState('');
  const [search, setSearch] = useState('');
  const [filteredFeedEntries, setFilteredFeedEntries] = useState([]);

  // Fetch all feed entries
  const { 
    data: feedEntriesData, 
    loading: feedEntriesLoading, 
    error: feedEntriesError,
    refetch: refetchFeedEntries
  } = useApiData(getFeedInputs, []);

  // Fetch ponds
  const { 
    data: pondsData, 
    loading: pondsLoading, 
    error: pondsError
  } = useApiData(getPonds, []);

  // Loading and error states
  const isLoading = feedEntriesLoading || pondsLoading;
  const hasError = feedEntriesError || pondsError;

  // Filter feed entries based on search term
  useEffect(() => {
    if (feedEntriesData && feedEntriesData.data) {
      let filtered = feedEntriesData.data;
      
      // Apply search filter
      if (search) {
        filtered = filtered.filter(entry => 
          (entry.feedType && entry.feedType.toLowerCase().includes(search.toLowerCase())) ||
          (entry.quantity && entry.quantity.toString().includes(search))
        );
      }
      
      // Apply pond filter
      if (pond) {
        filtered = filtered.filter(entry => entry.pondId === pond);
      }
      
      setFilteredFeedEntries(filtered);
    }
  }, [feedEntriesData, search, pond]);

  const handleFilter = async () => {
    try {
      // If pond is selected, fetch feed entries for that pond
      if (pond) {
        // Note: This would require a new API endpoint to filter by date range AND pond
        // For now, we'll filter client-side
        refetchFeedEntries();
      } else {
        // Fetch feed entries by date range
        // Note: This would require implementing the date range filter in the API
        refetchFeedEntries();
      }
    } catch (error) {
      console.error('Error filtering feed entries:', error);
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
          Error loading data: {feedEntriesError || pondsError}
        </Alert>
      </Container>
    );
  }

  // Use real data or fallback to mock data
  const feedEntries = filteredFeedEntries.length > 0 ? filteredFeedEntries : (feedEntriesData ? feedEntriesData.data : []);
  const ponds = pondsData ? pondsData.data : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Feed History
        </Typography>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}>
          Export Data
        </Button>
      </Box>
      
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardHeader
          title="Filter Feed Data"
          subheader="Search and filter historical feed entries"
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
          title="Feed Entries"
          subheader="Historical feed input records"
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Pond</TableCell>
                  <TableCell>Feed Type</TableCell>
                  <TableCell>Quantity (kg)</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feedEntries.map((entry) => (
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
                    <TableCell>{entry.feedType || 'N/A'}</TableCell>
                    <TableCell>{entry.quantity || 0}</TableCell>
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

export default FeedViewPage;