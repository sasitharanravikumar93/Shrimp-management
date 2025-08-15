import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Avatar,
  CardActions,
  Button
} from '@mui/material';
import { 
  Waves as PondIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import HealthScore from './HealthScore';

const PondCard = ({ 
  pond, 
  onClick, 
  onManageClick, 
  onTimelineClick 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: 6
          }
        }}
        onClick={onClick}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" component="div">
                {pond.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip 
                  label={pond.status} 
                  size="small" 
                  color={pond.status === 'Active' ? 'success' : 'default'} 
                />
                <Chip 
                  label={pond.health} 
                  size="small" 
                  color={
                    pond.health === 'Good' ? 'success' : 
                    pond.health === 'Fair' ? 'warning' : 
                    pond.health === 'Poor' ? 'error' : 'default'
                  }
                  icon={
                    pond.health === 'Good' ? <CheckIcon /> : 
                    pond.health === 'Poor' ? <WarningIcon /> : undefined
                  }
                />
              </Box>
            </Box>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PondIcon />
            </Avatar>
          </Box>
          
          <Box sx={{ my: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Health Score:
              </Typography>
              <HealthScore score={pond.healthScore} size={40} showLabel={false} />
            </Box>
            
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Progress:
                </Typography>
                <Typography variant="body2">
                  {pond.progress}%
                </Typography>
              </Box>
              <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1 }}>
                <Box 
                  sx={{ 
                    width: `${pond.progress}%`, 
                    height: 8, 
                    bgcolor: pond.progress > 70 ? 'success.main' : pond.progress > 40 ? 'warning.main' : 'error.main',
                    borderRadius: 1
                  }} 
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Last Event:
              </Typography>
              <Typography variant="body2">
                2 hours ago
              </Typography>
            </Box>
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between' }}>
          <Button 
            size="small" 
            onClick={(e) => { 
              e.stopPropagation(); 
              onManageClick(); 
            }}
          >
            Manage
          </Button>
          <Button 
            size="small"
            onClick={(e) => { 
              e.stopPropagation(); 
              onTimelineClick(); 
            }}
          >
            Timeline
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
};

export default PondCard;