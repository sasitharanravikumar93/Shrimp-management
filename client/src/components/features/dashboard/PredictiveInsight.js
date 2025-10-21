import { CalendarToday as CalendarIcon, Info as InfoIcon } from '@mui/icons-material';
import { Card, CardContent, Typography, Box, Avatar, LinearProgress } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

const PredictiveInsight = ({
  title,
  insight,
  confidence = 0,
  projectedDate = null,
  icon = <InfoIcon />,
  color = 'primary'
}) => {
  const CONFIDENCE_LEVEL = {
    HIGH: 80,
    MEDIUM: 60
  };

  // Get color based on confidence level
  const getConfidenceColor = () => {
    if (confidence >= CONFIDENCE_LEVEL.HIGH) return 'success';
    if (confidence >= CONFIDENCE_LEVEL.MEDIUM) return 'warning';
    return 'error';
  };

  return (
    <Card variant='outlined' sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              mr: 1,
              width: 32,
              height: 32
            }}
          >
            {icon}
          </Avatar>
          <Typography variant='h6' component='h3' sx={{ fontSize: '1rem' }}>
            {title}
          </Typography>
        </Box>
        <Typography variant='body2' sx={{ mb: 2 }}>
          {insight}
        </Typography>
        {confidence > 0 && (
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant='body2' color='text.secondary'>
                Confidence Level
              </Typography>
              <Typography variant='body2' color={`${getConfidenceColor()}.main`}>
                {confidence}%
              </Typography>
            </Box>
            <LinearProgress
              variant='determinate'
              value={confidence}
              color={getConfidenceColor()}
              sx={{ borderRadius: 2, height: 6 }}
            />
          </Box>
        )}
        {projectedDate && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <CalendarIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant='body2' color='text.secondary'>
              Projected: {projectedDate}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

PredictiveInsight.propTypes = {
  title: PropTypes.string.isRequired,
  insight: PropTypes.string.isRequired,
  confidence: PropTypes.number,
  projectedDate: PropTypes.string,
  icon: PropTypes.element,
  color: PropTypes.string
};

export default PredictiveInsight;
