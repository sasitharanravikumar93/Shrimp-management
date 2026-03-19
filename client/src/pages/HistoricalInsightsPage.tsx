import { Insights as InsightsIcon, Download as DownloadIcon } from '@mui/icons-material';
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
  TextField
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Area,
  BarChart,
  Bar
} from 'recharts';

import {
  useHistoricalSeasons,
  useHistoricalPondsForCurrentSeason,
  useHistoricalPondsBySeason,
  usePondComparisonCurrentSeason,
  usePondComparisonHistorical,
  useExportComparison
} from '../hooks/useHistoricalInsights';

const HistoricalInsightsPage: React.FC = () => {
  const { t } = useTranslation();

  // Mode selection: 'current' or 'historical'
  const [mode, setMode] = useState('current');

  // Current season mode states
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [selectedPondA, setSelectedPondA] = useState('');
  const [selectedPondB, setSelectedPondB] = useState('');

  // Historical mode states
  const [selectedSeason1, setSelectedSeason1] = useState('');
  const [selectedSeason2, setSelectedSeason2] = useState('');
  const [selectedPondA_H, setSelectedPondA_H] = useState('');
  const [selectedPondB_H, setSelectedPondB_H] = useState('');

  // Common states
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Metrics options for pond comparison
  const metricOptions = [
    { id: 'temperature', name: t('water_temperature') },
    { id: 'ph', name: t('ph_level') },
    { id: 'dissolved_oxygen', name: t('dissolved_oxygen') },
    { id: 'ammonia', name: t('ammonia_level') },
    { id: 'feed_consumption', name: t('feed_consumption') },
    { id: 'average_weight', name: t('average_shrimp_weight') }
  ];

  // Fetch data hooks
  const { data: historicalSeasonsData, loading: historicalSeasonsLoading, error: historicalSeasonsError } = useHistoricalSeasons();
  const { data: currentSeasonPondsData, loading: currentSeasonPondsLoading, error: currentSeasonPondsError } = useHistoricalPondsForCurrentSeason();
  const { data: season1PondsData, loading: season1PondsLoading, error: season1PondsError } = useHistoricalPondsBySeason(selectedSeason1);
  const { data: season2PondsData, loading: season2PondsLoading, error: season2PondsError } = useHistoricalPondsBySeason(selectedSeason2);

  const { mutate: compareCurrentMutate, loading: compareCurrentLoading, error: compareCurrentError } = usePondComparisonCurrentSeason();
  const { mutate: compareHistoricalMutate, loading: compareHistoricalLoading, error: compareHistoricalError } = usePondComparisonHistorical();
  const { mutate: exportMutate, loading: exportLoading } = useExportComparison();

  const isLoading = historicalSeasonsLoading || currentSeasonPondsLoading || season1PondsLoading || season2PondsLoading;
  const isProcessing = compareCurrentLoading || compareHistoricalLoading;

  const handleCompare = async () => {
    try {
      if (mode === 'current') {
        if (!startDate || !endDate || !selectedPondA || !selectedPondB) return;
        const result = await (compareCurrentMutate as any)({
          pond_a_id: selectedPondA,
          pond_b_id: selectedPondB,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          metrics: selectedMetrics
        });
        if (result?.data) setComparisonData(result.data.comparison_data);
      } else {
        if (!selectedPondA_H || !selectedPondB_H) return;
        const result = await (compareHistoricalMutate as any)({
          pond_a_id: selectedPondA_H,
          pond_b_id: selectedPondB_H,
          metrics: selectedMetrics
        });
        if (result?.data) setComparisonData(result.data.comparison_data);
      }
    } catch (err) {
      console.error('Comparison error:', err);
    }
  };

  const handleExportData = async () => {
    try {
      const params: any = { metrics: selectedMetrics, format: 'csv' };
      if (mode === 'current') {
        Object.assign(params, { pond_a_id: selectedPondA, pond_b_id: selectedPondB, mode: 'current', start_date: startDate?.toISOString().split('T')[0], end_date: endDate?.toISOString().split('T')[0] });
      } else {
        Object.assign(params, { pond_a_id: selectedPondA_H, pond_b_id: selectedPondB_H, mode: 'historical' });
      }
      await (exportMutate as any)(params);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const getPondName = (pondId: string) => {
    if (mode === 'current') {
      const pond = (currentSeasonPondsData as any)?.ponds?.find((p: any) => p.id === pondId);
      return pond ? `${pond.name} (${pond.season?.name || 'Unknown'})` : '';
    }
    const pond1 = (season1PondsData as any)?.ponds?.find((p: any) => p.id === pondId);
    if (pond1) return `${pond1.name} (${pond1.season?.name || 'Unknown'})`;
    const pond2 = (season2PondsData as any)?.ponds?.find((p: any) => p.id === pondId);
    if (pond2) return `${pond2.name} (${pond2.season?.name || 'Unknown'})`;
    return '';
  };

  const formatChartData = (metricData: any) => {
    if (!metricData || !metricData.pond_a_data || !metricData.pond_b_data) return [];
    
    if (mode === 'historical') {
      const allDays = new Set<number>();
      const pondAMap = new Map();
      const pondBMap = new Map();
      
      metricData.pond_a_data.forEach((item: any) => {
        const day = Math.floor((new Date(item.timestamp).getTime() - new Date(comparisonData.pond_a.season.startDate).getTime()) / (1000*3600*24)) + 1;
        allDays.add(day);
        pondAMap.set(day, item.value);
      });
      metricData.pond_b_data.forEach((item: any) => {
        const day = Math.floor((new Date(item.timestamp).getTime() - new Date(comparisonData.pond_b.season.startDate).getTime()) / (1000*3600*24)) + 1;
        allDays.add(day);
        pondBMap.set(day, item.value);
      });
      
      return Array.from(allDays).sort((a,b) => a-b).map(day => ({
        label: `${t('day')} ${day}`,
        pondA: pondAMap.get(day) ?? null,
        pondB: pondBMap.get(day) ?? null
      }));
    } else {
      const allDates = new Set<string>();
      const pondAMap = new Map();
      const pondBMap = new Map();
      
      metricData.pond_a_data.forEach((item: any) => {
        const date = item.timestamp.split('T')[0];
        allDates.add(date);
        pondAMap.set(date, item.value);
      });
      metricData.pond_b_data.forEach((item: any) => {
        const date = item.timestamp.split('T')[0];
        allDates.add(date);
        pondBMap.set(date, item.value);
      });
      
      return Array.from(allDates).sort().map(date => ({
        label: date,
        pondA: pondAMap.get(date) ?? null,
        pondB: pondBMap.get(date) ?? null
      }));
    }
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          {t('historical_insights')}
        </Typography>
        {comparisonData && (
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportData} disabled={exportLoading}>
            {t('export_data')}
          </Button>
        )}
      </Box>

      <Card elevation={3} sx={{ mb: 4 }}>
        <CardHeader title={t('comparison_mode')} />
        <CardContent>
          <RadioGroup row value={mode} onChange={(e) => { setMode(e.target.value); setComparisonData(null); }}>
            <FormControlLabel value="current" control={<Radio />} label={t('current_season_comparison')} />
            <FormControlLabel value="historical" control={<Radio />} label={t('historical_comparison')} />
          </RadioGroup>
        </CardContent>
      </Card>

      <Card elevation={3} sx={{ mb: 4 }}>
        <CardHeader title={mode === 'current' ? t('current_season_comparison') : t('historical_comparison')} />
        <CardContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              {mode === 'current' ? (
                <>
                  <Grid item xs={12} md={6}>
                    <DatePicker label={t('start_date')} value={startDate} onChange={setStartDate} slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker label={t('end_date')} value={endDate} onChange={setEndDate} slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('pond_a')}</InputLabel>
                      <Select value={selectedPondA} onChange={(e) => setSelectedPondA(e.target.value)} label={t('pond_a')}>
                        {(currentSeasonPondsData as any)?.ponds?.map((p: any) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('pond_b')}</InputLabel>
                      <Select value={selectedPondB} onChange={(e) => setSelectedPondB(e.target.value)} label={t('pond_b')}>
                        {(currentSeasonPondsData as any)?.ponds?.map((p: any) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('season_1')}</InputLabel>
                      <Select value={selectedSeason1} onChange={(e) => setSelectedSeason1(e.target.value)} label={t('season_1')}>
                        {(historicalSeasonsData as any)?.seasons?.map((s: any) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('pond_a')}</InputLabel>
                      <Select value={selectedPondA_H} onChange={(e) => setSelectedPondA_H(e.target.value)} label={t('pond_a')} disabled={!selectedSeason1}>
                        {(season1PondsData as any)?.ponds?.map((p: any) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('season_2')}</InputLabel>
                      <Select value={selectedSeason2} onChange={(e) => setSelectedSeason2(e.target.value)} label={t('season_2')}>
                        {(historicalSeasonsData as any)?.seasons?.map((s: any) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('pond_b')}</InputLabel>
                      <Select value={selectedPondB_H} onChange={(e) => setSelectedPondB_H(e.target.value)} label={t('pond_b')} disabled={!selectedSeason2}>
                        {(season2PondsData as any)?.ponds?.map((p: any) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>{t('metrics_to_compare')}</InputLabel>
                  <Select
                    multiple
                    value={selectedMetrics}
                    onChange={(e) => setSelectedMetrics(e.target.value as string[])}
                    input={<OutlinedInput label={t('metrics_to_compare')} />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((val) => <Chip key={val} label={metricOptions.find(m => m.id === val)?.name || val} size="small" />)}
                      </Box>
                    )}
                  >
                    {metricOptions.map(m => (
                      <MenuItem key={m.id} value={m.id}>
                        <Checkbox checked={selectedMetrics.indexOf(m.id) > -1} />
                        <ListItemText primary={m.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" fullWidth size="large" onClick={handleCompare} disabled={isProcessing || selectedMetrics.length === 0}>
                  {isProcessing ? t('comparing') : t('compare_ponds')}
                </Button>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </CardContent>
      </Card>

      {comparisonData && (
        <Card elevation={3}>
          <CardHeader title={t('comparison_results')} />
          <CardContent>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}>
              {selectedMetrics.map((mid) => <Tab key={mid} label={metricOptions.find(m => m.id === mid)?.name || mid} />)}
            </Tabs>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={formatChartData(comparisonData.metrics?.[selectedMetrics[activeTab]])}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="pondA" name={getPondName(mode === 'current' ? selectedPondA : selectedPondA_H)} stroke="#2563EB" />
                  <Line type="monotone" dataKey="pondB" name={getPondName(mode === 'current' ? selectedPondB : selectedPondB_H)} stroke="#10B981" />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default HistoricalInsightsPage;
