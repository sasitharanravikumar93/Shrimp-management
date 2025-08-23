import React from 'react';
import { Typography, Box, Card, CardContent, Grid, Button, CircularProgress, Alert, Container } from '@mui/material';
import { 
  Insights as InsightsIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import PredictiveInsight from './PredictiveInsight';
import { useApiData } from '../hooks/useApi';
import { getPondById } from '../services/api';

const PondDetail = ({ pondId }) => {
  const { data: pondData, loading: pondLoading, error: pondError } = useApiData(
    () => getPondById(pondId),
    [pondId],
    `pond-${pondId}`
  );

  console.log('PondDetail - pondId:', pondId);
  console.log('PondDetail - pondLoading:', pondLoading);
  console.log('PondDetail - pondError:', pondError);
  console.log('PondDetail - pondData:', pondData);

  if (pondLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (pondError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading pond details: {pondError.message}
      </Alert>
    );
  }

  // Ensure pondData exists before proceeding
  if (!pondData) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No pond data found for ID: {pondId}
      </Alert>
    );
  }

  const pond = pondData;

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Pond: {pond.name.en || pond.name} - Detailed View
      </Typography>

      {/* Pond Vitals Section */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Pond Vitals</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body1">Size: {pond.size} m²</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body1">Capacity: {pond.capacity}</Typography>
            </Grid>
            {/* Add more pond-specific vitals here */}
          </Grid>
        </CardContent>
      </Card>

      {/* AI Insights Section */}
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InsightsIcon sx={{ fontSize: 30, mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="h2">
              AI Insights & Recommendations
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            Based on current data trends for {pond.name.en || pond.name}, here are our recommendations:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <PredictiveInsight
                title="Water Quality Alert"
                insight="Low dissolved oxygen levels detected. Recommend immediate aeration."
                confidence={85}
                icon={<WarningIcon />}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <PredictiveInsight
                title="Growth Optimization"
                insight="Consider adjusting feeding frequency to optimize growth rate."
                confidence={78}
                icon={<TrendingUpIcon />}
                color="info"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <PredictiveInsight
                title="Harvest Projection"
                insight="Projected to reach harvest size in X days based on current growth rate."
                confidence={92}
                projectedDate="(Date)"
                icon={<CalendarIcon />}
                color="success"
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button variant="outlined">
              View Detailed Analysis
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PondDetail;