import {
  Agriculture as AgricultureIcon,
  WaterDrop as WaterIcon,
  Restaurant as RestaurantIcon,
  TrendingUp as GrowthIcon,
  Waves as PondIcon,
  Insights as InsightsIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import {
  Typography,
  Grid,
  Box,
  Button,
  Container,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent
} from '@mui/material';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useSeason } from '../../../context/SeasonContext';
import { useApiData } from '../../../hooks/useApi';
import { getPonds, getWaterQualityInputs, getFeedInputs } from '../../../services/api';
import logger from '../../../utils/logger';
import { useStableCallback, useStableMemo } from '../../../utils/performanceOptimization';
import FinancialOverviewWidget from '../../FinancialOverviewWidget';
import LowStockAlert from '../../LowStockAlert';
import PredictiveInsight from '../../PredictiveInsight';
import ProfitLossWidget from '../../ProfitLossWidget';
import QuickActions from '../../QuickActions';
import AlertBanner from '../dashboard/AlertBanner';
import KPICard from '../dashboard/KPICard';
import PondCard from '../ponds/PondCard';
import DataTrend from '../shared/charts/DataTrend';
import ErrorDisplay from '../shared/error-handling/ErrorDisplay';

// Section header component
const SectionHeader = ({ label, action }: { label: string; action?: React.ReactNode }) => (
  <Box
    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 1 }}
  >
    <Typography
      variant='overline'
      sx={{
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: 'text.secondary'
      }}
    >
      {label}
    </Typography>
    {action && action}
  </Box>
);

