import React, { useState } from 'react';
import { 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Chip, 
  Button,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  WaterDrop as WaterIcon,
  Science as GrowthIcon,
  Restaurant as FeedIcon,
  Camera as CameraIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useApiData, useApiMutation } from '../hooks/useApi';
import { 
  getNurseryBatchById,
  getEventsForNurseryBatch,
  createEvent,
  deleteEvent,
  getInventoryItems
} from '../services/api';
import { useSeason } from '../context/SeasonContext';
import CustomCalendar from '../components/CustomCalendar';
import { LineChart, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, Line, Bar, ResponsiveContainer } from 'recharts';

const DataForm = ({ eventType, nurseryBatch, refetchEvents, inventoryItems }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { selectedSeason } = useSeason();
  const [formData, setFormData] = useState({
    date: new Date(),
    details: {}
  });
  const { mutate: createEventMutation, loading: createEventLoading } = useApiMutation(createEvent);

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSeason) {
      alert(t('no_season_selected'));
      return;
    }
    try {
      const eventData = {
        eventType,
        date: formData.date,
        nurseryBatchId: id,
        seasonId: selectedSeason._id,
        details: formData.details
      };
      await createEventMutation(eventData);
      refetchEvents();
      setFormData({ date: new Date(), details: {} });
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const renderFields = () => {
    switch (eventType) {
      case 'WaterQualityTesting':
        return (
          <>
            <TextField margin="dense" name="pH" label={t('pH')} type="number" fullWidth variant="outlined" value={formData.details.pH || ''} onChange={handleDetailsChange} />
            <TextField margin="dense" name="dissolvedOxygen" label={t('dissolvedOxygen')} type="number" fullWidth variant="outlined" value={formData.details.dissolvedOxygen || ''} onChange={handleDetailsChange} />
            <TextField margin="dense" name="temperature" label={t('temperature')} type="number" fullWidth variant="outlined" value={formData.details.temperature || ''} onChange={handleDetailsChange} />
            <TextField margin="dense" name="salinity" label={t('salinity')} type="number" fullWidth variant="outlined" value={formData.details.salinity || ''} onChange={handleDetailsChange} />
          </>
        );
      case 'GrowthSampling':
        return (
          <>
            <TextField margin="dense" name="totalWeight" label={t('totalWeight')} type="number" fullWidth variant="outlined" value={formData.details.totalWeight || ''} onChange={handleDetailsChange} />
            <TextField margin="dense" name="totalCount" label={t('totalCount')} type="number" fullWidth variant="outlined" value={formData.details.totalCount || ''} onChange={handleDetailsChange} />
          </>
        );
      case 'Feeding':
        return (
          <>
            <TextField select margin="dense" name="inventoryItemId" label={t('feedItem')} fullWidth variant="outlined" value={formData.details.inventoryItemId || ''} onChange={handleDetailsChange}>
              {inventoryItems && inventoryItems.filter(item => item.itemType === 'Feed').map(item => (
                <MenuItem key={item._id} value={item._id}>{typeof item.itemName === 'object' ? item.itemName.en : item.itemName}</MenuItem>
              ))}
            </TextField>
            <TextField margin="dense" name="quantity" label={t('quantity')} type="number" fullWidth variant="outlined" value={formData.details.quantity || ''} onChange={handleDetailsChange} />
          </>
        );
      case 'Inspection':
        return (
          <TextField margin="dense" name="notes" label={t('notes')} type="text" fullWidth variant="outlined" multiline rows={4} value={formData.details.notes || ''} onChange={handleDetailsChange} />
        );
      default:
        return null;
    }
  };

  return (
    <Card variant="outlined">
      <CardHeader title={`${t('add')} ${t(eventType)}`} />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <TextField type="date" margin="dense" fullWidth variant="outlined" value={format(formData.date, 'yyyy-MM-dd')} onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))} />
          {renderFields()}
          <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={createEventLoading}>
            {createEventLoading ? t('saving') : t('add_entry')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const DataHistory = ({ eventType, events, handleDeleteEvent, handleEditEvent }) => {
  const { t } = useTranslation();

  const filteredEvents = events.filter(e => e.eventType === eventType);

  const renderChart = () => {
    if (filteredEvents.length === 0) return <Alert severity="info">{t('no_data_available')}</Alert>;

    let chart;
    switch (eventType) {
      case 'WaterQualityTesting':
        chart = (
          <LineChart data={filteredEvents.map(e => ({ date: format(new Date(e.date), 'MM/dd'), ...e.details }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="pH" stroke="#8884d8" />
            <Line type="monotone" dataKey="dissolvedOxygen" stroke="#82ca9d" />
            <Line type="monotone" dataKey="temperature" stroke="#ffc658" />
            <Line type="monotone" dataKey="salinity" stroke="#ff8042" />
          </LineChart>
        );
        break;
      case 'GrowthSampling':
        chart = (
          <BarChart data={filteredEvents.map(e => ({ date: format(new Date(e.date), 'MM/dd'), avgWeight: e.details.totalCount > 0 ? (e.details.totalWeight * 1000 / e.details.totalCount).toFixed(2) : 0 }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="avgWeight" fill="#8884d8" name="Avg. Weight (g)" />
          </BarChart>
        );
        break;
      case 'Feeding':
        chart = (
          <BarChart data={filteredEvents.map(e => ({ date: format(new Date(e.date), 'MM/dd'), ...e.details }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="quantity" fill="#82ca9d" name="Quantity (kg)" />
          </BarChart>
        );
        break;
      default:
        chart = null;
    }
    return <ResponsiveContainer width="100%" height={300}>{chart}</ResponsiveContainer>;
  };

  return (
    <Card variant="outlined">
      <CardHeader title={`${t('history')} - ${t(eventType)}`} />
      <CardContent>
        {renderChart()}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          {filteredEvents.map(event => (
            <Card key={event._id} variant="outlined" sx={{ p: 1, mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" fontWeight="bold">{format(new Date(event.date), 'PPP')}</Typography>
                  {Object.entries(event.details).map(([key, value]) => (
                    <Typography key={key} variant="body2" color="text.secondary">{`${t(key)}: ${value}`}</Typography>
                  ))}
                </Box>
                <Box>
                  <Tooltip title={t('edit')}><IconButton size="small" onClick={() => handleEditEvent(event)}><EditIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                  <Tooltip title={t('delete')}><IconButton size="small" onClick={() => handleDeleteEvent(event._id)}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

const NurseryBatchDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('data'); // 'data' or 'calendar'
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openEventModal, setOpenEventModal] = useState(false);

  const { selectedSeason } = useSeason();
  const { data: nurseryBatch, loading: nurseryBatchLoading, error: nurseryBatchError } = useApiData(() => getNurseryBatchById(id), [id]);
  const { data: eventsData, loading: eventsLoading, error: eventsError, refetch: refetchEvents } = useApiData(() => getEventsForNurseryBatch(id), [id]);
  const { data: inventoryItems, loading: inventoryLoading, error: inventoryError } = useApiData(() => getInventoryItems(selectedSeason?._id), [selectedSeason]);
  const { mutate: deleteEventMutation } = useApiMutation(deleteEvent);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm(t('areYouSureDeleteEvent'))) {
      try {
        await deleteEventMutation(eventId);
        refetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };
  
  const handleEditEvent = (event) => {
    alert("Edit functionality not yet implemented in this view.");
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event.resource);
    setOpenEventModal(true);
  };

  const handleCloseModal = () => {
    setOpenEventModal(false);
    setSelectedEvent(null);
  };

  const calendarEvents = (eventsData || []).map(event => ({
    id: event._id,
    title: t(event.eventType),
    start: new Date(event.date),
    end: new Date(new Date(event.date).setHours(new Date(event.date).getHours() + 1)),
    type: event.eventType,
    allDay: true,
    resource: event
  }));

  const isLoading = nurseryBatchLoading || eventsLoading || inventoryLoading;
  const hasError = nurseryBatchError || eventsError || inventoryError;

  if (isLoading) return <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Container>;
  if (hasError) return <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}><Alert severity="error">{t('error_loading_data')}: {hasError.message}</Alert></Container>;
  if (!nurseryBatch) return <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}><Alert severity="warning">{t('nursery_batch_not_found')}</Alert></Container>;

  const tabs = [
    { label: 'water_quality', icon: <WaterIcon />, eventType: 'WaterQualityTesting' },
    { label: 'growth_sampling', icon: <GrowthIcon />, eventType: 'GrowthSampling' },
    { label: 'feeding', icon: <FeedIcon />, eventType: 'Feeding' },
    { label: 'inspection', icon: <CameraIcon />, eventType: 'Inspection' },
  ];

  const currentTab = tabs[activeTab];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button variant="outlined" onClick={() => navigate('/nursery-management')}>{t('back_to_nursery_batches')}</Button>
        <Button variant="contained" startIcon={<CalendarIcon />} onClick={() => setViewMode(viewMode === 'data' ? 'calendar' : 'data')}>
          {viewMode === 'data' ? t('calendar_view') : t('data_view')}
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={typeof nurseryBatch.batchName === 'object' ? nurseryBatch.batchName.en : nurseryBatch.batchName}
              subheader={`${t('started')}: ${nurseryBatch.startDate ? format(new Date(nurseryBatch.startDate), 'PPP') : 'N/A'}`}
              action={<Chip label={nurseryBatch.status} color={nurseryBatch.status === 'Active' ? 'success' : 'default'} />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}><Typography variant="subtitle2" color="textSecondary">{t('species')}</Typography><Typography variant="body1">{nurseryBatch.species}</Typography></Grid>
                <Grid item xs={12} sm={6} md={3}><Typography variant="subtitle2" color="textSecondary">{t('initialCount')}</Typography><Typography variant="body1">{nurseryBatch.initialCount}</Typography></Grid>
                <Grid item xs={12} sm={6} md={3}><Typography variant="subtitle2" color="textSecondary">{t('size')}</Typography><Typography variant="body1">{nurseryBatch.size}</Typography></Grid>
                <Grid item xs={12} sm={6} md={3}><Typography variant="subtitle2" color="textSecondary">{t('capacity')}</Typography><Typography variant="body1">{nurseryBatch.capacity}</Typography></Grid>
                <Grid item xs={12} sm={6} md={3}><Typography variant="subtitle2" color="textSecondary">{t('source')}</Typography><Typography variant="body1">{nurseryBatch.source}</Typography></Grid>
                <Grid item xs={12} sm={6} md={3}><Typography variant="subtitle2" color="textSecondary">{t('season')}</Typography><Typography variant="body1">{nurseryBatch.seasonId ? (typeof nurseryBatch.seasonId.name === 'object' ? nurseryBatch.seasonId.name.en : nurseryBatch.seasonId.name) : 'N/A'}</Typography></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {viewMode === 'data' ? (
            <Card>
              <CardContent>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="nursery batch tabs" variant="scrollable" scrollButtons="auto">
                  {tabs.map(tab => <Tab key={tab.label} icon={tab.icon} label={t(tab.label)} />)}
                </Tabs>
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={5}>
                      <DataForm 
                        eventType={currentTab.eventType} 
                        nurseryBatch={nurseryBatch} 
                        refetchEvents={refetchEvents} 
                        inventoryItems={inventoryItems || []}
                      />
                    </Grid>
                    <Grid item xs={12} md={7}>
                      <DataHistory 
                        eventType={currentTab.eventType} 
                        events={eventsData || []} 
                        handleDeleteEvent={handleDeleteEvent}
                        handleEditEvent={handleEditEvent}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader title={t('events_calendar')} />
              <CardContent>
                <CustomCalendar
                  events={calendarEvents}
                  onEventSelect={handleEventSelect}
                  date={calendarDate}
                  view={calendarView}
                  onViewChange={(view) => setCalendarView(view)}
                  onDateChange={(date) => setCalendarDate(date)}
                />
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <Dialog open={openEventModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedEvent ? t(selectedEvent.eventType) : ''}</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}><strong>{t('date')}:</strong> {format(new Date(selectedEvent.date), 'PPP')}</Typography>
              {Object.entries(selectedEvent.details).map(([key, value]) => (
                <Typography key={key} variant="body1" sx={{ mb: 1 }}><strong>{t(key)}:</strong> {value}</Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>{t('close')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NurseryBatchDetailPage;