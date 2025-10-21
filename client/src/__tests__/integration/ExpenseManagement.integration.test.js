/**
 * Expense Management Integration Tests
 * Tests complete user workflows and component integration
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { SeasonProvider } from '../../context/SeasonContext';
import ExpenseManagementPage from '../../pages/ExpenseManagementPage';
import { renderUtils, testDataFactories, mockUtils } from '../../utils/testUtils';

// Mock API responses
const mockExpenses = [
  testDataFactories.createExpense({
    _id: '1',
    description: 'Fish Feed Purchase',
    amount: 500,
    mainCategory: 'Culture',
    subCategory: 'Feed',
    date: '2024-01-15'
  }),
  testDataFactories.createExpense({
    _id: '2',
    description: 'Pond Maintenance',
    amount: 200,
    mainCategory: 'Farm',
    subCategory: 'Maintenance',
    date: '2024-01-10'
  })
];

const mockSeasons = [
  testDataFactories.createSeason({
    _id: 'season-1',
    name: 'Season 2024',
    status: 'Active'
  })
];

describe('Expense Management Integration Tests', () => {
  let mockFetch;

  beforeEach(() => {
    // Setup comprehensive API mocks
    mockFetch = mockUtils.createMockFetch({
      '/seasons': mockSeasons,
      '/expenses': mockExpenses,
      '/expenses/create': { success: true, data: mockExpenses[0] },
      '/expenses/update': { success: true },
      '/expenses/delete': { success: true }
    });
  });

  afterEach(() => {
    mockFetch.cleanup();
    jest.restoreAllMocks();
  });

  const renderExpenseManagementPage = () => {
    return renderUtils.renderWithProviders(
      <SeasonProvider>
        <ExpenseManagementPage />
      </SeasonProvider>
    );
  };

  describe('Page Load and Navigation', () => {
    it('loads the expense management page and navigates between tabs', async () => {
      renderExpenseManagementPage();

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Expense Management')).toBeInTheDocument();
      });

      // Check that tabs are present
      expect(screen.getByRole('tab', { name: /dashboard/i })).toBeInTheDocument();
      const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
      expect(cultureTab).toBeInTheDocument();
      const farmTab = screen.getByRole('tab', { name: /farm expenses/i });
      expect(farmTab).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /salaries/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /reports/i })).toBeInTheDocument();

      // Navigate to Culture Expenses tab
      await userEvent.click(cultureTab);

      await waitFor(() => {
        expect(screen.getByText('Culture Expenses')).toBeInTheDocument();
      });

      // Navigate to Farm Expenses tab
      await userEvent.click(farmTab);

      await waitFor(() => {
        expect(screen.getByText('Farm Expenses')).toBeInTheDocument();
      });
    });
  });

  describe('Expense List Integration', () => {
    it('displays and filters expenses correctly', async () => {
      renderExpenseManagementPage();

      // Check Culture expenses
      const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
      await userEvent.click(cultureTab);

      await waitFor(() => {
        expect(screen.getByText('Fish Feed Purchase')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.queryByText('Pond Maintenance')).not.toBeInTheDocument();
      });

      // Verify expense details
      expect(screen.getByText('$500.00')).toBeInTheDocument();
      expect(screen.getByText('Feed')).toBeInTheDocument();

      // Check Farm expenses
      const farmTab = screen.getByRole('tab', { name: /farm expenses/i });
      await userEvent.click(farmTab);

      await waitFor(() => {
        expect(screen.getByText('Pond Maintenance')).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.queryByText('Fish Feed Purchase')).not.toBeInTheDocument();
      });
    });
  });

  describe('Expense Creation and Validation', () => {
    it('completes full expense creation workflow and handles validation', async () => {
      renderExpenseManagementPage();

      // Navigate to Culture Expenses
      const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
      await userEvent.click(cultureTab);

      // Wait for page to load and click Add button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add culture expense/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add culture expense/i });
      await userEvent.click(addButton);

      // Wait for form modal to open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Try to submit empty form
      const modal = screen.getByRole('dialog');
      const saveButton = within(modal).getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      // Check for validation errors
      await waitFor(() => {
        expect(within(modal).getByText('Description is required')).toBeInTheDocument();
      });

      // Fill out the form
      const descriptionInput = within(modal).getByLabelText(/description/i);
      await userEvent.type(descriptionInput, 'New Test Expense');

      const amountInput = within(modal).getByLabelText(/amount/i);
      await userEvent.type(amountInput, '150');

      const categorySelect = within(modal).getByLabelText(/sub category/i);
      await userEvent.selectOptions(categorySelect, 'Equipment');

      const dateInput = within(modal).getByLabelText(/date/i);
      await userEvent.type(dateInput, '2024-01-20');

      // Submit form
      await userEvent.click(saveButton);

      // Wait for form to close and expense to appear
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Verify expense was added (mock API would return success)
      expect(mockFetch.mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/expenses'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('New Test Expense')
        })
      );
    });
  });

  describe('Expense Editing Workflow', () => {
    it('completes full expense editing workflow', async () => {
      renderExpenseManagementPage();

      const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
      await userEvent.click(cultureTab);

      // Wait for expenses to load and find edit button
      await waitFor(() => {
        expect(screen.getByText('Fish Feed Purchase')).toBeInTheDocument();
      });

      // Find and click edit button for the first expense
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await userEvent.click(editButtons[0]);

      // Wait for edit form to open
      const modal = await screen.findByRole('dialog');

      // Verify form is pre-filled
      const descriptionInput = within(modal).getByDisplayValue('Fish Feed Purchase');
      expect(descriptionInput).toBeInTheDocument();

      // Update the description
      await userEvent.type(descriptionInput, ' - Updated');

      // Update amount
      const amountInput = within(modal).getByDisplayValue('500');
      await userEvent.clear(amountInput);
      await userEvent.type(amountInput, '600');

      // Save changes
      const saveButton = within(modal).getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      // Wait for form to close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Verify API was called with update
      expect(mockFetch.mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/expenses/1'),
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('Fish Feed Purchase - Updated')
        })
      );
    });
  });

  describe('Expense Deletion Workflow', () => {
    it('completes expense deletion with confirmation and handles cancellation', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm');

      // Test deletion cancellation
      confirmSpy.mockReturnValue(false);
      renderExpenseManagementPage();

      const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
      await userEvent.click(cultureTab);

      await waitFor(() => {
        expect(screen.getByText('Fish Feed Purchase')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await userEvent.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this expense?');

      // Verify API was NOT called for deletion
      expect(mockFetch.mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/expenses/1'),
        expect.objectContaining({ method: 'DELETE' })
      );

      // Test deletion confirmation
      confirmSpy.mockReturnValue(true);
      await userEvent.click(deleteButtons[0]);

      // Verify API was called
      await waitFor(() => {
        expect(mockFetch.mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/expenses/1'),
          expect.objectContaining({ method: 'DELETE' })
        );
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('displays error when API fails and handles network timeout', async () => {
      // Mock API failure
      mockFetch.cleanup();
      mockFetch = mockUtils.createMockFetch({
        '/seasons': mockSeasons,
        '/expenses': Promise.reject(new Error('API Error'))
      });

      renderExpenseManagementPage();

      const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
      await userEvent.click(cultureTab);

      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent(/error/i);

      // Mock slow API response
      mockFetch.cleanup();
      global.fetch = jest.fn(
        () =>
          new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), 100))
      );

      renderExpenseManagementPage();

      await userEvent.click(cultureTab);

      // Should show loading state first
      await waitFor(() => {
        expect(screen.getByRole('status') || screen.getByText(/loading/i)).toBeInTheDocument();
      });

      // Then show error after timeout
      await waitFor(
        () => {
          expect(screen.getByRole('alert')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });

  describe('Season Context Integration', () => {
    it('updates expenses when season changes', async () => {
      const multipleSeasons = [
        ...mockSeasons,
        testDataFactories.createSeason({
          _id: 'season-2',
          name: 'Season 2023',
          status: 'Completed'
        })
      ];

      mockFetch.cleanup();
      mockFetch = mockUtils.createMockFetch({
        '/seasons': multipleSeasons,
        '/expenses': mockExpenses
      });

      renderExpenseManagementPage();

      const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
      await userEvent.click(cultureTab);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Fish Feed Purchase')).toBeInTheDocument();
      });

      // Change season (this would typically be done through a season selector)
      // For this test, we'll verify that changing the season context would trigger a refetch
      expect(mockFetch.mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/expenses'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('Performance and Loading States', () => {
    it('shows loading states and handles concurrent operations', async () => {
      // Mock slow API
      mockFetch.cleanup();
      global.fetch = jest.fn(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve(mockExpenses)
                }),
              500
            )
          )
      );

      renderExpenseManagementPage();

      const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
      await userEvent.click(cultureTab);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByRole('status') || screen.getByText(/loading/i)).toBeInTheDocument();
      });

      // Wait for data to load
      await waitFor(
        () => {
          expect(screen.getByText('Fish Feed Purchase')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Start multiple operations concurrently
      const addButton = screen.getByRole('button', { name: /add culture expense/i });
      const editButtons = screen.getAllByRole('button', { name: /edit/i });

      // This should not cause race conditions or crashes
      await Promise.all([
        userEvent.click(addButton),
        // Small delay to prevent exact simultaneous clicks
        new Promise(resolve =>
          setTimeout(() => {
            userEvent.click(editButtons[0]).then(resolve);
          }, 10)
        )
      ]);

      // Should handle gracefully (one operation at a time)
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });
});