const FarmOverview: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('active');
  const [_timeRange, setTimeRange] = useState('week');
  const [showAlert, setShowAlert] = useState(true);
  const { selectedSeason } = useSeason();

  // Constants
  const DEFAULT_AVG_GROWTH_RATE = 1.2;
  const DEFAULT_FEED_EFFICIENCY = 1.4;
  const DEFAULT_WATER_QUALITY_SCORE = 85;
  const DEFAULT_TOTAL_FEED_CONSUMPTION = 1250;
  const DEFAULT_POND_PROGRESS = 75;
  const DEFAULT_POND_HEALTH_SCORE = 80;

  // Stable event handlers
  const handleFilterChange = useStableCallback((event: any, newValue: string | null) => {
    if (newValue !== null) setFilter(newValue);
  });

  // Fetch all ponds data
  const {
    data: allPondsData,
    loading: allPondsLoading,
    error: allPondsError,
    refetch: refetchPonds
  } = useApiData(getPonds, [], 'ponds');

  // Filter ponds
  const filteredPonds = useMemo(() => {
    const ponds = Array.isArray(allPondsData) ? allPondsData : [];
    let seasonFilteredPonds = ponds;
    if (selectedSeason) {
      seasonFilteredPonds = ponds.filter(
        pond => pond.seasonId?._id === selectedSeason?._id || pond.seasonId === selectedSeason?.id
      );
    }

    if (filter === 'all') return seasonFilteredPonds;
    return seasonFilteredPonds.filter(pond => pond.status?.toLowerCase() === filter);
  }, [allPondsData, filter, selectedSeason]);

  // KPI summary calculation
  const summaryData = useStableMemo(() => {
    const allPonds = Array.isArray(allPondsData) ? allPondsData : [];
    const totalPonds = allPonds.length;
    const activePonds = allPonds.filter(pond => pond.status === 'Active').length;

    return [
      { title: 'Total Ponds', value: totalPonds, icon: <PondIcon />, color: '#2563EB', change: 0 },
      {
        title: 'Active Ponds',
        value: activePonds,
        icon: <AgricultureIcon />,
        color: '#10B981',
        change: 0
      },
      {
        title: 'Avg. Growth Rate',
        value: DEFAULT_AVG_GROWTH_RATE,
        suffix: 'g/day',
        change: 0.1,
        changeText: '+0.1 from last week',
        icon: <GrowthIcon />,
        color: '#F59E0B'
      },
      {
        title: 'Feed Efficiency',
        value: DEFAULT_FEED_EFFICIENCY,
        suffix: ':1',
        change: -0.1,
        changeText: '-0.1 from last week',
        icon: <RestaurantIcon />,
        color: '#2563EB'
      },
      {
        title: 'Water Quality',
        value: DEFAULT_WATER_QUALITY_SCORE,
        suffix: '%',
        change: 5,
        changeText: '+5% from last week',
        icon: <WaterIcon />,
        color: '#10B981'
      },
      {
        title: 'Feed Consumption',
        value: DEFAULT_TOTAL_FEED_CONSUMPTION,
        suffix: 'kg',
        change: 12,
        changeText: '+12% from last week',
        icon: <RestaurantIcon />,
        color: '#7C3AED'
      }
    ];
  }, [allPondsData]);

  // Pond status data
  const transformedPondData = useMemo(() => {
    return filteredPonds.map(pond => ({
      id: pond._id || pond.id,
      name: pond.name,
      status: pond.status || 'Active',
      health: pond.health || 'Good',
      progress: pond.progress || Math.floor(Math.random() * 100),
      healthScore: pond.healthScore || Math.floor(Math.random() * 100)
    }));
  }, [filteredPonds]);

  if (allPondsLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (allPondsError) {
    return (
      <Container maxWidth={false} sx={{ mt: 2, mb: 4 }}>
        <ErrorDisplay error={allPondsError} onRetry={refetchPonds} />
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ mt: 1, mb: 4 }}>
      <LowStockAlert />
      {showAlert && (
        <AlertBanner
          severity='warning'
          message={t('water_quality_alert')}
          dismissible
          onClose={() => setShowAlert(false)}
        />
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant='h4' component='h1' sx={{ fontWeight: 700 }}>
            {t('farm_dashboard')}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
            {t('welcome_back')}
          </Typography>
        </Box>
        <Button variant='contained' startIcon={<InsightsIcon />} size='large'>
          {t('generate_report')}
        </Button>
      </Box>

      {/* KEY METRICS Section */}
      <SectionHeader label='KEY METRICS' />
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {summaryData.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <KPICard
              title={item.title}
              value={item.value}
              icon={item.icon}
              color={item.color}
              change={item.change}
              changeText={item.changeText}
              suffix={item.suffix}
              delay={index * 0.05}
            />
          </Grid>
        ))}
      </Grid>

      {/* QUICK ACTIONS */}
      <SectionHeader label='QUICK ACTIONS' />
      <Box sx={{ mb: 3 }}>
        <QuickActions
          onActionClick={(action: string) => console.log('Quick action clicked:', action)}
        />
      </Box>

      {/* FINANCIAL OVERVIEW Section */}
      <SectionHeader label='FINANCIAL OVERVIEW' />
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <FinancialOverviewWidget />
        </Grid>
        <Grid item xs={12} lg={4}>
          <ProfitLossWidget />
        </Grid>
      </Grid>

      {/* DATA TRENDS Section */}
      <SectionHeader label='DATA TRENDS' />
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <DataTrend
            title={t('water_quality_trend')}
            data={[
              { date: 'Pond A', do: 5.5 },
              { date: 'Pond B', do: 4.2 },
              { date: 'Pond C', do: 5.0 },
              { date: 'Pond D', do: 6.2 }
            ]}
            dataKey='do'
            color='#10B981'
            unit='mg/L'
            trend='auto'
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DataTrend
            title={t('feed_consumption_trend')}
            data={[
              { date: 'Mon', amount: 120 },
              { date: 'Tue', amount: 140 },
              { date: 'Wed', amount: 110 },
              { date: 'Thu', amount: 150 }
            ]}
            dataKey='amount'
            color='#2563EB'
            unit='kg'
            trend='auto'
          />
        </Grid>
      </Grid>

      {/* POND STATUS Section */}
      <SectionHeader
        label='POND STATUS'
        action={
          <ToggleButtonGroup
            size='small'
            value={filter}
            exclusive
            onChange={handleFilterChange}
            sx={{ height: 32 }}
          >
            <ToggleButton value='all'>{t('all')}</ToggleButton>
            <ToggleButton value='active'>{t('active')}</ToggleButton>
            <ToggleButton value='inactive'>{t('inactive')}</ToggleButton>
          </ToggleButtonGroup>
        }
      />
      <Card elevation={0} sx={{ mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Grid container spacing={2.5}>
            {transformedPondData.map(pond => (
              <Grid item xs={12} sm={6} lg={4} key={pond.id}>
                <PondCard pond={pond} onClick={() => navigate(`/dashboard/${pond.id}`)} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* AI INSIGHTS Section */}
      <SectionHeader label='AI INSIGHTS & RECOMMENDATIONS' />
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InsightsIcon sx={{ fontSize: 24, mr: 1, color: 'info.main' }} />
            <Typography variant='body1' sx={{ fontWeight: 600 }}>
              Based on current data trends, here are our recommendations:
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <PredictiveInsight
                title='Water Quality Alert'
                insight='Pond B and Pond E have low dissolved oxygen levels. Recommend immediate aeration.'
                confidence={85}
                icon={<WarningIcon />}
                color='warning'
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <PredictiveInsight
                title='Growth Optimization'
                insight='Increase feeding frequency for Pond A and Pond D to optimize growth rate.'
                confidence={78}
                icon={<GrowthIcon />}
                color='info'
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <PredictiveInsight
                title='Harvest Projection'
                insight='Pond D is projected to reach harvest size in 28 days based on current growth rate.'
                confidence={92}
                icon={<CalendarIcon />}
                color='success'
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default FarmOverview;
