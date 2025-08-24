
import React from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const feedData = [
  { date: '08-10', quantity: 45 },
  { date: '08-11', quantity: 46 },
  { date: '08-12', quantity: 48 },
  { date: '08-13', quantity: 47 },
  { date: '08-14', quantity: 50 },
  { date: '08-15', quantity: 52 },
  { date: '08-16', quantity: 51 },
];

const FeedLog = () => {
  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Feed Log</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3, textAlign: 'center' }}>
          <Box>
            <Typography variant="h5">51 kg</Typography>
            <Typography variant="body2" color="text.secondary">Today's Total Feed</Typography>
          </Box>
          <Box>
            <Typography variant="h5">52 kg</Typography>
            <Typography variant="body2" color="text.secondary">Yesterday's Total Feed</Typography>
          </Box>
          <Box>
            <Typography variant="h5">48.4 kg</Typography>
            <Typography variant="body2" color="text.secondary">7-Day Average</Typography>
          </Box>
        </Box>
        <Typography variant="subtitle1" gutterBottom>Daily Feed Quantity (Last 7 Days)</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={feedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="quantity" stroke="#8884d8" activeDot={{ r: 8 }} name="Feed (kg)" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default FeedLog;
