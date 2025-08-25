/**
 * Generic Data Visualization Component
 * Reusable component for charts and data display
 */

import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  Cell,
  AreaChart,
  Area
} from 'recharts';

// Chart type constants
export const CHART_TYPES = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
  AREA: 'area'
};

// Default color palette
const DEFAULT_COLORS = [
  '#1976d2',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ff9800',
  '#ff5722',
  '#f44336',
  '#e91e63'
];

// Custom tooltip component
const CustomTooltip = memo(({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <Card sx={{ p: 1, minWidth: 150 }}>
        <Typography variant='body2' sx={{ mb: 1, fontWeight: 'bold' }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant='body2' sx={{ color: entry.color }}>
            {entry.name}: {formatter ? formatter(entry.value) : entry.value}
          </Typography>
        ))}
      </Card>
    );
  }
  return null;
});

// Chart components
const BarChartComponent = memo(({ data, config, colors }) => (
  <ResponsiveContainer width='100%' height={config.height || 300}>
    <BarChart data={data} margin={config.margin}>
      <CartesianGrid strokeDasharray='3 3' />
      <XAxis dataKey={config.xAxisKey || 'name'} tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip content={<CustomTooltip formatter={config.formatter} />} />
      {config.showLegend && <Legend />}
      {config.bars?.map((bar, index) => (
        <Bar
          key={bar.dataKey}
          dataKey={bar.dataKey}
          fill={bar.color || colors[index % colors.length]}
          name={bar.name || bar.dataKey}
          radius={[2, 2, 0, 0]}
        />
      )) || <Bar dataKey={config.yAxisKey || 'value'} fill={colors[0]} radius={[2, 2, 0, 0]} />}
    </BarChart>
  </ResponsiveContainer>
));

const LineChartComponent = memo(({ data, config, colors }) => (
  <ResponsiveContainer width='100%' height={config.height || 300}>
    <LineChart data={data} margin={config.margin}>
      <CartesianGrid strokeDasharray='3 3' />
      <XAxis dataKey={config.xAxisKey || 'name'} tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip content={<CustomTooltip formatter={config.formatter} />} />
      {config.showLegend && <Legend />}
      {config.lines?.map((line, index) => (
        <Line
          key={line.dataKey}
          type='monotone'
          dataKey={line.dataKey}
          stroke={line.color || colors[index % colors.length]}
          strokeWidth={2}
          name={line.name || line.dataKey}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      )) || (
        <Line
          type='monotone'
          dataKey={config.yAxisKey || 'value'}
          stroke={colors[0]}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      )}
    </LineChart>
  </ResponsiveContainer>
));

const PieChartComponent = memo(({ data, config, colors }) => (
  <ResponsiveContainer width='100%' height={config.height || 300}>
    <PieChart>
      <Pie
        data={data}
        cx='50%'
        cy='50%'
        labelLine={false}
        label={
          config.showLabels
            ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`
            : false
        }
        outerRadius={config.outerRadius || 80}
        fill='#8884d8'
        dataKey={config.valueKey || 'value'}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip formatter={config.formatter} />} />
      {config.showLegend && <Legend />}
    </PieChart>
  </ResponsiveContainer>
));

const AreaChartComponent = memo(({ data, config, colors }) => (
  <ResponsiveContainer width='100%' height={config.height || 300}>
    <AreaChart data={data} margin={config.margin}>
      <CartesianGrid strokeDasharray='3 3' />
      <XAxis dataKey={config.xAxisKey || 'name'} tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip content={<CustomTooltip formatter={config.formatter} />} />
      {config.showLegend && <Legend />}
      {config.areas?.map((area, index) => (
        <Area
          key={area.dataKey}
          type='monotone'
          dataKey={area.dataKey}
          stackId={area.stackId || '1'}
          stroke={area.color || colors[index % colors.length]}
          fill={area.color || colors[index % colors.length]}
          name={area.name || area.dataKey}
        />
      )) || (
        <Area
          type='monotone'
          dataKey={config.yAxisKey || 'value'}
          stroke={colors[0]}
          fill={colors[0]}
        />
      )}
    </AreaChart>
  </ResponsiveContainer>
));

// Main DataVisualization component
const DataVisualization = memo(
  ({
    title,
    subtitle,
    data,
    type = CHART_TYPES.BAR,
    config = {},
    colors = DEFAULT_COLORS,
    loading = false,
    error = null,
    actions = null,
    className = '',
    height = 400,
    ...cardProps
  }) => {
    const { t } = useTranslation();

    // Memoize chart component selection
    const ChartComponent = useMemo(() => {
      switch (type) {
        case CHART_TYPES.BAR:
          return BarChartComponent;
        case CHART_TYPES.LINE:
          return LineChartComponent;
        case CHART_TYPES.PIE:
          return PieChartComponent;
        case CHART_TYPES.AREA:
          return AreaChartComponent;
        default:
          return BarChartComponent;
      }
    }, [type]);

    // Memoize chart configuration
    const chartConfig = useMemo(
      () => ({
        height,
        margin: { top: 20, right: 30, left: 20, bottom: 5 },
        showLegend: true,
        showLabels: type === CHART_TYPES.PIE,
        ...config
      }),
      [config, height, type]
    );

    if (loading) {
      return (
        <Card className={className} {...cardProps}>
          <CardContent>
            <Box display='flex' justifyContent='center' alignItems='center' height={height}>
              <CircularProgress />
            </Box>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card className={className} {...cardProps}>
          <CardContent>
            <Alert severity='error'>{error.message || t('error_loading_data')}</Alert>
          </CardContent>
        </Card>
      );
    }

    if (!data || data.length === 0) {
      return (
        <Card className={className} {...cardProps}>
          <CardContent>
            <Alert severity='info'>{t('no_data_available')}</Alert>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={className} {...cardProps}>
        {(title || subtitle || actions) && (
          <CardHeader
            title={
              title ? (
                <Typography variant='h6' component='h2'>
                  {t(title)}
                </Typography>
              ) : null
            }
            subheader={
              subtitle ? (
                <Typography variant='body2' color='text.secondary'>
                  {t(subtitle)}
                </Typography>
              ) : null
            }
            action={actions}
          />
        )}
        <CardContent>
          <ChartComponent data={data} config={chartConfig} colors={colors} />
        </CardContent>
      </Card>
    );
  }
);

// Specialized components for common use cases
export const MetricsBarChart = memo(({ data, title, ...props }) => (
  <DataVisualization
    type={CHART_TYPES.BAR}
    data={data}
    title={title}
    config={{
      xAxisKey: 'name',
      yAxisKey: 'value',
      formatter: value => `${value}%`
    }}
    {...props}
  />
));

export const TrendLineChart = memo(({ data, title, ...props }) => (
  <DataVisualization
    type={CHART_TYPES.LINE}
    data={data}
    title={title}
    config={{
      xAxisKey: 'date',
      yAxisKey: 'value',
      formatter: value => value.toFixed(2)
    }}
    {...props}
  />
));

export const DistributionPieChart = memo(({ data, title, ...props }) => (
  <DataVisualization
    type={CHART_TYPES.PIE}
    data={data}
    title={title}
    config={{
      valueKey: 'value',
      showLabels: true,
      outerRadius: 100
    }}
    {...props}
  />
));

export const GrowthAreaChart = memo(({ data, title, ...props }) => (
  <DataVisualization
    type={CHART_TYPES.AREA}
    data={data}
    title={title}
    config={{
      xAxisKey: 'date',
      yAxisKey: 'value',
      formatter: value => `${value} kg`
    }}
    {...props}
  />
));

export default DataVisualization;
