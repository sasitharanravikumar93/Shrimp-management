import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import PondManagementPage from './PondManagementPage';
import * as api from '../services/api';
import * as useApiHook from '../hooks/useApi';

// Mock the API calls
jest.mock('../services/api');
jest.mock('../hooks/useApi');

// Mock the context
jest.mock('../context/SeasonContext', () => ({
  useSeason: () => ({
    selectedSeason: { _id: 'season1', name: 'Test Season' }
  })
}));

// Mock react-router-dom useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ pondId: 'pond1' })
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  format: (date, formatString) => {
    if (formatString === 'yyyy-MM-dd') return '2023-06-15';
    if (formatString === 'HH:mm') return '14:30';
    return date.toString();
  }
}));

// Mock the chart components from recharts
jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: () => <div data-testid="bar-chart">Bar Chart</div>,
  Bar: () => <div data-testid="bar">Bar</div>,
  XAxis: () => <div data-testid="x-axis">X Axis</div>,
  YAxis: () => <div data-testid="y-axis">Y Axis</div>,
  CartesianGrid: () => <div data-testid="cartesian-grid">Cartesian Grid</div>,
  Tooltip: () => <div data-testid="tooltip">Tooltip</div>,
  Legend: () => <div data-testid="legend">Legend</div>,
  LineChart: () => <div data-testid="line-chart">Line Chart</div>,
  Line: () => <div data-testid="line">Line</div>,
  ScatterChart: () => <div data-testid="scatter-chart">Scatter Chart</div>,
  Scatter: () => <div data-testid="scatter">Scatter</div>,
  ZAxis: () => <div data-testid="z-axis">Z Axis</div>
}));

// Mock the components that are imported
jest.mock('../components/CustomCalendar', () => {
  return () => <div data-testid="custom-calendar">Custom Calendar</div>;
});

jest.mock('../components/HarvestProjection', () => {
  return () => <div data-testid="harvest-projection">Harvest Projection</div>;
});

jest.mock('../components/FeedCalculator', () => {
  return () => <div data-testid="feed-calculator">Feed Calculator</div>;
});

jest.mock('../components/WaterQualityAlert', () => {
  return () => <div data-testid="water-quality-alert">Water Quality Alert</div>;
});

jest.mock('../components/EventSuggestions', () => {
  return () => <div data-testid="event-suggestions">Event Suggestions</div>;
});

jest.mock('../components/AquacultureTooltip', () => {
  return ({ children }) => <div data-testid="aquaculture-tooltip">{children}</div>;
});

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: () => ({
    control: {},
    handleSubmit: (fn) => fn,
    reset: jest.fn(),
    setValue: jest.fn(),
    watch: jest.fn()
  }),
  Controller: ({ render }) => render({ field: { value: '', onChange: jest.fn() } })
}));

// Mock MUI date pickers
jest.mock('@mui/x-date-pickers/LocalizationProvider', () => {
  return ({ children }) => <div data-testid="localization-provider">{children}</div>;
});

jest.mock('@mui/x-date-pickers/DatePicker', () => {
  return () => <div data-testid="date-picker">Date Picker</div>;
});

