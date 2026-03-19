import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropTypes from 'prop-types';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import * as api from '../services/api';

import FeedViewPage from './FeedViewPage';

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
const MockLocalizationProvider = ({ children }) => (
  <div data-testid='localization-provider'>{children}</div>
);
MockLocalizationProvider.propTypes = { children: PropTypes.node.isRequired };
jest.mock('@mui/x-date-pickers/LocalizationProvider', () => MockLocalizationProvider);

const MockDatePicker = ({ label, value, onChange }) => {
  const TextField = require('@mui/material/TextField').default;
  return (
    <TextField
      label={label}
      value={value ? value.toISOString().split('T')[0] : ''}
      onChange={e => onChange(new Date(e.target.value))}
      data-testid={`date-picker-${label}`}
    />
  );
};
MockDatePicker.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired
};
jest.mock('@mui/x-date-pickers/DatePicker', () => MockDatePicker);

// Create a theme for testing
const theme = createTheme();

// Wrapper component to provide theme and router
const WithProviders = ({ children }) => (
  <ThemeProvider theme={theme}>
    <BrowserRouter>{children}</BrowserRouter>
  </ThemeProvider>
);
WithProviders.propTypes = { children: PropTypes.node.isRequired };

describe('FeedViewPage', () => {
  const mockFeedEntries = [
    {
      _id: '1',
      date: '2023-06-15T00:00:00.000Z',
      time: '2023-06-15T14:30:00.000Z',
      pondId: 'pond1',
      feedType: 'Standard Feed',
      quantity: 50
    },
    {
      _id: '2',
      date: '2023-06-14T00:00:00.000Z',
      time: '2023-06-14T10:15:00.000Z',
      pondId: 'pond2',
      feedType: 'Premium Feed',
      quantity: 30
    }
  ];

  const mockPonds = [
    { _id: 'pond1', name: 'Pond A' },
    { _id: 'pond2', name: 'Pond B' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock API functions
    jest.spyOn(api, 'getFeedInputs').mockResolvedValue(mockFeedEntries);
    jest.spyOn(api, 'getPonds').mockResolvedValue(mockPonds);
  });

  it('renders feed view page with title and export button', async () => {
    render(
      <WithProviders>
        <FeedViewPage />
      </WithProviders>
    );

    // Check that the page title is rendered
    expect(screen.getByText('Feed History')).toBeInTheDocument();

    // Check that the export button is rendered
    expect(screen.getByText('Export Data')).toBeInTheDocument();
  });

  it('renders filter section with date pickers, pond selector, and search field', async () => {
    render(
      <WithProviders>
        <FeedViewPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Filter Feed Data')).toBeInTheDocument();
    });

    // Check that filter section is rendered
    expect(screen.getByText('Filter Feed Data')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Pond')).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();

    // Check that pond options are rendered
    expect(screen.getByText('All Ponds')).toBeInTheDocument();
    expect(screen.getByText('Pond A')).toBeInTheDocument();
    expect(screen.getByText('Pond B')).toBeInTheDocument();
  });

  it('renders feed entries in table when data is loaded', async () => {
    render(
      <WithProviders>
        <FeedViewPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('2023-06-15')).toBeInTheDocument();
    });

    // Check that feed entries are displayed in the table
    expect(screen.getByText('2023-06-15')).toBeInTheDocument();
    expect(screen.getByText('14:30')).toBeInTheDocument();
    expect(screen.getByText('Pond A')).toBeInTheDocument();
    expect(screen.getByText('Standard Feed')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();

    // Check second entry
    expect(screen.getByText('2023-06-14')).toBeInTheDocument();
    expect(screen.getByText('10:15')).toBeInTheDocument();
    expect(screen.getByText('Pond B')).toBeInTheDocument();
    expect(screen.getByText('Premium Feed')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    // Mock API to simulate loading
    jest.spyOn(api, 'getFeedInputs').mockImplementation(() => new Promise(() => {})); // Never resolves
    jest.spyOn(api, 'getPonds').mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <WithProviders>
        <FeedViewPage />
      </WithProviders>
    );

    // Should show loading spinner
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error state when API calls fail', async () => {
    // Mock API to simulate error
    jest.spyOn(api, 'getFeedInputs').mockRejectedValue(new Error('Failed to fetch feed entries'));
    jest.spyOn(api, 'getPonds').mockResolvedValue(mockPonds);

    render(
      <WithProviders>
        <FeedViewPage />
      </WithProviders>
    );

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Error loading data/)).toBeInTheDocument();
    });

    // Should show error message
    expect(screen.getByText(/Failed to fetch feed entries/)).toBeInTheDocument();
  });

  it('filters feed entries based on search term', async () => {
    render(
      <WithProviders>
        <FeedViewPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('2023-06-15')).toBeInTheDocument();
    });

    // Check that all entries are initially visible
    expect(screen.getByText('Standard Feed')).toBeInTheDocument();
    expect(screen.getByText('Premium Feed')).toBeInTheDocument();

    // Search for "Standard"
    const searchInput = screen.getByLabelText('Search');
    await userEvent.type(searchInput, 'Standard');

    // Check that only matching entries are visible
    expect(screen.getByText('Standard Feed')).toBeInTheDocument();
    expect(screen.queryByText('Premium Feed')).not.toBeInTheDocument();
  });

  it('filters feed entries based on pond selection', async () => {
    render(
      <WithProviders>
        <FeedViewPage />
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
    const pondSelect = screen.getByLabelText('Pond');
    await userEvent.click(pondSelect); // Open the dropdown

    const pondAOption = screen.getByText('Pond A');
    await userEvent.click(pondAOption); // Select Pond A

    // Check that only Pond A entries are visible
    expect(screen.getByText('Pond A')).toBeInTheDocument();
    expect(screen.queryByText('Pond B')).not.toBeInTheDocument();
  });

  it('calls export function when export button is clicked', async () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(
      <WithProviders>
        <FeedViewPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Feed History')).toBeInTheDocument();
    });

    // Click the export button
    const exportButton = screen.getByText('Export Data');
    await userEvent.click(exportButton);

    // Check that export function was called
    expect(consoleLog).toHaveBeenCalledWith('Exporting data');

    // Clean up
    consoleLog.mockRestore();
  });

  it('calls filter function when apply filters button is clicked', async () => {
    // Mock useApiData to control refetch
    const mockRefetch = jest.fn();
    jest.spyOn(require('../hooks/useApi'), 'useApiData').mockReturnValue({
      data: { data: mockFeedEntries },
      loading: false,
      error: null,
      refetch: mockRefetch
    });

    render(
      <WithProviders>
        <FeedViewPage />
      </WithProviders>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Feed History')).toBeInTheDocument();
    });

    // Click the apply filters button
    const applyFiltersButton = screen.getByText('Apply Filters');
    await userEvent.click(applyFiltersButton);

    // Check that refetch function was called
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
