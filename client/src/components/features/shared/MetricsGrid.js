/**
 * Generic Metrics Grid Component
 * Reusable component for displaying KPIs and metrics
 */

import { Grid, Box, Typography, Skeleton, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import KPICard, { CircularKPICard } from '../KPICard';

// Metric types
export const METRIC_TYPES = {
  STANDARD: 'standard',
  CIRCULAR: 'circular',
  COMPACT: 'compact'
};

// Grid configurations
export const GRID_LAYOUTS = {
  SINGLE_ROW: { xs: 12, sm: 6, md: 3, lg: 3 },
  TWO_COLUMNS: { xs: 12, sm: 6, md: 6, lg: 6 },
  THREE_COLUMNS: { xs: 12, sm: 6, md: 4, lg: 4 },
  FOUR_COLUMNS: { xs: 12, sm: 6, md: 3, lg: 3 },
  RESPONSIVE: { xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }
};

// Default metric configuration
const defaultMetricConfig = {
  type: METRIC_TYPES.STANDARD,
  showChange: true,
  showProgress: false,
  animationDelay: 0
};

// Metric formatter utilities
const formatters = {
  currency: (value, currency = 'USD') =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(value),

  number: (value, decimals = 0) =>
    new Intl.NumberFormat('en-US', {
      maximumFractionDigits: decimals
    }).format(value),

  percentage: (value, decimals = 1) => `${Number(value).toFixed(decimals)}%`,

  compact: value => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  },

  duration: minutes => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }
};

// Metric card wrapper component
const MetricCard = memo(({ metric, type, gridProps, animationDelay }) => {
  const processedMetric = useMemo(() => {
    let processedValue = metric.value;

    // Apply formatter if specified
    if (metric.formatter && formatters[metric.formatter]) {
      processedValue = formatters[metric.formatter](metric.value, metric.formatterOptions);
    }

    return {
      ...metric,
      value: processedValue
    };
  }, [metric]);

  // Select component based on type
  const CardComponent = useMemo(() => {
    switch (type) {
      case METRIC_TYPES.CIRCULAR:
        return CircularKPICard;
      case METRIC_TYPES.COMPACT:
      case METRIC_TYPES.STANDARD:
      default:
        return KPICard;
    }
  }, [type]);

  return (
    <Grid item {...gridProps}>
      <CardComponent {...processedMetric} delay={animationDelay} />
    </Grid>
  );
});

// Loading skeleton component
const MetricSkeleton = memo(({ gridProps, type }) => (
  <Grid item {...gridProps}>
    <Box sx={{ p: 2 }}>
      <Skeleton
        variant='rectangular'
        height={type === METRIC_TYPES.CIRCULAR ? 200 : 120}
        sx={{ borderRadius: 2 }}
      />
    </Box>
  </Grid>
));

// Main MetricsGrid component
const MetricsGrid = memo(
  ({
    metrics = [],
    layout = GRID_LAYOUTS.FOUR_COLUMNS,
    type = METRIC_TYPES.STANDARD,
    loading = false,
    error = null,
    title = null,
    subtitle = null,
    animationStagger = 0.1,
    spacing = 2,
    className = '',
    emptyMessage = 'no_metrics_available',
    skeletonCount = 4,
    ...gridProps
  }) => {
    const { t } = useTranslation();

    // Memoize processed metrics
    const processedMetrics = useMemo(() => {
      return metrics.map((metric, index) => ({
        ...defaultMetricConfig,
        ...metric,
        id: metric.id || index,
        animationDelay: index * animationStagger
      }));
    }, [metrics, animationStagger]);

    // Render loading state
    if (loading) {
      return (
        <Box className={className}>
          {title && (
            <Typography variant='h5' gutterBottom>
              {t(title)}
            </Typography>
          )}
          {subtitle && (
            <Typography variant='body2' color='text.secondary' paragraph>
              {t(subtitle)}
            </Typography>
          )}
          <Grid container spacing={spacing} {...gridProps}>
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <MetricSkeleton key={index} gridProps={layout} type={type} />
            ))}
          </Grid>
        </Box>
      );
    }

    // Render error state
    if (error) {
      return (
        <Box className={className}>
          {title && (
            <Typography variant='h5' gutterBottom>
              {t(title)}
            </Typography>
          )}
          <Alert severity='error' sx={{ mt: 2 }}>
            {error.message || t('error_loading_metrics')}
          </Alert>
        </Box>
      );
    }

    // Render empty state
    if (!processedMetrics.length) {
      return (
        <Box className={className}>
          {title && (
            <Typography variant='h5' gutterBottom>
              {t(title)}
            </Typography>
          )}
          <Alert severity='info' sx={{ mt: 2 }}>
            {t(emptyMessage)}
          </Alert>
        </Box>
      );
    }

    return (
      <Box className={className}>
        {title && (
          <Typography variant='h5' gutterBottom>
            {t(title)}
          </Typography>
        )}
        {subtitle && (
          <Typography variant='body2' color='text.secondary' paragraph>
            {t(subtitle)}
          </Typography>
        )}
        <Grid container spacing={spacing} {...gridProps}>
          {processedMetrics.map(metric => (
            <MetricCard
              key={metric.id}
              metric={metric}
              type={metric.type || type}
              gridProps={layout}
              animationDelay={metric.animationDelay}
            />
          ))}
        </Grid>
      </Box>
    );
  }
);

