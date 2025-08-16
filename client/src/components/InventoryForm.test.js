import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import InventoryForm from './InventoryForm';
import * as useApiHook from '../hooks/useApi';

// Mock the API calls
jest.mock('../hooks/useApi');

// Mock MUI date pickers
jest.mock('@mui/x-date-pickers/LocalizationProvider', () => {
  return ({ children }) => <div data-testid="localization-provider">{children}</div>;
});

jest.mock('@mui/x-date-pickers/DatePicker', () => {
  return ({ renderInput, value, onChange }) => {
    const inputProps = renderInput({ inputProps: {} });
    return (
      <div data-testid="date-picker">
        {React.cloneElement(inputProps, {
          onChange: (e) => onChange(e.target.value),
          value: value ? value.toString() : ''
        })}
      </div>
    );
  };
});

// Create a theme for testing
const theme = createTheme();

// Wrapper component to provide theme
const WithProviders = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

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
        <InventoryForm 
          open={true} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
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
      costPerUnit: 5.50,
      lowStockThreshold: 200
    };

    render(
      <WithProviders>
        <InventoryForm 
          open={true} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
          item={mockItem}
        />
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
        <InventoryForm 
          open={true} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      </WithProviders>
    );

    // Click submit without filling any fields
    const submitButton = screen.getByText('Add Item');
    fireEvent.click(submitButton);

    // Check that validation errors are shown
    await waitFor(() => {
      expect(screen.getByText('Item Name is required')).toBeInTheDocument();
      expect(screen.getByText('Item Type is required')).toBeInTheDocument();
      expect(screen.getByText('Purchase Date is required')).toBeInTheDocument();
      expect(screen.getByText('Unit is required')).toBeInTheDocument();
    });
  });

  it('validates numeric fields', async () => {
    render(
      <WithProviders>
        <InventoryForm 
          open={true} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      </WithProviders>
    );

    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Item Name'), { target: { value: 'Standard Feed' } });
    fireEvent.change(screen.getByLabelText('Item Type'), { target: { value: 'Feed' } });
    fireEvent.change(screen.getByLabelText('Unit'), { target: { value: 'kg' } });
    
    // Enter invalid values for numeric fields
    fireEvent.change(screen.getByLabelText('Cost Per Unit'), { target: { value: 'invalid' } });
    fireEvent.change(screen.getByLabelText('Low Stock Threshold'), { target: { value: '-50' } });

    // Click submit
    const submitButton = screen.getByText('Add Item');
    fireEvent.click(submitButton);

    // Check that validation errors are shown
    await waitFor(() => {
      expect(screen.getByText('Cost Per Unit must be a non-negative number')).toBeInTheDocument();
      expect(screen.getByText('Low Stock Threshold must be a non-negative number')).toBeInTheDocument();
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
      costPerUnit: 5.50,
      lowStockThreshold: 200
    };

    mockApi.post.mockResolvedValue({ data: mockNewItem });

    render(
      <WithProviders>
        <InventoryForm 
          open={true} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      </WithProviders>
    );

    // Fill in all required fields
    fireEvent.change(screen.getByLabelText('Item Name'), { target: { value: 'Standard Feed' } });
    fireEvent.change(screen.getByLabelText('Item Type'), { target: { value: 'Feed' } });
    fireEvent.change(screen.getByLabelText('Supplier'), { target: { value: 'Aquatic Supplies Co.' } });
    fireEvent.change(screen.getByLabelText('Purchase Date'), { target: { value: '2023-01-15' } });
    fireEvent.change(screen.getByLabelText('Unit'), { target: { value: 'kg' } });
    fireEvent.change(screen.getByLabelText('Cost Per Unit'), { target: { value: '5.5' } });
    fireEvent.change(screen.getByLabelText('Low Stock Threshold'), { target: { value: '200' } });

    // Click submit
    const submitButton = screen.getByText('Add Item');
    fireEvent.click(submitButton);

    // Check that API post was called
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/inventory', {
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
      costPerUnit: 5.50,
      lowStockThreshold: 200
    };

    const mockUpdatedItem = {
      ...mockItem,
      supplier: 'New Supplier Co.'
    };

    mockApi.put.mockResolvedValue({ data: mockUpdatedItem });

    render(
      <WithProviders>
        <InventoryForm 
          open={true} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
          item={mockItem}
        />
      </WithProviders>
    );

    // Change supplier
    fireEvent.change(screen.getByLabelText('Supplier'), { target: { value: 'New Supplier Co.' } });

    // Click submit
    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    // Check that API put was called
    await waitFor(() => {
      expect(mockApi.put).toHaveBeenCalledWith('/inventory/1', {
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
        <InventoryForm 
          open={true} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      </WithProviders>
    );

    // Fill in all required fields
    fireEvent.change(screen.getByLabelText('Item Name'), { target: { value: 'Standard Feed' } });
    fireEvent.change(screen.getByLabelText('Item Type'), { target: { value: 'Feed' } });
    fireEvent.change(screen.getByLabelText('Purchase Date'), { target: { value: '2023-01-15' } });
    fireEvent.change(screen.getByLabelText('Unit'), { target: { value: 'kg' } });
    fireEvent.change(screen.getByLabelText('Cost Per Unit'), { target: { value: '5.5' } });

    // Click submit
    const submitButton = screen.getByText('Add Item');
    fireEvent.click(submitButton);

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
        <InventoryForm 
          open={true} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      </WithProviders>
    );

    // Click submit without filling any fields
    const submitButton = screen.getByText('Add Item');
    fireEvent.click(submitButton);

    // Check that validation errors are shown
    await waitFor(() => {
      expect(screen.getByText('Item Name is required')).toBeInTheDocument();
    });

    // Start typing in the item name field
    fireEvent.change(screen.getByLabelText('Item Name'), { target: { value: 'Standard Feed' } });

    // Check that the validation error for item name is cleared
    expect(screen.queryByText('Item Name is required')).not.toBeInTheDocument();
  });

  it('closes form when cancel button is clicked', () => {
    render(
      <WithProviders>
        <InventoryForm 
          open={true} 
          onClose={mockOnClose} 
          onSave={mockOnSave} 
        />
      </WithProviders>
    );

    // Click cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Check that onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
});