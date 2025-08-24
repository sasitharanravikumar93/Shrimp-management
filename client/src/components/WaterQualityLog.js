
import React from 'react';
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const waterQualityData = [
  { date: '08-10', do: 5.5, ph: 8.2 },
  { date: '08-11', do: 5.6, ph: 8.1 },
  { date: '08-12', do: 5.4, ph: 8.3 },
  { date: '08-13', do: 5.7, ph: 8.2 },
  { date: '08-14', do: 5.8, ph: 8.1 },
  { date: '08-15', do: 5.6, ph: 8.4 },
  { date: '08-16', do: 5.9, ph: 8.3 },
];

const WaterQualityLog = () => {
  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Water Quality Log</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3, textAlign: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ m: 1 }}>
            <Typography variant="body2" color="text.secondary">DO (mg/L)</Typography>
            <Chip label="5.9" color="success" />
          </Box>
          <Box sx={{ m: 1 }}>
            <Typography variant="body2" color="text.secondary">pH</Typography>
            <Chip label="8.3" color="success" />
          </Box>
          <Box sx={{ m: 1 }}>
            <Typography variant="body2" color="text.secondary">Ammonia (ppm)</Typography>
            <Chip label="0.1" color="success" />
          </Box>
          <Box sx={{ m: 1 }}>
            <Typography variant="body2" color="text.secondary">Salinity (ppt)</Typography>
            <Chip label="15" color="primary" />
          </Box>
           <Box sx={{ m: 1 }}>
            <Typography variant="body2" color="text.secondary">Latest Reading</Typography>
            <Chip label="Today, 8:00 AM" color="default" />
          </Box>
        </Box>
        <Typography variant="subtitle1" gutterBottom>Key Parameters (Last 7 Days)</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={waterQualityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="do" stroke="#82ca9d" name="DO (mg/L)" />
            <Line type="monotone" dataKey="ph" stroke="#ffc658" name="pH" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default WaterQualityLog;
