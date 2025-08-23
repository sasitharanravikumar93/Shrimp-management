import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NurseryBatchDetailPage from './NurseryBatchDetailPage';

// Mock the react-i18next useTranslation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'en'
    }
  })
}));

// Mock the useApiData hook
jest.mock('../hooks/useApi', () => ({
  useApiData: jest.fn(),
  useApiMutation: () => ({
    mutate: jest.fn(),
    loading: false
  })
}));

// Mock the CustomCalendar component
jest.mock('../components/CustomCalendar', () => {
  return function MockCustomCalendar() {
    return <div data-testid="custom-calendar">Custom Calendar</div>;
  };
});

// Mock react-router-dom useParams and useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: 'test-batch-id'
  }),
  useNavigate: () => mockNavigate
}));

describe('NurseryBatchDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', async () => {
    const { useApiData } = require('../hooks/useApi');
    
    // Mock successful API responses
    useApiData.mockImplementation((apiFunction) => {
      if (apiFunction.name === 'getNurseryBatchById') {
        return {
          data: {
            _id: 'test-batch-id',
            batchName: { en: 'Test Batch' },
            startDate: new Date().toISOString(),
            species: 'Vannamei',
            initialCount: 10000,
            size: 100,
            capacity: 15000,
            source: 'Hatchery X',
            seasonId: { _id: 'test-season-id', name: { en: 'Season 1' } },
            status: 'Active'
          },
          loading: false,
          error: null,
          refetch: jest.fn()
        };
      }
      
      if (apiFunction.name === 'getEventsForNurseryBatch') {
        return {
          data: [],
          loading: false,
          error: null,
          refetch: jest.fn()
        };
      }
      
      if (apiFunction.name === 'getInventoryItems') {
        return {
          data: [],
          loading: false,
          error: null,
          refetch: jest.fn()
        };
      }
      
      return {
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn()
      };
    });

    render(
      <BrowserRouter>
        <NurseryBatchDetailPage />
      </BrowserRouter>
    );

    // Wait for the component to load data
    await waitFor(() => {
      expect(screen.getByText('Test Batch')).toBeInTheDocument();
    });

    // Check that the main elements are rendered
    expect(screen.getByText('Test Batch')).toBeInTheDocument();
    expect(screen.getByText('back_to_nursery_batches')).toBeInTheDocument();
    expect(screen.getByTestId('custom-calendar')).toBeInTheDocument();
  });

  test('shows loading state', async () => {
    const { useApiData } = require('../hooks/useApi');
    
    // Mock loading state
    useApiData.mockImplementation((apiFunction) => {
      if (apiFunction.name === 'getNurseryBatchById') {
        return {
          data: null,
          loading: true,
          error: null,
          refetch: jest.fn()
        };
      }
      
      return {
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn()
      };
    });

    render(
      <BrowserRouter>
        <NurseryBatchDetailPage />
      </BrowserRouter>
    );

    // Check that loading indicator is shown
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows error state', async () => {
    const { useApiData } = require('../hooks/useApi');
    
    // Mock error state
    useApiData.mockImplementation((apiFunction) => {
      if (apiFunction.name === 'getNurseryBatchById') {
        return {
          data: null,
          loading: false,
          error: 'Error loading data',
          refetch: jest.fn()
        };
      }
      
      return {
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn()
      };
    });

    render(
      <BrowserRouter>
        <NurseryBatchDetailPage />
      </BrowserRouter>
    );

    // Check that error message is shown
    expect(screen.getByText(/error_loading_data/)).toBeInTheDocument();
  });
});