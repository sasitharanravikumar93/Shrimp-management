import React, { useState } from 'react';
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
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  ToggleButton,
  ToggleButtonGroup,
  Badge
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
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { format } from 'date-fns';
import moment from 'moment';
import { 
  Calendar, 
  momentLocalizer,
  Views
} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../components/CalendarOverrides.css';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { useForm, Controller } from 'react-hook-form';
import AquacultureTooltip from '../components/AquacultureTooltip';
import HarvestProjection from '../components/HarvestProjection';
import FeedCalculator from '../components/FeedCalculator';
import WaterQualityAlert from '../components/WaterQualityAlert';
import EventSuggestions from '../components/EventSuggestions';

// Set up calendar localizer
const localizer = momentLocalizer(moment);

const PondManagementPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('tabs'); // 'tabs' or 'calendar'
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [openEventModal, setOpenEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  
  // Mock data for demonstration
  const pond = { 
    id: 1, 
    name: 'Pond A', 
    season: 'Season 2023', 
    status: 'Active', 
    health: 'Good',
    projectedHarvest: '28 days'
  };
  
  // Sample data for tables
  const feedEntries = [
    { id: 1, date: '2023-06-15', time: '08:00', feedType: 'Standard Pellet', quantity: 50 },
    { id: 2, date: '2023-06-15', time: '16:00', feedType: 'Standard Pellet', quantity: 45 },
    { id: 3, date: '2023-06-16', time: '08:00', feedType: 'High Protein Pellet', quantity: 52 },
    { id: 4, date: '2023-06-16', time: '16:00', feedType: 'Standard Pellet', quantity: 48 },
    { id: 5, date: '2023-06-17', time: '08:00', feedType: 'High Protein Pellet', quantity: 55 },
  ];
  
  const waterQualityEntries = [
    { 
      id: 1, 
      date: '2023-06-15', 
      time: '08:00', 
      pH: 7.2, 
      dissolvedOxygen: 5.5, 
      temperature: 28.5, 
      salinity: 25.0
    },
    { 
      id: 2, 
      date: '2023-06-15', 
      time: '16:00', 
      pH: 7.1, 
      dissolvedOxygen: 5.2, 
      temperature: 29.0, 
      salinity: 25.2
    },
    { 
      id: 3, 
      date: '2023-06-16', 
      time: '08:00', 
      pH: 7.3, 
      dissolvedOxygen: 5.8, 
      temperature: 28.2, 
      salinity: 25.1
    },
    { 
      id: 4, 
      date: '2023-06-16', 
      time: '16:00', 
      pH: 7.2, 
      dissolvedOxygen: 5.6, 
      temperature: 28.7, 
      salinity: 25.0
    },
  ];
  
  const growthSamplingEntries = [
    { id: 1, date: '2023-06-15', time: '10:00', totalWeight: 5.5, totalCount: 100 },
    { id: 2, date: '2023-06-22', time: '10:00', totalWeight: 8.2, totalCount: 100 },
    { id: 3, date: '2023-06-29', time: '10:00', totalWeight: 11.5, totalCount: 100 },
    { id: 4, date: '2023-07-06', time: '10:00', totalWeight: 15.2, totalCount: 100 },
  ];
  
  // Calendar events data
  const events = [
    {
      id: 1,
      title: 'Morning Feeding',
      start: new Date(2023, 5, 15, 8, 0, 0),
      end: new Date(2023, 5, 15, 8, 30, 0),
      type: 'Feeding',
      resource: { description: 'Standard Pellet - 50kg' }
    },
    {
      id: 2,
      title: 'Water Quality Check',
      start: new Date(2023, 5, 15, 9, 0, 0),
      end: new Date(2023, 5, 15, 9, 30, 0),
      type: 'Water Quality',
      resource: { description: 'pH: 7.2, DO: 5.5mg/L' }
    },
    {
      id: 3,
      title: 'Afternoon Feeding',
      start: new Date(2023, 5, 15, 16, 0, 0),
      end: new Date(2023, 5, 15, 16, 30, 0),
      type: 'Feeding',
      resource: { description: 'Standard Pellet - 45kg' }
    },
    {
      id: 4,
      title: 'Growth Sampling',
      start: new Date(2023, 5, 15, 10, 0, 0),
      end: new Date(2023, 5, 15, 10, 45, 0),
      type: 'Growth Sampling',
      resource: { description: 'Avg. weight: 55g' }
    },
    {
      id: 5,
      title: 'Aeration Check',
      start: new Date(2023, 5, 16, 7, 0, 0),
      end: new Date(2023, 5, 16, 7, 30, 0),
      type: 'Maintenance',
      resource: { description: 'All systems operational' }
    },
  ];

  // Form setup with react-hook-form
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
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
    }
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
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

  const handleEventSubmit = (data) => {
    // Implementation for submitting event
    console.log('Event submitted:', data);
    setOpenAddModal(false);
  };

  const handleCloseModal = () => {
    setOpenEventModal(false);
    setSelectedEvent(null);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  // Get icon for active tab
  const getTabIcon = (tabIndex) => {
    switch(tabIndex) {
      case 0: return <FeedIcon />;
      case 1: return <WaterIcon />;
      case 2: return <GrowthIcon />;
      default: return null;
    }
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
  const feedChartData = feedEntries.map(entry => ({
    date: formatDate(entry.date),
    quantity: entry.quantity
  }));

  // Water quality chart data
  const waterQualityChartData = waterQualityEntries.map(entry => ({
    date: formatDate(entry.date),
    pH: entry.pH,
    do: entry.dissolvedOxygen,
    temp: entry.temperature
  }));

  // Growth chart data
  const growthChartData = growthSamplingEntries.map(entry => ({
    date: formatDate(entry.date),
    avgWeight: (entry.totalWeight * 1000 / entry.totalCount).toFixed(2)
  }));

  // Growth scatter data
  const growthScatterData = growthSamplingEntries.map((entry, index) => ({
    x: index + 1,
    y: (entry.totalWeight * 1000 / entry.totalCount).toFixed(2),
    date: formatDate(entry.date)
  }));

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
                label={pond.season} 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={pond.status} 
                color={pond.status === 'Active' ? 'success' : 'default'} 
              />
              <Chip 
                label={pond.health} 
                color={pond.health === 'Good' ? 'success' : pond.health === 'Fair' ? 'warning' : 'error'} 
                icon={pond.health === 'Good' ? <CheckIcon /> : <WarningIcon />}
              />
              <Chip 
                label={`Harvest: ${pond.projectedHarvest}`} 
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
                                >
                                  <MenuItem value="Standard Pellet">Standard Pellet</MenuItem>
                                  <MenuItem value="High Protein Pellet">High Protein Pellet</MenuItem>
                                  <MenuItem value="Vitamin Enhanced">Vitamin Enhanced</MenuItem>
                                  <MenuItem value="Special Formula">Special Formula</MenuItem>
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
                              onClick={() => setValue('eventType', 'Feed')}
                            >
                              Add Feed Entry
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
                              <Grid item xs={12} key={entry.id}>
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
                          
                          <Grid item xs={12}>
                            <Button 
                              type="submit" 
                              variant="contained" 
                              startIcon={<AddIcon />}
                              onClick={() => setValue('eventType', 'Water Quality')}
                            >
                              Add Water Quality Entry
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
                              <Grid item xs={12} key={entry.id}>
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
                                onClick={() => setValue('eventType', 'Growth Sampling')}
                              >
                                Add Growth Sampling Entry
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
                              <Grid item xs={12} key={entry.id}>
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
                                        Avg. Weight: {(entry.totalWeight * 1000 / entry.totalCount).toFixed(2)}g
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
          <Card elevation={3}>
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
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <CustomCalendar
                    events={events}
                    onEventSelect={handleEventSelect}
                    onDateChange={handleDateChange}
                    onRangeChange={handleRangeChange}
                    date={calendarDate}
                    onViewChange={() => {}} // onView handler
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader title="Upcoming Events" />
                    <CardContent>
                      <Grid container spacing={2}>
                        {events.slice(0, 3).map((event) => (
                          <Grid item xs={12} md={6} lg={4} key={event.id}>
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
                                  {event.resource.description}
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
                <strong>Description:</strong> {selectedEvent.resource.description}
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
          <Button variant="contained" onClick={handleSubmit(handleEventSubmit)}>
            Add Event
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default PondManagementPage;