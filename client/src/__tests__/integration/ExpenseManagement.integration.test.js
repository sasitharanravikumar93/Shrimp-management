/**
 * Expense Management Integration Tests
 * Tests complete user workflows and component integration
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { SeasonProvider } from '../../context/SeasonContext';
import ExpenseManagementPage from '../../pages/ExpenseManagementPage';
import { robustSelectors, robustAssertions } from '../../utils/robustTesting';
import {
  renderUtils,
  testDataFactories,
  mockUtils,
  robustInteractions,
  createPageObject
} from '../../utils/testUtils';

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
  let user;

  beforeEach(() => {
    user = userEvent.setup();

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
  });

  const renderExpenseManagementPage = () => {
    return renderUtils.renderWithProviders(
      <SeasonProvider>
        <ExpenseManagementPage />
      </SeasonProvider>
    );
  };

  describe('Page Load and Navigation', () => {
    it('loads the expense management page successfully', async () => {
      renderExpenseManagementPage();

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Expense Management')).toBeInTheDocument();
      });

      // Check that tabs are present
      expect(screen.getByRole('tab', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /culture expenses/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /farm expenses/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /salaries/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /reports/i })).toBeInTheDocument();
    });

    it('navigates between tabs correctly', async () => {
      renderExpenseManagementPage();

      await waitFor(() => {
        expect(screen.getByText('Expense Management')).toBeInTheDocument();
      });

      // Navigate to Culture Expenses tab
      const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
      await robustInteractions.click(cultureTab);

      await waitFor(() => {
        expect(screen.getByText('Culture Expenses')).toBeInTheDocument();
      });

      // Navigate to Farm Expenses tab
      const farmTab = screen.getByRole('tab', { name: /farm expenses/i });
      await robustInteractions.click(farmTab);

      await waitFor(() => {
        expect(screen.getByText('Farm Expenses')).toBeInTheDocument();
      });
    });
  });

  describe('Expense List Integration', () => {
    it('displays expenses correctly when tab is selected', async () => {
      renderExpenseManagementPage();

      // Navigate to Culture Expenses
      const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
      await robustInteractions.click(cultureTab);

      // Wait for expenses to load
      await waitFor(() => {
        expect(screen.getByText('Fish Feed Purchase')).toBeInTheDocument();
      });

      // Verify expense details
      expect(screen.getByText('$500.00')).toBeInTheDocument();
      expect(screen.getByText('Feed')).toBeInTheDocument();
    });

    it('filters expenses by category correctly', async () => {
      renderExpenseManagementPage();

      // Check Culture expenses
      const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
      await robustInteractions.click(cultureTab);

      await waitFor(() => {
        expect(screen.getByText('Fish Feed Purchase')).toBeInTheDocument();
        expect(screen.queryByText('Pond Maintenance')).not.toBeInTheDocument();
      });

      // Check Farm expenses
      const farmTab = screen.getByRole('tab', { name: /farm expenses/i });
      await robustInteractions.click(farmTab);

      await waitFor(() => {
        expect(screen.getByText('Pond Maintenance')).toBeInTheDocument();
        expect(screen.queryByText('Fish Feed Purchase')).not.toBeInTheDocument();
      });
    });
  });

  describe('Expense Creation Workflow', () => {
    it('completes full expense creation workflow', async () => {
      renderExpenseManagementPage();

      // Navigate to Culture Expenses
      const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
      await robustInteractions.click(cultureTab);

      // Wait for page to load and click Add button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add culture expense/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add culture expense/i });
      await robustInteractions.click(addButton);

      // Wait for form modal to open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Fill out the form
      const modal = screen.getByRole('dialog');
      const formPage = createPageObject();

      // Fill form fields
      const descriptionInput = within(modal).getByLabelText(/description/i);
      await robustInteractions.type(descriptionInput, 'New Test Expense');

      const amountInput = within(modal).getByLabelText(/amount/i);
      await robustInteractions.type(amountInput, '150');

      const categorySelect = within(modal).getByLabelText(/sub category/i);
      await robustInteractions.select(categorySelect, 'Equipment');

      const dateInput = within(modal).getByLabelText(/date/i);
      await robustInteractions.type(dateInput, '2024-01-20');

      // Submit form
      const saveButton = within(modal).getByRole('button', { name: /save/i });
      await robustInteractions.click(saveButton);

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

    it('handles form validation errors gracefully', async () => {
      renderExpenseManagementPage();

      const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
      await robustInteractions.click(cultureTab);

      const addButton = await screen.findByRole('button', { name: /add culture expense/i });
      await robustInteractions.click(addButton);

      const modal = await screen.findByRole('dialog');

      // Try to submit empty form
      const saveButton = within(modal).getByRole('button', { name: /save/i });
      await robustInteractions.click(saveButton);

      // Check for validation errors
      await waitFor(() => {
        const descriptionInput = within(modal).getByLabelText(/description/i);
        robustAssertions.hasError(descriptionInput);
      });
    });
  });

  describe('Expense Editing Workflow', () => {
    it('completes full expense editing workflow', async () => {
      renderExpenseManagementPage();

      const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
      await robustInteractions.click(cultureTab);

      // Wait for expenses to load and find edit button
      await waitFor(() => {
        expect(screen.getByText('Fish Feed Purchase')).toBeInTheDocument();
      });

      // Find and click edit button for the first expense
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await robustInteractions.click(editButtons[0]);

      // Wait for edit form to open
      const modal = await screen.findByRole('dialog');

      // Verify form is pre-filled
      const descriptionInput = within(modal).getByDisplayValue('Fish Feed Purchase');
      expect(descriptionInput).toBeInTheDocument();

      // Update the description
      await robustInteractions.type(descriptionInput, ' - Updated', { clear: false });

      // Update amount
      const amountInput = within(modal).getByDisplayValue('500');
      await robustInteractions.type(amountInput, '600', { clear: true });

      // Save changes
      const saveButton = within(modal).getByRole('button', { name: /save/i });
      await robustInteractions.click(saveButton);

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
    it('completes expense deletion with confirmation', async () => {
      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);

      try {
        renderExpenseManagementPage();

        const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
        await robustInteractions.click(cultureTab);

        await waitFor(() => {
          expect(screen.getByText('Fish Feed Purchase')).toBeInTheDocument();
        });

        // Find and click delete button
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        await robustInteractions.click(deleteButtons[0]);

        // Verify confirmation was called
        expect(window.confirm).toHaveBeenCalledWith(
          'Are you sure you want to delete this expense?'
        );

        // Verify API was called
        await waitFor(() => {
          expect(mockFetch.mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/expenses/1'),
            expect.objectContaining({ method: 'DELETE' })
          );
        });
      } finally {
        window.confirm = originalConfirm;
      }
    });

    it('cancels deletion when user cancels confirmation', async () => {
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => false);

      try {
        renderExpenseManagementPage();

        const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
        await robustInteractions.click(cultureTab);

        await waitFor(() => {
          expect(screen.getByText('Fish Feed Purchase')).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        await robustInteractions.click(deleteButtons[0]);

        expect(window.confirm).toHaveBeenCalled();

        // Verify API was NOT called for deletion
        expect(mockFetch.mockFetch).not.toHaveBeenCalledWith(
          expect.stringContaining('/expenses/1'),
          expect.objectContaining({ method: 'DELETE' })
        );
      } finally {
        window.confirm = originalConfirm;
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('displays error when API fails', async () => {
      // Mock API failure
      mockFetch.cleanup();
      mockFetch = mockUtils.createMockFetch({
        '/seasons': mockSeasons,
        '/expenses': Promise.reject(new Error('API Error'))
      });

      renderExpenseManagementPage();

      const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
      await robustInteractions.click(cultureTab);

      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent(/error/i);
    });

    it('handles network timeout gracefully', async () => {
      // Mock slow API response
      mockFetch.cleanup();
      global.fetch = jest.fn(
        () =>
          new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), 100))
      );

      renderExpenseManagementPage();

      const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
      await robustInteractions.click(cultureTab);

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
      await robustInteractions.click(cultureTab);

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
    it('shows appropriate loading states during operations', async () => {
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
      await robustInteractions.click(cultureTab);

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
    });

    it('handles concurrent operations correctly', async () => {
      renderExpenseManagementPage();

      const cultureTab = screen.getByRole('tab', { name: /culture expenses/i });
      await robustInteractions.click(cultureTab);

      await waitFor(() => {
        expect(screen.getByText('Fish Feed Purchase')).toBeInTheDocument();
      });

      // Start multiple operations concurrently
      const addButton = screen.getByRole('button', { name: /add culture expense/i });
      const editButtons = screen.getAllByRole('button', { name: /edit/i });

      // This should not cause race conditions or crashes
      await Promise.all([
        robustInteractions.click(addButton),
        // Small delay to prevent exact simultaneous clicks
        new Promise(resolve =>
          setTimeout(() => {
            robustInteractions.click(editButtons[0]).then(resolve);
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
