import { TextField } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import * as useApiHook from '../hooks/useApi';

import InventoryForm from './InventoryForm';

// Mock the API calls
jest.mock('../hooks/useApi');

// Mock MUI date pickers
jest.mock('@mui/x-date-pickers/LocalizationProvider', () => {
  return ({ children }) => <div data-testid='localization-provider'>{children}</div>;
});

jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ renderInput, value, onChange }) => {
    const view = renderInput({ inputProps: {} });
    return (
      <TextField
        label={view.label}
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={e => onChange(new Date(e.target.value))}
        data-testid='date-picker'
      />
    );
  }
}));

// Create a theme for testing
const theme = createTheme();

// Wrapper component to provide theme
const WithProviders = ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>;

describe('InventoryForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  const mockApi = {
    post: jest.fn(),
    put: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useApiHook.default = jest.fn(() => mockApi);
  });

  it('renders form for adding new inventory item', () => {
    render(
      <WithProviders>
        <InventoryForm open={true} onClose={mockOnClose} onSave={mockOnSave} />
      </WithProviders>
    );

    // Check that the form title is correct
    expect(screen.getByText('Add New Inventory Item')).toBeInTheDocument();

    // Check that form fields are rendered
    expect(screen.getByLabelText('Item Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Item Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Supplier')).toBeInTheDocument();
    expect(screen.getByLabelText('Purchase Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Unit')).toBeInTheDocument();
    expect(screen.getByLabelText('Cost Per Unit')).toBeInTheDocument();
    expect(screen.getByLabelText('Low Stock Threshold')).toBeInTheDocument();

    // Check that buttons are rendered
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('renders form for editing existing inventory item', () => {
    const mockItem = {
      _id: '1',
      itemName: 'Standard Feed',
      itemType: 'Feed',
      supplier: 'Aquatic Supplies Co.',
      purchaseDate: '2023-01-15T00:00:00.000Z',
      unit: 'kg',
      costPerUnit: 5.5,
      lowStockThreshold: 200
    };

    render(
      <WithProviders>
        <InventoryForm open={true} onClose={mockOnClose} onSave={mockOnSave} item={mockItem} />
      </WithProviders>
    );

    // Check that the form title is correct
    expect(screen.getByText('Edit Inventory Item')).toBeInTheDocument();

    // Check that form fields are pre-filled with item data
    expect(screen.getByLabelText('Item Name')).toHaveValue('Standard Feed');
    expect(screen.getByLabelText('Item Type')).toHaveValue('Feed');
    expect(screen.getByLabelText('Supplier')).toHaveValue('Aquatic Supplies Co.');
    expect(screen.getByLabelText('Unit')).toHaveValue('kg');
    expect(screen.getByLabelText('Cost Per Unit')).toHaveValue('5.5');
    expect(screen.getByLabelText('Low Stock Threshold')).toHaveValue('200');

    // Check that buttons are rendered
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    render(
      <WithProviders>
        <InventoryForm open={true} onClose={mockOnClose} onSave={mockOnSave} />
      </WithProviders>
    );

    // Click submit without filling any fields
    const submitButton = screen.getByText('Add Item');
    await userEvent.click(submitButton);

    // Check that validation errors are shown
    await waitFor(() => {
      expect(screen.getByText('Item Name is required')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Item Type is required')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Purchase Date is required')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Unit is required')).toBeInTheDocument();
    });
  });

  it('validates numeric fields', async () => {
    render(
      <WithProviders>
        <InventoryForm open={true} onClose={mockOnClose} onSave={mockOnSave} />
      </WithProviders>
    );

    // Fill in required fields
    await userEvent.type(screen.getByLabelText('Item Name'), 'Standard Feed');
    await userEvent.type(screen.getByLabelText('Item Type'), 'Feed');
    await userEvent.type(screen.getByLabelText('Unit'), 'kg');

    // Enter invalid values for numeric fields
    await userEvent.type(screen.getByLabelText('Cost Per Unit'), 'invalid');
    await userEvent.type(screen.getByLabelText('Low Stock Threshold'), '-50');

    // Click submit
    const submitButton = screen.getByText('Add Item');
    await userEvent.click(submitButton);

    // Check that validation errors are shown
    await waitFor(() => {
      expect(screen.getByText('Cost Per Unit must be a non-negative number')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText('Low Stock Threshold must be a non-negative number')
      ).toBeInTheDocument();
    });
  });

  it('submits form successfully for new item', async () => {
    const mockNewItem = {
      _id: '1',
      itemName: 'Standard Feed',
      itemType: 'Feed',
      supplier: 'Aquatic Supplies Co.',
      purchaseDate: '2023-01-15T00:00:00.000Z',
      unit: 'kg',
      costPerUnit: 5.5,
      lowStockThreshold: 200
    };

    mockApi.post.mockResolvedValue({ data: mockNewItem });

    render(
      <WithProviders>
        <InventoryForm open={true} onClose={mockOnClose} onSave={mockOnSave} />
      </WithProviders>
    );

    // Fill in all required fields
    await userEvent.type(screen.getByLabelText('Item Name'), 'Standard Feed');
    await userEvent.type(screen.getByLabelText('Item Type'), 'Feed');
    await userEvent.type(screen.getByLabelText('Supplier'), 'Aquatic Supplies Co.');
    await userEvent.type(screen.getByLabelText('Purchase Date'), '2023-01-15');
    await userEvent.type(screen.getByLabelText('Unit'), 'kg');
    await userEvent.type(screen.getByLabelText('Cost Per Unit'), '5.5');
    await userEvent.type(screen.getByLabelText('Low Stock Threshold'), '200');

    // Click submit
    const submitButton = screen.getByText('Add Item');
    await userEvent.click(submitButton);

    // Check that API post was called
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/inventory-items', {
        itemName: 'Standard Feed',
        itemType: 'Feed',
        supplier: 'Aquatic Supplies Co.',
        purchaseDate: expect.any(String),
        unit: 'kg',
        costPerUnit: 5.5,
        lowStockThreshold: 200
      });
    });

    // Check that onSave was called with the new item
    expect(mockOnSave).toHaveBeenCalledWith(mockNewItem);

    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('submits form successfully for editing existing item', async () => {
    const mockItem = {
      _id: '1',
      itemName: 'Standard Feed',
      itemType: 'Feed',
      supplier: 'Aquatic Supplies Co.',
      purchaseDate: '2023-01-15T00:00:00.000Z',
      unit: 'kg',
      costPerUnit: 5.5,
      lowStockThreshold: 200
    };

    const mockUpdatedItem = {
      ...mockItem,
      supplier: 'New Supplier Co.'
    };

    mockApi.put.mockResolvedValue({ data: mockUpdatedItem });

    render(
      <WithProviders>
        <InventoryForm open={true} onClose={mockOnClose} onSave={mockOnSave} item={mockItem} />
      </WithProviders>
    );

    // Change supplier
    await userEvent.type(screen.getByLabelText('Supplier'), 'New Supplier Co.');

    // Click submit
    const submitButton = screen.getByText('Save Changes');
    await userEvent.click(submitButton);

    // Check that API put was called
    await waitFor(() => {
      expect(mockApi.put).toHaveBeenCalledWith('/inventory-items/1', {
        itemName: 'Standard Feed',
        itemType: 'Feed',
        supplier: 'New Supplier Co.',
        purchaseDate: expect.any(String),
        unit: 'kg',
        costPerUnit: 5.5,
        lowStockThreshold: 200
      });
    });

    // Check that onSave was called with the updated item
    expect(mockOnSave).toHaveBeenCalledWith(mockUpdatedItem);

    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockApi.post.mockRejectedValue(new Error('API Error'));

    render(
      <WithProviders>
        <InventoryForm open={true} onClose={mockOnClose} onSave={mockOnSave} />
      </WithProviders>
    );

    // Fill in all required fields
    await userEvent.type(screen.getByLabelText('Item Name'), 'Standard Feed');
    await userEvent.type(screen.getByLabelText('Item Type'), 'Feed');
    await userEvent.type(screen.getByLabelText('Purchase Date'), '2023-01-15');
    await userEvent.type(screen.getByLabelText('Unit'), 'kg');
    await userEvent.type(screen.getByLabelText('Cost Per Unit'), '5.5');

    // Click submit
    const submitButton = screen.getByText('Add Item');
    await userEvent.click(submitButton);

    // Wait for error to be handled
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error saving inventory item:', expect.any(Error));
    });

    // Clean up
    consoleError.mockRestore();
  });

  it('clears validation errors when user starts typing', async () => {
    render(
      <WithProviders>
        <InventoryForm open={true} onClose={mockOnClose} onSave={mockOnSave} />
      </WithProviders>
    );

    // Click submit without filling any fields
    const submitButton = screen.getByText('Add Item');
    await userEvent.click(submitButton);

    // Check that validation errors are shown
    await waitFor(() => {
      expect(screen.getByText('Item Name is required')).toBeInTheDocument();
    });

    // Start typing in the item name field
    await userEvent.type(screen.getByLabelText('Item Name'), 'Standard Feed');

    // Check that the validation error for item name is cleared
    expect(screen.queryByText('Item Name is required')).not.toBeInTheDocument();
  });

  it('closes form when cancel button is clicked', async () => {
    render(
      <WithProviders>
        <InventoryForm open={true} onClose={mockOnClose} onSave={mockOnSave} />
      </WithProviders>
    );

    // Click cancel button
    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);

    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
});
