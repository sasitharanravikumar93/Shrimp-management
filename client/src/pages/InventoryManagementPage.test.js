import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { SeasonProvider } from '../context/SeasonContext';
import * as useApiHook from '../hooks/useApi';

import InventoryManagementPage from './InventoryManagementPage';

// Mock the API calls
jest.mock('../hooks/useApi');

// Mock the components that are imported
jest.mock('../components/InventoryForm', () => {
  const InventoryFormMock = ({ open, onClose, item }) =>
    open ? <div data-testid='inventory-form'>Inventory Form {item ? 'Edit' : 'Add'}</div> : null;
  InventoryFormMock.displayName = 'InventoryForm';
  return InventoryFormMock;
});

jest.mock('../components/InventoryAdjustmentModal', () => {
  const InventoryAdjustmentModalMock = ({ open, onClose, item }) =>
    open ? <div data-testid='adjustment-modal'>Adjustment Modal for {item?.itemName}</div> : null;
  InventoryAdjustmentModalMock.displayName = 'InventoryAdjustmentModal';
  return InventoryAdjustmentModalMock;
});

jest.mock('../components/AdjustmentHistoryModal', () => {
  const AdjustmentHistoryModalMock = ({ open, onClose, item }) =>
    open ? <div data-testid='history-modal'>History Modal for {item?.itemName}</div> : null;
  AdjustmentHistoryModalMock.displayName = 'AdjustmentHistoryModal';
  return AdjustmentHistoryModalMock;
});

// Create a theme for testing
const theme = createTheme();

// Wrapper component to provide theme and router
const WithProviders = ({ children }) => (
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <SeasonProvider>{children}</SeasonProvider>
    </BrowserRouter>
  </ThemeProvider>
);

