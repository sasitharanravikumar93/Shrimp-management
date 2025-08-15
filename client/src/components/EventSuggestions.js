import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import { 
  Lightbulb as LightbulbIcon,
  WaterDrop as WaterIcon,
  Restaurant as FeedIcon,
  Science as GrowthIcon,
  Build as MaintenanceIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const EventSuggestions = ({ 
  pondStatus,
  waterQuality,
  growthRate,
  lastFeeding,
  onSuggestionClick
}) => {
  // Generate suggestions based on pond conditions
  const getSuggestions = () => {
    const suggestions = [];
    
    // Water quality based suggestions
    if (waterQuality) {
      if (waterQuality.do < 5) {
        suggestions.push({
          id: 1,
          title: 'Low Dissolved Oxygen',
          description: 'Schedule aeration to increase oxygen levels',
          type: 'Water Quality',
          priority: 'high',
          icon: <WaterIcon />
        });
      }
      
      if (waterQuality.pH < 6.5 || waterQuality.pH > 8.5) {
        suggestions.push({
          id: 2,
          title: 'pH Imbalance',
          description: 'Adjust pH levels with lime or other buffers',
          type: 'Water Quality',
          priority: 'medium',
          icon: <WaterIcon />
        });
      }
      
      if (waterQuality.temp > 32) {
        suggestions.push({
          id: 3,
          title: 'High Temperature',
          description: 'Increase aeration or add shade to pond',
          type: 'Water Quality',
          priority: 'medium',
          icon: <WaterIcon />
        });
      }
    }
    
    // Growth rate based suggestions
    if (growthRate) {
      if (growthRate < 4) {
        suggestions.push({
          id: 4,
          title: 'Slow Growth Rate',
          description: 'Increase feeding frequency or check for diseases',
          type: 'Growth',
          priority: 'medium',
          icon: <GrowthIcon />
        });
      } else if (growthRate > 6) {
        suggestions.push({
          id: 5,
          title: 'Fast Growth Rate',
          description: 'Monitor feed conversion ratio to optimize costs',
          type: 'Growth',
          priority: 'low',
          icon: <GrowthIcon />
        });
      }
    }
    
    // General maintenance suggestions
    suggestions.push({
      id: 6,
      title: 'Routine Check',
      description: 'Perform routine pond inspection',
      type: 'Maintenance',
      priority: 'low',
      icon: <MaintenanceIcon />
    });
    
    return suggestions;
  };

  const suggestions = getSuggestions();

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LightbulbIcon sx={{ color: 'warning.main', mr: 1 }} />
            <Typography variant="h6" component="h3">
              Event Suggestions
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Based on current pond conditions:
          </Typography>
          
          <List>
            {suggestions.map((suggestion) => (
              <React.Fragment key={suggestion.id}>
                <ListItem 
                  sx={{ 
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: suggestion.priority === 'high' ? 'rgba(220, 53, 69, 0.1)' : 
                              suggestion.priority === 'medium' ? 'rgba(255, 193, 7, 0.1)' : 
                              'rgba(40, 167, 69, 0.1)'
                  }}
                >
                  <ListItemIcon>
                    {suggestion.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={suggestion.title}
                    secondary={suggestion.description}
                  />
                  <Chip 
                    label={suggestion.type}
                    size="small"
                    color={
                      suggestion.type === 'Water Quality' ? 'primary' :
                      suggestion.type === 'Growth' ? 'success' :
                      suggestion.type === 'Maintenance' ? 'warning' :
                      'default'
                    }
                  />
                </ListItem>
                {suggestion.id < suggestions.length && <Divider />}
              </React.Fragment>
            ))}
          </List>
          
          <Button 
            variant="outlined" 
            size="small" 
            sx={{ mt: 1 }}
            onClick={() => {
              if (onSuggestionClick) {
                onSuggestionClick(suggestions[0]); // Suggest the first (highest priority) suggestion
              }
            }}
          >
            Schedule Suggested Event
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EventSuggestions;