// Specialized metric grid components
export const DashboardMetrics = memo(({ metrics, ...props }) => (
  <MetricsGrid
    metrics={metrics}
    layout={GRID_LAYOUTS.FOUR_COLUMNS}
    type={METRIC_TYPES.STANDARD}
    title='dashboard_overview'
    animationStagger={0.1}
    {...props}
  />
));

export const PerformanceMetrics = memo(({ metrics, ...props }) => (
  <MetricsGrid
    metrics={metrics}
    layout={GRID_LAYOUTS.THREE_COLUMNS}
    type={METRIC_TYPES.CIRCULAR}
    title='performance_metrics'
    animationStagger={0.15}
    {...props}
  />
));

export const CompactMetrics = memo(({ metrics, ...props }) => (
  <MetricsGrid
    metrics={metrics}
    layout={GRID_LAYOUTS.RESPONSIVE}
    type={METRIC_TYPES.COMPACT}
    spacing={1}
    animationStagger={0.05}
    {...props}
  />
));

export const FinancialMetrics = memo(({ metrics, ...props }) => {
  // Add currency formatting to financial metrics
  const formattedMetrics = useMemo(
    () =>
      metrics.map(metric => ({
        ...metric,
        formatter: metric.formatter || 'currency',
        formatterOptions: metric.formatterOptions || 'USD'
      })),
    [metrics]
  );

  return (
    <MetricsGrid
      metrics={formattedMetrics}
      layout={GRID_LAYOUTS.TWO_COLUMNS}
      title='financial_overview'
      {...props}
    />
  );
});

// Utility functions for creating metrics
export const createMetric = ({
  id,
  title,
  value,
  icon,
  color = '#1976d2',
  change = 0,
  changeText = '',
  formatter = null,
  formatterOptions = null,
  progressValue = null,
  progressColor = 'primary',
  type = METRIC_TYPES.STANDARD
}) => ({
  id,
  title,
  value,
  icon,
  color,
  change,
  changeText,
  formatter,
  formatterOptions,
  progressValue,
  progressColor,
  type
});

export const createFinancialMetric = (id, title, value, icon, change = 0) =>
  createMetric({
    id,
    title,
    value,
    icon,
    change,
    formatter: 'currency',
    color: '#4caf50'
  });

export const createPercentageMetric = (id, title, value, icon, change = 0) =>
  createMetric({
    id,
    title,
    value,
    icon,
    change,
    formatter: 'percentage',
    type: METRIC_TYPES.CIRCULAR,
    progressValue: value,
    color: '#2196f3'
  });

export { formatters };
export default MetricsGrid;

// Add PropTypes validation
MetricsGrid.propTypes = {
  metrics: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      icon: PropTypes.element,
      color: PropTypes.string,
      change: PropTypes.number,
      changeText: PropTypes.string,
      formatter: PropTypes.oneOf(['currency', 'number', 'percentage', 'compact', 'duration']),
      formatterOptions: PropTypes.any,
      progressValue: PropTypes.number,
      progressColor: PropTypes.string,
      type: PropTypes.oneOf(Object.values(METRIC_TYPES))
    })
  ),
  layout: PropTypes.object,
  type: PropTypes.oneOf(Object.values(METRIC_TYPES)),
  loading: PropTypes.bool,
  error: PropTypes.object,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  animationStagger: PropTypes.number,
  spacing: PropTypes.number,
  className: PropTypes.string,
  emptyMessage: PropTypes.string,
  skeletonCount: PropTypes.number
};

// Add default props
MetricsGrid.defaultProps = {
  metrics: [],
  layout: GRID_LAYOUTS.FOUR_COLUMNS,
  type: METRIC_TYPES.STANDARD,
  loading: false,
  error: null,
  animationStagger: 0.1,
  spacing: 2,
  className: '',
  emptyMessage: 'no_metrics_available',
  skeletonCount: 4
};

// Add PropTypes for MetricCard
MetricCard.propTypes = {
  metric: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    icon: PropTypes.element,
    color: PropTypes.string,
    change: PropTypes.number,
    changeText: PropTypes.string,
    formatter: PropTypes.oneOf(['currency', 'number', 'percentage', 'compact', 'duration']),
    formatterOptions: PropTypes.any,
    progressValue: PropTypes.number,
    progressColor: PropTypes.string,
    type: PropTypes.oneOf(Object.values(METRIC_TYPES)),
    animationDelay: PropTypes.number
  }).isRequired,
  type: PropTypes.oneOf(Object.values(METRIC_TYPES)),
  gridProps: PropTypes.object,
  animationDelay: PropTypes.number
};

// Add PropTypes for MetricSkeleton
MetricSkeleton.propTypes = {
  gridProps: PropTypes.object,
  type: PropTypes.oneOf(Object.values(METRIC_TYPES))
};

// Add PropTypes for specialized components
DashboardMetrics.propTypes = {
  metrics: PropTypes.arrayOf(PropTypes.object).isRequired
};

PerformanceMetrics.propTypes = {
  metrics: PropTypes.arrayOf(PropTypes.object).isRequired
};

CompactMetrics.propTypes = {
  metrics: PropTypes.arrayOf(PropTypes.object).isRequired
};

FinancialMetrics.propTypes = {
  metrics: PropTypes.arrayOf(PropTypes.object).isRequired
};
