import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Chip
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const DataTrend = ({ 
  title, 
  data, 
  dataKey, 
  color = '#007BFF',
  unit = '',
  trend = 'neutral'
}) => {
  // Calculate trend based on first and last data points
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
      case 'up': return <TrendingUpIcon sx={{ color: 'success.main' }} />;
      case 'down': return <TrendingDownIcon sx={{ color: 'error.main' }} />;
      default: return <TrendingFlatIcon sx={{ color: 'warning.main' }} />;
    }
  };

  const getTrendColor = () => {
    switch (currentTrend) {
      case 'up': return 'success';
      case 'down': return 'error';
      default: return 'warning';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h3">
              {title}
            </Typography>
            <Chip 
              icon={getTrendIcon()} 
              label={
                currentTrend === 'up' ? 'Increasing' : 
                currentTrend === 'down' ? 'Decreasing' : 'Stable'
              } 
              color={getTrendColor()} 
              size="small"
            />
          </Box>
          
          <Box sx={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis unit={unit} />
                <Tooltip 
                  formatter={(value) => [`${value} ${unit}`, title]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey={dataKey} 
                  stroke={color} 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Current: {data.length > 0 ? `${data[data.length - 1][dataKey]} ${unit}` : 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average: {data.length > 0 ? 
                `${(data.reduce((sum, item) => sum + item[dataKey], 0) / data.length).toFixed(2)} ${unit}` : 
                'N/A'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DataTrend;