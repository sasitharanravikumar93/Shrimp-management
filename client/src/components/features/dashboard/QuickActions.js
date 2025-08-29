import {
  Restaurant as FeedIcon,
  WaterDrop as WaterIcon,
  Science as GrowthIcon,
  Build as MaintenanceIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';

const QuickActions = ({ onActionClick }) => {
  const { t } = useTranslation();

  const actions = [
    {
      id: 1,
      title: t('schedule_feeding'),
      description: t('add_feeding_event'),
      icon: <FeedIcon />,
      color: 'primary'
    },
    {
      id: 2,
      title: t('water_quality_check'),
      description: t('log_water_parameters'),
      icon: <WaterIcon />,
      color: 'info'
    },
    {
      id: 3,
      title: t('growth_sampling_action'),
      description: t('record_shrimp_growth'),
      icon: <GrowthIcon />,
      color: 'success'
    },
    {
      id: 4,
      title: t('maintenance_task'),
      description: t('schedule_equipment_maintenance'),
      icon: <MaintenanceIcon />,
      color: 'warning'
    },
    {
      id: 5,
      title: t('view_calendar'),
      description: t('check_upcoming_events'),
      icon: <CalendarIcon />,
      color: 'secondary'
    },
    {
      id: 6,
      title: t('send_notification'),
      description: t('alert_team'),
      icon: <NotificationIcon />,
      color: 'error'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant='outlined'>
        <CardContent>
          <Typography variant='h6' component='h3' gutterBottom>
            {t('quick_actions')}
          </Typography>

          <Grid container spacing={2}>
            {actions.map(action => (
              <Grid item xs={12} sm={6} md={4} key={action.id}>
                <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                  <Card
                    variant='outlined'
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: 3,
                        borderColor: `${action.color}.main`
                      }
                    }}
                    onClick={() => onActionClick && onActionClick(action)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: '50%',
                            bgcolor: `${action.color}.main`,
                            color: 'white',
                            mr: 1
                          }}
                        >
                          {action.icon}
                        </Box>
                        <Typography variant='h6' component='h4' sx={{ fontSize: '1rem' }}>
                          {action.title}
                        </Typography>
                      </Box>
                      <Typography variant='body2' color='text.secondary'>
                        {action.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickActions;
