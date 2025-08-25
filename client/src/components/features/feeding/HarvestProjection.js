import { CalendarToday as CalendarIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { Card, CardContent, Typography, Box, LinearProgress, Tooltip, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import PropTypes from 'prop-types';

const HarvestProjection = ({ currentWeight, targetWeight, growthRate, startDate, pondName }) => {
  // Calculate projected harvest date
  const calculateHarvestProjection = () => {
    if (!currentWeight || !targetWeight || !growthRate) return null;

    const remainingGrowth = targetWeight - currentWeight;
    const daysToHarvest = Math.ceil(remainingGrowth / growthRate);

    // Calculate projected date (simplified)
    const today = new Date();
    const projectedDate = new Date(today);
    projectedDate.setDate(today.getDate() + daysToHarvest);

    return {
      daysToHarvest,
      projectedDate: projectedDate.toLocaleDateString(),
      progress: Math.min(100, (currentWeight / targetWeight) * 100)
    };
  };

  const projection = calculateHarvestProjection();

  if (!projection) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Card variant='outlined' sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalendarIcon sx={{ color: 'primary.main', mr: 1 }} />
            <Typography variant='h6' component='h3'>
              Harvest Projection
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant='body2' color='text.secondary'>
                Progress to Harvest Size
              </Typography>
              <Typography variant='body2' fontWeight='bold'>
                {projection.progress.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant='determinate'
              value={projection.progress}
              color='success'
              sx={{ borderRadius: 2, height: 8 }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant='body2' color='text.secondary'>
                Projected Harvest Date
              </Typography>
              <Typography variant='h6' component='div'>
                {projection.projectedDate}
              </Typography>
            </Box>
            <Chip
              icon={<TrendingUpIcon />}
              label={`${projection.daysToHarvest} days`}
              color='primary'
              variant='outlined'
            />
          </Box>

          <Tooltip title={`Based on current growth rate of ${growthRate}g/day`}>
            <Typography
              variant='body2'
              sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}
            >
              {pondName ? `For ${pondName}: ` : ''}
              {currentWeight}g → {targetWeight}g at {growthRate}g/day
            </Typography>
          </Tooltip>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HarvestProjection;

// Add PropTypes validation
HarvestProjection.propTypes = {
  currentWeight: PropTypes.number,
  targetWeight: PropTypes.number,
  growthRate: PropTypes.number,
  startDate: PropTypes.instanceOf(Date),
  pondName: PropTypes.string
};
