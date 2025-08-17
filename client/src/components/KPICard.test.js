import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import KPICard, { CircularKPICard } from './KPICard';

// Create a theme for testing
const theme = createTheme();

// Wrapper component to provide theme
const WithTheme = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('KPICard', () => {
  const defaultProps = {
    title: 'Test KPI',
    value: 1234,
    icon: <TrendingUpIcon />
  };

  it('renders correctly with basic props', () => {
    render(
      <WithTheme>
        <KPICard {...defaultProps} />
      </WithTheme>
    );

    expect(screen.getByText('Test KPI')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(screen.getByTestId('trendingupicon')).toBeInTheDocument();
  });

  it('formats currency values correctly', () => {
    render(
      <WithTheme>
        <KPICard {...defaultProps} value={1234567} isCurrency={true} />
      </WithTheme>
    );

    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('displays suffix correctly', () => {
    render(
      <WithTheme>
        <KPICard {...defaultProps} value={45} suffix="%" />
      </WithTheme>
    );

    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('shows positive trend indicator', () => {
    render(
      <WithTheme>
        <KPICard {...defaultProps} change={5} changeText="Increased" />
      </WithTheme>
    );

    expect(screen.getByText('Increased')).toBeInTheDocument();
    expect(screen.getByTestId('trendingupicon')).toBeInTheDocument();
  });

  it('shows negative trend indicator', () => {
    render(
      <WithTheme>
        <KPICard {...defaultProps} change={-3} changeText="Decreased" />
      </WithTheme>
    );

    expect(screen.getByText('Decreased')).toBeInTheDocument();
    // The icon will be TrendingDownIcon, but we're just checking for any trend icon
    expect(screen.getByTestId('trendingdownicon')).toBeInTheDocument();
  });

  it('shows neutral trend indicator', () => {
    render(
      <WithTheme>
        <KPICard {...defaultProps} change={0} changeText="No change" />
      </WithTheme>
    );

    expect(screen.getByText('No change')).toBeInTheDocument();
  });

  it('renders progress bar when progressValue is provided', () => {
    render(
      <WithTheme>
        <KPICard {...defaultProps} progressValue={75} />
      </WithTheme>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('does not render progress bar when progressValue is null', () => {
    render(
      <WithTheme>
        <KPICard {...defaultProps} />
      </WithTheme>
    );

    // There should be no progress bar
    const progressBars = screen.queryAllByRole('progressbar');
    // Filter out the circular progress from the icon
    const linearProgressBars = progressBars.filter(pb => 
      pb.classList.contains('MuiLinearProgress-root')
    );
    expect(linearProgressBars).toHaveLength(0);
  });
});

describe('CircularKPICard', () => {
  const defaultProps = {
    title: 'Test Circular KPI',
    value: 75,
    icon: <TrendingUpIcon />
  };

  it('renders correctly with basic props', () => {
    render(
      <WithTheme>
        <CircularKPICard {...defaultProps} />
      </WithTheme>
    );

    expect(screen.getByText('Test Circular KPI')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByTestId('trendingupicon')).toBeInTheDocument();
  });

  it('shows positive trend indicator', () => {
    render(
      <WithTheme>
        <CircularKPICard {...defaultProps} change={10} changeText="Increased" />
      </WithTheme>
    );

    expect(screen.getByText('Increased')).toBeInTheDocument();
    expect(screen.getByTestId('trendingupicon')).toBeInTheDocument();
  });

  it('shows negative trend indicator', () => {
    render(
      <WithTheme>
        <CircularKPICard {...defaultProps} change={-5} changeText="Decreased" />
      </WithTheme>
    );

    expect(screen.getByText('Decreased')).toBeInTheDocument();
    // The icon will be TrendingDownIcon, but we're just checking for any trend icon
    expect(screen.getByTestId('trendingdownicon')).toBeInTheDocument();
  });

  it('handles values over 100 correctly', () => {
    render(
      <WithTheme>
        <CircularKPICard {...defaultProps} value={120} />
      </WithTheme>
    );

    // Should still render without errors even with value > 100
    expect(screen.getByText('120')).toBeInTheDocument();
  });
});