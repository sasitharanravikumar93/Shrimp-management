import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  TextField, 
  Button, 
  Box,
  Tabs,
  Tab,
  IconButton,
  Container,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  Restaurant as FeedIcon,
  WaterDrop as WaterIcon,
  Science as GrowthIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { format } from 'date-fns';
import { useSeason } from '../context/SeasonContext';
import { useParams } from 'react-router-dom';
import { useApiData, useApiMutation } from '../hooks/useApi';
import useApi from '../hooks/useApi';
import { 
  ResponsiveContainer,
  BarChart,
  LineChart,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip as RechartsTooltip,
  Legend,
  Bar,
  Line,
  Scatter
} from 'recharts';
import { 
  getPondById, 
  getFeedInputsByPondId, 
  getWaterQualityInputsByPondId, 
  getGrowthSamplingsByPondId,
  getEventsByPondId,
  createFeedInput,
  createWaterQualityInput,
  createGrowthSampling,
  createEvent
} from '../services/api';
import CustomCalendar from '../components/CustomCalendar';
import { useForm, Controller } from 'react-hook-form';
import AquacultureTooltip from '../components/AquacultureTooltip';
import HarvestProjection from '../components/HarvestProjection';
import FeedCalculator from '../components/FeedCalculator';
import WaterQualityAlert from '../components/WaterQualityAlert';
import EventSuggestions from '../components/EventSuggestions';

