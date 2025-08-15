import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarOverrides.css';
import { 
  CalendarToday as DayViewIcon,
  ViewWeek as WeekViewIcon,
  CalendarMonth as MonthViewIcon
} from '@mui/icons-material';

// Set up calendar localizer
const localizer = momentLocalizer(moment);

const CustomCalendar = ({ 
  events = [], 
  onEventSelect, 
  onDateChange, 
  onRangeChange,
  date,
  view = Views.WEEK,
  onViewChange,
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

  // Map MUI view names to react-big-calendar view names
  const getViewValue = (viewName) => {
    switch (viewName) {
      case 'day': return Views.DAY;
      case 'month': return Views.MONTH;
      default: return Views.WEEK;
    }
  };

  // Map react-big-calendar view names to MUI view names
  const getMuiViewName = (viewValue) => {
    switch (viewValue) {
      case Views.DAY: return 'day';
      case Views.MONTH: return 'month';
      default: return 'week';
    }
  };

  const processedEvents = useMemo(() => {
    return events.map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));
  }, [events]);

  return (
    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader 
        title="Events Calendar"
        action={
          <ToggleButtonGroup
            value={getMuiViewName(view)}
            exclusive
            onChange={(event, newView) => {
              if (newView !== null && onViewChange) {
                onViewChange(getViewValue(newView));
              }
            }}
            size="small"
            sx={{ height: 36 }}
          >
            <ToggleButton value="month" aria-label="month view">
              <MonthViewIcon />
            </ToggleButton>
            <ToggleButton value="week" aria-label="week view">
              <WeekViewIcon />
            </ToggleButton>
            <ToggleButton value="day" aria-label="day view">
              <DayViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        }
      />
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
            events={processedEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={onEventSelect}
            onNavigate={onDateChange}
            onView={onViewChange}
            onRangeChange={onRangeChange}
            eventPropGetter={eventStyleGetter}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            view={view}
            date={date}
            toolbar={false} // We're using our own toolbar
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