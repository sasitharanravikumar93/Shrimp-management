import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';

const PondCard = ({ pond, onClick, selected }) => {
  const { t } = useTranslation();
  
  return (
    <Card 
      onClick={onClick} 
      sx={{ 
        cursor: 'pointer', 
        border: selected ? '2px solid #2196f3' : '2px solid transparent',
        boxShadow: selected ? '0 0 10px #2196f3' : ''
      }}
    >
      <CardContent>
        <Typography variant="h6">{pond.name}</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          <Chip label={`${t('size')}: ${pond.size} m²`} size="small" />
          <Chip label={`${t('capacity')}: ${pond.capacity}`} size="small" />
        </Box>
      </CardContent>
    </Card>
  );
};

export default PondCard;