const PondManagementPage = () => {
  const api = useApi(); // Initialize useApi

  const [feedInventoryItems, setFeedInventoryItems] = useState([]);
  const [feedInventoryLoading, setFeedInventoryLoading] = useState(true);
  const [feedInventoryError, setFeedInventoryError] = useState(null);

  const [chemicalProbioticInventoryItems, setChemicalProbioticInventoryItems] = useState([]);
  const [chemicalProbioticInventoryLoading, setChemicalProbioticInventoryLoading] = useState(true);
  const [chemicalProbioticInventoryError, setChemicalProbioticInventoryError] = useState(null);

  useEffect(() => {
    const fetchFeedInventory = async () => {
      try {
        const response = await api.get('/inventory?itemType=Feed');
        setFeedInventoryItems(response.data);
      } catch (err) {
        console.error('Error fetching feed inventory:', err);
        setFeedInventoryError('Failed to load feed types.');
      } finally {
        setFeedInventoryLoading(false);
      }
    };

    const fetchChemicalProbioticInventory = async () => {
      try {
        // Assuming the API can filter by multiple itemTypes or we make two calls
        const chemicalResponse = await api.get('/inventory?itemType=Chemical');
        const probioticResponse = await api.get('/inventory?itemType=Probiotic');
        setChemicalProbioticInventoryItems([...chemicalResponse.data, ...probioticResponse.data]);
      } catch (err) {
        console.error('Error fetching chemical/probiotic inventory:', err);
        setChemicalProbioticInventoryError('Failed to load chemical/probiotic types.');
      } finally {
        setChemicalProbioticInventoryLoading(false);
      }
    };

    fetchFeedInventory();
    fetchChemicalProbioticInventory();
  }, [api]);


  const { pondId } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('tabs'); // 'tabs' or 'calendar'
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('week'); // 'month', 'week', 'day'
  const [calendarSearchTerm, setCalendarSearchTerm] = useState('');
  const [calendarEventTypeFilter, setCalendarEventTypeFilter] = useState('all');
  const [openEventModal, setOpenEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const { selectedSeason } = useSeason();
  
  // Fetch pond data with retry mechanism
  const { 
    data: pondData, 
    loading: pondLoading, 
    error: pondError
  } = useApiData(() => getPondById(pondId), [pondId], `pond-${pondId}`, 3);
  
  // Fetch feed entries with retry mechanism
  const { 
    data: feedEntriesData, 
    loading: feedEntriesLoading, 
    error: feedEntriesError,
    refetch: refetchFeedEntries
  } = useApiData(() => getFeedInputsByPondId(pondId), [pondId], `feed-${pondId}`, 3);
  
  // Fetch water quality entries with retry mechanism
  const { 
    data: waterQualityEntriesData, 
    loading: waterQualityEntriesLoading, 
    error: waterQualityEntriesError,
    refetch: refetchWaterQualityEntries
  } = useApiData(() => getWaterQualityInputsByPondId(pondId), [pondId], `water-${pondId}`, 3);
  
  // Fetch growth sampling entries with retry mechanism
  const { 
    data: growthSamplingEntriesData, 
    loading: growthSamplingEntriesLoading, 
    error: growthSamplingEntriesError,
    refetch: refetchGrowthSamplingEntries
  } = useApiData(() => getGrowthSamplingsByPondId(pondId), [pondId], `growth-${pondId}`, 3);
  
  // Fetch events with retry mechanism
  const { 
    data: eventsData, 
    loading: eventsLoading, 
    error: eventsError,
    refetch: refetchEvents
  } = useApiData(() => getEventsByPondId(pondId), [pondId], `events-${pondId}`, 3);
  
  // Mutations for creating new entries with retry mechanism
  const { mutate: createFeedInputMutation, loading: createFeedInputLoading } = useApiMutation(createFeedInput, 3);
  const { mutate: createWaterQualityInputMutation, loading: createWaterQualityInputLoading } = useApiMutation(createWaterQualityInput, 3);
  const { mutate: createGrowthSamplingMutation, loading: createGrowthSamplingLoading } = useApiMutation(createGrowthSampling, 3);
  const { mutate: createEventMutation, loading: createEventLoading } = useApiMutation(createEvent, 3);

  // Form setup with react-hook-form
  const { control, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      date: new Date(),
      time: new Date(),
      feedType: '',
      quantity: '',
      pH: '',
      dissolvedOxygen: '',
      temperature: '',
      salinity: '',
      chemicalUsed: '',
      chemicalQuantityUsed: '',
      totalWeight: '',
      totalCount: '',
      title: '',
      eventType: '',
      description: ''
    }
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === 'calendar') {
      setCalendarView('week'); // Default to week view when switching to calendar
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setOpenEventModal(true);
  };

  const handleDateChange = (date) => {
    setCalendarDate(date);
  };

  const handleRangeChange = (range) => {
    // For month view, range is array of dates
    // For week/day view, range is object with start/end
    if (Array.isArray(range)) {
      setCalendarDate(range[0]);
    } else if (range.start) {
      setCalendarDate(range.start);
    }
  };

  const handleAddEvent = () => {
    reset({
      date: new Date(),
      time: new Date(),
      feedType: '',
      quantity: '',
      pH: '',
      dissolvedOxygen: '',
      temperature: '',
      salinity: '',
      totalWeight: '',
      totalCount: '',
      title: '',
      eventType: '',
      description: ''
    });
    setOpenAddModal(true);
  };

  const handleEventSubmit = async (data) => {
    try {
      // Determine which type of event to create based on the active tab or form data
      if (activeTab === 0 || data.eventType === 'Feed') {
        // Create feed input
        await createFeedInputMutation({
          pondId,
          date: data.date,
          time: data.time,
          feedType: data.feedType,
          quantity: parseFloat(data.quantity)
        });
        refetchFeedEntries();
      } else if (activeTab === 1 || data.eventType === 'Water Quality') {
        // Create water quality input
        await createWaterQualityInputMutation({
          pondId,
          date: data.date,
          time: data.time,
          pH: parseFloat(data.pH),
          dissolvedOxygen: parseFloat(data.dissolvedOxygen),
          temperature: parseFloat(data.temperature),
          salinity: parseFloat(data.salinity),
          chemicalUsed: data.chemicalUsed,
          chemicalQuantityUsed: parseFloat(data.chemicalQuantityUsed)
        });
        refetchWaterQualityEntries();
      } else if (activeTab === 2 || data.eventType === 'Growth Sampling') {
        // Create growth sampling
        await createGrowthSamplingMutation({
          pondId,
          date: data.date,
          time: data.time,
          totalWeight: parseFloat(data.totalWeight),
          totalCount: parseInt(data.totalCount)
        });
        refetchGrowthSamplingEntries();
      } else {
        // Create generic event
        await createEventMutation({
          pondId,
          title: data.title,
          date: data.date,
          time: data.time,
          type: data.eventType,
          description: data.description
        });
        refetchEvents();
      }
      
      setOpenAddModal(false);
    } catch (error) {
      console.error('Error submitting event:', error);
    }
  };

  const handleCloseModal = () => {
    setOpenEventModal(false);
    setSelectedEvent(null);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  // Format date for display
  const formatDate = (date) => {
    try {
      return format(new Date(date), 'yyyy-MM-dd');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Format time for display
  const formatTime = (time) => {
    try {
      return format(new Date(time), 'HH:mm');
    } catch (e) {
      return 'Invalid Time';
    }
  };

  // Feed chart data
  const feedChartData = (feedEntriesData || []).map(entry => ({
    date: formatDate(entry.date),
    quantity: entry.quantity
  }));

  // Water quality chart data
  const waterQualityChartData = (waterQualityEntriesData || []).map(entry => ({
    date: formatDate(entry.date),
    pH: entry.pH,
    do: entry.dissolvedOxygen,
    temp: entry.temperature
  }));

  // Growth chart data
  const growthChartData = (growthSamplingEntriesData || []).map(entry => ({
    date: formatDate(entry.date),
    avgWeight: entry.totalCount > 0 ? (entry.totalWeight * 1000 / entry.totalCount).toFixed(2) : 0
  }));

  // Growth scatter data
  const growthScatterData = (growthSamplingEntriesData || []).map((entry, index) => ({
    x: index + 1,
    y: entry.totalCount > 0 ? (entry.totalWeight * 1000 / entry.totalCount).toFixed(2) : 0,
    date: formatDate(entry.date)
  }));

  const getFilteredCalendarEvents = (allEvents) => {
    let filtered = allEvents || [];

    // Apply search term filter
    if (calendarSearchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(calendarSearchTerm.toLowerCase()) ||
        event.type.toLowerCase().includes(calendarSearchTerm.toLowerCase()) ||
        (event.resource && event.resource.description && 
         event.resource.description.toLowerCase().includes(calendarSearchTerm.toLowerCase()))
      );
    }

    // Apply event type filter
    if (calendarEventTypeFilter !== 'all') {
      filtered = filtered.filter(event =>
        event.type === calendarEventTypeFilter
      );
    }

    return filtered;
  };

  // Loading and error states
  const isLoading = pondLoading || feedEntriesLoading || waterQualityEntriesLoading || 
                   growthSamplingEntriesLoading || eventsLoading;
  
  const hasError = pondError || feedEntriesError || waterQualityEntriesError || 
                   growthSamplingEntriesError || eventsError;

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
          Error loading pond data: {pondError || feedEntriesError || waterQualityEntriesError || 
                                   growthSamplingEntriesError || eventsError}
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => {
                // refetchPond(); // Removed as it's not used
                refetchFeedEntries();
                refetchWaterQualityEntries();
                refetchGrowthSamplingEntries();
                refetchEvents();
              }}
            >
              Retry
            </Button>
          </Box>
        </Alert>
      </Container>
    );
  }

  // Use real pond data or fallback to mock data
  const pond = pondData || { 
    id: pondId, 
    name: 'Pond', 
    season: selectedSeason?.name || 'Season', 
    status: 'Active', 
    health: 'Good',
    projectedHarvest: '28 days'
  };

  // Use real data or fallback to mock data
  const feedEntries = feedEntriesData || [];
  const waterQualityEntries = waterQualityEntriesData || [];
  const growthSamplingEntries = growthSamplingEntriesData || [];
  const events = eventsData || [];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {pond.name} Management
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                label={pond.seasonId?.name || pond.season || 'Season'} 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={pond.status || 'Active'} 
                color={(pond.status || 'Active') === 'Active' ? 'success' : 'default'} 
              />
              <Chip 
                label={pond.health || 'Good'} 
                color={
                  (pond.health || 'Good') === 'Good' ? 'success' : 
                  (pond.health || 'Good') === 'Fair' ? 'warning' : 'error'
                } 
                icon={(pond.health || 'Good') === 'Good' ? <CheckIcon /> : <WarningIcon />}
              />
              <Chip 
                label={`Harvest: ${pond.projectedHarvest || '30 days'}`} 
                color="info" 
                icon={<TrendingUpIcon />}
              />
            </Box>
          </Box>
          <Button 
            variant="contained" 
            startIcon={viewMode === 'tabs' ? <CalendarIcon /> : <FeedIcon />}
            onClick={() => handleViewModeChange(viewMode === 'tabs' ? 'calendar' : 'tabs')}
          >
            {viewMode === 'tabs' ? 'Calendar View' : 'Data View'}
          </Button>
        </Box>
        
        {/* Harvest Projection Card */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6} lg={4}>
            <HarvestProjection 
              currentWeight={152} // Example current weight in grams
              targetWeight={250} // Example target harvest weight in grams
              growthRate={5.2} // Example growth rate in grams per day
              startDate="2023-06-01"
              pondName={pond.name}
            />
          </Grid>
        </Grid>
        
        {viewMode === 'tabs' ? (
          <Card elevation={3}>
            <CardHeader
              title="Data Management"
              subheader="Record and view historical data for this pond"
              action={
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={handleAddEvent}
                >
                  Add New Event
                </Button>
              }
            />
            <CardContent>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                aria-label="pond management tabs"
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 3 }}
              >
                <Tab icon={<FeedIcon />} label="Feed" />
                <Tab icon={<WaterIcon />} label="Water Quality" />
                <Tab icon={<GrowthIcon />} label="Growth Sampling" />
              </Tabs>
              
              <Divider sx={{ mb: 3 }} />
              
              {/* Feed Tab */}
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={6}>
                    <Card variant="outlined">
                      <CardHeader title="Record Feed Input" />
                      <CardContent>
                        <FeedCalculator 
                          initialBiomass={500} // Example biomass in kg
                          initialShrimpCount={25000} // Example shrimp count
                          onCalculate={(feedQty) => {
                            // Update form with calculated feed quantity
                            setValue('quantity', feedQty.toFixed(2));
                          }}
                        />
                        <form onSubmit={handleSubmit(handleEventSubmit)}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Controller
                                name="date"
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    label="Date"
                                    value={field.value}
                                    onChange={field.onChange}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                  />
                                )}
                              />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Controller
                                name="time"
                                control={control}
                                render={({ field }) => (
                                  <TimePicker
                                    label="Time"
                                    value={field.value}
                                    onChange={field.onChange}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                  />
                                )}
                              />
                            </Grid>
                            
                            <Grid item xs={12}>
                              <Controller
                                name="feedType"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Feed Type"
                                    fullWidth
                                    select
                                    disabled={feedInventoryLoading}
                                    error={!!feedInventoryError}
                                    helperText={feedInventoryError || (feedInventoryLoading ? 'Loading feed types...' : '')}
                                  >
                                    {feedInventoryItems.map((item) => (
                                      <MenuItem key={item._id} value={item._id}>
                                        {item.itemName}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                )}
                              />
                            </Grid>
                            
                            <Grid item xs={12}>
                              <Controller
                                name="quantity"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Quantity (kg)"
                                    type="number"
                                    fullWidth
                                  />
                                )}
                              />
                            </Grid>
                            
                            <Grid item xs={12}>
                              <Button 
                                type="submit" 
                                variant="contained" 
                                startIcon={<AddIcon />}
                                disabled={createFeedInputLoading}
                              >
                                {createFeedInputLoading ? 'Adding...' : 'Add Feed Entry'}
                              </Button>
                            </Grid>
                          </Grid>
                        </form>
                        
                        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0, 123, 255, 0.1)', borderRadius: 1 }}>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            <AquacultureTooltip term="Feed Conversion Ratio (FCR)">
                              <strong>Tip:</strong> Based on current biomass, recommended daily feed amount is 45-55kg.
                            </AquacultureTooltip>
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} lg={6}>
                    <Card variant="outlined">
                      <CardHeader 
                        title="Feed History" 
                        action={
                          <Tooltip title="Export data">
                            <IconButton>
                              <FeedIcon />
                            </IconButton>
                          </Tooltip>
                        }
                      />
                      <CardContent>
                        <Box sx={{ height: 300, mb: 2 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={feedChartData}
                              margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Bar dataKey="quantity" name="Feed Quantity (kg)" fill="#007BFF" />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                          <Grid container spacing={1}>
                            {feedEntries.map((entry) => (
                              <Grid item xs={12} key={entry._id || entry.id}>
                                <Card variant="outlined" sx={{ p: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                      <Typography variant="body2" fontWeight="bold">
                                        {entry.feedType}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {formatDate(entry.date)} at {formatTime(entry.time)}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                      <Typography variant="body2" fontWeight="bold">
                                        {entry.quantity} kg
                                      </Typography>
                                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                        <IconButton size="small">
                                          <EditIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                        <IconButton size="small">
                                          <DeleteIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                  </Box>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
              
              {/* Water Quality Tab */}
              {activeTab === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={6}>
                    <Card variant="outlined">
                      <CardHeader title="Record Water Quality" />
                      <CardContent>
                        <WaterQualityAlert 
                          pondName={pond.name}
                          pH={7.2}
                          dissolvedOxygen={5.5}
                          temperature={28.5}
                          salinity={25.0}
                          ammonia={0.01}
                          nitrite={0.1}
                        />
                        <form onSubmit={handleSubmit(handleEventSubmit)}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Controller
                                name="date"
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    label="Date"
                                    value={field.value}
                                    onChange={field.onChange}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                  />
                                )}
                              />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Controller
                                name="time"
                                control={control}
                                render={({ field }) => (
                                  <TimePicker
                                    label="Time"
                                    value={field.value}
                                    onChange={field.onChange}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                  />
                                )}
                              />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Controller
                                name="pH"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="pH"
                                    type="number"
                                    fullWidth
                                  />
                                )}
                              />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Controller
                                name="dissolvedOxygen"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Dissolved Oxygen (mg/L)"
                                    type="number"
                                    fullWidth
                                  />
                                )}
                              />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Controller
                                name="temperature"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Temperature (°C)"
                                    type="number"
                                    fullWidth
                                  />
                                )}
                              />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Controller
                                name="salinity"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Salinity (ppt)"
                                    type="number"
                                    fullWidth
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Controller
                                name="chemicalUsed"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Chemical/Probiotic Used"
                                    fullWidth
                                    select
                                    disabled={chemicalProbioticInventoryLoading}
                                    error={!!chemicalProbioticInventoryError}
                                    helperText={chemicalProbioticInventoryError || (chemicalProbioticInventoryLoading ? 'Loading chemicals/probiotics...' : '')}
                                  >
                                    {chemicalProbioticInventoryItems.map((item) => (
                                      <MenuItem key={item._id} value={item._id}>
                                        {item.itemName}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Controller
                                name="chemicalQuantityUsed"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Quantity Used (unit)"
                                    type="number"
                                    fullWidth
                                  />
                                )}
                              />
                            </Grid>
                            
                            <Grid item xs={12}>
                              <Button 
                                type="submit" 
                                variant="contained" 
                                startIcon={<AddIcon />}
                                disabled={createWaterQualityInputLoading}
                              >
                                {createWaterQualityInputLoading ? 'Adding...' : 'Add Water Quality Entry'}
                              </Button>
                            </Grid>
                          </Grid>
                        </form>
                        
                        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(40, 167, 69, 0.1)', borderRadius: 1 }}>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            <AquacultureTooltip term="Dissolved Oxygen (DO)">
                              <strong>Tip:</strong> Optimal DO levels: 5-7 mg/L. pH should be between 6.5-8.5.
                            </AquacultureTooltip>
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} lg={6}>
                    <Card variant="outlined">
                      <CardHeader 
                        title="Water Quality History" 
                        action={
                          <Tooltip title="Export data">
                            <IconButton>
                              <WaterIcon />
                            </IconButton>
                          </Tooltip>
                        }
                      />
                      <CardContent>
                        <Box sx={{ height: 300, mb: 2 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={waterQualityChartData}
                              margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Line type="monotone" dataKey="pH" name="pH Level" stroke="#007BFF" activeDot={{ r: 8 }} />
                              <Line type="monotone" dataKey="do" name="Dissolved Oxygen (mg/L)" stroke="#28A745" />
                              <Line type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#FD7E14" />
                            </LineChart>
                          </ResponsiveContainer>
                        </Box>
                        
                        <WaterQualityAlert 
                          pondName={pond.name}
                          pH={7.2}
                          dissolvedOxygen={5.5}
                          temperature={28.5}
                          salinity={25.0}
                          ammonia={0.01}
                          nitrite={0.1}
                        />
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                          <Grid container spacing={1}>
                            {waterQualityEntries.map((entry) => (
                              <Grid item xs={12} key={entry._id || entry.id}>
                                <Card variant="outlined" sx={{ p: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                      <Typography variant="body2" fontWeight="bold">
                                        Water Quality Check
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {formatDate(entry.date)} at {formatTime(entry.time)}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                      <Typography variant="body2">
                                        pH: {entry.pH} | DO: {entry.dissolvedOxygen} | Temp: {entry.temperature}°C
                                      </Typography>
                                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                        <IconButton size="small">
                                          <EditIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                        <IconButton size="small">
                                          <DeleteIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                  </Box>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
              
              {/* Growth Sampling Tab */}
              {activeTab === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={6}>
                    <Card variant="outlined">
                      <CardHeader title="Record Growth Sampling" />
                      <CardContent>
                        <form onSubmit={handleSubmit(handleEventSubmit)}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Controller
                                name="date"
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    label="Date"
                                    value={field.value}
                                    onChange={field.onChange}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                  />
                                )}
                              />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Controller
                                name="time"
                                control={control}
                                render={({ field }) => (
                                  <TimePicker
                                    label="Time"
                                    value={field.value}
                                    onChange={field.onChange}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                  />
                                )}
                              />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Controller
                                name="totalWeight"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Total Weight (kg)"
                                    type="number"
                                    fullWidth
                                  />
                                )}
                              />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Controller
                                name="totalCount"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Total Count"
                                    type="number"
                                    fullWidth
                                  />
                                )}
                              />
                            </Grid>
                            
                            <Grid item xs={12}>
                              <Button 
                                type="submit" 
                                variant="contained" 
                                startIcon={<AddIcon />}
                                disabled={createGrowthSamplingLoading}
                              >
                                {createGrowthSamplingLoading ? 'Adding...' : 'Add Growth Sampling Entry'}
                              </Button>
                            </Grid>
                          </Grid>
                        </form>
                        
                        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(220, 53, 69, 0.1)', borderRadius: 1 }}>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            <AquacultureTooltip term="Harvest Size">
                              <strong>Tip:</strong> Current average weight is 152g. Target harvest size is 250g.
                            </AquacultureTooltip>
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} lg={6}>
                    <Card variant="outlined">
                      <CardHeader 
                        title="Growth Sampling History" 
                        action={
                          <Tooltip title="Export data">
                            <IconButton>
                              <GrowthIcon />
                            </IconButton>
                          </Tooltip>
                        }
                      />
                      <CardContent>
                        <Box sx={{ height: 300, mb: 2 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart
                              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                            >
                              <CartesianGrid />
                              <XAxis type="number" dataKey="x" name="Sample #" />
                              <YAxis type="number" dataKey="y" name="Avg Weight (g)" />
                              <ZAxis range={[100]} />
                              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                              <Legend />
                              <Scatter name="Growth Samples" data={growthScatterData} fill="#007BFF" />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                          <Grid container spacing={1}>
                            {growthSamplingEntries.map((entry) => (
                              <Grid item xs={12} key={entry._id || entry.id}>
                                <Card variant="outlined" sx={{ p: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                      <Typography variant="body2" fontWeight="bold">
                                        Growth Sampling
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {formatDate(entry.date)} at {formatTime(entry.time)}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                      <Typography variant="body2">
                                        Avg. Weight: {entry.totalCount > 0 ? (entry.totalWeight * 1000 / entry.totalCount).toFixed(2) : 0}g
                                      </Typography>
                                      <Typography variant="body2">
                                        Total: {entry.totalWeight}kg / {entry.totalCount} pcs
                                      </Typography>
                                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                        <IconButton size="small">
                                          <EditIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                        <IconButton size="small">
                                          <DeleteIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                  </Box>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        ) : (
          // Calendar View
          <Card elevation={3} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <CardHeader
              title="Events Calendar"
              subheader="View and manage events for this pond"
              action={
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={handleAddEvent}
                >
                  Add New Event
                </Button>
              }
            />
            <CardContent sx={{ pt: 0, pb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  placeholder="Search events..."
                  value={calendarSearchTerm}
                  onChange={(e) => setCalendarSearchTerm(e.target.value)}
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
                  value={calendarEventTypeFilter}
                  exclusive
                  onChange={(e, newFilter) => {
                    if (newFilter !== null) {
                      setCalendarEventTypeFilter(newFilter);
                    }
                  }}
                >
                  <ToggleButton value="all">All</ToggleButton>
                  <ToggleButton value="Feeding">Feeding</ToggleButton>
                  <ToggleButton value="Water Quality">Water Quality</ToggleButton>
                  <ToggleButton value="Growth Sampling">Growth Sampling</ToggleButton>
                  <ToggleButton value="Routine">Routine</ToggleButton>
                  <ToggleButton value="Maintenance">Maintenance</ToggleButton>
                  <ToggleButton value="Monitoring">Monitoring</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </CardContent>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Grid container spacing={3} sx={{ flexGrow: 1 }}>
                <Grid item xs={12} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <CustomCalendar
                    events={getFilteredCalendarEvents(events)}
                    onEventSelect={handleEventSelect}
                    onDateChange={handleDateChange}
                    onRangeChange={handleRangeChange}
                    date={calendarDate}
                    view={calendarView}
                    onViewChange={(view) => setCalendarView(view)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader title="Upcoming Events" />
                    <CardContent>
                      <Grid container spacing={2}>
                        {(events || []).slice(0, 3).map((event) => (
                          <Grid item xs={12} md={6} lg={4} key={event._id || event.id}>
                            <Card 
                              variant="outlined" 
                              sx={{ 
                                height: '100%',
                                borderLeft: `4px solid ${
                                  event.type === 'Routine' ? '#007BFF' : 
                                  event.type === 'Monitoring' ? '#28A745' : 
                                  event.type === 'Maintenance' ? '#FD7E14' :
                                  event.type === 'Feeding' ? '#007BFF' :
                                  event.type === 'Water Quality' ? '#28A745' :
                                  event.type === 'Growth Sampling' ? '#6f42c1' :
                                  '#9e9e9e'
                                }`
                              }}
                            >
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Box>
                                    <Typography variant="body1" fontWeight="bold">
                                      {event.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {format(new Date(event.start), 'MMM d, yyyy')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                                    </Typography>
                                  </Box>
                                  <Chip 
                                    label={event.type} 
                                    size="small" 
                                    color={
                                      event.type === 'Routine' ? 'primary' : 
                                      event.type === 'Monitoring' ? 'success' : 
                                      event.type === 'Maintenance' ? 'warning' :
                                      event.type === 'Feeding' ? 'primary' :
                                      event.type === 'Water Quality' ? 'success' :
                                      event.type === 'Growth Sampling' ? 'secondary' :
                                      'default'
                                    }
                                  />
                                </Box>
                                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                  {event.resource && event.resource.description ? event.resource.description : 'No description'}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <EventSuggestions 
                    pondStatus={pond.status}
                    waterQuality={{
                      do: 5.5,
                      pH: 7.2,
                      temp: 28.5
                    }}
                    growthRate={5.2}
                    lastFeeding="2023-06-16"
                    onSuggestionClick={(suggestion) => {
                      console.log('Suggested event:', suggestion);
                      // In a real app, this would open the add event modal with the suggestion pre-filled
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Container>
      
      {/* Event Detail Modal */}
      <Dialog open={openEventModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEvent?.title}
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Date:</strong> {format(new Date(selectedEvent.start), 'MMM d, yyyy')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Time:</strong> {format(new Date(selectedEvent.start), 'HH:mm')} - {format(new Date(selectedEvent.end), 'HH:mm')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Type:</strong> {selectedEvent.type}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Description:</strong> {selectedEvent.resource && selectedEvent.resource.description ? selectedEvent.resource.description : 'No description'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
          <Button variant="contained" startIcon={<EditIcon />} onClick={handleCloseModal}>
            Edit Event
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Event Modal */}
      <Dialog open={openAddModal} onClose={handleCloseAddModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add New Event
          <IconButton
            aria-label="close"
            onClick={handleCloseAddModal}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(handleEventSubmit)}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Event Title"
                      fullWidth
                      required
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Date"
                      value={field.value}
                      onChange={field.onChange}
                      renderInput={(params) => <TextField {...params} fullWidth required />}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Controller
                  name="time"
                  control={control}
                  render={({ field }) => (
                    <TimePicker
                      label="Start Time"
                      value={field.value}
                      onChange={field.onChange}
                      renderInput={(params) => <TextField {...params} fullWidth required />}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="eventType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Event Type"
                      fullWidth
                      select
                      required
                    >
                      <MenuItem value="Routine">Routine</MenuItem>
                      <MenuItem value="Monitoring">Monitoring</MenuItem>
                      <MenuItem value="Maintenance">Maintenance</MenuItem>
                      <MenuItem value="Feeding">Feeding</MenuItem>
                      <MenuItem value="Water Quality">Water Quality</MenuItem>
                      <MenuItem value="Growth Sampling">Growth Sampling</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={3}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddModal} color="primary">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit(handleEventSubmit)}
            disabled={createEventLoading}
          >
            {createEventLoading ? 'Adding...' : 'Add Event'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default PondManagementPage;