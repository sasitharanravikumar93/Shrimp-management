import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStableMemo, useStableCallback } from '../../../utils/performanceOptimization';

const PondCard = memo(({ pond, onClick, selected = false }) => {
  const { t } = useTranslation();

  // Memoize card styles to prevent re-calculation
  const cardStyles = useStableMemo(
    () => ({
      cursor: 'pointer',
      border: selected ? '2px solid #2196f3' : '2px solid transparent',
      boxShadow: selected ? '0 0 10px #2196f3' : ''
    }),
    [selected]
  );

  // Memoize chip data to prevent re-creation
  const chipData = useStableMemo(
    () => [
      { label: `${t('size')}: ${pond.size} m²`, key: 'size' },
      { label: `${t('capacity')}: ${pond.capacity}`, key: 'capacity' }
    ],
    [pond.size, pond.capacity, t]
  );

  // Stable click handler
  const handleClick = useStableCallback(() => {
    onClick && onClick(pond);
  }, [onClick, pond]);

  return (
    <Card onClick={handleClick} sx={cardStyles}>
      <CardContent>
        <Typography variant='h6'>{pond.name}</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {chipData.map(({ label, key }) => (
            <Chip key={key} label={label} size='small' />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
});

// Add display name for better debugging
PondCard.displayName = 'PondCard';

// PropTypes for runtime type checking
PondCard.propTypes = {
  pond: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    capacity: PropTypes.number.isRequired,
    status: PropTypes.string,
    seasonId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string
      })
    ])
  }).isRequired,
  onClick: PropTypes.func,
  selected: PropTypes.bool
};

// Default props removed - using JavaScript default parameters instead

export default PondCard;
