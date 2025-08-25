/**
 * Mobile-Optimized Farm Overview Component
 * Responsive version of FarmOverview designed for mobile devices
 */

import {
  Agriculture as AgricultureIcon,
  WaterDrop as WaterIcon,
  Restaurant as RestaurantIcon,
  TrendingUp as GrowthIcon,
  Waves as PondIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Stack,
  IconButton,
  Collapse,
  useTheme,
  useMediaQuery
} from '@mui/material';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSeason } from '../../context/SeasonContext';
import { useApiData } from '../../hooks/useApi';
import { getPonds, getWaterQualityInputs, getFeedInputs } from '../../services/api';
import { useResponsive, useMobileDetection } from '../../utils/responsiveUtils';
import { SpinnerLoader, SkeletonCard } from '../LoadingComponents';
import { StatusChip, MetricCard } from '../ui/StyledComponents';

import { ExpandableMobileCard, MobileGrid, TouchButton } from './MobileOptimized';

// Mobile KPI Card
const MobileKPICard = ({ title, value, icon, color, change, compact = false }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: compact ? 100 : 120,
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`
      }}
    >
      <CardContent
        sx={{ p: compact ? 1.5 : 2, height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              color,
              mr: 1,
              fontSize: compact ? '1.2rem' : '1.5rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {icon}
          </Box>
          <Typography
            variant={compact ? 'caption' : 'body2'}
            color='text.secondary'
            sx={{
              fontSize: compact ? '0.7rem' : '0.75rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {title}
          </Typography>
        </Box>

        <Typography
          variant={compact ? 'h6' : 'h5'}
          sx={{
            fontWeight: 700,
            color,
            mb: 'auto',
            lineHeight: 1.1
          }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>

        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant='caption'
              sx={{
                color: change >= 0 ? 'success.main' : 'error.main',
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            >
              {change >= 0 ? '+' : ''}
              {change}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Mobile Pond Card
const MobilePondCard = ({ pond, onPondClick }) => {
  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:active': {
          transform: 'scale(0.98)'
        }
      }}
      onClick={() => onPondClick(pond._id)}
    >
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}
        >
          <Typography variant='subtitle1' fontWeight='medium' sx={{ fontSize: '1rem' }}>
            {pond.name}
          </Typography>
          <StatusChip
            label={pond.status || 'Unknown'}
            status={getStatusColor(pond.status)}
            size='small'
          />
        </Box>

        <Stack direction='row' spacing={1} sx={{ mb: 1 }}>
          <Chip
            label={`${pond.size}m²`}
            size='small'
            variant='outlined'
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
          <Chip
            label={`Cap: ${pond.capacity}`}
            size='small'
            variant='outlined'
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        </Stack>

        {pond.waterQualityScore && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <WaterIcon sx={{ fontSize: '0.9rem', color: 'info.main' }} />
            <Typography variant='caption' color='text.secondary'>
              Quality: {pond.waterQualityScore}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const MobileFarmOverview = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isMobile } = useMobileDetection();
  const [tabValue, setTabValue] = useState(0);
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const { selectedSeason } = useSeason();

  // API calls
  const {
    data: allPondsData,
    loading: pondsLoading,
    error: pondsError
  } = useApiData(getPonds, [], 'ponds');

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
        ? filteredPonds.reduce((sum, pond) => sum + (pond.growthRate || 1.2), 0) /
          filteredPonds.length
        : 1.2;

    const feedEfficiency =
      filteredPonds.length > 0
        ? filteredPonds.reduce((sum, pond) => sum + (pond.feedEfficiency || 1.4), 0) /
          filteredPonds.length
        : 1.4;

    const waterQuality =
      filteredPonds.length > 0
        ? filteredPonds.reduce((sum, pond) => sum + (pond.waterQualityScore || 85), 0) /
          filteredPonds.length
        : 85;

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

  const handlePondClick = pondId => {
    // Navigate to pond detail
    console.log('Navigate to pond:', pondId);
  };

  if (!isMobile) {
    // Return desktop version or null
    return null;
  }

  if (pondsLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <MobileGrid columns={{ xs: 2 }} spacing={2}>
          {[...Array(4)].map((_, index) => (
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
