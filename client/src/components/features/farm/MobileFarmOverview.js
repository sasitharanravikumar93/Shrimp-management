/**
 * Mobile-Optimized Farm Overview Component
 * Responsive version of FarmOverview designed for mobile devices
 */

import {
  Agriculture as AgricultureIcon,
  TrendingUp as GrowthIcon,
  WaterDrop as WaterIcon,
  Waves as PondIcon
} from '@mui/icons-material';
import {
  Typography,
  Box,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSeason } from '../../../context/SeasonContext';
import { useApiData } from '../../../hooks/useApi';
import { getPonds, getWaterQualityInputs, getFeedInputs } from '../../../services/api';

import { MobileGrid, MobileKPICard } from './MobileOptimized';

// Default values for calculations
const DEFAULT_GROWTH_RATE = 1.2;
const DEFAULT_WATER_QUALITY_SCORE = 85;
const SKELETON_CARD_COUNT = 6;

const MobileFarmOverview = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [filter, setFilter] = useState('all');
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
  }, [filteredPonds, t, theme.palette]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (pondsLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <MobileGrid columns={{ xs: 2 }} spacing={2}>
          {[...Array(SKELETON_CARD_COUNT)].map((_, index) => (
            <Box key={`skeleton-${index}`} sx={{ height: 120, bgcolor: 'grey.200', borderRadius: 1 }} />
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
            <MobileKPICard key={`metric-${index}`} {...metric} compact />
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
      {/* Rest of the component... */}
    </Box>
  );
};

export default MobileFarmOverview;