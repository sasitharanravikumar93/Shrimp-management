import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import HealthScore from './HealthScore';

// Create a theme for testing
const theme = createTheme();

// Wrapper component to provide theme
const WithTheme = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('HealthScore', () => {
  it('renders correctly with default props', () => {
    render(
      <WithTheme>
        <HealthScore score={85} />
      </WithTheme>
    );

    // Check that the score is displayed
    expect(screen.getAllByRole('progressbar')[1]).toHaveAttribute('aria-valuenow', '85');
    
    // Check that the status text is displayed
    expect(screen.getByText('Good')).toBeInTheDocument();
    
    // Check that the correct icon is displayed (CheckCircleIcon for score >= 80)
    expect(screen.getByTestId('checkcircleicon')).toBeInTheDocument();
  });

  it('shows correct icon and status for good health (>= 80)', () => {
    render(
      <WithTheme>
        <HealthScore score={85} />
      </WithTheme>
    );

    expect(screen.getByTestId('checkcircleicon')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    // The text should have green color for good health
    expect(screen.getByText('Good')).toHaveStyle('color: #28A745');
  });

  it('shows correct icon and status for fair health (60-79)', () => {
    render(
      <WithTheme>
        <HealthScore score={70} />
      </WithTheme>
    );

    expect(screen.getByTestId('warningicon')).toBeInTheDocument();
    expect(screen.getByText('Fair')).toBeInTheDocument();
    // The text should have yellow color for fair health
    expect(screen.getByText('Fair')).toHaveStyle('color: #FFC107');
  });

  it('shows correct icon and status for poor health (< 60)', () => {
    render(
      <WithTheme>
        <HealthScore score={45} />
      </WithTheme>
    );

    expect(screen.getByTestId('erroricon')).toBeInTheDocument();
    expect(screen.getByText('Poor')).toBeInTheDocument();
    // The text should have red color for poor health
    expect(screen.getByText('Poor')).toHaveStyle('color: #DC3545');
  });

  it('hides label when showLabel is false', () => {
    render(
      <WithTheme>
        <HealthScore score={85} showLabel={false} />
      </WithTheme>
    );

    // Status text should not be in the document
    expect(screen.queryByText('Good')).not.toBeInTheDocument();
    
    // But the score should still be visible (in the CircularProgress)
    expect(screen.getAllByRole('progressbar')[1]).toHaveAttribute('aria-valuenow', '85');
  });

  it('renders with custom size', () => {
    render(
      <WithTheme>
        <HealthScore score={85} size={100} />
      </WithTheme>
    );

    // The component should render without errors with custom size
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('handles edge cases for score values', () => {
    // Test exactly 80 (should be Good)
    const { rerender } = render(
      <WithTheme>
        <HealthScore score={80} />
      </WithTheme>
    );
    expect(screen.getByText('Good')).toBeInTheDocument();

    // Test exactly 60 (should be Fair)
    rerender(
      <WithTheme>
        <HealthScore score={60} />
      </WithTheme>
    );
    expect(screen.getByText('Fair')).toBeInTheDocument();

    // Test exactly 59 (should be Poor)
    rerender(
      <WithTheme>
        <HealthScore score={59} />
      </WithTheme>
    );
    expect(screen.getByText('Poor')).toBeInTheDocument();

    // Test 0
    rerender(
      <WithTheme>
        <HealthScore score={0} />
      </WithTheme>
    );
    expect(screen.getByText('Poor')).toBeInTheDocument();

    // Test 100
    rerender(
      <WithTheme>
        <HealthScore score={100} />
      </WithTheme>
    );
    expect(screen.getByText('Good')).toBeInTheDocument();
  });
});

// Mocking the icons to add data-testid
jest.mock('@mui/icons-material', () => ({
  ...jest.requireActual('@mui/icons-material'),
  CheckCircle: (props) => <div {...props} data-testid="checkcircleicon" />,
  Warning: (props) => <div {...props} data-testid="warningicon" />,
  Error: (props) => <div {...props} data-testid="erroricon" />,
}));
