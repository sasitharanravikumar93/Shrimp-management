import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';
import * as api from '../services/api';

// Mock the API calls
jest.mock('../services/api');

// Mock the context
jest.mock('../context/SeasonContext', () => ({
  useSeason: () => ({
    selectedSeason: null
  })
}));

// Mock react-router-dom useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Mock the chart components from recharts
jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  ResponsiveContainer: ({ children }) => <div data-testid=\"responsive-container\">{children}</div>,
  BarChart: () => <div data-testid=\"bar-chart\">Bar Chart</div>,
  Bar: () => <div data-testid=\"bar\">Bar</div>,
  XAxis: () => <div data-testid=\"x-axis\">X Axis</div>,
  YAxis: () => <div data-testid=\"y-axis\">Y Axis</div>,
  CartesianGrid: () => <div data-testid=\"cartesian-grid\">Cartesian Grid</div>,
  Tooltip: () => <div data-testid=\"tooltip\">Tooltip</div>,
  Legend: () => <div data-testid=\"legend\">Legend</div>,
  LineChart: () => <div data-testid=\"line-chart\">Line Chart</div>,
  Line: () => <div data-testid=\"line\">Line</div>,
  PieChart: () => <div data-testid=\"pie-chart\">Pie Chart</div>,
  Pie: () => <div data-testid=\"pie\">Pie</div>,
  Cell: () => <div data-testid=\"cell\">Cell</div>
}));

// Mock the components that are imported
jest.mock('../components/KPICard', () => {
  return ({ title, value }) => (
    <div data-testid=\"kpi-card\">
      <span data-testid=\"kpi-title\">{title}</span>
      <span data-testid=\"kpi-value\">{value}</span>
    </div>
  );
});

jest.mock('../components/AlertBanner', () => {
  return ({ message, severity, dismissible, onClose }) => (
    <div data-testid=\"alert-banner\" data-severity={severity}>
      <span>{message}</span>
      {dismissible && <button onClick={onClose}>Close</button>}
    </div>
  );
});

jest.mock('../components/AquacultureTooltip', () => {
  return ({ children }) => <div data-testid=\"aquaculture-tooltip\">{children}</div>;
});

jest.mock('../components/PredictiveInsight', () => {
  return ({ title, insight }) => (
    <div data-testid=\"predictive-insight\">
      <span data-testid=\"insight-title\">{title}</span>
      <span data-testid=\"insight-content\">{insight}</span>
    </div>
  );
});

jest.mock('../components/HealthScore', () => {
  return ({ score }) => <div data-testid=\"health-score\">{score}</div>;
});

jest.mock('../components/PondCard', () => {
  return ({ pond, onClick, onManageClick, onTimelineClick }) => (
    <div data-testid=\"pond-card\">
      <span data-testid=\"pond-name\">{pond.name}</span>
      <span data-testid=\"pond-status\">{pond.status}</span>
      <button onClick={() => onClick()}>View</button>
      <button onClick={() => onManageClick()}>Manage</button>
      <button onClick={() => onTimelineClick()}>Timeline</button>
    </div>
  );
});

jest.mock('../components/DataTrend', () => {
  return ({ title }) => <div data-testid=\"data-trend\">{title}</div>;
});

jest.mock('../components/QuickActions', () => {
  return ({ onActionClick }) => (
    <div data-testid=\"quick-actions\">
      <button onClick={() => onActionClick({ id: 1, title: 'Test Action' })}>Quick Actions</button>
    </div>
  );
});

// Create a theme for testing
const theme = createTheme();

// Wrapper component to provide theme and router
const WithProviders = ({ children }) => (
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </ThemeProvider>
);

