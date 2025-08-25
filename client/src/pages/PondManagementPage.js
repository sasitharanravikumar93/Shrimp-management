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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
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

import AquacultureTooltip from '../components/features/farm/AquacultureTooltip';
import CustomCalendar from '../components/features/shared/forms/CustomCalendar';
import EventSuggestions from '../components/features/farm/EventSuggestions';
import FeedCalculator from '../components/features/feeding/FeedCalculator';
import HarvestProjection from '../components/features/feeding/HarvestProjection';
import PondCard from '../components/features/ponds/PondCard';
import WaterQualityAlert from '../components/features/water-quality/WaterQualityAlert';
import { useSeason } from '../context/SeasonContext';
import useApi, { useApiData, useApiMutation } from '../hooks/useApi';
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

const PondManagementPage = () => {
  const { t, i18n } = useTranslation();
  const api = useApi(); // Initialize useApi
  const navigate = useNavigate();
  const { selectedSeason } = useSeason();
  const { pondId } = useParams();

  const [ponds, setPonds] = useState([]);
  const [pondsLoading, setPondsLoading] = useState(false);
  const [pondsError, setPondsError] = useState(null);
  const [showAllPonds, setShowAllPonds] = useState(false);

  const [feedInventoryItems, setFeedInventoryItems] = useState([]);
  const [feedInventoryLoading, setFeedInventoryLoading] = useState(true);
  const [feedInventoryError, setFeedInventoryError] = useState(null);

  const [chemicalProbioticInventoryItems, setChemicalProbioticInventoryItems] = useState([]);
  const [chemicalProbioticInventoryLoading, setChemicalProbioticInventoryLoading] = useState(true);
  const [chemicalProbioticInventoryError, setChemicalProbioticInventoryError] = useState(null);
  const [feedType, setFeedType] = useState('');
  const [chemicalType, setChemicalType] = useState('');
  const [nurseryBatches, setNurseryBatches] = useState([]);

  useEffect(() => {
    const fetchNurseryBatches = async () => {
      if (!selectedSeason || !selectedSeason._id) {
        setNurseryBatches([]);
        return;
      }
      try {
        const response = await api.get(`/nursery-batches/season/${selectedSeason._id}`);
        setNurseryBatches(response || []);
      } catch (err) {
        console.error('Error fetching nursery batches:', err);
      }
    };
    fetchNurseryBatches();
  }, [selectedSeason, api]);

  useEffect(() => {
    const fetchPonds = async () => {
      console.log('Fetching ponds for season:', selectedSeason);
      if (!selectedSeason || !selectedSeason._id) {
        console.log('No selected season, setting ponds to empty array');
        setPonds([]);
        return;
      }

      setPondsLoading(true);
      setPondsError(null);

      try {
        console.log('Making API call to fetch ponds for season ID:', selectedSeason._id);
        // Add cache-busting parameter to ensure we get fresh data
        const cacheBuster = `_=${new Date().getTime()}`;
        const url = `/ponds/season/${selectedSeason._id}?${cacheBuster}`;
        console.log('API URL with cache buster:', url);

        const response = await api.get(url);
        console.log('Received response from ponds API:', response);

        // Check if response is an array or an object with data property
        let pondsData = [];
        if (Array.isArray(response)) {
          pondsData = response;
        } else if (response && Array.isArray(response.data)) {
          pondsData = response.data;
        } else if (response && typeof response === 'object' && response.data) {
          // Handle pagination response format
          pondsData = Array.isArray(response.data) ? response.data : [];
          console.log('Pagination response detected:', {
            page: response.pagination?.page,
            total: response.pagination?.total,
            pages: response.pagination?.pages
          });
        } else if (response) {
          // Handle case where response is a single object (unexpected)
          console.warn('Unexpected response format from ponds API:', response);
          pondsData = [];
        }

        console.log('Processed ponds data:', pondsData);
        console.log('Ponds data length:', pondsData.length);

        // Log details of each pond
        pondsData.forEach((pond, index) => {
          console.log(`Pond ${index + 1}:`, {
            id: pond._id || pond.id,
            name: pond.name,
            seasonId: pond.seasonId || pond.season,
            size: pond.size,
            capacity: pond.capacity
          });
        });

        setPonds(pondsData);
        if (pondsData && pondsData.length > 0) {
          if (!pondId) {
            console.log('No pondId in URL, navigating to first pond:', pondsData[0]._id);
            navigate(`/pond/${pondsData[0]._id}`);
          }
        } else {
          console.log('No ponds found for season');
        }
      } catch (err) {
        console.error('Error fetching ponds:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        setPondsError(t('failed_to_fetch_ponds'));
      } finally {
        setPondsLoading(false);
      }
    };

    fetchPonds();
  }, [selectedSeason, pondId, navigate, api, t]);

  useEffect(() => {
    const fetchFeedInventory = async () => {
      if (!selectedSeason || !selectedSeason._id) return;
      try {
        const response = await api.get(
          `/inventory-items?itemType=Feed&seasonId=${selectedSeason._id}`
        );
        setFeedInventoryItems(response || []);
      } catch (err) {
        console.error('Error fetching feed inventory:', err);
        setFeedInventoryError('Failed to load feed types.');
      } finally {
        setFeedInventoryLoading(false);
      }
    };

    const fetchChemicalProbioticInventory = async () => {
      if (!selectedSeason || !selectedSeason._id) return;
      try {
        const chemicalResponse = await api.get(
          `/inventory-items?itemType=Chemical&seasonId=${selectedSeason._id}`
        );
        const probioticResponse = await api.get(
          `/inventory-items?itemType=Probiotic&seasonId=${selectedSeason._id}`
        );
        setChemicalProbioticInventoryItems([
          ...(chemicalResponse || []),
          ...(probioticResponse || [])
        ]);
      } catch (err) {
        console.error('Error fetching chemical/probiotic inventory:', err);
        setChemicalProbioticInventoryError('Failed to load chemical/probiotic types.');
      } finally {
        setChemicalProbioticInventoryLoading(false);
      }
    };

    fetchFeedInventory();
    fetchChemicalProbioticInventory();
  }, [selectedSeason, api]);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('tabs');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('week');
  const [calendarSearchTerm, setCalendarSearchTerm] = useState('');
  const [calendarEventTypeFilter, setCalendarEventTypeFilter] = useState('all');
  const [openEventModal, setOpenEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);

  const {
    data: pondData,
    loading: pondLoading,
    error: pondError
  } = useApiData(() => pondId && getPondById(pondId), [pondId], `pond-${pondId}`, 3);

  const {
    data: feedEntriesData,
    loading: feedEntriesLoading,
    error: feedEntriesError,
    refetch: refetchFeedEntries
  } = useApiData(() => pondId && getFeedInputsByPondId(pondId), [pondId], `feed-${pondId}`, 3);

  const {
    data: waterQualityEntriesData,
    loading: waterQualityEntriesLoading,
    error: waterQualityEntriesError,
    refetch: refetchWaterQualityEntries
  } = useApiData(
    () => pondId && getWaterQualityInputsByPondId(pondId),
    [pondId],
    `water-${pondId}`,
    3
  );

  const {
    data: growthSamplingEntriesData,
    loading: growthSamplingEntriesLoading,
    error: growthSamplingEntriesError,
    refetch: refetchGrowthSamplingEntries
  } = useApiData(
    () => pondId && getGrowthSamplingsByPondId(pondId),
    [pondId],
    `growth-${pondId}`,
    3
  );

  const {
    data: eventsData,
    loading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents
  } = useApiData(() => pondId && getEventsByPondId(pondId), [pondId], `events-${pondId}`, 3);

  const {
    mutate: createFeedInputMutation,
    loading: createFeedInputLoading,
    error: createFeedInputError
  } = useApiMutation(createFeedInput, 3);
  const {
    mutate: createWaterQualityInputMutation,
    loading: createWaterQualityInputLoading,
    error: createWaterQualityInputError
  } = useApiMutation(createWaterQualityInput, 3);
  const {
    mutate: createGrowthSamplingMutation,
    loading: createGrowthSamplingLoading,
    error: createGrowthSamplingError
  } = useApiMutation(createGrowthSampling, 3);
  const {
    mutate: createEventMutation,
    loading: createEventLoading,
    error: createEventError
  } = useApiMutation(createEvent, 3);

  const { control, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      date: new Date(),
      time: new Date(),
      inventoryItemId: '',
      quantity: '',
      pH: '',
      dissolvedOxygen: '',
      temperature: '',
      salinity: '',
      quantityUsed: '',
      totalWeight: '',
      totalCount: '',
      title: '',
      eventType: '',
      description: ''
    }
  });

  const eventType = watch('eventType');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewModeChange = mode => {
    setViewMode(mode);
    if (mode === 'calendar') {
      setCalendarView('week');
    }
  };

  const handleEventSelect = event => {
    setSelectedEvent(event);
    setOpenEventModal(true);
  };

  const handleDateChange = date => {
    setCalendarDate(date);
  };

  const handleRangeChange = range => {
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

  const handleEventSubmit = async data => {
    try {
      const details = {};
      if (data.eventType === 'Feeding') {
        details.inventoryItemId = feedType;
        details.quantity = parseFloat(data.quantity);
      } else if (data.eventType === 'Water Quality') {
        details.pH = parseFloat(data.pH);
        details.dissolvedOxygen = parseFloat(data.dissolvedOxygen);
        details.temperature = parseFloat(data.temperature);
        details.salinity = parseFloat(data.salinity);
        details.inventoryItemId = chemicalType;
        details.quantityUsed = parseFloat(data.quantityUsed);
      } else if (data.eventType === 'Growth Sampling') {
        details.totalWeight = parseFloat(data.totalWeight);
        details.totalCount = parseInt(data.totalCount);
      } else if (data.eventType === 'Stocking') {
        details.nurseryBatchId = data.nurseryBatchId;
        details.species = data.species;
        details.initialCount = parseInt(data.initialCount);
      }

      await createEventMutation({
        pondId,
        seasonId: selectedSeason._id,
        title: data.title,
        date: data.date,
        time: data.time,
        eventType: data.eventType,
        description: data.description,
        details
      });
      refetchEvents();

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

  const formatDate = date => {
    try {
      return new Date(date).toLocaleDateString(i18n.language);
    } catch (e) {
      return t('invalid_date');
    }
  };

  const formatTime = time => {
    try {
      return new Date(time).toLocaleTimeString(i18n.language, {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return t('invalid_time');
    }
  };

  const feedChartData = (feedEntriesData || []).map(entry => ({
    date: formatDate(entry.date),
    quantity: entry.quantity
  }));

  const waterQualityChartData = (waterQualityEntriesData || []).map(entry => ({
    date: formatDate(entry.date),
    pH: entry.pH,
    do: entry.dissolvedOxygen,
    temp: entry.temperature
  }));

  const growthChartData = (growthSamplingEntriesData || []).map(entry => ({
    date: formatDate(entry.date),
    avgWeight: entry.totalCount > 0 ? ((entry.totalWeight * 1000) / entry.totalCount).toFixed(2) : 0
  }));

  const growthScatterData = (growthSamplingEntriesData || []).map((entry, index) => ({
    x: index + 1,
    y: entry.totalCount > 0 ? ((entry.totalWeight * 1000) / entry.totalCount).toFixed(2) : 0,
    date: formatDate(entry.date)
  }));

  const getFilteredCalendarEvents = allEvents => {
    let filtered = allEvents || [];
    if (calendarSearchTerm) {
      filtered = filtered.filter(
        event =>
          event.title.toLowerCase().includes(calendarSearchTerm.toLowerCase()) ||
          event.type.toLowerCase().includes(calendarSearchTerm.toLowerCase()) ||
          (event.resource &&
            event.resource.description &&
            event.resource.description.toLowerCase().includes(calendarSearchTerm.toLowerCase()))
      );
    }
    if (calendarEventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.type === calendarEventTypeFilter);
    }

    return filtered;
  };

  const isLoading =
    pondLoading ||
    feedEntriesLoading ||
    waterQualityEntriesLoading ||
    growthSamplingEntriesLoading ||
    eventsLoading;

  const hasError =
    pondError ||
    feedEntriesError ||
    waterQualityEntriesError ||
    growthSamplingEntriesError ||
    eventsError;

  if (isLoading) {
    return (
      <Container
        maxWidth='lg'
        sx={{
          mt: 2,
          mb: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (hasError) {
    const getErrorMessage = error => {
      if (!error) return null;
      if (typeof error === 'string') return error;
      if (typeof error === 'object' && error.message) return error.message;
      return 'An unknown error occurred';
    };

    const errorMessages = [
      pondError,
      feedEntriesError,
      waterQualityEntriesError,
      growthSamplingEntriesError,
      eventsError
    ]
      .map(getErrorMessage)
      .filter(Boolean)
      .join(', ');

    return (
      <Container maxWidth='lg' sx={{ mt: 2, mb: 4 }}>
        <Alert severity='error'>
          Error loading pond data: {errorMessages}
          <Box sx={{ mt: 2 }}>
            <Button
              variant='outlined'
              onClick={() => {
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

  const pond = pondData || {
    id: pondId,
    name: 'Pond',
    season: selectedSeason?.name || 'Season',
    status: 'Active',
    health: 'Good',
    projectedHarvest: '28 days'
  };

  const feedEntries = feedEntriesData || [];
  const waterQualityEntries = waterQualityEntriesData || [];
  const growthSamplingEntries = growthSamplingEntriesData || [];
  const events = eventsData || [];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth='lg' sx={{ mt: 2, mb: 4 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {(showAllPonds ? ponds : ponds.slice(0, 3)).map(p => (
            <Grid item xs={12} md={4} key={p._id}>
              <PondCard
                pond={p}
                onClick={() => navigate(`/pond/${p._id}`)}
                selected={p._id === pondId}
              />
            </Grid>
          ))}
        </Grid>
        {ponds.length > 3 && (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Button onClick={() => setShowAllPonds(!showAllPonds)}>
              {showAllPonds ? t('show_less') : t('show_more')}
            </Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant='h4' component='h1' gutterBottom>
              {pond.name && typeof pond.name === 'object'
                ? pond.name[i18n.language] || pond.name.en || 'Pond'
                : pond.name}{' '}
              Management
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={
                  pond && pond.seasonId && pond.seasonId.name
                    ? typeof pond.seasonId.name === 'object'
                      ? pond.seasonId.name[i18n.language] || pond.seasonId.name.en
                      : pond.seasonId.name
                    : pond && typeof pond.season === 'string'
                      ? pond.season
                      : selectedSeason?.name || 'Season'
                }
                color='primary'
                variant='outlined'
              />
              <Chip
                label={pond.status || 'Active'}
                color={(pond.status || 'Active') === 'Active' ? 'success' : 'default'}
              />
              <Chip
                label={pond.health || 'Good'}
                color={
                  (pond.health || 'Good') === 'Good'
                    ? 'success'
                    : (pond.health || 'Good') === 'Fair'
                      ? 'warning'
                      : 'error'
                }
                icon={(pond.health || 'Good') === 'Good' ? <CheckIcon /> : <WarningIcon />}
              />
              <Chip
                label={`Harvest: ${pond.projectedHarvest || '30 days'}`}
                color='info'
                icon={<TrendingUpIcon />}
              />
            </Box>
          </Box>
          <Button
            variant='contained'
            startIcon={viewMode === 'tabs' ? <CalendarIcon /> : <FeedIcon />}
            onClick={() => handleViewModeChange(viewMode === 'tabs' ? 'calendar' : 'tabs')}
          >
            {viewMode === 'tabs' ? 'Calendar View' : 'Data View'}
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6} lg={4}>
            <HarvestProjection
              currentWeight={152} // Example current weight in grams
              targetWeight={250} // Example target harvest weight in grams
              growthRate={5.2} // Example growth rate in grams per day
              startDate='2023-06-01'
              pondName={
                pond.name && typeof pond.name === 'object'
                  ? pond.name[i18n.language] || pond.name.en || 'Pond'
                  : pond.name
              }
            />
          </Grid>
        </Grid>

        {viewMode === 'tabs' ? (
          <Card elevation={3}>
            <CardHeader
              title='Data Management'
              subheader='Record and view historical data for this pond'
              action={
                <Button variant='contained' startIcon={<AddIcon />} onClick={handleAddEvent}>
                  Add New Event
                </Button>
              }
            />
            <CardContent>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label='pond management tabs'
                variant='scrollable'
                scrollButtons='auto'
                sx={{ mb: 3 }}
              >
                <Tab icon={<FeedIcon />} label='Feed' />
                <Tab icon={<WaterIcon />} label='Water Quality' />
                <Tab icon={<GrowthIcon />} label='Growth Sampling' />
              </Tabs>

              <Divider sx={{ mb: 3 }} />

              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={6}>
                    <Card variant='outlined'>
                      <CardHeader title='Record Feed Input' />
                      <CardContent>
                        {createFeedInputError && (
                          <Alert severity='error' sx={{ mb: 2 }}>
                            {createFeedInputError.message}
                          </Alert>
                        )}
                        <FeedCalculator
                          initialBiomass={500}
                          initialShrimpCount={25000}
                          onCalculate={feedQty => {
                            setValue('quantity', feedQty.toFixed(2));
                          }}
                        />
                        <form onSubmit={handleSubmit(handleEventSubmit)}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Controller
                                name='date'
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    label='Date'
                                    value={field.value}
                                    onChange={field.onChange}
                                    renderInput={params => <TextField {...params} fullWidth />}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Controller
                                name='time'
                                control={control}
                                render={({ field }) => (
                                  <TimePicker
                                    label='Time'
                                    value={field.value}
                                    onChange={field.onChange}
                                    renderInput={params => <TextField {...params} fullWidth />}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <TextField
                                label='Feed Type'
                                fullWidth
                                select
                                disabled={feedInventoryLoading}
                                error={!!feedInventoryError}
                                helperText={
                                  feedInventoryError ||
                                  (feedInventoryLoading ? 'Loading feed types...' : '')
                                }
                                value={feedType}
                                onChange={e => setFeedType(e.target.value)}
                              >
                                {Array.isArray(feedInventoryItems) &&
                                  feedInventoryItems.map(item => {
                                    const itemName =
                                      typeof item.itemName === 'object'
                                        ? item.itemName[i18n.language] || item.itemName.en
                                        : item.itemName;
                                    return (
                                      <MenuItem key={item._id} value={item._id}>
                                        {itemName}
                                      </MenuItem>
                                    );
                                  })}
                              </TextField>
                            </Grid>

                            <Grid item xs={12}>
                              <Controller
                                name='quantity'
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label='Quantity (kg)'
                                    type='number'
                                    fullWidth
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <Button
                                type='submit'
                                variant='contained'
                                startIcon={<AddIcon />}
                                disabled={createFeedInputLoading}
                              >
                                {createFeedInputLoading ? 'Adding...' : 'Add Feed Entry'}
                              </Button>
                            </Grid>
                          </Grid>
                        </form>

                        <Box
                          sx={{ mt: 3, p: 2, bgcolor: 'rgba(0, 123, 255, 0.1)', borderRadius: 1 }}
                        >
                          <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
                            <AquacultureTooltip term='Feed Conversion Ratio (FCR)'>
                              <strong>Tip:</strong> Based on current biomass, recommended daily feed
                              amount is 45-55kg.
                            </AquacultureTooltip>
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} lg={6}>
                    <Card variant='outlined'>
                      <CardHeader
                        title='Feed History'
                        action={
                          <Tooltip title='Export data'>
                            <IconButton>
                              <FeedIcon />
                            </IconButton>
                          </Tooltip>
                        }
                      />
                      <CardContent>
                        <Box sx={{ height: 300, mb: 2 }}>
                          <ResponsiveContainer width='100%' height='100%'>
                            <BarChart
                              data={feedChartData}
                              margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                            >
                              <CartesianGrid strokeDasharray='3 3' />
                              <XAxis dataKey='date' />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Bar dataKey='quantity' name='Feed Quantity (kg)' fill='#007BFF' />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                          <Grid container spacing={1}>
                            {feedEntries.map(entry => (
                              <Grid item xs={12} key={entry._id || entry.id}>
                                <Card variant='outlined' sx={{ p: 1 }}>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <Box>
                                      <Typography variant='body2' fontWeight='bold'>
                                        {entry.feedType}
                                      </Typography>
                                      <Typography variant='body2' color='text.secondary'>
                                        {formatDate(entry.date)} at {formatTime(entry.time)}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                      <Typography variant='body2' fontWeight='bold'>
                                        {entry.quantity} kg
                                      </Typography>
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          justifyContent: 'flex-end',
                                          gap: 0.5
                                        }}
                                      >
                                        <IconButton size='small'>
                                          <EditIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                        <IconButton size='small'>
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

              {activeTab === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={6}>
                    <Card variant='outlined'>
                      <CardHeader title='Record Water Quality' />
                      <CardContent>
                        {createWaterQualityInputError && (
                          <Alert severity='error' sx={{ mb: 2 }}>
                            {createWaterQualityInputError.message}
                          </Alert>
                        )}
                        <WaterQualityAlert
                          pondName={
                            pond.name && typeof pond.name === 'object'
                              ? pond.name[i18n.language] || pond.name.en || 'Pond'
                              : pond.name
                          }
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
                                name='date'
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    label='Date'
                                    value={field.value}
                                    onChange={field.onChange}
                                    renderInput={params => <TextField {...params} fullWidth />}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Controller
                                name='time'
                                control={control}
                                render={({ field }) => (
                                  <TimePicker
                                    label='Time'
                                    value={field.value}
                                    onChange={field.onChange}
                                    renderInput={params => <TextField {...params} fullWidth />}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Controller
                                name='pH'
                                control={control}
                                render={({ field }) => (
                                  <TextField {...field} label='pH' type='number' fullWidth />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Controller
                                name='dissolvedOxygen'
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label='Dissolved Oxygen (mg/L)'
                                    type='number'
                                    fullWidth
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Controller
                                name='temperature'
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label='Temperature (°C)'
                                    type='number'
                                    fullWidth
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Controller
                                name='salinity'
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label='Salinity (ppt)'
                                    type='number'
                                    fullWidth
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <TextField
                                label='Chemical/Probiotic Used'
                                fullWidth
                                select
                                disabled={chemicalProbioticInventoryLoading}
                                error={!!chemicalProbioticInventoryError}
                                helperText={
                                  chemicalProbioticInventoryError ||
                                  (chemicalProbioticInventoryLoading
                                    ? 'Loading chemicals/probiotics...'
                                    : '')
                                }
                                value={chemicalType}
                                onChange={e => setChemicalType(e.target.value)}
                              >
                                {Array.isArray(chemicalProbioticInventoryItems) &&
                                  chemicalProbioticInventoryItems.map(item => {
                                    const itemName =
                                      typeof item.itemName === 'object'
                                        ? item.itemName[i18n.language] || item.itemName.en
                                        : item.itemName;
                                    return (
                                      <MenuItem key={item._id} value={item._id}>
                                        {itemName}
                                      </MenuItem>
                                    );
                                  })}
                              </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Controller
                                name='quantityUsed'
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label='Quantity Used (unit)'
                                    type='number'
                                    fullWidth
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <Button
                                type='submit'
                                variant='contained'
                                startIcon={<AddIcon />}
                                disabled={createWaterQualityInputLoading}
                              >
                                {createWaterQualityInputLoading
                                  ? 'Adding...'
                                  : 'Add Water Quality Entry'}
                              </Button>
                            </Grid>
                          </Grid>
                        </form>

                        <Box
                          sx={{ mt: 3, p: 2, bgcolor: 'rgba(40, 167, 69, 0.1)', borderRadius: 1 }}
                        >
                          <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
                            <AquacultureTooltip term='Dissolved Oxygen (DO)'>
                              <strong>Tip:</strong> Optimal DO levels: 5-7 mg/L. pH should be
                              between 6.5-8.5.
                            </AquacultureTooltip>
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} lg={6}>
                    <Card variant='outlined'>
                      <CardHeader
                        title='Water Quality History'
                        action={
                          <Tooltip title='Export data'>
                            <IconButton>
                              <WaterIcon />
                            </IconButton>
                          </Tooltip>
                        }
                      />
                      <CardContent>
                        <Box sx={{ height: 300, mb: 2 }}>
                          <ResponsiveContainer width='100%' height='100%'>
                            <LineChart
                              data={waterQualityChartData}
                              margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                            >
                              <CartesianGrid strokeDasharray='3 3' />
                              <XAxis dataKey='date' />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Line
                                type='monotone'
                                dataKey='pH'
                                name='pH Level'
                                stroke='#007BFF'
                                activeDot={{ r: 8 }}
                              />
                              <Line
                                type='monotone'
                                dataKey='do'
                                name='Dissolved Oxygen (mg/L)'
                                stroke='#28A745'
                              />
                              <Line
                                type='monotone'
                                dataKey='temp'
                                name='Temperature (°C)'
                                stroke='#FD7E14'
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </Box>

                        <WaterQualityAlert
                          pondName={
                            pond.name && typeof pond.name === 'object'
                              ? pond.name[i18n.language] || pond.name.en || 'Pond'
                              : pond.name
                          }
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
                            {waterQualityEntries.map(entry => (
                              <Grid item xs={12} key={entry._id || entry.id}>
                                <Card variant='outlined' sx={{ p: 1 }}>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <Box>
                                      <Typography variant='body2' fontWeight='bold'>
                                        Water Quality Check
                                      </Typography>
                                      <Typography variant='body2' color='text.secondary'>
                                        {formatDate(entry.date)} at {formatTime(entry.time)}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                      <Typography variant='body2'>
                                        pH: {entry.pH} | DO: {entry.dissolvedOxygen} | Temp:{' '}
                                        {entry.temperature}°C
                                      </Typography>
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          justifyContent: 'flex-end',
                                          gap: 0.5
                                        }}
                                      >
                                        <IconButton size='small'>
                                          <EditIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                        <IconButton size='small'>
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

              {activeTab === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={6}>
                    <Card variant='outlined'>
                      <CardHeader title='Record Growth Sampling' />
                      <CardContent>
                        {createGrowthSamplingError && (
                          <Alert severity='error' sx={{ mb: 2 }}>
                            {createGrowthSamplingError.message}
                          </Alert>
                        )}
                        <form onSubmit={handleSubmit(handleEventSubmit)}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Controller
                                name='date'
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    label='Date'
                                    value={field.value}
                                    onChange={field.onChange}
                                    renderInput={params => <TextField {...params} fullWidth />}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Controller
                                name='time'
                                control={control}
                                render={({ field }) => (
                                  <TimePicker
                                    label='Time'
                                    value={field.value}
                                    onChange={field.onChange}
                                    renderInput={params => <TextField {...params} fullWidth />}
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Controller
                                name='totalWeight'
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label='Total Weight (kg)'
                                    type='number'
                                    fullWidth
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Controller
                                name='totalCount'
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label='Total Count'
                                    type='number'
                                    fullWidth
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <Button
                                type='submit'
                                variant='contained'
                                startIcon={<AddIcon />}
                                disabled={createGrowthSamplingLoading}
                              >
                                {createGrowthSamplingLoading
                                  ? 'Adding...'
                                  : 'Add Growth Sampling Entry'}
                              </Button>
                            </Grid>
                          </Grid>
                        </form>

                        <Box
                          sx={{ mt: 3, p: 2, bgcolor: 'rgba(220, 53, 69, 0.1)', borderRadius: 1 }}
                        >
                          <Typography variant='body2' sx={{ fontStyle: 'italic' }}>
                            <AquacultureTooltip term='Harvest Size'>
                              <strong>Tip:</strong> Current average weight is 152g. Target harvest
                              size is 250g.
                            </AquacultureTooltip>
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} lg={6}>
                    <Card variant='outlined'>
                      <CardHeader
                        title='Growth Sampling History'
                        action={
                          <Tooltip title='Export data'>
                            <IconButton>
                              <GrowthIcon />
                            </IconButton>
                          </Tooltip>
                        }
                      />
                      <CardContent>
                        <Box sx={{ height: 300, mb: 2 }}>
                          <ResponsiveContainer width='100%' height='100%'>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                              <CartesianGrid />
                              <XAxis type='number' dataKey='x' name='Sample #' />
                              <YAxis type='number' dataKey='y' name='Avg Weight (g)' />
                              <ZAxis range={[100]} />
                              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                              <Legend />
                              <Scatter
                                name='Growth Samples'
                                data={growthScatterData}
                                fill='#007BFF'
                              />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                          <Grid container spacing={1}>
                            {growthSamplingEntries.map(entry => (
                              <Grid item xs={12} key={entry._id || entry.id}>
                                <Card variant='outlined' sx={{ p: 1 }}>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <Box>
                                      <Typography variant='body2' fontWeight='bold'>
                                        Growth Sampling
                                      </Typography>
                                      <Typography variant='body2' color='text.secondary'>
                                        {formatDate(entry.date)} at {formatTime(entry.time)}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                      <Typography variant='body2'>
                                        Avg. Weight:{' '}
                                        {entry.totalCount > 0
                                          ? ((entry.totalWeight * 1000) / entry.totalCount).toFixed(
                                            2
                                          )
                                          : 0}
                                        g
                                      </Typography>
                                      <Typography variant='body2'>
                                        Total: {entry.totalWeight}kg / {entry.totalCount} pcs
                                      </Typography>
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          justifyContent: 'flex-end',
                                          gap: 0.5
                                        }}
                                      >
                                        <IconButton size='small'>
                                          <EditIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                        <IconButton size='small'>
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
          <Card elevation={3} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <CardHeader
              title='Events Calendar'
              subheader='View and manage events for this pond'
              action={
                <Button variant='contained' startIcon={<AddIcon />} onClick={handleAddEvent}>
                  Add New Event
                </Button>
              }
            />
            <CardContent sx={{ pt: 0, pb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  placeholder='Search events...'
                  value={calendarSearchTerm}
                  onChange={e => setCalendarSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                  sx={{ minWidth: 200 }}
                />
                <ToggleButtonGroup
                  size='small'
                  value={calendarEventTypeFilter}
                  exclusive
                  onChange={(e, newFilter) => {
                    if (newFilter !== null) {
                      setCalendarEventTypeFilter(newFilter);
                    }
                  }}
                >
                  <ToggleButton value='all'>All</ToggleButton>
                  <ToggleButton value='Feeding'>Feeding</ToggleButton>
                  <ToggleButton value='Water Quality'>Water Quality</ToggleButton>
                  <ToggleButton value='Growth Sampling'>Growth Sampling</ToggleButton>
                  <ToggleButton value='Routine'>Routine</ToggleButton>
                  <ToggleButton value='Maintenance'>Maintenance</ToggleButton>
                  <ToggleButton value='Monitoring'>Monitoring</ToggleButton>
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
                    onViewChange={view => setCalendarView(view)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Card variant='outlined'>
                    <CardHeader title='Upcoming Events' />
                    <CardContent>
                      <Grid container spacing={2}>
                        {(events || []).slice(0, 3).map(event => (
                          <Grid item xs={12} md={6} lg={4} key={event._id || event.id}>
                            <Card
                              variant='outlined'
                              sx={{
                                height: '100%',
                                borderLeft: `4px solid ${event.type === 'Routine'
                                    ? '#007BFF'
                                    : event.type === 'Monitoring'
                                      ? '#28A745'
                                      : event.type === 'Maintenance'
                                        ? '#FD7E14'
                                        : event.type === 'Feeding'
                                          ? '#007BFF'
                                          : event.type === 'Water Quality'
                                            ? '#28A745'
                                            : event.type === 'Growth Sampling'
                                              ? '#6f42c1'
                                              : '#9e9e9e'
                                  }`
                              }}
                            >
                              <CardContent>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start'
                                  }}
                                >
                                  <Box>
                                    <Typography variant='body1' fontWeight='bold'>
                                      {event.title}
                                    </Typography>
                                    <Typography variant='body2' color='text.secondary'>
                                      {new Date(event.start).toLocaleDateString(i18n.language, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </Typography>
                                    <Typography variant='body2' color='text.secondary'>
                                      {new Date(event.start).toLocaleTimeString(i18n.language, {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}{' '}
                                      -{' '}
                                      {new Date(event.end).toLocaleTimeString(i18n.language, {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={event.type}
                                    size='small'
                                    color={
                                      event.type === 'Routine'
                                        ? 'primary'
                                        : event.type === 'Monitoring'
                                          ? 'success'
                                          : event.type === 'Maintenance'
                                            ? 'warning'
                                            : event.type === 'Feeding'
                                              ? 'primary'
                                              : event.type === 'Water Quality'
                                                ? 'success'
                                                : event.type === 'Growth Sampling'
                                                  ? 'secondary'
                                                  : 'default'
                                    }
                                  />
                                </Box>
                                <Typography variant='body2' sx={{ mt: 1, fontStyle: 'italic' }}>
                                  {event.resource && event.resource.description
                                    ? event.resource.description
                                    : 'No description'}
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
                    lastFeeding='2023-06-16'
                    onSuggestionClick={suggestion => {
                      console.log('Suggested event:', suggestion);
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Container>

      <Dialog open={openEventModal} onClose={handleCloseModal} maxWidth='sm' fullWidth>
        <DialogTitle>
          {selectedEvent?.title}
          <IconButton
            aria-label='close'
            onClick={handleCloseModal}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Typography variant='body1' sx={{ mb: 2 }}>
                <strong>{t('date')}:</strong>{' '}
                {new Date(selectedEvent.start).toLocaleDateString(i18n.language, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>
                <strong>{t('time')}:</strong>{' '}
                {new Date(selectedEvent.start).toLocaleTimeString(i18n.language, {
                  hour: '2-digit',
                  minute: '2-digit'
                })}{' '}
                -{' '}
                {new Date(selectedEvent.end).toLocaleTimeString(i18n.language, {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>
                <strong>Type:</strong> {selectedEvent.type}
              </Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>
                <strong>Description:</strong>{' '}
                {selectedEvent.resource && selectedEvent.resource.description
                  ? selectedEvent.resource.description
                  : 'No description'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color='primary'>
            Close
          </Button>
          <Button variant='contained' startIcon={<EditIcon />} onClick={handleCloseModal}>
            Edit Event
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAddModal} onClose={handleCloseAddModal} maxWidth='sm' fullWidth>
        <DialogTitle>
          Add New Event
          <IconButton
            aria-label='close'
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
                  name='eventType'
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label='Event Type' fullWidth select required>
                      <MenuItem value='Routine'>Routine</MenuItem>
                      <MenuItem value='Monitoring'>Monitoring</MenuItem>
                      <MenuItem value='Maintenance'>Maintenance</MenuItem>
                      <MenuItem value='Feeding'>Feeding</MenuItem>
                      <MenuItem value='Water Quality'>Water Quality</MenuItem>
                      <MenuItem value='Growth Sampling'>Growth Sampling</MenuItem>
                      <MenuItem value='Stocking'>Stocking</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name='title'
                  control={control}
                  render={({ field }) => <TextField {...field} label='Event Title' fullWidth />}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name='date'
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label='Date'
                      value={field.value}
                      onChange={field.onChange}
                      renderInput={params => <TextField {...params} fullWidth required />}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name='time'
                  control={control}
                  render={({ field }) => (
                    <TimePicker
                      label='Start Time'
                      value={field.value}
                      onChange={field.onChange}
                      renderInput={params => <TextField {...params} fullWidth required />}
                    />
                  )}
                />
              </Grid>

              {eventType === 'Feeding' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      label='Feed Type'
                      fullWidth
                      select
                      disabled={feedInventoryLoading}
                      error={!!feedInventoryError}
                      helperText={
                        feedInventoryError || (feedInventoryLoading ? 'Loading feed types...' : '')
                      }
                      value={feedType}
                      onChange={e => setFeedType(e.target.value)}
                    >
                      {Array.isArray(feedInventoryItems) &&
                        feedInventoryItems.map(item => {
                          const itemName =
                            typeof item.itemName === 'object'
                              ? item.itemName[i18n.language] || item.itemName.en
                              : item.itemName;
                          return (
                            <MenuItem key={item._id} value={item._id}>
                              {itemName}
                            </MenuItem>
                          );
                        })}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name='quantity'
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label='Quantity (kg)' type='number' fullWidth />
                      )}
                    />
                  </Grid>
                </>
              )}

              {eventType === 'Water Quality' && (
                <>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name='pH'
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label='pH' type='number' fullWidth />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name='dissolvedOxygen'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label='Dissolved Oxygen (mg/L)'
                          type='number'
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name='temperature'
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label='Temperature (°C)' type='number' fullWidth />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name='salinity'
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label='Salinity (ppt)' type='number' fullWidth />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label='Chemical/Probiotic Used'
                      fullWidth
                      select
                      disabled={chemicalProbioticInventoryLoading}
                      error={!!chemicalProbioticInventoryError}
                      helperText={
                        chemicalProbioticInventoryError ||
                        (chemicalProbioticInventoryLoading ? 'Loading chemicals/probiotics...' : '')
                      }
                      value={chemicalType}
                      onChange={e => setChemicalType(e.target.value)}
                    >
                      {Array.isArray(chemicalProbioticInventoryItems) &&
                        chemicalProbioticInventoryItems.map(item => {
                          const itemName =
                            typeof item.itemName === 'object'
                              ? item.itemName[i18n.language] || item.itemName.en
                              : item.itemName;
                          return (
                            <MenuItem key={item._id} value={item._id}>
                              {itemName}
                            </MenuItem>
                          );
                        })}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name='quantityUsed'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label='Quantity Used (unit)'
                          type='number'
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                </>
              )}

              {eventType === 'Growth Sampling' && (
                <>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name='totalWeight'
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label='Total Weight (kg)' type='number' fullWidth />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name='totalCount'
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label='Total Count' type='number' fullWidth />
                      )}
                    />
                  </Grid>
                </>
              )}

              {eventType === 'Stocking' && (
                <>
                  <Grid item xs={12}>
                    <Controller
                      name='nurseryBatchId'
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label='Nursery Batch' fullWidth select>
                          {/* TODO: Populate with nursery batches */}
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name='species'
                      control={control}
                      render={({ field }) => <TextField {...field} label='Species' fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name='initialCount'
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label='Initial Count' type='number' fullWidth />
                      )}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Controller
                  name='description'
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label='Description' fullWidth multiline rows={3} />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddModal} color='primary'>
            Cancel
          </Button>
          <Button
            variant='contained'
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