jest.mock('@mui/x-date-pickers/TimePicker', () => {
  return () => <div data-testid="time-picker">Time Picker</div>;
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

describe('PondManagementPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useApi hook
    useApiHook.default = jest.fn(() => ({
      get: jest.fn()
    }));
    
    // Mock API functions
    api.getPondById = jest.fn().mockResolvedValue({
      id: 'pond1',
      name: 'Test Pond',
      seasonId: { name: 'Test Season' },
      status: 'Active',
      health: 'Good',
      projectedHarvest: '30 days'
    });
    
    api.getFeedInputsByPondId = jest.fn().mockResolvedValue([
      { _id: 'feed1', feedType: 'Standard Feed', date: '2023-06-15', time: '14:30', quantity: 50 }
    ]);
    
    api.getWaterQualityInputsByPondId = jest.fn().mockResolvedValue([
      { _id: 'water1', pH: 7.2, dissolvedOxygen: 5.5, temperature: 28.5, salinity: 25, date: '2023-06-15', time: '14:30' }
    ]);
    
    api.getGrowthSamplingsByPondId = jest.fn().mockResolvedValue([
      { _id: 'growth1', totalWeight: 500, totalCount: 25000, date: '2023-06-15', time: '14:30' }
    ]);
    
    api.getEventsByPondId = jest.fn().mockResolvedValue([
      { 
        _id: 'event1', 
        title: 'Feeding Event', 
        start: new Date('2023-06-15T14:30:00'), 
        end: new Date('2023-06-15T15:00:00'), 
        type: 'Feeding',
        resource: { description: 'Standard feeding' }
      }
    ]);
    
    api.createFeedInput = jest.fn().mockResolvedValue({});
    api.createWaterQualityInput = jest.fn().mockResolvedValue({});
    api.createGrowthSampling = jest.fn().mockResolvedValue({});
    api.createEvent = jest.fn().mockResolvedValue({});
  });

  it('renders pond management page with basic information', async () => {
    render(
      <WithProviders>
        <PondManagementPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Pond Management')).toBeInTheDocument();
    });

    // Check that pond information is displayed
    expect(screen.getByText('Test Pond Management')).toBeInTheDocument();
    expect(screen.getByText('Test Season')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Harvest: 30 days')).toBeInTheDocument();

    // Check that key components are rendered
    expect(screen.getByTestId('harvest-projection')).toBeInTheDocument();
    expect(screen.getByText('Data Management')).toBeInTheDocument();
    expect(screen.getByText('Add New Event')).toBeInTheDocument();
  });

  it('renders feed tab with feed data', async () => {
    render(
      <WithProviders>
        <PondManagementPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Pond Management')).toBeInTheDocument();
    });

    // Check feed tab is rendered
    expect(screen.getByText('Feed')).toBeInTheDocument();
    
    // Check feed history is displayed
    expect(screen.getByText('Standard Feed')).toBeInTheDocument();
    expect(screen.getByText('50 kg')).toBeInTheDocument();
    expect(screen.getByText('2023-06-15')).toBeInTheDocument();
    
    // Check feed chart is rendered
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders water quality tab with water data', async () => {
    render(
      <WithProviders>
        <PondManagementPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Pond Management')).toBeInTheDocument();
    });

    // Click on Water Quality tab
    const waterTab = screen.getByText('Water Quality');
    waterTab.click();

    // Check water quality tab is rendered
    expect(screen.getByText('Water Quality')).toBeInTheDocument();
    
    // Check water quality history is displayed
    expect(screen.getByText('Water Quality Check')).toBeInTheDocument();
    expect(screen.getByText('pH: 7.2 | DO: 5.5 | Temp: 28.5°C')).toBeInTheDocument();
    expect(screen.getByText('2023-06-15')).toBeInTheDocument();
    
    // Check water quality chart is rendered
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    
    // Check water quality alert is rendered
    expect(screen.getByTestId('water-quality-alert')).toBeInTheDocument();
  });

  it('renders growth sampling tab with growth data', async () => {
    render(
      <WithProviders>
        <PondManagementPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Pond Management')).toBeInTheDocument();
    });

    // Click on Growth Sampling tab
    const growthTab = screen.getByText('Growth Sampling');
    growthTab.click();

    // Check growth sampling tab is rendered
    expect(screen.getByText('Growth Sampling')).toBeInTheDocument();
    
    // Check growth sampling history is displayed
    expect(screen.getByText('Growth Sampling')).toBeInTheDocument();
    expect(screen.getByText('Total: 500kg / 25000 pcs')).toBeInTheDocument();
    expect(screen.getByText('2023-06-15')).toBeInTheDocument();
    
    // Check growth chart is rendered
    expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
  });

  it('switches to calendar view when button is clicked', async () => {
    render(
      <WithProviders>
        <PondManagementPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Pond Management')).toBeInTheDocument();
    });

    // Click on Calendar View button
    const calendarViewButton = screen.getByText('Calendar View');
    calendarViewButton.click();

    // Check that calendar view is displayed
    expect(screen.getByText('Events Calendar')).toBeInTheDocument();
    expect(screen.getByTestId('custom-calendar')).toBeInTheDocument();
    expect(screen.getByTestId('event-suggestions')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    // Mock API calls to simulate loading
    api.getPondById = jest.fn(() => new Promise(() => {})); // Never resolves
    
    render(
      <WithProviders>
        <PondManagementPage />
      </WithProviders>
    );

    // Should show loading spinner
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error state when API calls fail', async () => {
    // Mock API calls to simulate error
    api.getPondById = jest.fn().mockRejectedValue(new Error('Failed to fetch pond'));
    
    render(
      <WithProviders>
        <PondManagementPage />
      </WithProviders>
    );

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Error loading pond data/)).toBeInTheDocument();
    });
    
    // Should show error message
    expect(screen.getByText(/Failed to fetch pond/)).toBeInTheDocument();
  });
});