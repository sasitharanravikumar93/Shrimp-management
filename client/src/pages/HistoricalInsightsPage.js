import React, { useState } from 'react';
import { 
  Typography, 
  Grid, 
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
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  TextField
} from '@mui/material';
import { 
  Insights as InsightsIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { 
  useHistoricalSeasons,
  useHistoricalPondsForCurrentSeason,
  useHistoricalPondsBySeason,
  usePondComparisonCurrentSeason,
  usePondComparisonHistorical,
  useExportComparison
} from '../hooks/useHistoricalInsights';
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
  ComposedChart,
  Area
} from 'recharts';

const HistoricalInsightsPage = () => {
  // Mode selection: 'current' or 'historical'
  const [mode, setMode] = useState('current');
  
  // Current season mode states
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago
  const [endDate, setEndDate] = useState(new Date());
  const [selectedPondA, setSelectedPondA] = useState('');
  const [selectedPondB, setSelectedPondB] = useState('');
  
  // Historical mode states
  const [selectedSeason1, setSelectedSeason1] = useState('');
  const [selectedSeason2, setSelectedSeason2] = useState('');
  const [selectedPondA_H, setSelectedPondA_H] = useState('');
  const [selectedPondB_H, setSelectedPondB_H] = useState('');
  
  // Common states
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Metrics options for pond comparison
  const metricOptions = [
    { id: 'temperature', name: 'Water Temperature' },
    { id: 'ph', name: 'pH Level' },
    { id: 'dissolved_oxygen', name: 'Dissolved Oxygen' },
    { id: 'ammonia', name: 'Ammonia Level' },
    { id: 'feed_consumption', name: 'Feed Consumption' },
    { id: 'average_weight', name: 'Average Shrimp Weight' }
  ];

  // Fetch seasons for historical mode
  const { 
    data: historicalSeasonsData, 
    loading: historicalSeasonsLoading, 
    error: historicalSeasonsError
  } = useHistoricalSeasons();

  // Fetch ponds for current season mode
  const { 
    data: currentSeasonPondsData, 
    loading: currentSeasonPondsLoading, 
    error: currentSeasonPondsError
  } = useHistoricalPondsForCurrentSeason();

  // Fetch ponds for selected seasons in historical mode
  const { 
    data: season1PondsData, 
    loading: season1PondsLoading, 
    error: season1PondsError
  } = useHistoricalPondsBySeason(selectedSeason1, [selectedSeason1]);

  const { 
    data: season2PondsData, 
    loading: season2PondsLoading, 
    error: season2PondsError
  } = useHistoricalPondsBySeason(selectedSeason2, [selectedSeason2]);

  // Pond comparison mutations
  const { 
    mutate: compareCurrentMutate, 
    loading: compareCurrentLoading, 
    error: compareCurrentError
  } = usePondComparisonCurrentSeason();

  const { 
    mutate: compareHistoricalMutate, 
    loading: compareHistoricalLoading, 
    error: compareHistoricalError
  } = usePondComparisonHistorical();

  // Export mutation
  const { 
    mutate: exportMutate, 
    loading: exportLoading, 
    error: exportError
  } = useExportComparison();

  // Loading and error states
  const isLoading = historicalSeasonsLoading || currentSeasonPondsLoading || season1PondsLoading || season2PondsLoading;
  const hasError = historicalSeasonsError || currentSeasonPondsError || season1PondsError || season2PondsError;
  const isProcessing = compareCurrentLoading || compareHistoricalLoading;
  const hasComparisonError = compareCurrentError || compareHistoricalError;

  // Handle current season comparison
  const handleCompareCurrentSeason = async () => {
    if (!selectedPondA || !selectedPondB || selectedMetrics.length === 0) {
      return;
    }

    try {
      const comparisonResult = await compareCurrentMutate({
        pond_a_id: selectedPondA,
        pond_b_id: selectedPondB,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        metrics: selectedMetrics
      });
      
      if (comparisonResult.data) {
        setComparisonData(comparisonResult.data.comparison_data);
      }
    } catch (error) {
      console.error('Error comparing ponds:', error);
    }
  };

  // Handle historical comparison
  const handleCompareHistorical = async () => {
    if (!selectedPondA_H || !selectedPondB_H || selectedMetrics.length === 0) {
      return;
    }

    try {
      const comparisonResult = await compareHistoricalMutate({
        pond_a_id: selectedPondA_H,
        pond_b_id: selectedPondB_H,
        metrics: selectedMetrics
      });
      
      if (comparisonResult.data) {
        setComparisonData(comparisonResult.data.comparison_data);
      }
    } catch (error) {
      console.error('Error comparing ponds:', error);
    }
  };

  // Handle export data
  const handleExportData = async () => {
    try {
      let exportParams = {
        metrics: selectedMetrics,
        format: 'csv'
      };

      if (mode === 'current') {
        exportParams = {
          ...exportParams,
          pond_a_id: selectedPondA,
          pond_b_id: selectedPondB,
          mode: 'current',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        };
      } else {
        exportParams = {
          ...exportParams,
          pond_a_id: selectedPondA_H,
          pond_b_id: selectedPondB_H,
          mode: 'historical'
        };
      }

      await exportMutate(exportParams);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  // Format data for charts
  const formatChartData = (metricData) => {
    if (!metricData || !metricData.pond_a_data || !metricData.pond_b_data || !metricData.differences) {
      return [];
    }

    // Create a map for easier lookup
    const pondAMap = new Map(metricData.pond_a_data.map(item => [item.timestamp, item.value]));
    const pondBMap = new Map(metricData.pond_b_data.map(item => [item.timestamp, item.value]));
    const diffMap = new Map(metricData.differences.map(item => [item.timestamp, item.difference]));

    // Get all unique dates
    const allDates = new Set([
      ...metricData.pond_a_data.map(item => new Date(item.timestamp).toISOString().split('T')[0]),
      ...metricData.pond_b_data.map(item => new Date(item.timestamp).toISOString().split('T')[0])
    ]);

    // Format data for the chart
    return Array.from(allDates).map(date => {
      const timestamp = new Date(date).toISOString();
      return {
        date,
        pondA: pondAMap.get(timestamp) || null,
        pondB: pondBMap.get(timestamp) || null,
        difference: diffMap.get(timestamp) || null
      };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Get pond name by ID
  const getPondName = (pondId) => {
    if (mode === 'current') {
      if (!currentSeasonPondsData || !currentSeasonPondsData.ponds) return '';
      const pond = currentSeasonPondsData.ponds.find(p => p.id === pondId);
      return pond ? `${pond.name} (${pond.season?.name || 'Unknown Season'})` : '';
    } else {
      // For historical mode, we need to check both season's ponds
      if (season1PondsData && season1PondsData.ponds) {
        const pond = season1PondsData.ponds.find(p => p.id === pondId);
        if (pond) return `${pond.name} (${pond.season?.name || 'Unknown Season'})`;
      }
      if (season2PondsData && season2PondsData.ponds) {
        const pond = season2PondsData.ponds.find(p => p.id === pondId);
        if (pond) return `${pond.name} (${pond.season?.name || 'Unknown Season'})`;
      }
      return '';
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
          Error loading data: {historicalSeasonsError?.message || currentSeasonPondsError?.message || season1PondsError?.message || season2PondsError?.message || 'Unknown error occurred'}
        </Alert>
      </Container>
    );
  }

  if (hasComparisonError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Error comparing ponds: {compareCurrentError?.message || compareHistoricalError?.message || 'Unknown error occurred'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Historical Insights
        </Typography>
        {comparisonData && (
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportData} disabled={exportLoading}>
            {exportLoading ? 'Exporting...' : 'Export Data'}
          </Button>
        )}
      </Box>
      
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardHeader
          title="Comparison Mode"
          subheader="Select the type of comparison you want to perform"
        />
        <CardContent>
          <FormControl component="fieldset">
            <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value)}>
              <FormControlLabel value="current" control={<Radio />} label="Current Season Comparison" />
              <FormControlLabel value="historical" control={<Radio />} label="Historical Comparison" />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>
      
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardHeader
          title={mode === 'current' ? "Current Season Comparison" : "Historical Comparison"}
          subheader={mode === 'current' ? "Compare ponds within the current season" : "Compare ponds across different seasons"}
        />
        <CardContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              {mode === 'current' ? (
                // Current Season Mode
                <>
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
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="pond-a-select-label">Pond A</InputLabel>
                      <Select
                        labelId="pond-a-select-label"
                        value={selectedPondA}
                        onChange={(e) => setSelectedPondA(e.target.value)}
                        input={<OutlinedInput label="Pond A" />}
                      >
                        {currentSeasonPondsData?.ponds?.map((pond) => (
                          <MenuItem key={pond.id} value={pond.id}>
                            {pond.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="pond-b-select-label">Pond B</InputLabel>
                      <Select
                        labelId="pond-b-select-label"
                        value={selectedPondB}
                        onChange={(e) => setSelectedPondB(e.target.value)}
                        input={<OutlinedInput label="Pond B" />}
                      >
                        {currentSeasonPondsData?.ponds?.map((pond) => (
                          <MenuItem key={pond.id} value={pond.id}>
                            {pond.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              ) : (
                // Historical Mode
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="season-1-select-label">Season 1</InputLabel>
                      <Select
                        labelId="season-1-select-label"
                        value={selectedSeason1}
                        onChange={(e) => {
                          setSelectedSeason1(e.target.value);
                          setSelectedPondA_H(''); // Reset pond selection when season changes
                        }}
                        input={<OutlinedInput label="Season 1" />}
                      >
                        {historicalSeasonsData?.seasons?.map((season) => (
                          <MenuItem key={season.id} value={season.id}>
                            {season.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="pond-a-historical-select-label">Pond A</InputLabel>
                      <Select
                        labelId="pond-a-historical-select-label"
                        value={selectedPondA_H}
                        onChange={(e) => setSelectedPondA_H(e.target.value)}
                        input={<OutlinedInput label="Pond A" />}
                        disabled={!selectedSeason1}
                      >
                        {season1PondsData?.ponds?.map((pond) => (
                          <MenuItem key={pond.id} value={pond.id}>
                            {pond.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="season-2-select-label">Season 2</InputLabel>
                      <Select
                        labelId="season-2-select-label"
                        value={selectedSeason2}
                        onChange={(e) => {
                          setSelectedSeason2(e.target.value);
                          setSelectedPondB_H(''); // Reset pond selection when season changes
                        }}
                        input={<OutlinedInput label="Season 2" />}
                      >
                        {historicalSeasonsData?.seasons?.map((season) => (
                          <MenuItem key={season.id} value={season.id}>
                            {season.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="pond-b-historical-select-label">Pond B</InputLabel>
                      <Select
                        labelId="pond-b-historical-select-label"
                        value={selectedPondB_H}
                        onChange={(e) => setSelectedPondB_H(e.target.value)}
                        input={<OutlinedInput label="Pond B" />}
                        disabled={!selectedSeason2}
                      >
                        {season2PondsData?.ponds?.map((pond) => (
                          <MenuItem key={pond.id} value={pond.id}>
                            {pond.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="metrics-select-label">Metrics to Compare</InputLabel>
                  <Select
                    labelId="metrics-select-label"
                    multiple
                    value={selectedMetrics}
                    onChange={(e) => setSelectedMetrics(e.target.value)}
                    input={<OutlinedInput label="Metrics to Compare" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const metric = metricOptions.find(m => m.id === value);
                          return <Chip key={value} label={metric?.name || value} size="small" />;
                        })}
                      </Box>
                    )}
                  >
                    {metricOptions.map((metric) => (
                      <MenuItem key={metric.id} value={metric.id}>
                        <Checkbox checked={selectedMetrics.indexOf(metric.id) > -1} />
                        <ListItemText primary={metric.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  startIcon={<InsightsIcon />} 
                  onClick={mode === 'current' ? handleCompareCurrentSeason : handleCompareHistorical}
                  size="large"
                  fullWidth
                  disabled={
                    isProcessing || 
                    (mode === 'current' && (!selectedPondA || !selectedPondB || selectedPondA === selectedPondB)) ||
                    (mode === 'historical' && (!selectedPondA_H || !selectedPondB_H || selectedPondA_H === selectedPondB_H)) ||
                    selectedMetrics.length === 0
                  }
                >
                  {isProcessing ? 'Comparing Ponds...' : 'Compare Ponds'}
                </Button>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </CardContent>
      </Card>
      
      <Card elevation={3}>
        <CardHeader
          title="Comparison Results"
          subheader="Pond performance comparison"
        />
        <CardContent>
          {comparisonData ? (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {mode === 'current' 
                    ? `Comparing: ${getPondName(selectedPondA)} vs ${getPondName(selectedPondB)}`
                    : `Comparing: ${getPondName(selectedPondA_H)} vs ${getPondName(selectedPondB_H)}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {mode === 'current' 
                    ? `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                    : `Season 1: ${comparisonData.pond_a.season?.name || 'N/A'} | Season 2: ${comparisonData.pond_b.season?.name || 'N/A'}`}
                </Typography>
              </Box>
              
              <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                {selectedMetrics.map((metricId) => {
                  const metric = metricOptions.find(m => m.id === metricId);
                  return <Tab key={metricId} label={metric?.name || metricId} />;
                })}
              </Tabs>
              
              <Box sx={{ mt: 3 }}>
                {selectedMetrics.map((metricId, index) => {
                  const metric = metricOptions.find(m => m.id === metricId);
                  const metricData = comparisonData.metrics[metricId];
                  const chartData = formatChartData(metricData);
                  
                  return (
                    <Box key={metricId} hidden={activeTab !== index}>
                      {activeTab === index && (
                        <Paper elevation={0} sx={{ p: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            {metric?.name || metricId} Comparison
                          </Typography>
                          
                          {chartData.length > 0 ? (
                            <Box sx={{ height: 400 }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                  data={chartData}
                                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis 
                                    dataKey="date" 
                                    angle={-45} 
                                    textAnchor="end" 
                                    height={60}
                                    tick={{ fontSize: 12 }}
                                  />
                                  <YAxis />
                                  <Tooltip 
                                    formatter={(value) => [Number(value).toFixed(2), '']}
                                    labelFormatter={(label) => `Date: ${label}`}
                                  />
                                  <Legend />
                                  <Line 
                                    type="monotone" 
                                    dataKey="pondA" 
                                    name={mode === 'current' 
                                      ? getPondName(selectedPondA) 
                                      : getPondName(selectedPondA_H)} 
                                    stroke="#1f77b4" 
                                    strokeWidth={2}
                                    dot={{ r: 2 }}
                                    activeDot={{ r: 6 }}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="pondB" 
                                    name={mode === 'current' 
                                      ? getPondName(selectedPondB) 
                                      : getPondName(selectedPondB_H)} 
                                    stroke="#ff7f0e" 
                                    strokeWidth={2}
                                    dot={{ r: 2 }}
                                    activeDot={{ r: 6 }}
                                  />
                                  <Area 
                                    type="monotone" 
                                    dataKey="difference" 
                                    name="Difference" 
                                    fill="#d62728" 
                                    stroke="#d62728" 
                                    fillOpacity={0.2}
                                    strokeWidth={1}
                                  />
                                </ComposedChart>
                              </ResponsiveContainer>
                            </Box>
                          ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                              <Typography>No data available for this metric</Typography>
                            </Box>
                          )}
                          
                          {/* Summary statistics */}
                          {metricData && (
                            <Box sx={{ mt: 3 }}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                  <Card variant="outlined">
                                    <CardContent>
                                      <Typography variant="body2" color="text.secondary">
                                        Data Points (Pond A)
                                      </Typography>
                                      <Typography variant="h6">
                                        {metricData.pond_a_data?.length || 0}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Card variant="outlined">
                                    <CardContent>
                                      <Typography variant="body2" color="text.secondary">
                                        Data Points (Pond B)
                                      </Typography>
                                      <Typography variant="h6">
                                        {metricData.pond_b_data?.length || 0}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Card variant="outlined">
                                    <CardContent>
                                      <Typography variant="body2" color="text.secondary">
                                        Average Difference
                                      </Typography>
                                      <Typography variant="h6">
                                        {metricData.differences && metricData.differences.length > 0 
                                          ? (metricData.differences.reduce((sum, d) => sum + d.difference, 0) / metricData.differences.length).toFixed(2)
                                          : 'N/A'}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              </Grid>
                            </Box>
                          )}
                        </Paper>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <InsightsIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Compare Pond Performance
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Select the comparison mode, choose ponds, select metrics, and click "Compare Ponds" to see detailed performance comparisons.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default HistoricalInsightsPage;