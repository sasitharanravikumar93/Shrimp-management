import {
  Agriculture as AgricultureIcon,
  WaterDrop as WaterIcon,
  Restaurant as RestaurantIcon,
  TrendingUp as GrowthIcon,
  Waves as PondIcon,
  Insights as InsightsIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import {
  Typography,
  Grid,
  Box,
  Button,
  Container,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useSeason } from '../../../context/SeasonContext';
import { useApiData } from '../../../hooks/useApi';
import { getPonds, getWaterQualityInputs, getFeedInputs } from '../../../services/api';
import logger from '../../../utils/logger';
import { useStableCallback, useStableMemo } from '../../../utils/performanceOptimization';
import AlertBanner from '../dashboard/AlertBanner';
import KPICard from '../dashboard/KPICard';
import PondCard from '../ponds/PondCard';
import DataTrend from '../shared/charts/DataTrend';
import ErrorDisplay from '../shared/error-handling/ErrorDisplay';

// eslint-disable-next-line max-lines-per-function
const FarmOverview = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [_timeRange, setTimeRange] = useState('week');
  const [showAlert, setShowAlert] = useState(false);
  const { selectedSeason } = useSeason();

  // Constants for magic numbers
  const DEFAULT_AVG_GROWTH_RATE = 1.2;
  const DEFAULT_FEED_EFFICIENCY = 1.4;
  const DEFAULT_WATER_QUALITY_SCORE = 85;
  const DEFAULT_FEED_CONSUMPTION = 50;
  const DEFAULT_TOTAL_FEED_CONSUMPTION = 1250;
  const DEFAULT_POND_PROGRESS = 75;
  const DEFAULT_POND_HEALTH_SCORE = 80;
  const WATER_QUALITY_DATA_LIMIT = 6;
  const DEFAULT_PH = 7.2;
  const DEFAULT_DO = 5.5;
  const DEFAULT_TEMP = 28.5;
  // Additional constants for fallback data
  const FALLBACK_POND_B_PH = 6.8;
  const FALLBACK_POND_B_DO = 4.2;
  const FALLBACK_POND_B_TEMP = 29.0;
  const FALLBACK_POND_C_PH = 7.0;
  const FALLBACK_POND_C_DO = 5.0;
  const FALLBACK_POND_C_TEMP = 28.0;
  const FALLBACK_MON_AMOUNT = 120;
  const FALLBACK_TUE_AMOUNT = 140;
  const FALLBACK_WED_AMOUNT = 110;
  const FALLBACK_THU_AMOUNT = 150;
  const FALLBACK_FRI_AMOUNT = 130;
  const FALLBACK_SAT_AMOUNT = 160;
  const FALLBACK_SUN_AMOUNT = 140;

  // Stable event handlers to prevent child re-renders
  const handleFilterChange = useStableCallback(event => {
    setFilter(event.target.value);
  }, []);

  const _handleTimeRangeChange = useStableCallback((event, newValue) => {
    if (newValue !== null) {
      setTimeRange(newValue);
    }
  }, []);

  const _handlePondClick = useStableCallback(
    pondId => {
      navigate(`/dashboard/${pondId}`);
    },
    [navigate]
  );

  const _handleCloseAlert = useStableCallback(() => {
    setShowAlert(false);
  }, []);

  // Fetch all ponds data with caching
  const {
    data: allPondsData,
    loading: allPondsLoading,
    error: allPondsError,
    refetch: refetchPonds
  } = useApiData(getPonds, [], 'ponds');

  // Fetch water quality data for charts
  const { data: _waterQualityData, loading: _waterQualityLoading } = useApiData(
    () => {
      return getWaterQualityInputs();
    },
    [selectedSeason],
    'waterQuality'
  );

  // Fetch feed data for charts
  const { data: _feedData, loading: _feedLoading } = useApiData(
    () => {
      return getFeedInputs();
    },
    [selectedSeason],
    'feedData'
  );

  // Debug logging for season and data changes
  useEffect(() => {
    logger.debug('Season selection changed', {
      selectedSeason: selectedSeason?._id,
      seasonName: selectedSeason?.name,
      component: 'FarmOverview'
    });
  }, [selectedSeason]);

  useEffect(() => {
    logger.debug('Ponds data updated', {
      pondsCount: allPondsData?.data?.length || 0,
      hasData: !!allPondsData?.data,
      component: 'FarmOverview'
    });
  }, [allPondsData]);

  // Filter ponds based on selection and season
  const filteredPonds = useMemo(() => {
    const ponds = allPondsData?.data || [];

    // First filter by season if a season is selected
    let seasonFilteredPonds = ponds;
    if (selectedSeason) {
      seasonFilteredPonds = ponds.filter(pond => {
        logger.debug('Filtering pond by season', {
          pondId: pond._id,
          pondSeasonId: pond.seasonId?._id,
          selectedSeasonId: selectedSeason?._id,
          component: 'FarmOverview'
        });
        return pond.seasonId && pond.seasonId._id === selectedSeason._id;
      });
    }

    // Then filter by status
    if (filter === 'all') {
      return seasonFilteredPonds;
    }
    return seasonFilteredPonds.filter(pond => pond.status?.toLowerCase() === filter);
  }, [allPondsData, filter, selectedSeason]);

  // Memoized summary data calculation to prevent unnecessary recalculations
  const summaryData = useStableMemo(() => {
    if (!filteredPonds) return [];

    const totalPonds = filteredPonds.length;
    const activePonds = filteredPonds.filter(pond => pond.status === 'Active').length;

    // Calculate real metrics from pond data where available
    const avgGrowthRate =
      filteredPonds.length > 0
        ? filteredPonds.reduce(
            (sum, pond) => sum + (pond.growthRate || DEFAULT_AVG_GROWTH_RATE),
            0
          ) / filteredPonds.length
        : DEFAULT_AVG_GROWTH_RATE;

    const feedEfficiency =
      filteredPonds.length > 0
        ? filteredPonds.reduce(
            (sum, pond) => sum + (pond.feedEfficiency || DEFAULT_FEED_EFFICIENCY),
            0
          ) / filteredPonds.length
        : DEFAULT_FEED_EFFICIENCY;

    const waterQuality =
      filteredPonds.length > 0
        ? filteredPonds.reduce(
            (sum, pond) => sum + (pond.waterQualityScore || DEFAULT_WATER_QUALITY_SCORE),
            0
          ) / filteredPonds.length
        : DEFAULT_WATER_QUALITY_SCORE;

    const feedConsumption =
      filteredPonds.length > 0
        ? filteredPonds.reduce(
            (sum, pond) => sum + (pond.feedConsumption || DEFAULT_FEED_CONSUMPTION),
            0
          )
        : DEFAULT_TOTAL_FEED_CONSUMPTION;

    return [
      {
        title: t('total_ponds'),
        value: totalPonds,
        change: 0,
        icon: <PondIcon />,
        color: '#007BFF'
      },
      {
        title: t('active_ponds'),
        value: activePonds,
        change: 0,
        icon: <AgricultureIcon />,
        color: '#28A745'
      },
      {
        title: t('avg_growth_rate'),
        value: Number(avgGrowthRate.toFixed(1)),
        suffix: t('g_per_day'),
        change: 0.1,
        changeText: t('plus_point_one_from_last_week'),
        icon: <GrowthIcon />,
        color: '#FD7E14'
      },
      {
        title: t('feed_efficiency'),
        value: Number(feedEfficiency.toFixed(1)),
        suffix: t('colon_one'),
        change: -0.1,
        changeText: t('minus_point_one_from_last_week'),
        icon: <RestaurantIcon />,
        color: '#007BFF'
      },
      {
        title: t('water_quality'),
        value: Math.round(waterQuality),
        suffix: t('percentage'),
        change: 5,
        changeText: t('plus_five_percent_from_last_week'),
        icon: <WaterIcon />,
        color: '#28A745'
      },
      {
        title: t('feed_consumption'),
        value: Math.round(feedConsumption),
        suffix: t('kg'),
        change: 12,
        changeText: t('plus_twelve_percent_from_last_week'),
        icon: <RestaurantIcon />,
        color: '#FD7E14'
      }
    ];
  }, [filteredPonds, t]);

  // Transform pond data for PondCard component
  const transformedPondData = useMemo(() => {
    return filteredPonds.map(pond => ({
      id: pond._id || pond.id,
      name: pond.name,
      status: pond.status || 'Active', // Default to Active if not set
      health: pond.health || 'Good', // Default to Good if not set
      progress: pond.progress || pond.stockingDensity || DEFAULT_POND_PROGRESS, // Use stocking density or default
      healthScore: pond.healthScore || pond.waterQualityScore || DEFAULT_POND_HEALTH_SCORE // Use water quality score or default
    }));
  }, [filteredPonds]);

  // Transform water quality data for charts
  const transformedWaterQualityData = useMemo(() => {
    if (!_waterQualityData?.data || _waterQualityData.data.length === 0) {
      // Fallback data if no real data available
      return [
        { date: 'Pond A', pH: DEFAULT_PH, do: DEFAULT_DO, temp: DEFAULT_TEMP },
        {
          date: 'Pond B',
          pH: FALLBACK_POND_B_PH,
          do: FALLBACK_POND_B_DO,
          temp: FALLBACK_POND_B_TEMP
        },
        {
          date: 'Pond C',
          pH: FALLBACK_POND_C_PH,
          do: FALLBACK_POND_C_DO,
          temp: FALLBACK_POND_C_TEMP
        }
      ];
    }

    return _waterQualityData.data.slice(0, WATER_QUALITY_DATA_LIMIT).map(item => ({
      date: item.pondId?.name || 'Unknown',
      pH: item.pH || DEFAULT_PH,
      do: item.dissolvedOxygen || DEFAULT_DO,
      temp: item.temperature || DEFAULT_TEMP
    }));
  }, [_waterQualityData]);

  // Transform feed data for charts
  const transformedFeedData = useMemo(() => {
    if (!_feedData?.data || _feedData.data.length === 0) {
      // Fallback data if no real data available
      return [
        { date: 'Mon', amount: FALLBACK_MON_AMOUNT },
        { date: 'Tue', amount: FALLBACK_TUE_AMOUNT },
        { date: 'Wed', amount: FALLBACK_WED_AMOUNT },
        { date: 'Thu', amount: FALLBACK_THU_AMOUNT },
        { date: 'Fri', amount: FALLBACK_FRI_AMOUNT },
        { date: 'Sat', amount: FALLBACK_SAT_AMOUNT },
        { date: 'Sun', amount: FALLBACK_SUN_AMOUNT }
      ];
    }

    // Group feed data by date and sum quantities
    const groupedData = _feedData.data.reduce((acc, feed) => {
      const date = new Date(feed.date).toLocaleDateString('en-US', { weekday: 'short' });
      acc[date] = (acc[date] || 0) + (feed.quantity || 0);
      return acc;
    }, {});

    return Object.entries(groupedData).map(([date, amount]) => ({
      date,
      amount: Math.round(amount)
    }));
  }, [_feedData]);

  // Loading and error states
  const isLoading = allPondsLoading;
  const hasError = allPondsError;

  if (isLoading) {
    return (
      <Container
        maxWidth={false}
        sx={{
          mt: 2,
          mb: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (hasError) {
    return (
      <Container maxWidth={false} sx={{ mt: 2, mb: 4 }}>
        <ErrorDisplay
          error={allPondsError}
          context={{
            onRetry: refetchPonds,
            navigate: path => navigate(path)
          }}
          variant='standard'
        />
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ mt: 2, mb: 4 }}>
      {/* Alert Banner */}
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
          <Typography variant='h4' component='h1' gutterBottom>
            {t('farm_dashboard')}
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {t('welcome_back')}
          </Typography>
        </Box>
        <Button variant='contained' startIcon={<InsightsIcon />} size='large'>
          {t('generate_report')}
        </Button>
      </Box>

      {/* KPI Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryData.map((item, _index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={item.title}>
            <KPICard
              title={t(item.title)}
              value={item.value}
              icon={item.icon}
              color={item.color}
              change={item.change}
              changeText={item.changeText}
              suffix={item.suffix}
            />
          </Grid>
        ))}
      </Grid>

      {/* Key Metrics Charts - Using real API data */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Water Quality Chart */}
        <Grid item xs={12} md={6}>
          <DataTrend
            title={t('water_quality_trend')}
            data={transformedWaterQualityData}
            dataKey='do'
            color='#28A745'
            unit='mg/L'
            trend='auto'
          />
        </Grid>

        {/* Feed Consumption Chart */}
        <Grid item xs={12} md={6}>
          <DataTrend
            title={t('feed_consumption_trend')}
            data={transformedFeedData}
            dataKey='amount'
            color='#007BFF'
            unit='kg'
            trend='auto'
          />
        </Grid>
      </Grid>

      {/* Pond Selection Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            {t('pond_overview')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ToggleButtonGroup
              size='small'
              value={filter}
              exclusive
              onChange={handleFilterChange}
              sx={{ height: 36 }}
            >
              <ToggleButton value='all'>{t('all_ponds')}</ToggleButton>
              <ToggleButton value='active'>{t('active')}</ToggleButton>
              <ToggleButton value='inactive'>{t('inactive')}</ToggleButton>
            </ToggleButtonGroup>
            <Button variant='outlined' startIcon={<FilterIcon />} size='small'>
              {t('more_filters')}
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {transformedPondData.map(pond => (
            <Grid item xs={12} sm={6} lg={4} key={pond.id}>
              <PondCard
                pond={pond}
                onClick={() => navigate(`/dashboard/${pond.id}`)}
                onManageClick={() => navigate(`/dashboard/${pond.id}`)}
                onTimelineClick={() => navigate(`/pond/${pond.id}`)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

// Icon components for summary cards
const _CheckCircleIcon = () => <CheckIcon />;

export default FarmOverview;
