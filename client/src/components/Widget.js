import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const Widget = ({ title, children }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ mt: 2 }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
};

export default Widget;
