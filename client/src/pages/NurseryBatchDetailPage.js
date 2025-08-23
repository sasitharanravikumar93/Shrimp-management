import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  CalendarToday as CalendarIcon,
  WaterDrop as WaterIcon,
  Science as GrowthIcon,
  Restaurant as FeedIcon,
  Camera as CameraIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import CustomCalendar from '../components/CustomCalendar';
import { useApiData, useApiMutation } from '../hooks/useApi';
import { 
  getNurseryBatchById,
  getEventsForNurseryBatch,
  createEvent,
  updateEvent,
  deleteEvent,
  getInventoryItems
} from '../services/api';

const NurseryBatchDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('week');
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    eventType: '',
    date: new Date(),
    details: {}
  });

  // Fetch nursery batch details
  const { 
    data: nurseryBatch, 
    loading: nurseryBatchLoading, 
    error: nurseryBatchError,
    refetch: refetchNurseryBatch
  } = useApiData(() => getNurseryBatchById(id), [id]);

  // Fetch events for this nursery batch
  const { 
    data: eventsData, 
    loading: eventsLoading, 
    error: eventsError,
    refetch: refetchEvents
  } = useApiData(() => getEventsForNurseryBatch(id), [id]);

  // Fetch inventory items for event forms
  const { 
    data: inventoryItems, 
    loading: inventoryLoading, 
    error: inventoryError
  } = useApiData(getInventoryItems, []);

  // Mutations
  const { mutate: createEventMutation, loading: createEventLoading } = useApiMutation(createEvent);
  const { mutate: updateEventMutation, loading: updateEventLoading } = useApiMutation(updateEvent);
  const { mutate: deleteEventMutation, loading: deleteEventLoading } = useApiMutation(deleteEvent);

  // Format events for calendar
  const calendarEvents = eventsData ? eventsData.map(event => ({
    id: event._id,
    title: t(event.eventType),
    start: new Date(event.date),
    end: new Date(new Date(event.date).setHours(new Date(event.date).getHours() + 1)),
    type: event.eventType,
    allDay: true,
    resource: event
  })) : [];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenEventDialog = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setEventFormData({
        eventType: event.eventType,
        date: new Date(event.date),
        details: event.details || {}
      });
    } else {
      setEditingEvent(null);
      setEventFormData({
        eventType: '',
        date: new Date(),
        details: {}
      });
    }
    setOpenEventDialog(true);
  };

  const handleCloseEventDialog = () => {
    setOpenEventDialog(false);
    setEditingEvent(null);
  };

  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setEventFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setEventFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [name]: value
      }
    }));
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const eventData = {
        eventType: eventFormData.eventType,
        date: eventFormData.date,
        nurseryBatchId: id,
        seasonId: nurseryBatch?.seasonId?._id || nurseryBatch?.seasonId || '',
        details: eventFormData.details
      };

      if (editingEvent) {
        // Update existing event
        await updateEventMutation(editingEvent._id, eventData);
      } else {
        // Create new event
        await createEventMutation(eventData);
      }
      
      handleCloseEventDialog();
      refetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
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

  const handleCalendarEventSelect = (event) => {
    handleOpenEventDialog(event.resource);
  };

  // Loading and error states
  const isLoading = nurseryBatchLoading || eventsLoading;
  const hasError = nurseryBatchError || eventsError;

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
          {t('error_loading_data')}: {nurseryBatchError || eventsError}
        </Alert>
      </Container>
    );
  }

  if (!nurseryBatch) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          {t('nursery_batch_not_found')}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button 
        variant="outlined" 
        onClick={() => navigate('/nursery-management')}
        sx={{ mb: 2 }}
      >
        {t('back_to_nursery_batches')}
      </Button>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={typeof nurseryBatch.batchName === 'object' 
                ? nurseryBatch.batchName.en 
                : nurseryBatch.batchName}
              subheader={`${t('started')}: ${nurseryBatch.startDate ? format(new Date(nurseryBatch.startDate), 'PPP') : 'N/A'}`}
              action={
                <Chip 
                  label={nurseryBatch.status} 
                  color={
                    nurseryBatch.status === 'Active' ? 'success' : 
                    nurseryBatch.status === 'Completed' ? 'default' : 
                    nurseryBatch.status === 'Inactive' ? 'warning' : 
                    'primary'
                  }
                />
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="textSecondary">{t('species')}</Typography>
                  <Typography variant="body1">{nurseryBatch.species}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="textSecondary">{t('initialCount')}</Typography>
                  <Typography variant="body1">{nurseryBatch.initialCount}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="textSecondary">{t('size')}</Typography>
                  <Typography variant="body1">{nurseryBatch.size}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="textSecondary">{t('capacity')}</Typography>
                  <Typography variant="body1">{nurseryBatch.capacity}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="textSecondary">{t('source')}</Typography>
                  <Typography variant="body1">{nurseryBatch.source}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="textSecondary">{t('season')}</Typography>
                  <Typography variant="body1">
                    {nurseryBatch.seasonId ? 
                      (typeof nurseryBatch.seasonId === 'object' ? 
                        (typeof nurseryBatch.seasonId.name === 'object' ? 
                          nurseryBatch.seasonId.name.en : 
                          nurseryBatch.seasonId.name) : 
                        nurseryBatch.seasonId) : 
                      'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                aria-label="nursery batch tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab icon={<CalendarIcon />} label={t('calendar')} />
                <Tab icon={<WaterIcon />} label={t('water_quality')} />
                <Tab icon={<GrowthIcon />} label={t('growth_sampling')} />
                <Tab icon={<FeedIcon />} label={t('feeding')} />
                <Tab icon={<CameraIcon />} label={t('inspection')} />
              </Tabs>
              
              {activeTab === 0 && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button 
                      variant="contained" 
                      startIcon={<AddIcon />} 
                      onClick={() => handleOpenEventDialog()}
                    >
                      {t('add_event')}
                    </Button>
                  </Box>
                  <CustomCalendar
                    events={calendarEvents}
                    onEventSelect={handleCalendarEventSelect}
                    date={selectedDate}
                    view={calendarView}
                    onViewChange={(view) => setCalendarView(view)}
                    onDateChange={(date) => setSelectedDate(date)}
                  />
                </Box>
              )}
              
              {activeTab === 1 && (
                <Box sx={{ mt: 2 }}>
                  <Typography>{t('water_quality_tab_content')}</Typography>
                  {/* Water quality content will be implemented here */}
                </Box>
              )}
              
              {activeTab === 2 && (
                <Box sx={{ mt: 2 }}>
                  <Typography>{t('growth_sampling_tab_content')}</Typography>
                  {/* Growth sampling content will be implemented here */}
                </Box>
              )}
              
              {activeTab === 3 && (
                <Box sx={{ mt: 2 }}>
                  <Typography>{t('feeding_tab_content')}</Typography>
                  {/* Feeding content will be implemented here */}
                </Box>
              )}
              
              {activeTab === 4 && (
                <Box sx={{ mt: 2 }}>
                  <Typography>{t('inspection_tab_content')}</Typography>
                  {/* Inspection content will be implemented here */}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Event Dialog */}
      <Dialog open={openEventDialog} onClose={handleCloseEventDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEvent ? t('edit_event') : t('add_event')}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth variant="outlined" margin="dense" sx={{ mt: 2 }}>
            <InputLabel id="event-type-label">{t('eventType')}</InputLabel>
            <Select
              labelId="event-type-label"
              name="eventType"
              value={eventFormData.eventType}
              onChange={handleEventInputChange}
              label={t('eventType')}
            >
              <MenuItem value="NurseryPreparation">{t('nursery_preparation')}</MenuItem>
              <MenuItem value="WaterQualityTesting">{t('water_quality_testing')}</MenuItem>
              <MenuItem value="GrowthSampling">{t('growth_sampling')}</MenuItem>
              <MenuItem value="Feeding">{t('feeding')}</MenuItem>
              <MenuItem value="Inspection">{t('inspection')}</MenuItem>
            </Select>
          </FormControl>
          
          {eventFormData.eventType === 'NurseryPreparation' && (
            <>
              <TextField
                margin="dense"
                name="preparationMethod"
                label={t('preparationMethod')}
                type="text"
                fullWidth
                variant="outlined"
                value={eventFormData.details.preparationMethod || ''}
                onChange={handleDetailsChange}
              />
              <TextField
                margin="dense"
                name="preparationDate"
                label={t('preparationDate')}
                type="date"
                fullWidth
                variant="outlined"
                value={eventFormData.details.preparationDate || ''}
                onChange={handleDetailsChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </>
          )}
          
          {eventFormData.eventType === 'WaterQualityTesting' && (
            <>
              <TextField
                margin="dense"
                name="testTime"
                label={t('testTime')}
                type="time"
                fullWidth
                variant="outlined"
                value={eventFormData.details.testTime || ''}
                onChange={handleDetailsChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
              />
              <TextField
                margin="dense"
                name="pH"
                label={t('pH')}
                type="number"
                fullWidth
                variant="outlined"
                value={eventFormData.details.pH || ''}
                onChange={handleDetailsChange}
              />
              <TextField
                margin="dense"
                name="dissolvedOxygen"
                label={t('dissolvedOxygen')}
                type="number"
                fullWidth
                variant="outlined"
                value={eventFormData.details.dissolvedOxygen || ''}
                onChange={handleDetailsChange}
              />
              <TextField
                margin="dense"
                name="temperature"
                label={t('temperature')}
                type="number"
                fullWidth
                variant="outlined"
                value={eventFormData.details.temperature || ''}
                onChange={handleDetailsChange}
              />
              <TextField
                margin="dense"
                name="salinity"
                label={t('salinity')}
                type="number"
                fullWidth
                variant="outlined"
                value={eventFormData.details.salinity || ''}
                onChange={handleDetailsChange}
              />
            </>
          )}
          
          {eventFormData.eventType === 'GrowthSampling' && (
            <>
              <TextField
                margin="dense"
                name="samplingTime"
                label={t('samplingTime')}
                type="time"
                fullWidth
                variant="outlined"
                value={eventFormData.details.samplingTime || ''}
                onChange={handleDetailsChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                margin="dense"
                name="totalWeight"
                label={t('totalWeight')}
                type="number"
                fullWidth
                variant="outlined"
                value={eventFormData.details.totalWeight || ''}
                onChange={handleDetailsChange}
              />
              <TextField
                margin="dense"
                name="totalCount"
                label={t('totalCount')}
                type="number"
                fullWidth
                variant="outlined"
                value={eventFormData.details.totalCount || ''}
                onChange={handleDetailsChange}
              />
            </>
          )}
          
          {eventFormData.eventType === 'Feeding' && (
            <>
              <TextField
                margin="dense"
                name="feedTime"
                label={t('feedTime')}
                type="time"
                fullWidth
                variant="outlined"
                value={eventFormData.details.feedTime || ''}
                onChange={handleDetailsChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <FormControl fullWidth variant="outlined" margin="dense">
                <InputLabel id="feed-item-label">{t('feedItem')}</InputLabel>
                <Select
                  labelId="feed-item-label"
                  name="inventoryItemId"
                  value={eventFormData.details.inventoryItemId || ''}
                  onChange={handleDetailsChange}
                  label={t('feedItem')}
                >
                  {inventoryItems && inventoryItems
                    .filter(item => item.itemType === 'Feed')
                    .map(item => (
                      <MenuItem key={item._id} value={item._id}>
                        {typeof item.itemName === 'object' ? item.itemName.en : item.itemName}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                name="quantity"
                label={t('quantity')}
                type="number"
                fullWidth
                variant="outlined"
                value={eventFormData.details.quantity || ''}
                onChange={handleDetailsChange}
              />
            </>
          )}
          
          {eventFormData.eventType === 'Inspection' && (
            <>
              <TextField
                margin="dense"
                name="notes"
                label={t('notes')}
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                value={eventFormData.details.notes || ''}
                onChange={handleDetailsChange}
              />
              {/* Media upload will be implemented here */}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEventDialog}>{t('cancel')}</Button>
          <Button 
            onClick={handleEventSubmit} 
            variant="contained"
            disabled={createEventLoading || updateEventLoading}
          >
            {createEventLoading || updateEventLoading ? t('saving') : 
             editingEvent ? t('update_event') : t('add_event')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NurseryBatchDetailPage;