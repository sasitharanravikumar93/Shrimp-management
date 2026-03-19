// eslint-disable-next-line max-lines-per-function, complexity, max-lines
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
  Alert,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails
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
import EventSuggestions from '../components/features/farm/EventSuggestions';
import FeedCalculator from '../components/features/feeding/FeedCalculator';
import FeedLog from '../components/features/feeding/FeedLog';
import HarvestProjection from '../components/features/feeding/HarvestProjection';
import PondCard from '../components/features/ponds/PondCard';
import { useGlobalError } from '../components/features/shared/error-handling/GlobalErrorProvider';
import CustomCalendar from '../components/features/shared/forms/CustomCalendar';
import WaterQualityAlert from '../components/features/water-quality/WaterQualityAlert';
import FinancialOverviewWidget from '../components/FinancialOverviewWidget';
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
import logger from '../utils/logger';

// eslint-disable-next-line max-lines-per-function, complexity, max-lines
const PondManagementPage = () => {
  const { t, i18n } = useTranslation();
  const api = useApi(); // Initialize useApi
  const navigate = useNavigate();
  const { selectedSeason } = useSeason();
  const { pondId } = useParams();
  const { showError } = useGlobalError();

  const API_DATA_CACHE_DURATION = 3;
  const POND_DISPLAY_LIMIT = 3;
  const KG_TO_GRAMS_CONVERSION = 1000;
  const ZAXIS_RANGE_VALUE = 100;

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
        logger.error('Error fetching nursery batches:', err);
        showError(err);
      }
    };
    fetchNurseryBatches();
  }, [selectedSeason, api, showError]);

  useEffect(() => {
    const fetchPonds = async () => {
      logger.debug('Fetching ponds for season:', selectedSeason);
      if (!selectedSeason || !selectedSeason._id) {
        logger.debug('No selected season, setting ponds to empty array');
        setPonds([]);
        return;
      }

      setPondsLoading(true);
      setPondsError(null);

      try {
        logger.debug('Making API call to fetch ponds for season ID:', selectedSeason._id);
        const cacheBuster = `_=${new Date().getTime()}`;
        const url = `/ponds/season/${selectedSeason._id}?${cacheBuster}`;
        const response = await api.get(url);

        let pondsData = [];
        if (Array.isArray(response)) {
          pondsData = response;
        } else if (response && Array.isArray(response.data)) {
          pondsData = response.data;
        } else if (response && typeof response === 'object' && response.data) {
          pondsData = Array.isArray(response.data) ? response.data : [];
        }

        setPonds(pondsData);
        if (pondsData && pondsData.length > 0) {
          if (!pondId) {
            navigate(`/pond/${pondsData[0]._id}`);
          }
        }
      } catch (err) {
        logger.error('Error fetching ponds:', err);
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
        // Updated to use both filter and seasonId for robustness
        const response = await api.get(`/inventory-items?itemType=Feed&seasonId=${selectedSeason._id}`);
        setFeedInventoryItems(response || []);
      } catch (err) {
        logger.error('Error fetching feed inventory:', err);
        setFeedInventoryError('Failed to load feed types.');
      } finally {
        setFeedInventoryLoading(false);
      }
    };

    const fetchChemicalProbioticInventory = async () => {
      if (!selectedSeason || !selectedSeason._id) return;
      try {
        const chemicalResponse = await api.get(`/inventory-items?itemType=Chemical&seasonId=${selectedSeason._id}`);
        const probioticResponse = await api.get(`/inventory-items?itemType=Probiotic&seasonId=${selectedSeason._id}`);
        setChemicalProbioticInventoryItems([
          ...(chemicalResponse || []),
          ...(probioticResponse || [])
        ]);
      } catch (err) {
        logger.error('Error fetching chemical/probiotic inventory:', err);
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
  } = useApiData(
    () => pondId && getPondById(pondId),
    [pondId],
    `pond-${pondId}`,
    API_DATA_CACHE_DURATION
  );

  const {
    data: feedEntriesData,
    loading: feedEntriesLoading,
    error: feedEntriesError,
    refetch: refetchFeedEntries
  } = useApiData(
    () => pondId && getFeedInputsByPondId(pondId),
    [pondId],
    `feed-${pondId}`,
    API_DATA_CACHE_DURATION
  );

  const {
    data: waterQualityEntriesData,
    loading: waterQualityEntriesLoading,
    error: waterQualityEntriesError,
    refetch: refetchWaterQualityEntries
  } = useApiData(
    () => pondId && getWaterQualityInputsByPondId(pondId),
    [pondId],
    `water-${pondId}`,
    API_DATA_CACHE_DURATION
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
    API_DATA_CACHE_DURATION
  );

  const {
    data: eventsData,
    loading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents
  } = useApiData(
    () => pondId && getEventsByPondId(pondId),
    [pondId],
    `events-${pondId}`,
    API_DATA_CACHE_DURATION
  );

  const {
    mutate: createFeedInputMutation,
    loading: createFeedInputLoading,
    error: createFeedInputError
  } = useApiMutation(createFeedInput, API_DATA_CACHE_DURATION);
  
  const {
    mutate: createWaterQualityInputMutation,
    loading: createWaterQualityInputLoading,
    error: createWaterQualityInputError
  } = useApiMutation(createWaterQualityInput, API_DATA_CACHE_DURATION);
  
  const {
    mutate: createGrowthSamplingMutation,
    loading: createGrowthSamplingLoading,
    error: createGrowthSamplingError
  } = useApiMutation(createGrowthSampling, API_DATA_CACHE_DURATION);

  const { mutate: createEventMutation, loading: createEventLoading } = useApiMutation(
    createEvent,
    API_DATA_CACHE_DURATION
  );

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
      description: '',
      nurseryBatchId: '',
      species: '',
      initialCount: ''
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
      inventoryItemId: '',
      quantity: '',
      pH: '',
      dissolvedOxygen: '',
      temperature: '',
      salinity: '',
      totalWeight: '',
      totalCount: '',
      title: '',
      eventType: '',
      description: '',
      nurseryBatchId: '',
      species: '',
      initialCount: ''
    });
    setOpenAddModal(true);
  };

  const handleDeleteFeedEntry = async feedEntryId => {
    if (!feedEntryId) return;
    try {
      const confirmed = window.confirm('Are you sure you want to delete this feed entry?');
      if (!confirmed) return;
      await api.delete(`/feed-inputs/${feedEntryId}`);
      refetchFeedEntries();
    } catch (error) {
      logger.error('Error deleting feed entry:', error);
      showError(error);
    }
  };

  const handleFeedInputSubmit = async data => {
    try {
      await createFeedInputMutation({
        date: data.date.toISOString().split('T')[0],
        time: data.time.toLocaleTimeString('en-US', {
          hour12: false, hour: '2-digit', minute: '2-digit'
        }),
        pondId: pondId,
        inventoryItemId: feedType,
        quantity: parseFloat(data.quantity),
        seasonId: selectedSeason?._id
      });
      refetchFeedEntries();
    } catch (error) {
      logger.error('Error creating feed input:', error);
      showError(error);
    }
  };

  const handleEventSubmit = async data => {
    try {
      const details = {};
      if (data.eventType === 'Water Quality') {
        details.pH = parseFloat(data.pH);
        details.dissolvedOxygen = parseFloat(data.dissolvedOxygen);
        details.temperature = parseFloat(data.temperature);
        details.salinity = parseFloat(data.salinity);
        details.inventoryItemId = chemicalType;
        details.quantityUsed = parseFloat(data.quantityUsed);
        
        await createWaterQualityInputMutation({
          pondId,
          date: data.date,
          time: data.time,
          ...details,
          seasonId: selectedSeason?._id
        });
        refetchWaterQualityEntries();
      } else if (data.eventType === 'Growth Sampling') {
        details.totalWeight = parseFloat(data.totalWeight);
        details.totalCount = parseInt(data.totalCount);
        
        await createGrowthSamplingMutation({
          pondId,
          date: data.date,
          time: data.time,
          ...details,
          seasonId: selectedSeason?._id
        });
        refetchGrowthSamplingEntries();
      } else {
        if (data.eventType === 'Stocking') {
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
      }

      setOpenAddModal(false);
    } catch (error) {
      logger.error('Error submitting event:', error);
      showError(error);
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

  const growthScatterData = (growthSamplingEntriesData || []).map((entry, index) => ({
    x: index,
    y: (entry.totalWeight * 1000) / entry.totalCount,
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
    eventsLoading ||
    pondsLoading;

  const hasError =
    pondError ||
    feedEntriesError ||
    waterQualityEntriesError ||
    growthSamplingEntriesError ||
    eventsError ||
    pondsError;

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Skeleton variant="text" width={200} height={36} />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 2 }} />
            </Box>
          </Box>
          <Skeleton variant="rounded" width={140} height={40} sx={{ borderRadius: 2 }} />
        </Box>
        <Skeleton variant="rounded" width="100%" height={400} sx={{ borderRadius: 3 }} />
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

    showError(new Error(`Error loading pond data: ${errorMessages}`));

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

  const getHealthColor = health => {
    const actualHealth = health || 'Good';
    if (actualHealth === 'Good') {
      return 'success';
    }
    if (actualHealth === 'Fair') {
      return 'warning';
    }
    return 'error';
  };

  const getHealthIcon = health => {
    const actualHealth = health || 'Good';
    return actualHealth === 'Good' ? <CheckIcon /> : <WarningIcon />;
  };

  const getEventTypeColor = eventType => {
    switch (eventType) {
      case 'Routine':
      case 'Feeding':
        return 'primary';
      case 'Monitoring':
      case 'Water Quality':
        return 'success';
      case 'Maintenance':
        return 'warning';
      case 'Growth Sampling':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getEventTypeBorderColor = eventType => {
    switch (eventType) {
      case 'Routine':
      case 'Feeding':
        return '#007BFF';
      case 'Monitoring':
      case 'Water Quality':
        return '#28A745';
      case 'Maintenance':
        return '#FD7E14';
      case 'Growth Sampling':
        return '#6f42c1';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth='lg' sx={{ mt: 2, mb: 4 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {(showAllPonds ? ponds : ponds.slice(0, POND_DISPLAY_LIMIT)).map(p => (
            <Grid item xs={12} md={4} key={p._id}>
              <PondCard
                pond={p}
                onClick={() => navigate(`/pond/${p._id}`)}
                selected={p._id === pondId}
              />
            </Grid>
          ))}
        </Grid>
        {ponds.length > POND_DISPLAY_LIMIT && (
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
                color={getHealthColor(pond.health)}
                icon={getHealthIcon(pond.health)}
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
              currentWeight={152} 
              targetWeight={250} 
              growthRate={5.2} 
              startDate='2023-06-01'
              pondName={
                pond.name && typeof pond.name === 'object'
                  ? pond.name[i18n.language] || pond.name.en || 'Pond'
                  : pond.name
              }
            />
          </Grid>
          <Grid item xs={12} md={6} lg={8}>
            <FinancialOverviewWidget pondId={pondId} seasonId={selectedSeason?._id || pond?.seasonId?._id} />
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
                <Tab icon={<FeedIcon />} label={t('feed.feed')} />
                <Tab icon={<WaterIcon />} label={t('water_quality')} />
                <Tab icon={<GrowthIcon />} label={t('growth.sampling')} />
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
                        <form onSubmit={handleSubmit(handleFeedInputSubmit)}>
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
                                error={
                                  !!feedInventoryError ||
                                  (Array.isArray(feedInventoryItems) &&
                                    feedInventoryItems.length === 0)
                                }
                                required
                                helperText={
                                  feedInventoryError
                                    ? `Error: ${feedInventoryError}`
                                    : feedInventoryLoading
                                    ? 'Loading feed types...'
                                    : Array.isArray(feedInventoryItems) &&
                                      feedInventoryItems.length === 0
                                    ? 'No feed inventory available for this season.'
                                    : ''
                                }
                                value={feedType}
                                onChange={e => setFeedType(e.target.value)}
                              >
                                {Array.isArray(feedInventoryItems) &&
                                feedInventoryItems.length > 0 ? (
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
                                  })
                                ) : (
                                  <MenuItem disabled value=''>
                                    No feed inventory available
                                  </MenuItem>
                                )}
                              </TextField>
                            </Grid>

                            <Grid item xs={12}>
                              <Controller
                                name='quantity'
                                control={control}
                                rules={{
                                  required: 'Quantity is required',
                                  min: { value: 0.1, message: 'Quantity must be greater than 0' }
                                }}
                                render={({ field, fieldState }) => (
                                  <TextField
                                    {...field}
                                    label='Quantity (kg)'
                                    type='number'
                                    fullWidth
                                    required
                                    error={!!fieldState.error}
                                    helperText={
                                      fieldState.error?.message ||
                                      'Enter the amount of feed to be used'
                                    }
                                  />
                                )}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <Button
                                type='submit'
                                variant='contained'
                                startIcon={<AddIcon />}
                                disabled={
                                  createFeedInputLoading ||
                                  (Array.isArray(feedInventoryItems) &&
                                    feedInventoryItems.length === 0)
                                }
                              >
                                {createFeedInputLoading
                                  ? 'Adding...'
                                  : Array.isArray(feedInventoryItems) &&
                                    feedInventoryItems.length === 0
                                  ? 'No Feed Inventory Available'
                                  : 'Add Feed Entry'}
                              </Button>
                            </Grid>
                          </Grid>
                        </form>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} lg={6}>
                    <Card variant='outlined'>
                      <CardHeader title='Feed History' />
                      <CardContent>
                        <FeedLog pondId={pondId} seasonId={selectedSeason?._id} />
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
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} lg={6}>
                    <Card variant='outlined'>
                      <CardHeader title='Water Quality History' />
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
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} lg={6}>
                    <Card variant='outlined'>
                      <CardHeader title='Growth Sampling History' />
                      <CardContent>
                        <Box sx={{ height: 300, mb: 2 }}>
                          <ResponsiveContainer width='100%' height='100%'>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                              <CartesianGrid />
                              <XAxis type='number' dataKey='x' name='Sample #' />
                              <YAxis type='number' dataKey='y' name='Avg Weight (g)' />
                              <ZAxis range={[ZAXIS_RANGE_VALUE]} />
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
              <CustomCalendar
                events={getFilteredCalendarEvents(events)}
                onEventSelect={handleEventSelect}
                onDateChange={handleDateChange}
                onRangeChange={handleRangeChange}
                date={calendarDate}
                view={calendarView}
                onViewChange={view => setCalendarView(view)}
              />
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
                {new Date(selectedEvent.start).toLocaleDateString(i18n.language)}
              </Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>
                <strong>{t('time')}:</strong>{' '}
                {new Date(selectedEvent.start).toLocaleTimeString(i18n.language)}
              </Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>
                <strong>Type:</strong> {selectedEvent.type}
              </Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>
                <strong>Description:</strong>{' '}
                {selectedEvent.resource?.description || 'No description'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
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
                        <TextField {...field} label='DO (mg/L)' type='number' fullWidth />
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
                          {nurseryBatches.map(batch => (
                            <MenuItem key={batch._id} value={batch._id}>
                              {typeof batch.batchName === 'object' ? batch.batchName.en : batch.batchName}
                            </MenuItem>
                          ))}
                        </TextField>
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
          <Button onClick={handleCloseAddModal}>Cancel</Button>
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
