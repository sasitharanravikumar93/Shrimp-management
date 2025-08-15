import React, { useState } from 'react';
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
  ToggleButtonGroup
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
import KPICard, { CircularKPICard } from '../components/KPICard';
import AlertBanner from '../components/AlertBanner';
import AquacultureTooltip from '../components/AquacultureTooltip';
import PredictiveInsight from '../components/PredictiveInsight';
import HealthScore from '../components/HealthScore';
import PondCard from '../components/PondCard';
import DataTrend from '../components/DataTrend';
import QuickActions from '../components/QuickActions';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('week');
  
  // Alert banner state
  const [showAlert, setShowAlert] = useState(true);
  
  // Placeholder data for ponds
  const ponds = [
    { id: 1, name: 'Pond A', status: 'Active', health: 'Good', progress: 75, healthScore: 85 },
    { id: 2, name: 'Pond B', status: 'Active', health: 'Fair', progress: 60, healthScore: 65 },
    { id: 3, name: 'Pond C', status: 'Inactive', health: 'N/A', progress: 0, healthScore: 0 },
    { id: 4, name: 'Pond D', status: 'Active', health: 'Good', progress: 90, healthScore: 92 },
    { id: 5, name: 'Pond E', status: 'Active', health: 'Poor', progress: 40, healthScore: 35 },
    { id: 6, name: 'Pond F', status: 'Active', health: 'Good', progress: 70, healthScore: 78 }
  ];

  // Filter ponds based on selection
  const filteredPonds = filter === 'all' 
    ? ponds 
    : ponds.filter(pond => pond.status.toLowerCase() === filter);

  // Summary data
  const summaryData = [
    { title: 'Total Ponds', value: 12, change: 2, changeText: '+2 from last week', icon: <PondIcon />, color: '#007BFF' },
    { title: 'Active Seasons', value: 3, change: 0, icon: <AgricultureIcon />, color: '#28A745' },
    { title: 'Avg. Growth Rate', value: 1.2, suffix: 'g/day', change: 0.1, changeText: '+0.1 from last week', icon: <GrowthIcon />, color: '#FD7E14' },
    { title: 'Feed Efficiency', value: 1.4, suffix: ':1', change: -0.1, changeText: '-0.1 from last week', icon: <RestaurantIcon />, color: '#007BFF' },
    { title: 'Water Quality', value: 85, suffix: '%', change: 5, changeText: '+5% from last week', icon: <WaterIcon />, color: '#28A745' },
    { title: 'Feed Consumption', value: 1250, suffix: 'kg', change: 12, changeText: '+12% from last week', icon: <RestaurantIcon />, color: '#FD7E14' }
  ];

  // Water quality data
  const waterQualityData = [
    { pond: 'Pond A', pH: 7.2, do: 5.5, temp: 28.5 },
    { pond: 'Pond B', pH: 6.8, do: 4.2, temp: 29.0 },
    { pond: 'Pond C', pH: 7.0, do: 5.0, temp: 28.0 },
    { pond: 'Pond D', pH: 7.5, do: 6.2, temp: 27.5 },
    { pond: 'Pond E', pH: 6.5, do: 3.8, temp: 30.0 },
    { pond: 'Pond F', pH: 7.1, do: 5.8, temp: 28.2 }
  ];

  // Feed consumption data
  const feedConsumptionData = [
    { date: 'Mon', amount: 120 },
    { date: 'Tue', amount: 140 },
    { date: 'Wed', amount: 110 },
    { date: 'Thu', amount: 150 },
    { date: 'Fri', amount: 130 },
    { date: 'Sat', amount: 160 },
    { date: 'Sun', amount: 140 }
  ];

  // Feed type distribution
  const feedTypeData = [
    { name: 'Standard Pellet', value: 45 },
    { name: 'High Protein', value: 30 },
    { name: 'Vitamin Enhanced', value: 15 },
    { name: 'Special Formula', value: 10 }
  ];
  
  const COLORS = ['#007BFF', '#28A745', '#FD7E14', '#DC3545'];

  // Handle filter change
  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  return (
    <Container maxWidth={false} sx={{ mt: 2, mb: 4 }}>
      {/* Alert Banner */}
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
          <Typography variant="h4" component="h1" gutterBottom>
            Farm Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's what's happening with your shrimp farm today.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<InsightsIcon />}
          size="large"
        >
          Generate Report
        </Button>
      </Box>
      
      {/* KPI Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
            />
          </Grid>
        ))}
      </Grid>
      
      {/* Key Metrics Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Water Quality Chart */}
        <Grid item xs={12} md={6}>
          <DataTrend
            title="Water Quality Trend"
            data={waterQualityData.map(item => ({
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
            title="Feed Consumption Trend"
            data={feedConsumptionData}
            dataKey="amount"
            color="#007BFF"
            unit="kg"
            trend="auto"
          />
        </Grid>
      </Grid>
      
      {/* Pond Management Section */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Individual Pond Management
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ToggleButtonGroup
                size="small"
                value={filter}
                exclusive
                onChange={handleFilterChange}
                sx={{ height: 36 }}
              >
                <ToggleButton value="all">All Ponds</ToggleButton>
                <ToggleButton value="active">Active</ToggleButton>
                <ToggleButton value="inactive">Inactive</ToggleButton>
              </ToggleButtonGroup>
              <Button 
                variant="outlined" 
                startIcon={<FilterIcon />}
                size="small"
              >
                More Filters
              </Button>
            </Box>
          </Box>
          
          {/* Quick Actions */}
          <Box sx={{ mb: 3 }}>
            <QuickActions 
              onActionClick={(action) => {
                console.log('Quick action clicked:', action);
                // In a real app, this would navigate to the appropriate page or open a modal
              }}
            />
          </Box>
          
          <Grid container spacing={3}>
            {filteredPonds.map((pond) => (
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
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button variant="outlined" startIcon={<CalendarIcon />}>
              Schedule Feeding for All Active Ponds
            </Button>
          </Box>
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
            Based on current data trends, here are our recommendations:
          </Typography>
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

// Icon components for summary cards
const CheckCircleIcon = () => <CheckIcon />;

export default DashboardPage;