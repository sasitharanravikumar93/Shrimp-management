import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import PredictiveInsight from './PredictiveInsight';

// Create a theme for testing
const theme = createTheme();

// Wrapper component to provide theme
const WithTheme = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('PredictiveInsight', () => {
  const defaultProps = {
    title: 'Test Insight',
    insight: 'This is a test predictive insight message'
  };

  it('renders correctly with basic props', () => {
    render(
      <WithTheme>
        <PredictiveInsight {...defaultProps} />
      </WithTheme>
    );

    expect(screen.getByText('Test Insight')).toBeInTheDocument();
    expect(screen.getByText('This is a test predictive insight message')).toBeInTheDocument();
  });

  it('shows confidence level when provided', () => {
    render(
      <WithTheme>
        <PredictiveInsight {...defaultProps} confidence={75} />
      </WithTheme>
    );

    expect(screen.getByText('Confidence Level')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows correct confidence color for high confidence (>= 80)', () => {
    render(
      <WithTheme>
        <PredictiveInsight {...defaultProps} confidence={85} />
      </WithTheme>
    );

    // High confidence should have success color
    expect(screen.getByText('85%')).toHaveStyle('color: rgb(46, 125, 50)'); // success.main
    expect(screen.getByRole('progressbar')).toHaveClass('MuiLinearProgress-colorSuccess');
  });

  it('shows correct confidence color for medium confidence (60-79)', () => {
    render(
      <WithTheme>
        <PredictiveInsight {...defaultProps} confidence={70} />
      </WithTheme>
    );

    // Medium confidence should have warning color
    expect(screen.getByText('70%')).toHaveStyle('color: rgb(237, 108, 2)'); // warning.main
    expect(screen.getByRole('progressbar')).toHaveClass('MuiLinearProgress-colorWarning');
  });

  it('shows correct confidence color for low confidence (< 60)', () => {
    render(
      <WithTheme>
        <PredictiveInsight {...defaultProps} confidence={45} />
      </WithTheme>
    );

    // Low confidence should have error color
    expect(screen.getByText('45%')).toHaveStyle('color: rgb(211, 47, 47)'); // error.main
    expect(screen.getByRole('progressbar')).toHaveClass('MuiLinearProgress-colorError');
  });

  it('does not show confidence when confidence is 0', () => {
    render(
      <WithTheme>
        <PredictiveInsight {...defaultProps} confidence={0} />
      </WithTheme>
    );

    expect(screen.queryByText('Confidence Level')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows projected date when provided', () => {
    const testDate = '2023-12-31';
    render(
      <WithTheme>
        <PredictiveInsight {...defaultProps} projectedDate={testDate} />
      </WithTheme>
    );

    expect(screen.getByText(`Projected: ${testDate}`)).toBeInTheDocument();
    expect(screen.getByTestId('calendartodayicon')).toBeInTheDocument();
  });

  it('does not show projected date when not provided', () => {
    render(
      <WithTheme>
        <PredictiveInsight {...defaultProps} />
      </WithTheme>
    );

    expect(screen.queryByText(/Projected:/)).not.toBeInTheDocument();
    expect(screen.queryByTestId('calendartodayicon')).not.toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    render(
      <WithTheme>
        <PredictiveInsight {...defaultProps} icon={<TrendingUpIcon data-testid="trendingupicon" />} />
      </WithTheme>
    );

    expect(screen.getByTestId('trendingupicon')).toBeInTheDocument();
  });

  it('renders with custom color', () => {
    render(
      <WithTheme>
        <PredictiveInsight {...defaultProps} color="secondary" />
      </WithTheme>
    );

    // Check that the avatar has the secondary color
    const avatar = screen.getByText('Test Insight').closest('.MuiCardContent-root').querySelector('.MuiAvatar-root');
    expect(avatar).toHaveStyle('background-color: rgb(156, 39, 176)'); // secondary.main
  });
});

// Mocking the icons to add data-testid
jest.mock('@mui/icons-material', () => ({
  ...jest.requireActual('@mui/icons-material'),
  CalendarToday: (props) => <div {...props} data-testid="calendartodayicon" />,
  TrendingUp: (props) => <div {...props} data-testid="trendingupicon" />,
  Info: (props) => <div {...props} data-testid="infoicon" />,
}));
