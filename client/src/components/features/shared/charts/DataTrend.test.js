import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { testDataFactories, renderUtils } from '../utils/testUtils';

import DataTrend from './DataTrend';

// Create a theme for testing
const theme = createTheme();

// Mock the recharts components since they're complex SVG elements
jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  LineChart: ({ children }) => <div data-testid='line-chart'>{children}</div>,
  Line: () => <div data-testid='line' />,
  XAxis: () => <div data-testid='x-axis' />,
  YAxis: () => <div data-testid='y-axis' />,
  CartesianGrid: () => <div data-testid='cartesian-grid' />,
  Tooltip: () => <div data-testid='tooltip' />,
  ResponsiveContainer: ({ children }) => <div data-testid='responsive-container'>{children}</div>
}));

// Wrapper component to provide theme
const WithTheme = ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>;

describe('DataTrend', () => {
  const mockData = [
    { date: '2023-01-01', value: 10 },
    { date: '2023-01-02', value: 15 },
    { date: '2023-01-03', value: 20 },
    { date: '2023-01-04', value: 25 }
  ];

  const defaultProps = {
    title: 'Test Data Trend',
    data: mockData,
    dataKey: 'value',
    unit: 'kg'
  };

  it('renders correctly with basic props', async () => {
    renderUtils.renderWithProviders(<DataTrend {...defaultProps} />, { router: false });

    // Wait for component to fully render
    await waitFor(() => {
      expect(screen.getByText('Test Data Trend')).toBeInTheDocument();
    });

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText('Current: 25 kg')).toBeInTheDocument();
    expect(screen.getByText(/Average:.*17.50 kg/)).toBeInTheDocument();
  });

  it('shows increasing trend when data is increasing', async () => {
    renderUtils.renderWithProviders(<DataTrend {...defaultProps} trend='up' />, { router: false });

    await waitFor(() => {
      expect(screen.getByText('Increasing')).toBeInTheDocument();
    });

    expect(screen.getByTestId('trendingupicon')).toBeInTheDocument();
  });

  it('shows decreasing trend when data is decreasing', () => {
    const decreasingData = [
      { date: '2023-01-01', value: 30 },
      { date: '2023-01-02', value: 25 },
      { date: '2023-01-03', value: 20 },
      { date: '2023-01-04', value: 15 }
    ];

    render(
      <WithTheme>
        <DataTrend {...defaultProps} data={decreasingData} trend='down' />
      </WithTheme>
    );

    expect(screen.getByText('Decreasing')).toBeInTheDocument();
    expect(screen.getByTestId('trendingdownicon')).toBeInTheDocument();
    expect(screen.getByText('Decreasing')).toBeInTheDocument();
  });

  it('shows stable trend when data is stable', () => {
    const stableData = [
      { date: '2023-01-01', value: 20 },
      { date: '2023-01-02', value: 20 },
      { date: '2023-01-03', value: 20 },
      { date: '2023-01-04', value: 20 }
    ];

    render(
      <WithTheme>
        <DataTrend {...defaultProps} data={stableData} trend='neutral' />
      </WithTheme>
    );

    expect(screen.getByText('Stable')).toBeInTheDocument();
    expect(screen.getByTestId('trendingflaticon')).toBeInTheDocument();
    expect(screen.getByText('Stable')).toBeInTheDocument();
  });

  it('calculates trend automatically when trend is set to auto', () => {
    render(
      <WithTheme>
        <DataTrend {...defaultProps} trend='auto' />
      </WithTheme>
    );

    // Since our mockData is increasing, it should show increasing trend
    expect(screen.getByText('Increasing')).toBeInTheDocument();
    expect(screen.getByTestId('trendingupicon')).toBeInTheDocument();
  });

  it('handles empty data gracefully', async () => {
    renderUtils.renderWithProviders(<DataTrend {...defaultProps} data={[]} />, { router: false });

    await waitFor(() => {
      expect(screen.getByText('Test Data Trend')).toBeInTheDocument();
    });

    expect(screen.getByText('Current: N/A')).toBeInTheDocument();
    expect(screen.getByText('Average: N/A')).toBeInTheDocument();
  });

  it('handles single data point', () => {
    const singleData = [{ date: '2023-01-01', value: 15 }];

    render(
      <WithTheme>
        <DataTrend {...defaultProps} data={singleData} trend='auto' />
      </WithTheme>
    );

    // With single data point, trend should be neutral
    expect(screen.getByText('Stable')).toBeInTheDocument();
    expect(screen.getByText('Current: 15 kg')).toBeInTheDocument();
    expect(screen.getByText('Average: 15.00 kg')).toBeInTheDocument();
  });

  it('renders with custom color', () => {
    render(
      <WithTheme>
        <DataTrend {...defaultProps} color='#FF0000' />
      </WithTheme>
    );

    // The color is passed to the Line component, which we've mocked
    // We can't easily test the color directly, but we can ensure it renders
    expect(screen.getByText('Test Data Trend')).toBeInTheDocument();
  });

  it('renders with custom unit', () => {
    render(
      <WithTheme>
        <DataTrend {...defaultProps} unit='°C' />
      </WithTheme>
    );

    expect(screen.getByText('Current: 25 °C')).toBeInTheDocument();
    expect(screen.getByText(/Average:.*17.50 °C/)).toBeInTheDocument();
  });
});

// Mocking the icons to add data-testid
jest.mock('@mui/icons-material', () => ({
  ...jest.requireActual('@mui/icons-material'),
  TrendingUp: props => <div {...props} data-testid='trendingupicon' />,
  TrendingDown: props => <div {...props} data-testid='trendingdownicon' />,
  TrendingFlat: props => <div {...props} data-testid='trendingflaticon' />
}));
