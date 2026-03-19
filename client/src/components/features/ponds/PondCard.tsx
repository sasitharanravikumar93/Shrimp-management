import { Card, CardContent, Typography, Box, Chip, SxProps, Theme } from '@mui/material';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStableMemo, useStableCallback } from '../../../utils/performanceOptimization';

export interface Pond {
  id?: string;
  _id?: string;
  name: string;
  size?: number;
  capacity?: number;
  status?: string;
  health?: string;
  progress?: number;
  healthScore?: number;
  seasonId?: string | { _id: string; name: string };
}

export interface PondCardProps {
  pond: Pond;
  onClick?: (pond: Pond) => void;
  selected?: boolean;
}

const PondCard = memo<PondCardProps>(({ pond, onClick, selected = false }) => {
  const { t } = useTranslation();

  const cardStyles: SxProps<Theme> = useStableMemo(
    () => ({
      cursor: 'pointer',
      border: selected ? '2px solid #2196f3' : '2px solid transparent',
      boxShadow: selected ? '0 0 10px #2196f3' : '',
      height: '100%'
    }),
    [selected]
  );

  const chipData = useStableMemo(
    () => [
      { label: `${t('size')}: ${pond.size || 0} m²`, key: 'size' },
      { label: `${t('capacity')}: ${pond.capacity || 0}`, key: 'capacity' }
    ],
    [pond.size, pond.capacity, t]
  );

  const handleClick = useStableCallback(() => {
    if (onClick) onClick(pond);
  });

  return (
    <Card onClick={handleClick} sx={cardStyles}>
      <CardContent>
        <Typography variant="h6">{pond.name}</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
          {chipData.map(({ label, key }) => (
            <Chip key={key} label={label} size="small" />
          ))}
          {pond.status && (
            <Chip 
              label={t(pond.status.toLowerCase())} 
              size="small" 
              color={pond.status === 'Active' ? 'success' : 'default'}
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

PondCard.displayName = 'PondCard';

export default PondCard;
