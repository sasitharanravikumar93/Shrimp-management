import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Button,
  Grid,
  Divider
} from '@mui/material';
import { 
  Restaurant as FeedIcon,
  WaterDrop as WaterIcon,
  Science as GrowthIcon,
  Build as MaintenanceIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const QuickActions = ({ onActionClick }) => {
  const actions = [
    {
      id: 1,
      title: 'Schedule Feeding',
      description: 'Add a new feeding event',
      icon: <FeedIcon />,
      color: 'primary'
    },
    {
      id: 2,
      title: 'Water Quality Check',
      description: 'Log water parameters',
      icon: <WaterIcon />,
      color: 'info'
    },
    {
      id: 3,
      title: 'Growth Sampling',
      description: 'Record shrimp growth data',
      icon: <GrowthIcon />,
      color: 'success'
    },
    {
      id: 4,
      title: 'Maintenance Task',
      description: 'Schedule equipment maintenance',
      icon: <MaintenanceIcon />,
      color: 'warning'
    },
    {
      id: 5,
      title: 'View Calendar',
      description: 'Check upcoming events',
      icon: <CalendarIcon />,
      color: 'secondary'
    },
    {
      id: 6,
      title: 'Send Notification',
      description: 'Alert team about issues',
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
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Quick Actions
          </Typography>
          
          <Grid container spacing={2}>
            {actions.map((action) => (
              <Grid item xs={12} sm={6} md={4} key={action.id}>
                <motion.div
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card 
                    variant="outlined" 
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
                        <Typography variant="h6" component="h4" sx={{ fontSize: '1rem' }}>
                          {action.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
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