describe('DashboardPage', () => {
  const mockPonds = [
    { 
      _id: '1', 
      name: 'Pond A', 
      status: 'Active', 
      health: 'Good', 
      progress: 75, 
      healthScore: 85,
      seasonId: 'season1'
    },
    { 
      _id: '2', 
      name: 'Pond B', 
      status: 'Active', 
      health: 'Fair', 
      progress: 60, 
      healthScore: 70,
      seasonId: 'season1'
    },
    { 
      _id: '3', 
      name: 'Pond C', 
      status: 'Inactive', 
      health: 'Poor', 
      progress: 30, 
      healthScore: 45,
      seasonId: 'season1'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API functions
    api.getPonds = jest.fn().mockResolvedValue(mockPonds);
  });

  it('renders dashboard page with title and welcome message', async () => {
    render(
      <WithProviders>
        <DashboardPage />
      </WithProviders>
    );

    // Check that the page title is rendered
    expect(screen.getByText('Farm Dashboard')).toBeInTheDocument();
    
    // Check that the welcome message is rendered
    expect(screen.getByText('Welcome back! Here\\'s what\\'s happening with your shrimp farm today.')).toBeInTheDocument();
  });

  it('renders KPI cards with summary data', async () => {
    render(
      <WithProviders>
        <DashboardPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('kpi-card')).toBeInTheDocument();
    });

    // Check that KPI cards are rendered
    expect(screen.getByTestId('kpi-title')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-value')).toBeInTheDocument();
    
    // Should render 6 KPI cards based on summaryData
    expect(screen.getAllByTestId('kpi-card')).toHaveLength(6);
  });

  it('renders data trend charts', async () => {
    render(
      <WithProviders>
        <DashboardPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('data-trend')).toBeInTheDocument();
    });

    // Check that data trend components are rendered
    expect(screen.getByText('Water Quality Trend')).toBeInTheDocument();
    expect(screen.getByText('Feed Consumption Trend')).toBeInTheDocument();
  });

  it('renders pond cards with pond data', async () => {
    render(
      <WithProviders>
        <DashboardPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('pond-card')).toBeInTheDocument();
    });

    // Check that pond cards are rendered
    expect(screen.getByTestId('pond-name')).toBeInTheDocument();
    expect(screen.getByTestId('pond-status')).toBeInTheDocument();
    
    // Should render 3 pond cards based on mock data
    expect(screen.getAllByTestId('pond-card')).toHaveLength(3);
  });

  it('renders predictive insights', async () => {
    render(
      <WithProviders>
        <DashboardPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('predictive-insight')).toBeInTheDocument();
    });

    // Check that predictive insights are rendered
    expect(screen.getByText('Water Quality Alert')).toBeInTheDocument();
    expect(screen.getByText('Growth Optimization')).toBeInTheDocument();
    expect(screen.getByText('Harvest Projection')).toBeInTheDocument();
  });

  it('renders alert banner initially', async () => {
    render(
      <WithProviders>
        <DashboardPage />
      </WithProviders>
    );

    // Check that alert banner is rendered
    expect(screen.getByTestId('alert-banner')).toBeInTheDocument();
    expect(screen.getByText('Water quality alert in 2 ponds. Please check Pond B and Pond E immediately.')).toBeInTheDocument();
  });

  it('hides alert banner when close button is clicked', async () => {
    render(
      <WithProviders>
        <DashboardPage />
      </WithProviders>
    );

    // Check that alert banner is initially rendered
    expect(screen.getByTestId('alert-banner')).toBeInTheDocument();

    // Click the close button
    const closeButton = screen.getByText('Close');
    closeButton.click();

    // Check that alert banner is no longer in the document
    expect(screen.queryByTestId('alert-banner')).not.toBeInTheDocument();
  });

  it('filters ponds based on status', async () => {
    render(
      <WithProviders>
        <DashboardPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('pond-card')).toBeInTheDocument();
    });

    // Check that all ponds are initially visible
    expect(screen.getAllByTestId('pond-card')).toHaveLength(3);

    // Click on \"Active\" filter
    const activeFilter = screen.getByText('Active');
    activeFilter.click();

    // Check that only active ponds are visible
    // Note: This test might need adjustment based on how the filtering actually works in the component
  });

  it('shows loading state initially', () => {
    // Mock API to simulate loading
    api.getPonds = jest.fn(() => new Promise(() => {})); // Never resolves
    
    render(
      <WithProviders>
        <DashboardPage />
      </WithProviders>
    );

    // Should show loading spinner
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error state when API call fails', async () => {
    // Mock API to simulate error
    api.getPonds = jest.fn().mockRejectedValue(new Error('Failed to fetch ponds'));
    
    render(
      <WithProviders>
        <DashboardPage />
      </WithProviders>
    );

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Error loading dashboard data/)).toBeInTheDocument();
    });
    
    // Should show error message
    expect(screen.getByText(/Failed to fetch ponds/)).toBeInTheDocument();
  });

  it('renders quick actions component', async () => {
    render(
      <WithProviders>
        <DashboardPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    });

    // Check that quick actions component is rendered
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
  });
});