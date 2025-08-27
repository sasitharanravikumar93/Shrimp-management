/**
 * Mobile-Optimized Farm Overview Component
 * Responsive version of FarmOverview designed for mobile devices
 */

import {
  Agriculture as AgricultureIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  TrendingUp as GrowthIcon,
  WaterDrop as WaterIcon,
  Waves as PondIcon
} from '@mui/icons-material';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Collapse,
  Stack,
  useTheme
} from '@mui/material';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSeason } from '../../../context/SeasonContext';
import { useApiData } from '../../../hooks/useApi';
import { getPonds, getWaterQualityInputs, getFeedInputs } from '../../../services/api';
import logger from '../../../utils/logger';
import { useMobileDetection } from '../../../utils/responsiveUtils';

import { 
  MobileGrid, 
  MobileKPICard, 
  MobilePondCard, 
  TouchButton,
  SkeletonCard,
  ExpandableMobileCard
} from './MobileOptimized';

// Default values for calculations
const DEFAULT_GROWTH_RATE = 1.2;
const DEFAULT_WATER_QUALITY_SCORE = 85;
const DEFAULT_FEED_EFFICIENCY = 1.5;
const SKELETON_CARD_COUNT = 6;

const MobileFarmOverview = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isMobile } = useMobileDetection();
  const [tabValue, setTabValue] = useState(0);
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const { selectedSeason } = useSeason();

  // API calls
  const { data: allPondsData, loading: pondsLoading } = useApiData(getPonds, [], 'ponds');

  const { data: waterQualityData } = useApiData(
    () => {
      return getWaterQualityInputs();
    },
    [selectedSeason],
    'waterQuality'
  );

  const { data: feedData } = useApiData(
    () => {
      return getFeedInputs();
    },
    [selectedSeason],
    'feedData'
  );

  // Filter ponds
  const filteredPonds = useMemo(() => {
    const ponds = allPondsData?.data || [];
    let seasonFilteredPonds = ponds;

    if (selectedSeason) {
      seasonFilteredPonds = ponds.filter(pond => {
        return pond.seasonId && pond.seasonId._id === selectedSeason._id;
      });
    }

    if (filter === 'all') {
      return seasonFilteredPonds;
    }
    return seasonFilteredPonds.filter(pond => pond.status?.toLowerCase() === filter.toLowerCase());
  }, [allPondsData, filter, selectedSeason]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!filteredPonds.length) return [];

    const totalPonds = filteredPonds.length;
    const activePonds = filteredPonds.filter(pond => pond.status === 'Active').length;

    const avgGrowthRate =
      filteredPonds.length > 0
        ? filteredPonds.reduce((sum, pond) => sum + (pond.growthRate || DEFAULT_GROWTH_RATE), 0) /
        filteredPonds.length
        : DEFAULT_GROWTH_RATE;

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

    return [
      {
        title: t('total_ponds'),
        value: totalPonds,
        icon: <PondIcon />,
        color: theme.palette.primary.main
      },
      {
        title: t('active_ponds'),
        value: activePonds,
        icon: <AgricultureIcon />,
        color: theme.palette.success.main
      },
      {
        title: t('avg_growth'),
        value: `${avgGrowthRate.toFixed(1)}x`,
        icon: <GrowthIcon />,
        color: theme.palette.info.main,
        change: 5.2
      },
      {
        title: t('water_quality'),
        value: `${waterQuality.toFixed(0)}%`,
        icon: <WaterIcon />,
        color: theme.palette.secondary.main,
        change: -2.1
      }
    ];
  }, [filteredPonds, t]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePondClick = pondId => {
    // Navigate to pond detail
    logger.info('Navigate to pond:', pondId);
  };

  if (!isMobile) {
    // Return desktop version or null
    return null;
  }

  if (pondsLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <MobileGrid columns={{ xs: 2 }} spacing={2}>
          {[...Array(SKELETON_CARD_COUNT)].map((_, index) => (
            <SkeletonCard key={index} height={120} />
          ))}
        </MobileGrid>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 8 }}>
      {' '}
      {/* Bottom padding for mobile nav */}
      {/* Header */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant='h5' fontWeight='bold' gutterBottom>
          {t('farm_overview')}
        </Typography>

        {selectedSeason && (
          <Typography variant='body2' color='text.secondary'>
            {selectedSeason.name}
          </Typography>
        )}
      </Box>
      {/* KPI Cards */}
      <Box sx={{ px: 2, pb: 2 }}>
        <MobileGrid columns={{ xs: 2 }} spacing={1.5}>
          {metrics.map((metric, index) => (
            <MobileKPICard key={index} {...metric} compact />
          ))}
        </MobileGrid>
      </Box>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mx: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant='fullWidth'
          sx={{
            '& .MuiTab-root': {
              fontSize: '0.875rem',
              minHeight: 40
            }
          }}
        >
          <Tab label={t('ponds')} />
          <Tab label={t('metrics')} />
          <Tab label={t('alerts')} />
        </Tabs>
      </Box>
      {/* Tab Content */}
      <Box sx={{ p: 2 }}>
        {tabValue === 0 && (
          <>
            {/* Filters */}
            <Box sx={{ mb: 2 }}>
              <TouchButton
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  backgroundColor: theme.palette.grey[100],
                  color: theme.palette.text.secondary,
                  width: '100%',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterIcon fontSize='small' />
                  <span>Filter: {filter === 'all' ? 'All Ponds' : filter}</span>
                </Box>
                {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </TouchButton>

              <Collapse in={showFilters}>
                <Stack direction='row' spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                  {['all', 'active', 'maintenance', 'inactive'].map(filterOption => (
                    <Chip
                      key={filterOption}
                      label={filterOption === 'all' ? 'All' : filterOption}
                      variant={filter === filterOption ? 'filled' : 'outlined'}
                      size='small'
                      onClick={() => setFilter(filterOption)}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  ))}
                </Stack>
              </Collapse>
            </Box>

            {/* Ponds Grid */}
            <MobileGrid columns={{ xs: 1 }} spacing={1.5}>
              {filteredPonds.map(pond => (
                <MobilePondCard key={pond._id} pond={pond} onPondClick={handlePondClick} />
              ))}
            </MobileGrid>

            {filteredPonds.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant='body2' color='text.secondary'>
                  {t('no_ponds_found')}
                </Typography>
              </Box>
            )}
          </>
        )}

        {tabValue === 1 && (
          <Box>
            <Typography variant='h6' gutterBottom>
              {t('detailed_metrics')}
            </Typography>

            <ExpandableMobileCard
              title='Growth Performance'
              subtitle='Fish growth and development metrics'
              icon={<GrowthIcon />}
            >
              <Typography variant='body2'>Average growth rate: {metrics[2]?.value}</Typography>
            </ExpandableMobileCard>

            <Box sx={{ mt: 2 }}>
              <ExpandableMobileCard
                title='Water Quality'
                subtitle='Water parameters and quality scores'
                icon={<WaterIcon />}
              >
                <Typography variant='body2'>Overall quality score: {metrics[3]?.value}</Typography>
              </ExpandableMobileCard>
            </Box>
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <Typography variant='h6' gutterBottom>
              {t('alerts_notifications')}
            </Typography>

            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant='body2' color='text.secondary'>
                {t('no_active_alerts')}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MobileFarmOverview;
