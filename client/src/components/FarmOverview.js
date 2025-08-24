import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { 
  Typography, 
  Grid, 
  Box, 
  Button, 
  Container,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Agriculture as AgricultureIcon,
  WaterDrop as WaterIcon,
  Restaurant as RestaurantIcon,
  TrendingUp as GrowthIcon,
  Waves as PondIcon,
  Insights as InsightsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useSeason } from '../context/SeasonContext';
import { useApiData } from '../hooks/useApi';
import { getPonds } from '../services/api';
import KPICard, { CircularKPICard } from './KPICard';
import AlertBanner from './AlertBanner';
import AquacultureTooltip from './AquacultureTooltip';
import PredictiveInsight from './PredictiveInsight';
import HealthScore from './HealthScore';
import PondCard from './PondCard';
import DataTrend from './DataTrend';
import QuickActions from './QuickActions';

const FarmOverview = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('week');
  const { selectedSeason } = useSeason();

  
  
  // Alert banner state
  const [showAlert, setShowAlert] = useState(true);
  
  // Fetch all ponds data with caching
  const { 
    data: allPondsData, 
    loading: allPondsLoading, 
    error: allPondsError,
    refetch: refetchPonds
  } = useApiData(getPonds, [], 'ponds');

  // Debugging logs
  useEffect(() => {
    console.log('FarmOverview - selectedSeason:', selectedSeason);
  }, [selectedSeason]);

  useEffect(() => {
    console.log('FarmOverview - allPondsData:', allPondsData);
  }, [allPondsData]);

  
  
  

  // Filter ponds based on selection and season
  const filteredPonds = useMemo(() => {
    const ponds = allPondsData?.data || [];
    
    // First filter by season if a season is selected
    let seasonFilteredPonds = ponds;
    if (selectedSeason) {
          let seasonFilteredPonds = ponds;
    if (selectedSeason) {
      seasonFilteredPonds = ponds.filter(pond => {
        console.log('Pond seasonId._id:', pond.seasonId?._id, 'Selected seasonId._id:', selectedSeason?._id);
        return pond.seasonId && pond.seasonId._id === selectedSeason._id;
      });
    }
    }
    
    // Then filter by status
    if (filter === 'all') {
      return seasonFilteredPonds;
    } else {
      return seasonFilteredPonds.filter(pond => 
        pond.status?.toLowerCase() === filter
      );
    }
  }, [allPondsData, filter, selectedSeason]);

  

  // Calculate summary data based on real data
  const calculateSummaryData = () => {
    if (!filteredPonds) return [];
    
    const totalPonds = filteredPonds.length;
    const activePonds = filteredPonds.filter(pond => pond.status === 'Active').length;
    
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
        value: 1.2, 
        suffix: t('g_per_day'), 
        change: 0.1, 
        changeText: t('plus_point_one_from_last_week'), 
        icon: <GrowthIcon />, 
        color: '#FD7E14' 
      },
      { 
        title: t('feed_efficiency'), 
        value: 1.4, 
        suffix: t('colon_one'), 
        change: -0.1, 
        changeText: t('minus_point_one_from_last_week'), 
        icon: <RestaurantIcon />, 
        color: '#007BFF' 
      },
      { 
        title: t('water_quality'), 
        value: 85, 
        suffix: t('percentage'), 
        change: 5, 
        changeText: t('plus_five_percent_from_last_week'), 
        icon: <WaterIcon />, 
        color: '#28A745' 
      },
      { 
        title: t('feed_consumption'), 
        value: 1250, 
        suffix: t('kg'), 
        change: 12, 
        changeText: t('plus_twelve_percent_from_last_week'), 
        icon: <RestaurantIcon />, 
        color: '#FD7E14' 
      }
    ];
  };

  const summaryData = useMemo(() => calculateSummaryData(), [filteredPonds]);

  // Transform pond data for PondCard component
  const transformedPondData = useMemo(() => {
    return filteredPonds.map(pond => ({
      id: pond._id || pond.id,
      name: pond.name,
      status: pond.status || 'Active', // Default to Active if not set
      health: pond.health || 'Good', // Default to Good if not set
      progress: pond.progress || Math.floor(Math.random() * 100), // Generate random if not set
      healthScore: pond.healthScore || Math.floor(Math.random() * 100) // Generate random if not set
    }));
  }, [filteredPonds]);

  // Handle filter change
  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  // Loading and error states
  const isLoading = allPondsLoading;
  const hasError = allPondsError;

  if (isLoading) {
    return (
      <Container maxWidth={false} sx={{ mt: 2, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (hasError) {
    return (
      <Container maxWidth={false} sx={{ mt: 2, mb: 4 }}>
        <Alert severity="error">
          Error loading dashboard data: {allPondsError.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ mt: 2, mb: 4 }}>
      {/* Alert Banner */}
      {showAlert && (
        <AlertBanner 
          severity="warning"
          message={t('water_quality_alert')}
          dismissible
          onClose={() => setShowAlert(false)}
        />
      )}
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('farm_dashboard')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('welcome_back')}
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<InsightsIcon />}
          size="large"
        >
          {t('generate_report')}
        </Button>
      </Box>
      
      {/* KPI Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryData.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
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
      
      {/* Key Metrics Charts - Using placeholder data for now */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Water Quality Chart */}
        <Grid item xs={12} md={6}>
          <DataTrend
            title={t('water_quality_trend')}
            data={[
              { pond: 'Pond A', pH: 7.2, do: 5.5, temp: 28.5 },
              { pond: 'Pond B', pH: 6.8, do: 4.2, temp: 29.0 },
              { pond: 'Pond C', pH: 7.0, do: 5.0, temp: 28.0 },
              { pond: 'Pond D', pH: 7.5, do: 6.2, temp: 27.5 },
              { pond: 'Pond E', pH: 6.5, do: 3.8, temp: 30.0 },
              { pond: 'Pond F', pH: 7.1, do: 5.8, temp: 28.2 }
            ].map(item => ({
              date: item.pond,
              pH: item.pH,
              do: item.do,
              temp: item.temp
            }))}
            dataKey="do"
            color="#28A745"
            unit="mg/L"
            trend="auto"
          />
        </Grid>
        
        {/* Feed Consumption Chart */}
        <Grid item xs={12} md={6}>
          <DataTrend
            title={t('feed_consumption_trend')}
            data={[
              { date: 'Mon', amount: 120 },
              { date: 'Tue', amount: 140 },
              { date: 'Wed', amount: 110 },
              { date: 'Thu', amount: 150 },
              { date: 'Fri', amount: 130 },
              { date: 'Sat', amount: 160 },
              { date: 'Sun', amount: 140 }
            ]}
            dataKey="amount"
            color="#007BFF"
            unit="kg"
            trend="auto"
          />
        </Grid>
      </Grid>
      
      {/* Pond Selection Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('pond_overview')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ToggleButtonGroup
              size="small"
              value={filter}
              exclusive
              onChange={handleFilterChange}
              sx={{ height: 36 }}
            >
              <ToggleButton value="all">{t('all_ponds')}</ToggleButton>
              <ToggleButton value="active">{t('active')}</ToggleButton>
              <ToggleButton value="inactive">{t('inactive')}</ToggleButton>
            </ToggleButtonGroup>
            <Button 
              variant="outlined" 
              startIcon={<FilterIcon />}
              size="small"
            >
              {t('more_filters')}
            </Button>
          </Box>
        </Box>
        
        
        
        <Grid container spacing={3}>
          {transformedPondData.map((pond) => (
            <Grid item xs={12} sm={6} lg={4} key={pond.id}>
              <PondCard 
                pond={pond}
                onClick={() => navigate(`/dashboard/${pond.id}`)}
                onManageClick={() => navigate(`/dashboard/${pond.id}`)}
                onTimelineClick={() => console.log('View timeline for', pond.name)}
              />
            </Grid>
          ))}
        </Grid>
        
        
      </Box>
      
      
    </Container>
  );
};

// Icon components for summary cards
const CheckCircleIcon = () => <CheckIcon />;

export default FarmOverview;
