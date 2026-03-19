import { Card, CardContent, Typography, Box } from '@mui/material';
import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const growthData = [
  { date: '07-20', abw: 8.5 },
  { date: '07-27', abw: 10.2 },
  { date: '08-03', abw: 12.1 },
  { date: '08-10', abw: 14.5 },
  { date: '08-17', abw: 16.8 }
];

const GrowthSamplingLog = () => {
  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant='h6'>Growth Sampling Log</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3, textAlign: 'center' }}>
          <Box>
            <Typography variant='h5'>16.8 g</Typography>
            <Typography variant='body2' color='text.secondary'>
              Latest ABW
            </Typography>
          </Box>
          <Box>
            <Typography variant='h5'>2.3 g/wk</Typography>
            <Typography variant='body2' color='text.secondary'>
              Weekly Growth Rate
            </Typography>
          </Box>
          <Box>
            <Typography variant='h5'>12%</Typography>
            <Typography variant='body2' color='text.secondary'>
              Uniformity (CV)
            </Typography>
          </Box>
          <Box>
            <Typography variant='h5'>Aug 17, 2025</Typography>
            <Typography variant='body2' color='text.secondary'>
              Last Sample Date
            </Typography>
          </Box>
        </Box>
        <Typography variant='subtitle1' gutterBottom>
          Average Body Weight (ABW) Trend
        </Typography>
        <ResponsiveContainer width='100%' height={300}>
          <ComposedChart data={growthData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey='abw' fill='#8884d8' name='Actual ABW (g)' />
            <Line
              type='monotone'
              dataKey='abw'
              stroke='#ff7300'
              name='Projected Growth'
              strokeDasharray='5 5'
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default GrowthSamplingLog;
