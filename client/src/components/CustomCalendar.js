import React from 'react';
import { Card, CardContent, CardHeader, Box } from '@mui/material';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarOverrides.css';

// Set up calendar localizer
const localizer = momentLocalizer(moment);

const CustomCalendar = ({ 
  events = [], 
  onEventSelect, 
  onDateChange, 
  onRangeChange,
  date,
  onViewChange,
  view = Views.WEEK,
  toolbar = true
}) => {
  // Event styles for calendar
  const eventStyleGetter = (event) => {
    let backgroundColor = '#007BFF';
    let className = 'rbc-event-routine';
    
    if (event.type === 'Routine') {
      backgroundColor = '#007BFF';
      className = 'rbc-event-routine';
    }
    if (event.type === 'Monitoring') {
      backgroundColor = '#28A745';
      className = 'rbc-event-monitoring';
    }
    if (event.type === 'Maintenance') {
      backgroundColor = '#FD7E14';
      className = 'rbc-event-maintenance';
    }
    if (event.type === 'Feeding') {
      backgroundColor = '#007BFF';
      className = 'rbc-event-feeding';
    }
    if (event.type === 'Water Quality') {
      backgroundColor = '#28A745';
      className = 'rbc-event-water-quality';
    }
    if (event.type === 'Growth Sampling') {
      backgroundColor = '#6f42c1';
      className = 'rbc-event-growth-sampling';
    }
    
    const style = {
      backgroundColor,
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    
    return {
      style,
      className
    };
  };

  return (
    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader title="Events Calendar" />
      <CardContent sx={{ flexGrow: 1, p: { xs: 1, sm: 2 }, height: '100%' }}>
        <Box sx={{ 
          height: '100%', 
          minHeight: { xs: 400, sm: 500, md: 600 },
          '& .rbc-calendar': {
            height: '100%'
          }
        }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={onEventSelect}
            onNavigate={onDateChange}
            onView={onViewChange}
            onRangeChange={onRangeChange}
            eventPropGetter={eventStyleGetter}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            defaultView={view}
            date={date}
            toolbar={toolbar}
            formats={{
              dateFormat: 'd',
              dayFormat: 'ddd D/M',
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }) => 
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default CustomCalendar;