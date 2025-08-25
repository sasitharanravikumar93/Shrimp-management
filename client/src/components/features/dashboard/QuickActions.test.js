import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import QuickActions from './QuickActions';

// Create a theme for testing
const theme = createTheme();

// Wrapper component to provide theme
const WithTheme = ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>;

describe('QuickActions', () => {
  const mockOnActionClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all quick actions correctly', () => {
    render(
      <WithTheme>
        <QuickActions onActionClick={mockOnActionClick} />
      </WithTheme>
    );

    // Check that all action titles are rendered
    expect(screen.getByText('Schedule Feeding')).toBeInTheDocument();
    expect(screen.getByText('Water Quality Check')).toBeInTheDocument();
    expect(screen.getByText('Growth Sampling')).toBeInTheDocument();
    expect(screen.getByText('Maintenance Task')).toBeInTheDocument();
    expect(screen.getByText('View Calendar')).toBeInTheDocument();
    expect(screen.getByText('Send Notification')).toBeInTheDocument();

    // Check that all action descriptions are rendered
    expect(screen.getByText('Add a new feeding event')).toBeInTheDocument();
    expect(screen.getByText('Log water parameters')).toBeInTheDocument();
    expect(screen.getByText('Record shrimp growth data')).toBeInTheDocument();
    expect(screen.getByText('Schedule equipment maintenance')).toBeInTheDocument();
    expect(screen.getByText('Check upcoming events')).toBeInTheDocument();
    expect(screen.getByText('Alert team about issues')).toBeInTheDocument();

    // Check that all icons are rendered
    expect(screen.getByTestId('restauranticon')).toBeInTheDocument();
    expect(screen.getByTestId('waterdropicon')).toBeInTheDocument();
    expect(screen.getByTestId('scienceicon')).toBeInTheDocument();
    expect(screen.getByTestId('buildicon')).toBeInTheDocument();
    expect(screen.getByTestId('calendartodayicon')).toBeInTheDocument();
    expect(screen.getByTestId('notificationsicon')).toBeInTheDocument();
  });

  it('calls onActionClick with correct action when action card is clicked', async () => {
    render(
      <WithTheme>
        <QuickActions onActionClick={mockOnActionClick} />
      </WithTheme>
    );

    // Click on the "Schedule Feeding" action
    const feedingAction = screen.getByText('Schedule Feeding').closest('.MuiCard-root');
    await userEvent.click(feedingAction);

    expect(mockOnActionClick).toHaveBeenCalledTimes(1);
    expect(mockOnActionClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        title: 'Schedule Feeding',
        description: 'Add a new feeding event',
        color: 'primary'
      })
    );
  });

  it('calls onActionClick with correct action for each action type', async () => {
    render(
      <WithTheme>
        <QuickActions onActionClick={mockOnActionClick} />
      </WithTheme>
    );

    // Click on all actions and verify they're called with correct parameters
    const actions = [
      { title: 'Schedule Feeding', id: 1 },
      { title: 'Water Quality Check', id: 2 },
      { title: 'Growth Sampling', id: 3 },
      { title: 'Maintenance Task', id: 4 },
      { title: 'View Calendar', id: 5 },
      { title: 'Send Notification', id: 6 }
    ];

    for (const action of actions) {
      // Changed forEach to for...of for async/await
      const actionElement = screen.getByText(action.title).closest('.MuiCard-root');
      await userEvent.click(actionElement); // Used userEvent.click() and await
    }

    expect(mockOnActionClick).toHaveBeenCalledTimes(6);
  });

  it('does not throw error when onActionClick is not provided', async () => {
    // This should not throw an error
    expect(() => {
      render(
        <WithTheme>
          <QuickActions />
        </WithTheme>
      );
    }).not.toThrow();

    // Clicking an action should not cause an error
    const feedingAction = screen.getByText('Schedule Feeding').closest('.MuiCard-root');
    await userEvent.click(feedingAction); // Used userEvent.click() and await
    expect(() => {
      // No assertion needed here, just that it doesn't throw
    }).not.toThrow();
  });

  it('renders with correct section title', () => {
    render(
      <WithTheme>
        <QuickActions onActionClick={mockOnActionClick} />
      </WithTheme>
    );

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toHaveClass('MuiTypography-h6');
  });

  it('renders action cards with correct layout', () => {
    render(
      <WithTheme>
        <QuickActions onActionClick={mockOnActionClick} />
      </WithTheme>
    );

    // Check that we have 6 action cards
    const actionCards = screen
      .getAllByText(
        /Schedule Feeding|Water Quality Check|Growth Sampling|Maintenance Task|View Calendar|Send Notification/
      )
      .map(el => el.closest('.MuiCard-root'));
    expect(actionCards).toHaveLength(6);
  });
});
