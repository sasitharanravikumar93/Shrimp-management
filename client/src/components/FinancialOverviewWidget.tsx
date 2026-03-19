import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

import { useSeason } from '../context/SeasonContext';
import { getFinancialSummary } from '../services/api';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#7C3AED', '#6D28D9', '#EC4899', '#EF4444'];

export interface FinancialOverviewWidgetProps {
  pondId?: string;
}

const FinancialOverviewWidget: React.FC<FinancialOverviewWidgetProps> = ({ pondId }) => {
  const { selectedSeason } = useSeason();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        setLoading(true);
        setError(null);
        const seasonId = (selectedSeason as any)?._id || (selectedSeason as any)?.id;
        const response = await getFinancialSummary(seasonId, pondId);
        setData(response);
      } catch (err) {
        console.error('Error fetching financial summary:', err);
        setError('Failed to load financial data');
      } finally {
        setLoading(false);
      }
    };

    fetchFinance();
  }, [selectedSeason, pondId]);

  if (loading) {
    return (
      <Card elevation={3} sx={{ height: '100%' }}>
        <CardHeader title='Financial Overview' avatar={<WalletIcon color='primary' />} />
        <CardContent
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}
        >
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card elevation={3} sx={{ height: '100%' }}>
        <CardHeader title='Financial Overview' avatar={<WalletIcon color='primary' />} />
        <CardContent>
          <Alert severity='error'>{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const chartData = Object.entries(data.breakdown || {})
    .filter(([_, value]) => (value as number) > 0)
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value as number
    }));

  return (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardHeader
        title='Financial Overview (Cost of Production)'
        avatar={<WalletIcon color='primary' />}
      />
      <CardContent>
        <Typography variant='h4' color='primary' gutterBottom>
          $
          {data.totalOperationalCost?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) || '0.00'}
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          Total Operational Cost for {pondId ? 'this Pond' : 'all Ponds'}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {chartData.length > 0 ? (
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx='50%'
                      cy='50%'
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey='value'
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {chartData.map((item, index) => (
                  <Box
                    key={index}
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: COLORS[index % COLORS.length]
                        }}
                      />
                      <Typography variant='body2'>{item.name}</Typography>
                    </Box>
                    <Typography variant='body2' fontWeight='bold'>
                      ${item.value.toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Typography variant='body2' color='text.secondary' align='center' sx={{ py: 4 }}>
            No cost data recorded yet.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialOverviewWidget;
