import { Info as InfoIcon } from '@mui/icons-material';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import AquacultureTooltip from '../farm/AquacultureTooltip';

const FeedCalculator = ({
  onCalculate,
  initialBiomass = 0,
  initialShrimpCount = 0,
  feedingStrategy = 'standard'
}) => {
  const [biomass, setBiomass] = useState(initialBiomass);
  const [shrimpCount, setShrimpCount] = useState(initialShrimpCount);
  const [strategy, setStrategy] = useState(feedingStrategy);
  const [calculatedFeed, setCalculatedFeed] = useState(0);

  // Standard feeding rates by strategy (percentage of biomass per day)
  const feedingRates = {
    standard: 0.03, // 3% of biomass
    growth: 0.04, // 4% of biomass for growth phase
    maintenance: 0.02, // 2% of biomass for maintenance
    highDensity: 0.05 // 5% of biomass for high density ponds
  };

  // Calculate feed quantity when inputs change
  useEffect(() => {
    if (biomass > 0) {
      const rate = feedingRates[strategy] || feedingRates.standard;
      const feedQty = biomass * rate;
      setCalculatedFeed(feedQty);
      if (onCalculate) {
        onCalculate(feedQty);
      }
    } else if (shrimpCount > 0) {
      // Estimate biomass from shrimp count (assuming average weight)
      // This is a simplified calculation - in reality, this would be more complex
      const avgWeight = 15; // grams (example)
      const estimatedBiomass = (shrimpCount * avgWeight) / 1000; // kg
      const rate = feedingRates[strategy] || feedingRates.standard;
      const feedQty = estimatedBiomass * rate;
      setCalculatedFeed(feedQty);
      if (onCalculate) {
        onCalculate(feedQty);
      }
    } else {
      setCalculatedFeed(0);
      if (onCalculate) {
        onCalculate(0);
      }
    }
  }, [biomass, shrimpCount, strategy, feedingRates, onCalculate]);

  const handleBiomassChange = e => {
    const value = parseFloat(e.target.value) || 0;
    setBiomass(value);
  };

  const handleShrimpCountChange = e => {
    const value = parseInt(e.target.value) || 0;
    setShrimpCount(value);
  };

  const handleStrategyChange = e => {
    setStrategy(e.target.value);
  };

  return (
    <Box sx={{ p: 2, border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant='h6' component='h3' sx={{ flexGrow: 1 }}>
          Feed Calculator
        </Typography>
        <AquacultureTooltip term='Feed Conversion Ratio (FCR)'>
          <IconButton size='small'>
            <InfoIcon fontSize='small' />
          </IconButton>
        </AquacultureTooltip>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <TextField
          label='Pond Biomass (kg)'
          type='number'
          value={biomass || ''}
          onChange={handleBiomassChange}
          InputProps={{
            endAdornment: <Typography variant='body2'>kg</Typography>
          }}
          sx={{ width: 150 }}
        />

        <TextField
          label='Shrimp Count'
          type='number'
          value={shrimpCount || ''}
          onChange={handleShrimpCountChange}
          sx={{ width: 150 }}
        />

        <FormControl sx={{ width: 150 }}>
          <InputLabel>Feeding Strategy</InputLabel>
          <Select value={strategy} label='Feeding Strategy' onChange={handleStrategyChange}>
            <MenuItem value='standard'>Standard (3%)</MenuItem>
            <MenuItem value='growth'>Growth Phase (4%)</MenuItem>
            <MenuItem value='maintenance'>Maintenance (2%)</MenuItem>
            <MenuItem value='highDensity'>High Density (5%)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant='body1'>Recommended Daily Feed:</Typography>
        <Chip label={`${calculatedFeed.toFixed(2)} kg`} color='primary' variant='outlined' />
        <Typography variant='body2' color='text.secondary'>
          (Based on {feedingRates[strategy] * 100}% of biomass)
        </Typography>
      </Box>
    </Box>
  );
};

export default FeedCalculator;

// Add PropTypes validation
FeedCalculator.propTypes = {
  onCalculate: PropTypes.func,
  initialBiomass: PropTypes.number,
  initialShrimpCount: PropTypes.number,
  feedingStrategy: PropTypes.oneOf(['standard', 'growth', 'maintenance', 'highDensity'])
};

// Add default props
FeedCalculator.defaultProps = {
  initialBiomass: 0,
  initialShrimpCount: 0,
  feedingStrategy: 'standard'
};
