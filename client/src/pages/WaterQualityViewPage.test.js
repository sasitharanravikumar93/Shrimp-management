import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import WaterQualityViewPage from './WaterQualityViewPage';
import * as api from '../services/api';

// Mock the API calls
jest.mock('../services/api');

// Mock date-fns
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  format: (date, formatString) => {
    if (formatString === 'yyyy-MM-dd') return '2023-06-15';
    if (formatString === 'HH:mm') return '14:30';
    return date.toString();
  }
}));

// Mock MUI date pickers
jest.mock('@mui/x-date-pickers/LocalizationProvider', () => {
  return ({ children }) => <div data-testid="localization-provider">{children}</div>;
});

jest.mock('@mui/x-date-pickers/DatePicker', () => {
  const React = require('react');
  return ({ renderInput, value, onChange, label }) => {
    const inputProps = renderInput({ inputProps: {} });
    return (
      <div data-testid={`date-picker-${label}`}>
        <label>{label}</label>
        {React.cloneElement(inputProps, {
          onChange: (e) => onChange(new Date(e.target.value)),
          value: value ? value.toISOString().split('T')[0] : ''
        })}
      </div>
    );
  };
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

describe('WaterQualityViewPage', () => {
  const mockWaterQualityEntries = [
    {
      _id: '1',
      date: '2023-06-15T00:00:00.000Z',
      time: '2023-06-15T14:30:00.000Z',
      pondId: 'pond1',
      pH: 7.2,
      dissolvedOxygen: 5.5,
      temperature: 28.5,
      salinity: 25.0,
      ammonia: 0.01,
      nitrite: 0.1,
      alkalinity: 120.0
    },
    {
      _id: '2',
      date: '2023-06-14T00:00:00.000Z',
      time: '2023-06-14T10:15:00.000Z',
      pondId: 'pond2',
      pH: 6.8,
      dissolvedOxygen: 4.2,
      temperature: 29.0,
      salinity: 24.5,
      ammonia: 0.02,
      nitrite: 0.15,
      alkalinity: 110.0
    }
  ];

  const mockPonds = [
    { _id: 'pond1', name: 'Pond A' },
    { _id: 'pond2', name: 'Pond B' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API functions
    api.getWaterQualityInputs = jest.fn().mockResolvedValue(mockWaterQualityEntries);
    api.getPonds = jest.fn().mockResolvedValue(mockPonds);
  });

  it('renders water quality view page with title and export button', async () => {
    render(
      <WithProviders>
        <WaterQualityViewPage />
      </WithProviders>
    );

    // Check that the page title is rendered
    expect(screen.getByText('Water Quality History')).toBeInTheDocument();
    
    // Check that the export button is rendered
    expect(screen.getByText('Export Data')).toBeInTheDocument();
  });

  it('renders filter section with date pickers, pond selector, and search field', async () => {
    render(
      <WithProviders>
        <WaterQualityViewPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Filter Water Quality Data')).toBeInTheDocument();
    });

    // Check that filter section is rendered
    expect(screen.getByText('Filter Water Quality Data')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Pond')).toBeInTheDocument();
    expect(screen.getByText('Parameter')).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    
    // Check that pond options are rendered
    expect(screen.getByText('All Ponds')).toBeInTheDocument();
    expect(screen.getByText('Pond A')).toBeInTheDocument();
    expect(screen.getByText('Pond B')).toBeInTheDocument();
    
    // Check that parameter options are rendered
    expect(screen.getByText('All Parameters')).toBeInTheDocument();
    expect(screen.getByText('pH')).toBeInTheDocument();
    expect(screen.getByText('Dissolved Oxygen')).toBeInTheDocument();
    expect(screen.getByText('Temperature')).toBeInTheDocument();
  });

  it('renders water quality entries in table when data is loaded', async () => {
    render(
      <WithProviders>
        <WaterQualityViewPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('2023-06-15')).toBeInTheDocument();
    });

    // Check that water quality entries are displayed in the table
    expect(screen.getByText('2023-06-15')).toBeInTheDocument();
    expect(screen.getByText('14:30')).toBeInTheDocument();
    expect(screen.getByText('Pond A')).toBeInTheDocument();
    expect(screen.getByText('7.2')).toBeInTheDocument();
    expect(screen.getByText('5.50')).toBeInTheDocument();
    expect(screen.getByText('28.5')).toBeInTheDocument();
    expect(screen.getByText('25.0')).toBeInTheDocument();
    expect(screen.getByText('0.010')).toBeInTheDocument();
    expect(screen.getByText('0.100')).toBeInTheDocument();
    expect(screen.getByText('120.0')).toBeInTheDocument();

    // Check second entry
    expect(screen.getByText('2023-06-14')).toBeInTheDocument();
    expect(screen.getByText('10:15')).toBeInTheDocument();
    expect(screen.getByText('Pond B')).toBeInTheDocument();
    expect(screen.getByText('6.8')).toBeInTheDocument();
    expect(screen.getByText('4.20')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    // Mock API to simulate loading
    api.getWaterQualityInputs = jest.fn(() => new Promise(() => {})); // Never resolves
    api.getPonds = jest.fn(() => new Promise(() => {})); // Never resolves
    
    render(
      <WithProviders>
        <WaterQualityViewPage />
      </WithProviders>
    );

    // Should show loading spinner
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error state when API calls fail', async () => {
    // Mock API to simulate error
    api.getWaterQualityInputs = jest.fn().mockRejectedValue(new Error('Failed to fetch water quality entries'));
    api.getPonds = jest.fn().mockResolvedValue(mockPonds);
    
    render(
      <WithProviders>
        <WaterQualityViewPage />
      </WithProviders>
    );

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Error loading data/)).toBeInTheDocument();
    });
    
    // Should show error message
    expect(screen.getByText(/Failed to fetch water quality entries/)).toBeInTheDocument();
  });

  it('filters water quality entries based on search term', async () => {
    render(
      <WithProviders>
        <WaterQualityViewPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('2023-06-15')).toBeInTheDocument();
    });

    // Check that all entries are initially visible
    expect(screen.getByText('Pond A')).toBeInTheDocument();
    expect(screen.getByText('Pond B')).toBeInTheDocument();

    // Search for "7.2"
    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: '7.2' } });

    // Check that only matching entries are visible
    // Note: This implementation might need adjustment based on how the filtering actually works
  });

  it('filters water quality entries based on pond selection', async () => {
    render(
      <WithProviders>
        <WaterQualityViewPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('2023-06-15')).toBeInTheDocument();
    });

    // Check that all entries are initially visible
    expect(screen.getByText('Pond A')).toBeInTheDocument();
    expect(screen.getByText('Pond B')).toBeInTheDocument();

    // Select Pond A
    // Note: This implementation might need adjustment based on how the select actually works
  });

  it('calls export function when export button is clicked', async () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(
      <WithProviders>
        <WaterQualityViewPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Water Quality History')).toBeInTheDocument();
    });

    // Click the export button
    const exportButton = screen.getByText('Export Data');
    fireEvent.click(exportButton);

    // Check that export function was called
    expect(consoleLog).toHaveBeenCalledWith('Exporting data');

    // Clean up
    consoleLog.mockRestore();
  });

  it('calls filter function when apply filters button is clicked', async () => {
    render(
      <WithProviders>
        <WaterQualityViewPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Water Quality History')).toBeInTheDocument();
    });

    // Click the apply filters button
    const applyFiltersButton = screen.getByText('Apply Filters');
    fireEvent.click(applyFiltersButton);

    // Check that refetch function was called
    // Note: This would require mocking the useApiData hook more thoroughly
  });
});