import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Box,
  Chip,
  Container,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Insights as InsightsIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useApiData } from '../hooks/useApi';
import { 
  getSeasons, 
  getPonds, 
  getFeedInputs, 
  getGrowthSamplings, 
  getWaterQualityInputs 
} from '../services/api';
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
  Line
} from 'recharts';

const HistoricalInsightsPage = () => {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)); // 1 year ago
  const [endDate, setEndDate] = useState(new Date());
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [selectedPonds, setSelectedPonds] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Fetch seasons
  const { 
    data: seasonsData, 
    loading: seasonsLoading, 
    error: seasonsError
  } = useApiData(getSeasons, []);

  // Fetch ponds
  const { 
    data: pondsData, 
    loading: pondsLoading, 
    error: pondsError
  } = useApiData(getPonds, []);

  // Fetch all data for analysis
  const { 
    data: feedInputsData, 
    loading: feedInputsLoading, 
    error: feedInputsError
  } = useApiData(getFeedInputs, []);

  const { 
    data: growthSamplingsData, 
    loading: growthSamplingsLoading, 
    error: growthSamplingsError
  } = useApiData(getGrowthSamplings, []);

  const { 
    data: waterQualityInputsData, 
    loading: waterQualityInputsLoading, 
    error: waterQualityInputsError
  } = useApiData(getWaterQualityInputs, []);

  // Metrics options
  const metricOptions = [
    'Total Feed Consumption',
    'Average Daily Growth',
    'Feed Conversion Ratio (FCR)',
    'Survival Rate',
    'Average Water Temperature',
    'Average Dissolved Oxygen'
  ];

  // Loading and error states
  const isLoading = seasonsLoading || pondsLoading || feedInputsLoading || 
                   growthSamplingsLoading || waterQualityInputsLoading;
  const hasError = seasonsError || pondsError || feedInputsError || 
                   growthSamplingsError || waterQualityInputsError;

  // Filter data based on selected parameters
  const filterDataByPonds = (data, pondIds) => {
    if (!pondIds || pondIds.length === 0) return data;
    return data.filter(item => pondIds.includes(item.pondId));
  };

  const filterDataByDateRange = (data, startDate, endDate) => {
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // Calculate metrics
  const calculateMetrics = () => {
    const filteredFeedInputs = filterDataByDateRange(
      filterDataByPonds(feedInputsData ? feedInputsData.data : [], selectedPonds),
      startDate,
      endDate
    );
    
    const filteredGrowthSamplings = filterDataByDateRange(
      filterDataByPonds(growthSamplingsData || [], selectedPonds),
      startDate,
      endDate
    );
    
    const filteredWaterQualityInputs = filterDataByDateRange(
      filterDataByPonds(waterQualityInputsData ? waterQualityInputsData.data : [], selectedPonds),
      startDate,
      endDate
    );

    const metrics = {};

    // Total Feed Consumption
    if (selectedMetrics.includes('Total Feed Consumption')) {
      metrics.totalFeedConsumption = filteredFeedInputs.reduce((sum, entry) => sum + (entry.quantity || 0), 0);
    }

    // Average Daily Growth
    if (selectedMetrics.includes('Average Daily Growth') && filteredGrowthSamplings.length > 0) {
      const growthRates = filteredGrowthSamplings.map(entry => {
        if (entry.totalCount > 0) {
          return (entry.totalWeight * 1000) / entry.totalCount; // Avg weight in grams
        }
        return 0;
      });
      const avgGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
      metrics.averageDailyGrowth = avgGrowth;
    }

    // Feed Conversion Ratio (FCR)
    if (selectedMetrics.includes('Feed Conversion Ratio (FCR)') && filteredFeedInputs.length > 0) {
      const totalFeed = filteredFeedInputs.reduce((sum, entry) => sum + (entry.quantity || 0), 0);
      const totalWeightGain = filteredGrowthSamplings.reduce((sum, entry) => sum + (entry.totalWeight || 0), 0);
      metrics.feedConversionRatio = totalWeightGain > 0 ? totalFeed / totalWeightGain : 0;
    }

    // Average Water Temperature
    if (selectedMetrics.includes('Average Water Temperature') && filteredWaterQualityInputs.length > 0) {
      const totalTemp = filteredWaterQualityInputs.reduce((sum, entry) => sum + (entry.temperature || 0), 0);
      metrics.averageWaterTemperature = totalTemp / filteredWaterQualityInputs.length;
    }

    // Average Dissolved Oxygen
    if (selectedMetrics.includes('Average Dissolved Oxygen') && filteredWaterQualityInputs.length > 0) {
      const totalDO = filteredWaterQualityInputs.reduce((sum, entry) => sum + (entry.dissolvedOxygen || 0), 0);
      metrics.averageDissolvedOxygen = totalDO / filteredWaterQualityInputs.length;
    }

    return metrics;
  };

  // Generate chart data for visualization
  const generateChartData = () => {
    const filteredFeedInputs = filterDataByDateRange(
      filterDataByPonds(feedInputsData ? feedInputsData.data : [], selectedPonds),
      startDate,
      endDate
    );
    
    const filteredGrowthSamplings = filterDataByDateRange(
      filterDataByPonds(growthSamplingsData || [], selectedPonds),
      startDate,
      endDate
    );
    
    const filteredWaterQualityInputs = filterDataByDateRange(
      filterDataByPonds(waterQualityInputsData ? waterQualityInputsData.data : [], selectedPonds),
      startDate,
      endDate
    );

    // Group data by date for charts
    const feedChartData = {};
    filteredFeedInputs.forEach(entry => {
      const date = new Date(entry.date).toISOString().split('T')[0];
      if (!feedChartData[date]) {
        feedChartData[date] = 0;
      }
      feedChartData[date] += entry.quantity || 0;
    });

    const growthChartData = {};
    filteredGrowthSamplings.forEach(entry => {
      const date = new Date(entry.date).toISOString().split('T')[0];
      if (!growthChartData[date]) {
        growthChartData[date] = [];
      }
      if (entry.totalCount > 0) {
        growthChartData[date].push((entry.totalWeight * 1000) / entry.totalCount);
      }
    });

    const waterQualityChartData = {};
    filteredWaterQualityInputs.forEach(entry => {
      const date = new Date(entry.date).toISOString().split('T')[0];
      if (!waterQualityChartData[date]) {
        waterQualityChartData[date] = { temp: [], do: [] };
      }
      waterQualityChartData[date].temp.push(entry.temperature || 0);
      waterQualityChartData[date].do.push(entry.dissolvedOxygen || 0);
    });

    // Convert to array format for charts
    const feedChartArray = Object.entries(feedChartData).map(([date, quantity]) => ({
      date,
      quantity
    }));

    const growthChartArray = Object.entries(growthChartData).map(([date, weights]) => {
      const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
      return {
        date,
        avgWeight: isNaN(avgWeight) ? 0 : avgWeight
      };
    });

    const waterQualityChartArray = Object.entries(waterQualityChartData).map(([date, values]) => {
      const avgTemp = values.temp.reduce((sum, t) => sum + t, 0) / values.temp.length;
      const avgDO = values.do.reduce((sum, d) => sum + d, 0) / values.do.length;
      return {
        date,
        avgTemp: isNaN(avgTemp) ? 0 : avgTemp,
        avgDO: isNaN(avgDO) ? 0 : avgDO
      };
    });

    return {
      feedConsumption: feedChartArray,
      growth: growthChartArray,
      waterQuality: waterQualityChartArray
    };
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Calculate metrics
      const metrics = calculateMetrics();
      
      // Generate chart data
      const chartData = generateChartData();
      
      setReportData({
        metrics,
        chartData
      });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleExportData = () => {
    // Implementation for exporting data would go here
    console.log('Exporting data');
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (hasError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Error loading data: {seasonsError || pondsError || feedInputsError || 
                             growthSamplingsError || waterQualityInputsError}
        </Alert>
      </Container>
    );
  }

  // Use real data or fallback to mock data
  const seasonOptions = seasonsData || [];
  const pondOptions = pondsData ? pondsData.data : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Historical Insights
        </Typography>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExportData}>
          Export Report
        </Button>
      </Box>
      
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardHeader
          title="Analysis Parameters"
          subheader="Select data for historical analysis"
        />
        <CardContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="seasons-select-label">Seasons</InputLabel>
                  <Select
                    labelId="seasons-select-label"
                    multiple
                    value={selectedSeasons}
                    onChange={(e) => setSelectedSeasons(e.target.value)}
                    input={<OutlinedInput label="Seasons" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const season = seasonOptions.find(s => s._id === value || s.id === value);
                          return <Chip key={value} label={season?.name} size="small" />;
                        })}
                      </Box>
                    )}
                  >
                    {seasonOptions.map((season) => (
                      <MenuItem key={season._id || season.id} value={season._id || season.id}>
                        <Checkbox checked={selectedSeasons.indexOf(season._id || season.id) > -1} />
                        <ListItemText primary={season.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="ponds-select-label">Ponds</InputLabel>
                  <Select
                    labelId="ponds-select-label"
                    multiple
                    value={selectedPonds}
                    onChange={(e) => setSelectedPonds(e.target.value)}
                    input={<OutlinedInput label="Ponds" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const pond = pondOptions.find(p => p._id === value || p.id === value);
                          return <Chip key={value} label={pond?.name} size="small" />;
                        })}
                      </Box>
                    )}
                  >
                    {pondOptions.map((pond) => (
                      <MenuItem key={pond._id || pond.id} value={pond._id || pond.id}>
                        <Checkbox checked={selectedPonds.indexOf(pond._id || pond.id) > -1} />
                        <ListItemText primary={pond.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="metrics-select-label">Metrics</InputLabel>
                  <Select
                    labelId="metrics-select-label"
                    multiple
                    value={selectedMetrics}
                    onChange={(e) => setSelectedMetrics(e.target.value)}
                    input={<OutlinedInput label="Metrics" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {metricOptions.map((metric) => (
                      <MenuItem key={metric} value={metric}>
                        <Checkbox checked={selectedMetrics.indexOf(metric) > -1} />
                        <ListItemText primary={metric} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  startIcon={<InsightsIcon />} 
                  onClick={handleGenerateReport} 
                  size="large"
                  fullWidth
                  disabled={isGeneratingReport || selectedMetrics.length === 0}
                >
                  {isGeneratingReport ? 'Generating Report...' : 'Generate Historical Report'}
                </Button>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </CardContent>
      </Card>
      
      <Card elevation={3}>
        <CardHeader
          title="Analysis Results"
          subheader="Historical trends and comparisons"
        />
        <CardContent>
          {reportData ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Key Metrics
              </Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {selectedMetrics.includes('Total Feed Consumption') && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Total Feed Consumption
                        </Typography>
                        <Typography variant="h5" component="div">
                          {reportData.metrics.totalFeedConsumption?.toFixed(2) || '0.00'} kg
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                {selectedMetrics.includes('Average Daily Growth') && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Average Daily Growth
                        </Typography>
                        <Typography variant="h5" component="div">
                          {reportData.metrics.averageDailyGrowth?.toFixed(2) || '0.00'} g/day
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                {selectedMetrics.includes('Feed Conversion Ratio (FCR)') && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Feed Conversion Ratio (FCR)
                        </Typography>
                        <Typography variant="h5" component="div">
                          {reportData.metrics.feedConversionRatio?.toFixed(2) || '0.00'} :1
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                {selectedMetrics.includes('Average Water Temperature') && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Average Water Temperature
                        </Typography>
                        <Typography variant="h5" component="div">
                          {reportData.metrics.averageWaterTemperature?.toFixed(1) || '0.0'} °C
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                
                {selectedMetrics.includes('Average Dissolved Oxygen') && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          Average Dissolved Oxygen
                        </Typography>
                        <Typography variant="h5" component="div">
                          {reportData.metrics.averageDissolvedOxygen?.toFixed(2) || '0.00'} mg/L
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Trends Visualization
              </Typography>
              
              {selectedMetrics.includes('Total Feed Consumption') && reportData.chartData.feedConsumption.length > 0 && (
                <Box sx={{ height: 300, mb: 4 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.chartData.feedConsumption}
                      margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantity" name="Feed Consumption (kg)" fill="#007BFF" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
              
              {selectedMetrics.includes('Average Daily Growth') && reportData.chartData.growth.length > 0 && (
                <Box sx={{ height: 300, mb: 4 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={reportData.chartData.growth}
                      margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="avgWeight" name="Average Weight (g)" stroke="#28A745" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
              
              {selectedMetrics.includes('Average Water Temperature') && reportData.chartData.waterQuality.length > 0 && (
                <Box sx={{ height: 300, mb: 4 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={reportData.chartData.waterQuality}
                      margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="avgTemp" name="Avg Temperature (°C)" stroke="#FD7E14" activeDot={{ r: 8 }} />
                      {selectedMetrics.includes('Average Dissolved Oxygen') && (
                        <Line type="monotone" dataKey="avgDO" name="Avg Dissolved Oxygen (mg/L)" stroke="#007BFF" />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" paragraph>
                The historical analysis report will appear here once you generate it. 
                This report will include charts, graphs, and tables summarizing the 
                historical data based on your selections.
              </Typography>
              <Typography variant="body1" paragraph>
                Key insights will be highlighted to help you identify trends, 
                compare performance across different periods, and make data-driven 
                decisions for your shrimp farm operations.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <InsightsIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default HistoricalInsightsPage;