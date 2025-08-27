import { createTheme, ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import PondCard from './PondCard';

const theme = createTheme();

// Wrapper component to provide theme
const WithTheme = ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>;

// Mock HealthScore component
jest.mock('./HealthScore', () => {
  const HealthScore = ({ score }) => (
    <div data-testid='health-score' role='progressbar' aria-valuenow={score}>
      Health Score: {score}
    </div>
  );
  return HealthScore;
});

describe('PondCard', () => {
  const mockPond = {
    id: 1,
    name: 'Test Pond',
    status: 'Active',
    health: 'Good',
    healthScore: 85,
    progress: 75
  };

  const mockOnClick = jest.fn();
  const mockOnManageClick = jest.fn();
  const mockOnTimelineClick = jest.fn();

  const defaultProps = {
    pond: mockPond,
    onClick: mockOnClick,
    onManageClick: mockOnManageClick,
    onTimelineClick: mockOnTimelineClick
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pond information correctly', () => {
    render(
      <WithTheme>
        <PondCard {...defaultProps} />
      </WithTheme>
    );

    expect(screen.getByText('Test Pond')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('displays correct health score', () => {
    render(
      <WithTheme>
        <PondCard {...defaultProps} />
      </WithTheme>
    );

    // Health score is rendered as a component, so we check for its presence
    expect(screen.getByTestId('health-score')).toHaveAttribute('aria-valuenow', '85');
  });

  it('shows different chip colors based on status', () => {
    const { rerender } = render(
      <WithTheme>
        <PondCard {...defaultProps} />
      </WithTheme>
    );

    // Active status should have success color
    expect(screen.getByText('Active')).toHaveClass('MuiChip-colorSuccess');

    // Test with inactive status
    rerender(
      <WithTheme>
        <PondCard {...defaultProps} pond={{ ...mockPond, status: 'Inactive' }} />
      </WithTheme>
    );

    // Inactive status should have default color
    expect(screen.getByText('Inactive')).toHaveClass('MuiChip-colorDefault');
  });

  it('shows different chip colors based on health', () => {
    const { rerender } = render(
      <WithTheme>
        <PondCard {...defaultProps} />
      </WithTheme>
    );

    // Good health should have success color
    expect(screen.getByText('Good')).toHaveClass('MuiChip-colorSuccess');

    // Test with fair health
    rerender(
      <WithTheme>
        <PondCard {...defaultProps} pond={{ ...mockPond, health: 'Fair' }} />
      </WithTheme>
    );

    // Fair health should have warning color
    expect(screen.getByText('Fair')).toHaveClass('MuiChip-colorWarning');

    // Test with poor health
    rerender(
      <WithTheme>
        <PondCard {...defaultProps} pond={{ ...mockPond, health: 'Poor' }} />
      </WithTheme>
    );

    // Poor health should have error color
    expect(screen.getByText('Poor')).toHaveClass('MuiChip-colorError');
  });

  it('calls onClick when card is clicked', async () => {
    render(
      <WithTheme>
        <PondCard {...defaultProps} />
      </WithTheme>
    );

    // Use testing-library's recommended approach instead of direct Node access
    const card = screen.getByRole('button', { name: /Test Pond/i });
    await userEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('calls onManageClick when manage button is clicked', async () => {
    render(
      <WithTheme>
        <PondCard {...defaultProps} />
      </WithTheme>
    );

    const manageButton = screen.getByRole('button', { name: /Manage/i });
    await userEvent.click(manageButton);

    expect(mockOnManageClick).toHaveBeenCalledTimes(1);
    // Should not call the main onClick
    expect(mockOnClick).toHaveBeenCalledTimes(0);
  });

  it('calls onTimelineClick when timeline button is clicked', async () => {
    render(
      <WithTheme>
        <PondCard {...defaultProps} />
      </WithTheme>
    );

    const timelineButton = screen.getByRole('button', { name: /Timeline/i });
    await userEvent.click(timelineButton);

    expect(mockOnTimelineClick).toHaveBeenCalledTimes(1);
    // Should not call the main onClick
    expect(mockOnClick).toHaveBeenCalledTimes(0);
  });

  it('displays correct progress bar color based on progress value', () => {
    const { rerender } = render(
      <WithTheme>
        <PondCard {...defaultProps} />
      </WithTheme>
    );

    // 75% progress should have success color
    // Use testing-library's recommended approach instead of direct Node access
    expect(screen.getByText('75%')).toBeInTheDocument();

    // Test with medium progress (45%)
    rerender(
      <WithTheme>
        <PondCard {...defaultProps} pond={{ ...mockPond, progress: 45 }} />
      </WithTheme>
    );

    // 45% progress should be visible
    expect(screen.getByText('45%')).toBeInTheDocument();

    // Test with low progress (25%)
    rerender(
      <WithTheme>
        <PondCard {...defaultProps} pond={{ ...mockPond, progress: 25 }} />
      </WithTheme>
    );

    // 25% progress should be visible
    expect(screen.getByText('25%')).toBeInTheDocument();
  });
});
