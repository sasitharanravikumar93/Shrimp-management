import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { SeasonProvider } from '../context/SeasonContext';
import DashboardPage from '../pages/DashboardPage';
import * as api from '../services/api';

// Mock the API calls
jest.mock('../services/api');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Mock the chart components from recharts
// eslint-disable-next-line react/display-name
jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  BarChart: () => <div data-testid='bar-chart'>Bar Chart</div>,
  Bar: () => <div data-testid='bar'>Bar</div>,
  XAxis: () => <div data-testid='x-axis'>X Axis</div>,
  YAxis: () => <div data-testid='y-axis'>Y Axis</div>,
  CartesianGrid: () => <div data-testid='cartesian-grid'>Cartesian Grid</div>,
  Tooltip: () => <div data-testid='tooltip'>Tooltip</div>,
  Legend: () => <div data-testid='legend'>Legend</div>,
  ResponsiveContainer: ({ children }) => <div data-testid='responsive-container'>{children}</div>,
  LineChart: () => <div data-testid='line-chart'>Line Chart</div>,
  Line: () => <div data-testid='line'>Line</div>,
  PieChart: () => <div data-testid='pie-chart'>Pie Chart</div>,
  Pie: () => <div data-testid='pie'>Pie</div>,
  Cell: () => <div data-testid='cell'>Cell</div>
}));

// Mock the components that are imported
// eslint-disable-next-line react/display-name, react/prop-types
jest.mock('../components/KPICard', () => ({
  __esModule: true,
  default: ({ title, value, changeText, suffix }) => (
    <div data-testid='kpi-card'>
      <span data-testid='kpi-title'>{title}</span>
      <span data-testid='kpi-value'>
        {value}
        {suffix}
      </span>
      {changeText && <span data-testid='kpi-change'>{changeText}</span>}
    </div>
  ),
  // eslint-disable-next-line react/prop-types
  CircularKPICard: ({ title, value }) => (
    <div data-testid='circular-kpi-card'>
      <span data-testid='circular-kpi-title'>{title}</span>
      <span data-testid='circular-kpi-value'>{value}</span>
    </div>
  )
}));

// eslint-disable-next-line react/display-name, react/prop-types
jest.mock('../components/AlertBanner', () => {
  return ({ message, severity, dismissible, onClose }) => (
    <div data-testid='alert-banner' data-severity={severity}>
      {message}
      {dismissible && <button onClick={onClose}>Close</button>}
    </div>
  );
});

// eslint-disable-next-line react/display-name, react/prop-types
jest.mock('../components/AquacultureTooltip', () => {
  return ({ children }) => <div data-testid='aquaculture-tooltip'>{children}</div>;
});

// eslint-disable-next-line react/display-name, react/prop-types
jest.mock('../components/PredictiveInsight', () => {
  return ({ title, insight, confidence, projectedDate }) => (
    <div data-testid='predictive-insight'>
      <span data-testid='insight-title'>{title}</span>
      <span data-testid='insight-content'>{insight}</span>
      {confidence && <span data-testid='insight-confidence'>{confidence}%</span>}
      {projectedDate && <span data-testid='insight-date'>{projectedDate}</span>}
    </div>
  );
});

// eslint-disable-next-line react/display-name, react/prop-types
jest.mock('../components/HealthScore', () => {
  return ({ score }) => (
    <div data-testid='health-score' role='progressbar' aria-valuenow={score}>
      {score}
    </div>
  );
});

// eslint-disable-next-line react/display-name, react/prop-types
jest.mock('../components/PondCard', () => {
  return ({ pond }) => (
    <div data-testid='pond-card'>
      <span data-testid='pond-name'>{pond.name}</span>
      <span data-testid='pond-status'>{pond.status}</span>
      <span data-testid='pond-health'>{pond.health}</span>
      <span data-testid='pond-progress'>{pond.progress}%</span>
    </div>
  );
});

// eslint-disable-next-line react/display-name, react/prop-types
jest.mock('../components/DataTrend', () => {
  return ({ title, data }) => (
    <div data-testid='data-trend'>
      <span data-testid='data-trend-title'>{title}</span>
      <span data-testid='data-trend-content'>Chart with {data?.length || 0} data points</span>
    </div>
  );
});

// eslint-disable-next-line react/display-name, react/prop-types, no-unused-vars
jest.mock('../components/QuickActions', () => {
  return ({ onActionClick: _onActionClick }) => (
    <div data-testid='quick-actions'>Quick Actions</div>
  );
});

// Mock SeasonContext
const mockSeasonContext = {
  seasons: [{ id: 1, name: 'Test Season', status: 'Active' }],
  selectedSeason: { id: 1, name: 'Test Season', status: 'Active' },
  selectSeason: jest.fn(),
  setSelectedSeason: jest.fn(),
  loading: false,
  error: null
};

jest.mock('../context/SeasonContext', () => ({
  ...jest.requireActual('../context/SeasonContext'),
  useSeason: () => mockSeasonContext
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', async () => {
    // Mock API to simulate loading
    api.getPonds.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <BrowserRouter>
        <SeasonProvider>
          <DashboardPage />
        </SeasonProvider>
      </BrowserRouter>
    );

    // Should show loading spinner
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render dashboard content when data is loaded', async () => {
    // Mock API responses
    api.getPonds.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Pond A',
          status: 'Active',
          seasonId: 1,
          health: 'Good',
          progress: 75,
          healthScore: 85
        },
        {
          id: 2,
          name: 'Pond B',
          status: 'Inactive',
          seasonId: 1,
          health: 'Fair',
          progress: 45,
          healthScore: 65
        }
      ]
    });

    render(
      <BrowserRouter>
        <SeasonProvider>
          <DashboardPage />
        </SeasonProvider>
      </BrowserRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check that key elements are rendered
    expect(screen.getByText('Farm Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Individual Pond Management')).toBeInTheDocument();
    expect(screen.getByText('AI Insights & Recommendations')).toBeInTheDocument();

    // Check that KPI cards are rendered (there are 6)
    expect(screen.getAllByTestId('kpi-card')).toHaveLength(6);

    // Check that pond cards are rendered
    expect(screen.getAllByTestId('pond-card')).toHaveLength(2);

    // Check that data trends are rendered
    expect(screen.getByText('Water Quality Trend')).toBeInTheDocument();
    expect(screen.getByText('Feed Consumption Trend')).toBeInTheDocument();
  });

  it('should show error message when API fails', async () => {
    // Mock API to simulate error
    const errorMessage = 'Failed to fetch ponds';
    api.getPonds.mockRejectedValue(new Error(errorMessage));

    render(
      <BrowserRouter>
        <SeasonProvider>
          <DashboardPage />
        </SeasonProvider>
      </BrowserRouter>
    );

    // Wait for error to be displayed
    await waitFor(
      () => {
        expect(
          screen.getByText((content, _element) => {
            return content.includes('Error loading dashboard data');
          })
        ).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it('should filter ponds based on status', async () => {
    // Mock API responses
    api.getPonds.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Pond A',
          status: 'Active',
          seasonId: 1,
          health: 'Good',
          progress: 75,
          healthScore: 85
        },
        {
          id: 2,
          name: 'Pond B',
          status: 'Inactive',
          seasonId: 1,
          health: 'Fair',
          progress: 45,
          healthScore: 65
        }
      ]
    });

    render(
      <BrowserRouter>
        <SeasonProvider>
          <DashboardPage />
        </SeasonProvider>
      </BrowserRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check that both ponds are initially shown
    expect(screen.getAllByTestId('pond-card')).toHaveLength(2);
  });
});
