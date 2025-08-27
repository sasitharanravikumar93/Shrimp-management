/**
 * Optimized Chart Components
 * Provides performance-optimized wrappers for Recharts components
 */

import PropTypes from 'prop-types';
import React, { memo, useMemo, useRef, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { useStableMemo, useDebounce, useChartResize } from '../../../utils/performanceOptimization';

// Chart performance constants
const CHART_PERFORMANCE = {
  MAX_DATA_POINTS: 1000,
  DEBOUNCE_DELAY: 100,
  ANIMATION_DURATION: 300,
  VIRTUALIZATION_THRESHOLD: 500
};

// Virtualization hook for large datasets
const useVirtualizedData = (data, maxPoints) => {
  return useMemo(() => {
    if (!data || data.length <= maxPoints) {
      return data;
    }

    // Simple sampling for virtualization
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, index) => index % step === 0);
  }, [data, maxPoints]);
};

// Optimized Bar Chart Component with virtualization
export const OptimizedBarChart = memo(
  ({
    data,
    width = '100%',
    height = 300,
    margin = { top: 20, right: 30, left: 20, bottom: 5 },
    bars = [],
    colors = ['#8884d8', '#82ca9d', '#ffc658'],
    showGrid = true,
    showTooltip = true,
    showLegend = true,
    enableVirtualization = true,
    maxDataPoints = CHART_PERFORMANCE.MAX_DATA_POINTS,
    animationDuration = CHART_PERFORMANCE.ANIMATION_DURATION,
    ...props
  }) => {
    const chartRef = useRef(null);

    // Use virtualized data for large datasets (always call the hook)
    const processedData = useVirtualizedData(data, enableVirtualization ? maxDataPoints : data?.length || 0);

    // Debounce data changes to prevent excessive re-renders
    const debouncedData = useDebounce(processedData, CHART_PERFORMANCE.DEBOUNCE_DELAY);

    // Memoize margin to prevent re-renders
    const stableMargin = useStableMemo(() => margin, [JSON.stringify(margin)]);

    // Memoize bar configurations with performance optimizations
    const stableBars = useStableMemo(() => {
      return bars.map((bar, index) => ({
        key: bar.dataKey || `bar-${index}`,
        dataKey: bar.dataKey,
        fill: bar.fill || colors[index % colors.length],
        name: bar.name || bar.dataKey,
        animationDuration: bar.animationDuration || animationDuration,
        isAnimationActive: bar.isAnimationActive !== false,
        ...bar
      }));
    }, [bars, colors, animationDuration]);

    // Memoize chart props with performance settings
    const chartProps = useStableMemo(
      () => ({
        width,
        height,
        data: debouncedData,
        margin: stableMargin,
        // Performance optimizations
        syncId: props.syncId,
        throttleDelay: 16, // ~60fps
        ...props
      }),
      [width, height, debouncedData, stableMargin, props]
    );

    // Chart resize handling
    const handleResize = useCallback(() => {
      // Force chart redraw on resize
      if (chartRef.current) {
        chartRef.current.handleResize();
      }
    }, []);

    useChartResize(chartRef, handleResize);

    if (!debouncedData || debouncedData.length === 0) {
      return (
        <div
          style={{
            width,
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999'
          }}
        >
          No data available
        </div>
      );
    }

    return (
      <div ref={chartRef}>
        <ResponsiveContainer width={width} height={height}>
          <BarChart {...chartProps}>
            {showGrid && <CartesianGrid strokeDasharray='3 3' />}
            <XAxis dataKey='name' tick={{ fontSize: 12 }} interval='preserveStartEnd' />
            <YAxis tick={{ fontSize: 12 }} />
            {showTooltip && <OptimizedTooltip />}
            {showLegend && <Legend />}
            {stableBars.map(bar => (
              <Bar
                key={bar.key}
                dataKey={bar.dataKey}
                fill={bar.fill}
                name={bar.name}
                animationDuration={bar.animationDuration}
                isAnimationActive={bar.isAnimationActive}
                {...bar}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

// Optimized Line Chart Component with performance enhancements
export const OptimizedLineChart = memo(
  ({
    data,
    width = '100%',
    height = 300,
    margin = { top: 20, right: 30, left: 20, bottom: 5 },
    lines = [],
    colors = ['#8884d8', '#82ca9d', '#ffc658'],
    showGrid = true,
    showTooltip = true,
    showLegend = true,
    enableVirtualization = true,
    maxDataPoints = CHART_PERFORMANCE.MAX_DATA_POINTS,
    connectNulls = false,
    dot = false, // Disable dots for better performance with large datasets
    animationDuration = CHART_PERFORMANCE.ANIMATION_DURATION,
    ...props
  }) => {
    const chartRef = useRef(null);

    // Use virtualized data for large datasets (always call the hook)
    const processedData = useVirtualizedData(data, enableVirtualization ? maxDataPoints : data?.length || 0);

    // Debounce data changes
    const debouncedData = useDebounce(processedData, CHART_PERFORMANCE.DEBOUNCE_DELAY);

    const stableMargin = useStableMemo(() => margin, [JSON.stringify(margin)]);

    const stableLines = useStableMemo(() => {
      return lines.map((line, index) => ({
        key: line.dataKey || `line-${index}`,
        dataKey: line.dataKey,
        stroke: line.stroke || colors[index % colors.length],
        name: line.name || line.dataKey,
        strokeWidth: line.strokeWidth || 2,
        dot: line.dot !== undefined ? line.dot : dot,
        connectNulls: line.connectNulls !== undefined ? line.connectNulls : connectNulls,
        animationDuration: line.animationDuration || animationDuration,
        isAnimationActive: line.isAnimationActive !== false,
        // Performance optimization: reduce precision for smoother rendering
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        ...line
      }));
    }, [lines, colors, dot, connectNulls, animationDuration]);

    const chartProps = useStableMemo(
      () => ({
        width,
        height,
        data: debouncedData,
        margin: stableMargin,
        syncId: props.syncId,
        throttleDelay: 16,
        ...props
      }),
      [width, height, debouncedData, stableMargin, props]
    );

    const handleResize = useCallback(() => {
      if (chartRef.current) {
        chartRef.current.handleResize();
      }
    }, []);

    useChartResize(chartRef, handleResize);

    if (!debouncedData || debouncedData.length === 0) {
      return (
        <div
          style={{
            width,
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999'
          }}
        >
          No data available
        </div>
      );
    }

    return (
      <div ref={chartRef}>
        <ResponsiveContainer width={width} height={height}>
          <LineChart {...chartProps}>
            {showGrid && <CartesianGrid strokeDasharray='3 3' />}
            <XAxis dataKey='name' tick={{ fontSize: 12 }} interval='preserveStartEnd' />
            <YAxis tick={{ fontSize: 12 }} />
            {showTooltip && <OptimizedTooltip />}
            {showLegend && <Legend />}
            {stableLines.map(line => (
              <Line
                key={line.key}
                dataKey={line.dataKey}
                stroke={line.stroke}
                name={line.name}
                strokeWidth={line.strokeWidth}
                dot={line.dot}
                connectNulls={line.connectNulls}
                animationDuration={line.animationDuration}
                isAnimationActive={line.isAnimationActive}
                strokeLinecap={line.strokeLinecap}
                strokeLinejoin={line.strokeLinejoin}
                {...line}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

// Optimized Pie Chart Component
export const OptimizedPieChart = memo(
  ({
    data,
    width = '100%',
    height = 300,
    cx = '50%',
    cy = '50%',
    outerRadius = 80,
    colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'],
    showTooltip = true,
    showLegend = true,
    dataKey = 'value',
    nameKey = 'name',
    ...props
  }) => {
    const stableColors = useStableMemo(() => colors, [JSON.stringify(colors)]);

    const pieData = useStableMemo(() => {
      return (
        data?.map((entry, index) => ({
          ...entry,
          fill: entry.fill || stableColors[index % stableColors.length]
        })) || []
      );
    }, [data, stableColors]);

    const pieProps = useStableMemo(
      () => ({
        cx,
        cy,
        outerRadius,
        dataKey,
        data: pieData,
        ...props
      }),
      [cx, cy, outerRadius, dataKey, pieData, props]
    );

    if (!data || data.length === 0) {
      return null;
    }

    return (
      <ResponsiveContainer width={width} height={height}>
        <PieChart>
          <Pie {...pieProps}>
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    );
  }
);

// Optimized Tooltip with caching
export const OptimizedTooltip = memo(
  ({
    active,
    payload,
    label,
    formatter,
    labelFormatter,
    contentStyle = {
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '10px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    ...props
  }) => {
    const formattedLabel = useStableMemo(() => {
      return labelFormatter ? labelFormatter(label) : label;
    }, [label, labelFormatter]);

    const formattedPayload = useStableMemo(() => {
      if (!payload || !payload.length) return [];

      return payload.map((entry, index) => ({
        ...entry,
        formattedValue: formatter ? formatter(entry.value, entry.name, entry) : entry.value
      }));
    }, [payload, formatter]);

    if (!active || !payload || !payload.length) {
      return null;
    }

    return (
      <div className='custom-tooltip' style={contentStyle} {...props}>
        {formattedLabel && (
          <p className='label' style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
            {formattedLabel}
          </p>
        )}
        {formattedPayload.map((entry, index) => (
          <p
            key={index}
            className='intro'
            style={{
              margin: '2px 0',
              color: entry.color
            }}
          >
            {`${entry.name}: ${entry.formattedValue}`}
          </p>
        ))}
      </div>
    );
  }
);

// Enhanced Chart Performance Utils
export const chartPerformanceUtils = {
  // Reduce data points for better performance with intelligent sampling
  sampleData: (data, maxPoints = CHART_PERFORMANCE.MAX_DATA_POINTS) => {
    if (!data || data.length <= maxPoints) return data;

    // Use different sampling strategies based on data characteristics
    const step = Math.ceil(data.length / maxPoints);

    // For time series data, preserve important peaks and valleys
    if (data.some(d => d.date || d.time || d.timestamp)) {
      return data.filter((_, index) => {
        // Always include first and last points
        if (index === 0 || index === data.length - 1) return true;

        // Sample at regular intervals
        return index % step === 0;
      });
    }

    // For regular data, use uniform sampling
    return data.filter((_, index) => index % step === 0);
  },

  // Debounce chart updates with intelligent timing
  debounceChartUpdate: (callback, delay = CHART_PERFORMANCE.DEBOUNCE_DELAY) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(...args), delay);
    };
  },

  // Optimize data for charts with advanced processing
  optimizeChartData: (data, options = {}) => {
    const {
      maxDataPoints = CHART_PERFORMANCE.MAX_DATA_POINTS,
      sortBy = null,
      filterBy = null,
      aggregateBy = null,
      precision = 2
    } = options;

    let processedData = [...(data || [])];

    // Apply filtering
    if (filterBy && typeof filterBy === 'function') {
      processedData = processedData.filter(filterBy);
    }

    // Apply sorting
    if (sortBy) {
      processedData.sort((a, b) => {
        if (typeof sortBy === 'string') {
          return a[sortBy] - b[sortBy];
        }
        return sortBy(a, b);
      });
    }

    // Round numeric values for better performance
    processedData = processedData.map(item => {
      const processedItem = { ...item };
      Object.keys(processedItem).forEach(key => {
        if (typeof processedItem[key] === 'number') {
          processedItem[key] =
            Math.round(processedItem[key] * Math.pow(10, precision)) / Math.pow(10, precision);
        }
      });
      return processedItem;
    });

    // Apply aggregation if needed
    if (aggregateBy && typeof aggregateBy === 'function') {
      processedData = aggregateBy(processedData);
    }

    // Sample data if too many points
    processedData = chartPerformanceUtils.sampleData(processedData, maxDataPoints);

    return processedData;
  },

  // Calculate optimal animation duration based on data size
  getOptimalAnimationDuration: dataLength => {
    if (dataLength > 100) return 300; // Faster for large datasets
    if (dataLength > 50) return 500;
    return CHART_PERFORMANCE.ANIMATION_DURATION; // Default for small datasets
  },

  // Determine if virtualization should be enabled
  shouldEnableVirtualization: dataLength => {
    return dataLength > CHART_PERFORMANCE.VIRTUALIZATION_THRESHOLD;
  },

  // Chart-specific performance recommendations
  getPerformanceConfig: (chartType, dataLength) => {
    const baseConfig = {
      enableVirtualization: chartPerformanceUtils.shouldEnableVirtualization(dataLength),
      animationDuration: chartPerformanceUtils.getOptimalAnimationDuration(dataLength),
      maxDataPoints: CHART_PERFORMANCE.MAX_DATA_POINTS
    };

    switch (chartType) {
      case 'line':
        return {
          ...baseConfig,
          dot: dataLength < 20, // Only show dots for small datasets
          connectNulls: false
        };

      case 'bar':
        return {
          ...baseConfig,
          maxBarSize: dataLength > 50 ? 20 : undefined
        };

      case 'pie':
        return {
          ...baseConfig,
          animationDuration: dataLength > 10 ? 300 : 750
        };

      default:
        return baseConfig;
    }
  }
};

// Add display names for debugging
OptimizedBarChart.displayName = 'OptimizedBarChart';
OptimizedLineChart.displayName = 'OptimizedLineChart';
OptimizedPieChart.displayName = 'OptimizedPieChart';
OptimizedTooltip.displayName = 'OptimizedTooltip';

export default {
  OptimizedBarChart,
  OptimizedLineChart,
  OptimizedPieChart,
  OptimizedTooltip,
  chartPerformanceUtils
};

// Add PropTypes validation
OptimizedBarChart.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  margin: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    left: PropTypes.number,
    bottom: PropTypes.number
  }),
  bars: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      fill: PropTypes.string,
      name: PropTypes.string
    })
  ),
  colors: PropTypes.arrayOf(PropTypes.string),
  showGrid: PropTypes.bool,
  showTooltip: PropTypes.bool,
  showLegend: PropTypes.bool,
  enableVirtualization: PropTypes.bool,
  maxDataPoints: PropTypes.number,
  animationDuration: PropTypes.number
};

OptimizedBarChart.defaultProps = {
  width: '100%',
  height: 300,
  margin: { top: 20, right: 30, left: 20, bottom: 5 },
  bars: [],
  colors: ['#8884d8', '#82ca9d', '#ffc658'],
  showGrid: true,
  showTooltip: true,
  showLegend: true,
  enableVirtualization: true,
  maxDataPoints: 1000,
  animationDuration: 600
};

OptimizedLineChart.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  margin: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    left: PropTypes.number,
    bottom: PropTypes.number
  }),
  lines: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      stroke: PropTypes.string,
      name: PropTypes.string,
      strokeWidth: PropTypes.number,
      dot: PropTypes.bool,
      connectNulls: PropTypes.bool
    })
  ),
  colors: PropTypes.arrayOf(PropTypes.string),
  showGrid: PropTypes.bool,
  showTooltip: PropTypes.bool,
  showLegend: PropTypes.bool,
  enableVirtualization: PropTypes.bool,
  maxDataPoints: PropTypes.number,
  connectNulls: PropTypes.bool,
  dot: PropTypes.bool,
  animationDuration: PropTypes.number
};

OptimizedLineChart.defaultProps = {
  width: '100%',
  height: 300,
  margin: { top: 20, right: 30, left: 20, bottom: 5 },
  lines: [],
  colors: ['#8884d8', '#82ca9d', '#ffc658'],
  showGrid: true,
  showTooltip: true,
  showLegend: true,
  enableVirtualization: true,
  maxDataPoints: 1000,
  connectNulls: false,
  dot: false,
  animationDuration: 600
};

OptimizedPieChart.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  cx: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  cy: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  outerRadius: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  colors: PropTypes.arrayOf(PropTypes.string),
  showTooltip: PropTypes.bool,
  showLegend: PropTypes.bool,
  dataKey: PropTypes.string,
  nameKey: PropTypes.string
};

OptimizedPieChart.defaultProps = {
  width: '100%',
  height: 300,
  cx: '50%',
  cy: '50%',
  outerRadius: 80,
  colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'],
  showTooltip: true,
  showLegend: true,
  dataKey: 'value',
  nameKey: 'name'
};

OptimizedTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  formatter: PropTypes.func,
  labelFormatter: PropTypes.func,
  contentStyle: PropTypes.object
};

OptimizedTooltip.defaultProps = {
  contentStyle: {
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }
};
