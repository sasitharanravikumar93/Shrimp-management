import React from 'react';
import { Tooltip, Typography } from '@mui/material';

const AquacultureTooltip = ({ title, term, children, ...props }) => {
  // Dictionary of aquaculture terms and their definitions
  const termDefinitions = {
    'Feed Conversion Ratio (FCR)': 'The ratio of feed given to the weight gain of fish/shrimp. Lower FCR indicates more efficient feeding.',
    'Dissolved Oxygen (DO)': 'The amount of oxygen dissolved in water, crucial for aquatic life. Optimal levels for shrimp are 5-7 mg/L.',
    'pH Level': 'A measure of water acidity or alkalinity. For shrimp farming, optimal pH is between 6.5-8.5.',
    'Salinity': 'The salt concentration in water, measured in parts per thousand (ppt). Shrimp require 15-35 ppt for optimal growth.',
    'Biomass': 'The total weight of organisms in a given area or volume. Used to calculate feeding requirements.',
    'Feed Efficiency': 'How effectively feed is converted into growth. Higher efficiency means less waste and lower costs.',
    'Growth Rate': 'The speed at which shrimp increase in size, typically measured in grams per day.',
    'Water Temperature': 'The temperature of the water, which affects metabolic rates and growth. Optimal for shrimp is 28-32°C.',
    'Ammonia': 'A toxic compound that can build up in aquaculture systems. Levels should be kept below 0.02 mg/L.',
    'Nitrite': 'A toxic compound produced during the nitrogen cycle. Levels should be kept below 0.2 mg/L.',
    'Alkalinity': 'The water\'s ability to neutralize acids, important for pH stability. Optimal range is 80-150 mg/L.',
    'Turbidity': 'The clarity of water, affected by suspended particles. High turbidity can reduce oxygen levels.',
    'Harvest Size': 'The target weight at which shrimp are ready for market, typically 25-30 grams for most species.'
  };

  const definition = termDefinitions[term] || termDefinitions[title] || 'No definition available';

  return (
    <Tooltip 
      title={
        <React.Fragment>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {term || title}
          </Typography>
          <Typography variant="body2">
            {definition}
          </Typography>
        </React.Fragment>
      }
      arrow
      {...props}
    >
      <span>{children}</span>
    </Tooltip>
  );
};

export default AquacultureTooltip;