describe('InventoryManagementPage', () => {
  const mockInventoryItems = [
    {
      _id: '1',
      itemName: 'Standard Feed',
      itemType: 'Feed',
      supplier: 'Aquatic Supplies Co.',
      unit: 'kg',
      costPerUnit: 5.5,
      currentQuantity: 1000,
      lowStockThreshold: 200
    },
    {
      _id: '2',
      itemName: 'Probiotic A',
      itemType: 'Probiotic',
      supplier: 'BioAquatics Inc.',
      unit: 'liter',
      costPerUnit: 25.0,
      currentQuantity: 50,
      lowStockThreshold: 30
    },
    {
      _id: '3',
      itemName: 'Salt',
      itemType: 'Chemical',
      supplier: 'Chemical Solutions Ltd.',
      unit: 'kg',
      costPerUnit: 0.75,
      currentQuantity: 0,
      lowStockThreshold: 100
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useApi hook
    const mockApi = {
      get: jest.fn().mockResolvedValue({ data: mockInventoryItems }),
      delete: jest.fn().mockResolvedValue({})
    };

    jest.spyOn(useApiHook, 'default').mockImplementation(() => mockApi);
  });

  it('renders inventory management page with title and add button', async () => {
    render(
      <WithProviders>
        <InventoryManagementPage />
      </WithProviders>
    );

    // Check that the page title is rendered
    expect(screen.getByText('Inventory Management')).toBeInTheDocument();

    // Check that the add button is rendered
    expect(screen.getByText('Add New Item')).toBeInTheDocument();
  });

  it('renders inventory items in table when data is loaded', async () => {
    render(
      <WithProviders>
        <InventoryManagementPage />
      </WithProviders>
    );

    // Wait for data to load
    await screen.findByText('Standard Feed');

    // Check that all inventory items are displayed
    expect(screen.getByText('Standard Feed')).toBeInTheDocument();
    expect(screen.getByText('Feed')).toBeInTheDocument();
    expect(screen.getByText('Aquatic Supplies Co.')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();
    expect(screen.getByText('5.5')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('In Stock')).toBeInTheDocument();

    expect(screen.getByText('Probiotic A')).toBeInTheDocument();
    expect(screen.getByText('Probiotic')).toBeInTheDocument();
    expect(screen.getByText('BioAquatics Inc.')).toBeInTheDocument();
    expect(screen.getByText('liter')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('Low Stock')).toBeInTheDocument();

    expect(screen.getByText('Salt')).toBeInTheDocument();
    expect(screen.getByText('Chemical')).toBeInTheDocument();
    expect(screen.getByText('Chemical Solutions Ltd.')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();
    expect(screen.getByText('0.75')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    // Mock API to simulate loading
    const mockApi = {
      get: jest.fn(() => new Promise(() => {})) // Never resolves
    };

    jest.spyOn(useApiHook, 'default').mockImplementation(() => mockApi);

    render(
      <WithProviders>
        <InventoryManagementPage />
      </WithProviders>
    );

    // Should show loading spinner
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error state when API call fails', async () => {
    // Mock API to simulate error
    const mockApi = {
      get: jest.fn().mockRejectedValue(new Error('Failed to fetch inventory items'))
    };

    jest.spyOn(useApiHook, 'default').mockImplementation(() => mockApi);

    render(
      <WithProviders>
        <InventoryManagementPage />
      </WithProviders>
    );

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch inventory items/)).toBeInTheDocument();
    });
  });

  it('filters inventory items based on search term', async () => {
    render(
      <WithProviders>
        <InventoryManagementPage />
      </WithProviders>
    );

    // Wait for data to load
    await screen.findByText('Standard Feed');

    // Check that all items are initially visible
    expect(screen.getByText('Standard Feed')).toBeInTheDocument();
    expect(screen.getByText('Probiotic A')).toBeInTheDocument();
    expect(screen.getByText('Salt')).toBeInTheDocument();

    // Search for "Feed"
    const searchInput = screen.getByLabelText('Search Inventory');
    await userEvent.type(searchInput, 'Feed');

    // Check that only "Standard Feed" is visible
    expect(screen.getByText('Standard Feed')).toBeInTheDocument();
    expect(screen.queryByText('Probiotic A')).not.toBeInTheDocument();
    expect(screen.queryByText('Salt')).not.toBeInTheDocument();
  });

  it('opens inventory form when add button is clicked', async () => {
    render(
      <WithProviders>
        <InventoryManagementPage />
      </WithProviders>
    );

    // Wait for data to load
    await screen.findByText('Standard Feed');

    // Click the "Add New Item" button
    const addButton = screen.getByText('Add New Item');
    await userEvent.click(addButton);

    // Check that the inventory form is opened
    expect(screen.getByTestId('inventory-form')).toBeInTheDocument();
    expect(screen.getByTestId('inventory-form')).toHaveTextContent('Inventory Form Add');
  });

  it('opens inventory form when edit button is clicked', async () => {
    render(
      <WithProviders>
        <InventoryManagementPage />
      </WithProviders>
    );

    // Wait for data to load
    await screen.findByText('Standard Feed');

    // Click the edit button for the first item
    // Find the parent button element using a more appropriate method
    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    // Check that the inventory form is opened in edit mode
    expect(screen.getByTestId('inventory-form')).toBeInTheDocument();
    expect(screen.getByTestId('inventory-form')).toHaveTextContent('Inventory Form Edit');
  });

  it('opens adjustment modal when adjustment button is clicked', async () => {
    render(
      <WithProviders>
        <InventoryManagementPage />
      </WithProviders>
    );

    // Wait for data to load
    await screen.findByText('Standard Feed');

    // Click the adjustment button for the first item
    // Find the parent button element using a more appropriate method
    const adjustmentButton = screen.getByRole('button', { name: /adjust/i });
    await userEvent.click(adjustmentButton);

    // Check that the adjustment modal is opened
    expect(screen.getByTestId('adjustment-modal')).toBeInTheDocument();
    expect(screen.getByTestId('adjustment-modal')).toHaveTextContent(
      'Adjustment Modal for Standard Feed'
    );
  });

  it('opens history modal when history button is clicked', async () => {
    render(
      <WithProviders>
        <InventoryManagementPage />
      </WithProviders>
    );

    // Wait for data to load
    await screen.findByText('Standard Feed');

    // Click the history button for the first item
    // Find the parent button element using a more appropriate method
    const historyButton = screen.getByRole('button', { name: /history/i });
    await userEvent.click(historyButton);

    // Check that the history modal is opened
    expect(screen.getByTestId('history-modal')).toBeInTheDocument();
    expect(screen.getByTestId('history-modal')).toHaveTextContent(
      'History Modal for Standard Feed'
    );
  });

  it('shows confirmation dialog when delete button is clicked', async () => {
    // Mock window.confirm
    const mockConfirm = jest.spyOn(window, 'confirm').mockImplementation(() => true);

    render(
      <WithProviders>
        <InventoryManagementPage />
      </WithProviders>
    );

    // Wait for data to load
    await screen.findByText('Standard Feed');

    // Click the delete button for the first item
    // Find the parent button element using a more appropriate method
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    // Check that confirm dialog was called
    expect(mockConfirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this inventory item? This action is not reversible.'
    );

    // Clean up
    mockConfirm.mockRestore();
  });
});
