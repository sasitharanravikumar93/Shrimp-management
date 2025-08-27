/**
 * Shared Components Master Index
 * Central export point for all shared components across features
 */

// Import all components and their exports
import DataTable, { CELL_TYPES, createColumn, createActionColumn } from './DataTable';
import DataVisualization, {
  CHART_TYPES,
  MetricsBarChart,
  TrendLineChart,
  DistributionPieChart,
  GrowthAreaChart
} from './DataVisualization';
import FilterPanel, {
  FILTER_TYPES,
  createFilter,
  createSelectFilter,
  createDateRangeFilter,
  createTextFilter,
  createNumberFilter
} from './FilterPanel';
import MetricsGrid, {
  METRIC_TYPES,
  GRID_LAYOUTS,
  DashboardMetrics,
  PerformanceMetrics,
  CompactMetrics,
  FinancialMetrics,
  createMetric,
  createFinancialMetric,
  createPercentageMetric,
  formatters
} from './MetricsGrid';

// UI Components
export * from './ui';

// Form Components
export * from './forms';

// Error Handling Components
export * from './error-handling';

// Loading Components
export * from './loading';

// Chart Components
export * from './charts';

// Layout Components
export * from './layout';

/**
 * Common Components Index
 * Centralized export for all reusable components
 */

// Data Visualization
export { default as DataVisualization, CHART_TYPES } from './DataVisualization';
export {
  MetricsBarChart,
  TrendLineChart,
  DistributionPieChart,
  GrowthAreaChart
} from './DataVisualization';

// Metrics Display
export { default as MetricsGrid } from './MetricsGrid';
export {
  METRIC_TYPES,
  GRID_LAYOUTS,
  DashboardMetrics,
  PerformanceMetrics,
  CompactMetrics,
  FinancialMetrics,
  createMetric,
  createFinancialMetric,
  createPercentageMetric,
  formatters
} from './MetricsGrid';

// Data Table
export { default as DataTable, CELL_TYPES } from './DataTable';
export { createColumn, createActionColumn } from './DataTable';

// Filter Panel
export { default as FilterPanel, FILTER_TYPES } from './FilterPanel';
export {
  createFilter,
  createSelectFilter,
  createDateRangeFilter,
  createTextFilter,
  createNumberFilter
} from './FilterPanel';

// Component combinations for common use cases
export const DataDashboard = {
  MetricsGrid,
  DataVisualization,
  DataTable,
  FilterPanel
};

export const ChartTypes = CHART_TYPES;
export const MetricTypes = METRIC_TYPES;
export const CellTypes = CELL_TYPES;
export const FilterTypes = FILTER_TYPES;
export const GridLayouts = GRID_LAYOUTS;
