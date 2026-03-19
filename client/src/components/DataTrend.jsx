import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const DataTrend = ({ title, data, dataKey, color = '#2563EB', unit = '', trend = 'neutral' }) => {
  const calculateTrend = () => {
    if (!data || data.length < 2) return 'neutral';
    const first = data[0][dataKey];
    const last = data[data.length - 1][dataKey];
    if (last > first) return 'up';
    if (last < first) return 'down';
    return 'neutral';
  };

  const currentTrend = trend === 'auto' ? calculateTrend() : trend;

  const getTrendIcon = () => {
    switch (currentTrend) {
      case 'up':
        return <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />;
      case 'down':
        return <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16 }} />;
      default:
        return <TrendingFlatIcon sx={{ color: 'warning.main', fontSize: 16 }} />;
    }
  };

  const getTrendColor = () => {
    switch (currentTrend) {
      case 'up':
        return 'success';
      case 'down':
        return 'error';
      default:
        return 'warning';
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 1.5,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            border: '1px solid',
            borderColor: 'divider',
            minWidth: 120
          }}
        >
          <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          <Typography variant='body2' sx={{ fontWeight: 700, color, mt: 0.5 }}>
            {payload[0].value} {unit}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant='h6' component='h3' sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
              {title}
            </Typography>
            <Chip
              icon={getTrendIcon()}
              label={
                currentTrend === 'up'
                  ? 'Increasing'
                  : currentTrend === 'down'
                  ? 'Decreasing'
                  : 'Stable'
              }
              color={getTrendColor()}
              size='small'
              variant='outlined'
              sx={{ fontSize: '0.7rem', height: 24 }}
            />
          </Box>

          <Box sx={{ height: 200 }}>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id={`gradient-${dataKey}`} x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor={color} stopOpacity={0.15} />
                    <stop offset='95%' stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke='rgba(0,0,0,0.04)' vertical={false} />
                <XAxis
                  dataKey='date'
                  tick={{ fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(0,0,0,0.08)' }}
                  tickLine={false}
                />
                <YAxis
                  unit={unit ? ` ${unit}` : ''}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type='monotone'
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2.5}
                  fill={`url(#gradient-${dataKey})`}
                  activeDot={{ r: 6, strokeWidth: 2, fill: '#fff', stroke: color }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant='caption' color='text.secondary'>
              Current: {data.length > 0 ? `${data[data.length - 1][dataKey]} ${unit}` : 'N/A'}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Average:{' '}
              {data.length > 0
                ? `${(data.reduce((sum, item) => sum + item[dataKey], 0) / data.length).toFixed(
                    2
                  )} ${unit}`
                : 'N/A'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DataTrend;
