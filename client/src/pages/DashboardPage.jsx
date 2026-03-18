import React, { useState, useMemo } from 'react';
import { 
  Typography, 
  Grid, 
  Box, 
  Button, 
  Container,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
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
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSeason } from '../context/SeasonContext';
import { useApiData } from '../hooks/useApi';
import { getPonds } from '../services/api';
import KPICard from '../components/KPICard';
import AlertBanner from '../components/AlertBanner';
import PredictiveInsight from '../components/PredictiveInsight';
import PondCard from '../components/PondCard';
import DataTrend from '../components/DataTrend';
import QuickActions from '../components/QuickActions';
import FinancialOverviewWidget from '../components/FinancialOverviewWidget';
import ProfitLossWidget from '../components/ProfitLossWidget';
import LowStockAlert from '../components/LowStockAlert';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

// Section header component
const SectionHeader = ({ label, action }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 1 }}>
    <Typography 
      variant="overline" 
      sx={{ 
        fontSize: '0.7rem', 
        fontWeight: 700, 
        letterSpacing: '0.1em',
        color: 'text.secondary',
      }}
    >
      {label}
    </Typography>
    {action && action}
  </Box>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const { selectedSeason } = useSeason();
  const [showAlert, setShowAlert] = useState(true);
  
  const { 
    data: allPondsData, 
    loading: allPondsLoading, 
    error: allPondsError,
  } = useApiData(getPonds, [], 'ponds');

  const filteredPonds = useMemo(() => {
    if (!allPondsData) return [];
    let seasonFilteredPonds = allPondsData;
    if (selectedSeason) {
      seasonFilteredPonds = allPondsData.filter(pond => 
        pond.seasonId === selectedSeason.id
      );
    }
    if (filter === 'all') return seasonFilteredPonds;
    return seasonFilteredPonds.filter(pond => 
      pond.status?.toLowerCase() === filter
    );
  }, [allPondsData, filter, selectedSeason]);

  const summaryData = useMemo(() => {
    if (!filteredPonds) return [];
    const totalPonds = filteredPonds.length;
    const activePonds = filteredPonds.filter(pond => pond.status === 'Active').length;
    return [
      { title: 'Total Ponds', value: totalPonds, change: 0, icon: <PondIcon />, color: '#2563EB' },
      { title: 'Active Ponds', value: activePonds, change: 0, icon: <AgricultureIcon />, color: '#10B981' },
      { title: 'Avg. Growth Rate', value: 1.2, suffix: 'g/day', change: 0.1, changeText: '+0.1 from last week', icon: <GrowthIcon />, color: '#F59E0B' },
      { title: 'Feed Efficiency', value: 1.4, suffix: ':1', change: -0.1, changeText: '-0.1 from last week', icon: <RestaurantIcon />, color: '#2563EB' },
      { title: 'Water Quality', value: 85, suffix: '%', change: 5, changeText: '+5% from last week', icon: <WaterIcon />, color: '#10B981' },
      { title: 'Feed Consumption', value: 1250, suffix: 'kg', change: 12, changeText: '+12% from last week', icon: <RestaurantIcon />, color: '#7C3AED' },
    ];
  }, [filteredPonds]);

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

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) setFilter(newFilter);
  };

  // Skeleton loading
  if (allPondsLoading) {
    return (
      <Container maxWidth={false} sx={{ mt: 2, mb: 4 }}>
        <DashboardSkeleton />
      </Container>
    );
  }

  if (allPondsError) {
    return (
      <Container maxWidth={false} sx={{ mt: 2, mb: 4 }}>
        <Alert severity="error">Error loading dashboard data: {allPondsError}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ mt: 1, mb: 4 }}>
      {/* Alert Banner */}
      <LowStockAlert />
      {showAlert && (
        <AlertBanner 
          severity="warning"
          message="Water quality alert in 2 ponds. Please check Pond B and Pond E immediately."
          dismissible
          onClose={() => setShowAlert(false)}
        />
      )}
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Farm Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Welcome back! Here's what's happening with your shrimp farm today.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<InsightsIcon />}
          size="large"
          sx={{ px: 3 }}
        >
          Generate Report
        </Button>
      </Box>
      
      {/* KEY METRICS Section */}
      <SectionHeader label="KEY METRICS" />
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
      <SectionHeader label="QUICK ACTIONS" />
      <Box sx={{ mb: 3 }}>
        <QuickActions 
          onActionClick={(action) => {
            console.log('Quick action clicked:', action);
          }}
        />
      </Box>
      
      {/* FINANCIAL OVERVIEW & TRENDS Section */}
      <SectionHeader label="FINANCIAL OVERVIEW" />
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <FinancialOverviewWidget />
        </Grid>
        <Grid item xs={12} lg={4}>
          <ProfitLossWidget />
        </Grid>
      </Grid>

      {/* DATA TRENDS Section */}
      <SectionHeader label="DATA TRENDS" />
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <DataTrend
            title="Water Quality Trend"
            data={[
              { date: 'Pond A', do: 5.5 },
              { date: 'Pond B', do: 4.2 },
              { date: 'Pond C', do: 5.0 },
              { date: 'Pond D', do: 6.2 },
              { date: 'Pond E', do: 3.8 },
              { date: 'Pond F', do: 5.8 },
            ]}
            dataKey="do"
            color="#10B981"
            unit="mg/L"
            trend="auto"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DataTrend
            title="Feed Consumption Trend"
            data={[
              { date: 'Mon', amount: 120 },
              { date: 'Tue', amount: 140 },
              { date: 'Wed', amount: 110 },
              { date: 'Thu', amount: 150 },
              { date: 'Fri', amount: 130 },
              { date: 'Sat', amount: 160 },
              { date: 'Sun', amount: 140 },
            ]}
            dataKey="amount"
            color="#2563EB"
            unit="kg"
            trend="auto"
          />
        </Grid>
      </Grid>
      
      {/* POND STATUS Section */}
      <SectionHeader 
        label="POND STATUS" 
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ToggleButtonGroup
              size="small"
              value={filter}
              exclusive
              onChange={handleFilterChange}
              sx={{ height: 32 }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="active">Active</ToggleButton>
              <ToggleButton value="inactive">Inactive</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        }
      />
      <Card elevation={0} sx={{ mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          {transformedPondData.length === 0 ? (
            <EmptyState
              icon="pond"
              title="No ponds configured"
              description="Add your first pond to start tracking data and managing your farm."
              actionLabel="Go to Admin"
              onAction={() => navigate('/admin')}
            />
          ) : (
            <Grid container spacing={2.5}>
              {transformedPondData.map((pond) => (
                <Grid item xs={12} sm={6} lg={4} key={pond.id}>
                  <PondCard 
                    pond={pond}
                    onClick={() => navigate(`/pond/${pond.id}`)}
                    onManageClick={() => navigate(`/pond/${pond.id}`)}
                    onTimelineClick={() => console.log('View timeline for', pond.name)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
      
      {/* INSIGHTS Section */}
      <SectionHeader label="AI INSIGHTS & RECOMMENDATIONS" />
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InsightsIcon sx={{ fontSize: 24, mr: 1, color: 'info.main' }} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Based on current data trends, here are our recommendations:
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <PredictiveInsight
                title="Water Quality Alert"
                insight="Pond B and Pond E have low dissolved oxygen levels. Recommend immediate aeration."
                confidence={85}
                icon={<WarningIcon />}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <PredictiveInsight
                title="Growth Optimization"
                insight="Increase feeding frequency for Pond A and Pond D to optimize growth rate."
                confidence={78}
                icon={<TrendingUpIcon />}
                color="info"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <PredictiveInsight
                title="Harvest Projection"
                insight="Pond D is projected to reach harvest size in 28 days based on current growth rate."
                confidence={92}
                projectedDate="July 15, 2023"
                icon={<CalendarIcon />}
                color="success"
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button variant="outlined" size="small">
              View Detailed Analysis
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DashboardPage;