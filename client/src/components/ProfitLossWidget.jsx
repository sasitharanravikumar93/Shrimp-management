import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { Card, CardContent, Typography, Box, CircularProgress, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';

import { useSeason } from '../context/SeasonContext';
import { getProfitAndLoss } from '../services/api';

const ProfitLossWidget = () => {
  const { selectedSeason } = useSeason();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedSeason?.id) {
      setLoading(true);
      getProfitAndLoss(selectedSeason.id)
        .then(res => setData(res))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedSeason]);

  if (!selectedSeason) return null;

  if (loading) {
    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <CircularProgress size={30} />
      </Card>
    );
  }

  if (!data) return null;

  const isProfit = data.netProfitLoss >= 0;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography color='text.secondary' gutterBottom variant='h6'>
          Season P&L Overview
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='body1' color='text.secondary'>
            Total Revenue
          </Typography>
          <Typography variant='h6' color='success.main'>
            ${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Box>

        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='body1' color='text.secondary'>
            Total Operational Cost
          </Typography>
          <Typography variant='h6' color='error.main'>
            -${data.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h6' fontWeight='bold'>
            Net Margin
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isProfit ? <TrendingUp color='success' /> : <TrendingDown color='error' />}
            <Typography
              variant='h5'
              color={isProfit ? 'success.main' : 'error.main'}
              fontWeight='bold'
            >
              $
              {Math.abs(data.netProfitLoss).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Box>
        <Typography
          align='right'
          variant='body2'
          color={isProfit ? 'success.main' : 'error.main'}
          sx={{ mt: 0.5 }}
        >
          ({data.margin.toFixed(2)}%)
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ProfitLossWidget;
