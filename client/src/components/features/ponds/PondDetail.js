import {
  Insights as InsightsIcon,
  Widgets as WidgetsIcon, // Biomass
  Scale as ScaleIcon, // ABW
  SyncAlt as SyncAltIcon, // FCR
  HealthAndSafety as HealthAndSafetyIcon, // Survival
  Event as EventIcon, // DOC
  Speed as SpeedIcon, // Health Score
  Archive as ArchiveIcon, // Harvested Biomass, Final Harvested Biomass
  CheckCircle as CheckCircleIcon, // Survival Rate
  DonutLarge as DonutLargeIcon, // Feed Conversion Ratio
  Info as InfoIcon // Info icon
} from '@mui/icons-material';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Container,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import React, { useState } from 'react';

import FeedLog from '../feeding/FeedLog';
import GrowthSamplingLog from '../feeding/GrowthSamplingLog';
import WaterQualityLog from '../water-quality/WaterQualityLog';

// --- MOCK DATA FOR DYNAMIC KPIS ---
const activeKpis = [
  {
    title: 'Current Biomass',
    value: '4,500 kg',
    icon: <WidgetsIcon fontSize='large' color='primary' />
  },
  {
    title: 'Avg. Body Weight',
    value: '16.8 g',
    icon: <ScaleIcon fontSize='large' color='primary' />
  },
  { title: 'FCR', value: '1.25', icon: <SyncAltIcon fontSize='large' color='primary' /> },
  {
    title: 'Survival Rate',
    value: '92%',
    icon: <HealthAndSafetyIcon fontSize='large' color='primary' />
  },
  { title: 'Days of Culture', value: '75', icon: <EventIcon fontSize='large' color='primary' /> },
  { title: 'Health Score', value: '95/100', icon: <SpeedIcon fontSize='large' color='primary' /> }
];

const partialHarvestKpis = [
  {
    title: 'Remaining Biomass',
    value: '2,100 kg',
    icon: <WidgetsIcon fontSize='large' color='warning' />
  },
  {
    title: 'Harvested Weight',
    value: '2,400 kg',
    icon: <ArchiveIcon fontSize='large' color='warning' />
  },
  {
    title: 'Avg. Body Weight',
    value: '16.9 g',
    icon: <ScaleIcon fontSize='large' color='warning' />
  },
  { title: 'Updated FCR', value: '1.28', icon: <SyncAltIcon fontSize='large' color='warning' /> },
  {
    title: 'Updated Survival',
    value: '91%',
    icon: <HealthAndSafetyIcon fontSize='large' color='warning' />
  },
  { title: 'Days of Culture', value: '75', icon: <EventIcon fontSize='large' color='warning' /> }
];

const finalReportKpis = [
  {
    title: 'Total Harvested Weight',
    value: '4,450 kg',
    icon: <ArchiveIcon fontSize='large' color='secondary' />
  },
  {
    title: 'Final FCR',
    value: '1.31',
    icon: <CheckCircleIcon fontSize='large' color='secondary' />
  },
  { title: 'Final ABW', value: '18.2 g', icon: <ScaleIcon fontSize='large' color='secondary' /> },
  {
    title: 'Overall Survival',
    value: '89%',
    icon: <HealthAndSafetyIcon fontSize='large' color='secondary' />
  },
  {
    title: 'Total Days of Culture',
    value: '82',
    icon: <EventIcon fontSize='large' color='secondary' />
  },
  {
    title: 'Yield (kg/ha)',
    value: '8,900',
    icon: <DonutLargeIcon fontSize='large' color='secondary' />
  }
];

const PondDetail = () => {
  const [tabIndex, setTabIndex] = useState(0);

  // --- SIMULATE BACKEND DATA ---
  // 1. Set the pond's true status
  const pond = { status: 'Active' }; // Options: 'Active', 'Completed', 'Inactive', 'Planning'

  // 2. Add events to simulate harvests
  const events = [
    // { type: 'partial_harvest', data: { weight: 2400 } }
  ];

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const pondName = 'Pond A-1'; // Static data

  // --- DERIVE THE CORRECT VIEW STATE ---
  let viewState = 'Active'; // Default
  let kpiCards = activeKpis;
  let statusChip = <Chip label='Active' color='success' variant='outlined' />;

  const hasPartialHarvest = events.some(e => e.type === 'partial_harvest');

  if (pond.status === 'Active') {
    if (hasPartialHarvest) {
      viewState = 'PartiallyHarvested';
      kpiCards = partialHarvestKpis;
      statusChip = <Chip label='Active (Partial Harvest)' color='warning' variant='outlined' />;
    } else {
      viewState = 'Active';
      kpiCards = activeKpis;
      statusChip = <Chip label='Active' color='success' variant='outlined' />;
    }
  } else if (pond.status === 'Completed') {
    viewState = 'FinalReport';
    kpiCards = finalReportKpis;
    statusChip = <Chip label='Completed' color='secondary' variant='outlined' />;
  } else {
    viewState = 'Inactive';
    kpiCards = []; // No KPIs for inactive/planning ponds
    statusChip = <Chip label={pond.status} color='default' variant='outlined' />;
  }

  return (
    <Container maxWidth='lg' sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant='h4' component='h1'>
          {pondName} - Detailed View
        </Typography>
        {statusChip}
      </Box>

      {/* KPI Cards Section */}
      {kpiCards.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {kpiCards.map((kpi, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={`${kpi.title}-${index}`}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent
                  sx={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: '100%'
                  }}
                >
                  {kpi.icon}
                  <Typography variant='h6' sx={{ mt: 1 }}>
                    {kpi.value}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ minHeight: '3em' }}>
                    {kpi.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {(viewState === 'Active' || viewState === 'PartiallyHarvested') && (
        <>
          {/* Pond Performance Logs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabIndex} onChange={handleTabChange} aria-label='Pond Performance Logs'>
              <Tab label='Feed' />
              <Tab label='Water Quality' />
              <Tab label='Growth Sampling' />
            </Tabs>
          </Box>

          {tabIndex === 0 && <FeedLog />}
          {tabIndex === 1 && <WaterQualityLog />}
          {tabIndex === 2 && <GrowthSamplingLog />}

          {/* AI Insights Section */}
          <Card elevation={3} sx={{ mt: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InsightsIcon sx={{ fontSize: 30, mr: 1, color: 'primary.main' }} />
                <Typography variant='h6' component='h2'>
                  AI Insights & Recommendations
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant='h6' color='text.secondary' gutterBottom>
                  Coming Soon
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                  Advanced analytics and predictive recommendations will be available here in a
                  future update.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {viewState === 'FinalReport' && (
        <Card elevation={3} sx={{ mt: 4, textAlign: 'center' }}>
          <CardContent>
            <Typography variant='h6'>Cycle Complete</Typography>
            <Typography variant='body1' color='text.secondary'>
              This data represents the final report for the completed cycle.
            </Typography>
            <Button variant='contained' sx={{ mt: 2 }}>
              View Full Cycle Logs
            </Button>
          </CardContent>
        </Card>
      )}

      {viewState === 'Inactive' && (
        <Card elevation={3} sx={{ mt: 4, textAlign: 'center' }}>
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
          >
            <InfoIcon fontSize='large' color='action' />
            <Typography variant='h6'>Pond Not Active</Typography>
            <Typography variant='body1' color='text.secondary'>
              This pond is currently in &apos;Planning&apos; or &apos;Inactive&apos; status. No
              operational data to display.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default PondDetail;

// Add PropTypes validation
