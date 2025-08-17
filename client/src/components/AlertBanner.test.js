import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AlertBanner from './AlertBanner';

// Create a theme for testing
const theme = createTheme();

// Wrapper component to provide theme
const WithTheme = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('AlertBanner', () => {
  it('renders correctly with default props', () => {
    render(
      <WithTheme>
        <AlertBanner message="Test message" />
      </WithTheme>
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
    // Should show info icon by default
    expect(screen.getByTestId('infoicon')).toBeInTheDocument();
  });

  it('shows correct icon and styles for info severity', () => {
    render(
      <WithTheme>
        <AlertBanner message="Info message" severity="info" />
      </WithTheme>
    );

    expect(screen.getByText('Info message')).toBeInTheDocument();
    expect(screen.getByTestId('infoicon')).toBeInTheDocument();
    // Check that the container has the correct background color for info
    const container = screen.getByText('Info message').closest('.MuiPaper-root');
    expect(container).toHaveStyle('background-color: rgb(227, 242, 253)');
  });

  it('shows correct icon and styles for success severity', () => {
    render(
      <WithTheme>
        <AlertBanner message="Success message" severity="success" />
      </WithTheme>
    );

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByTestId('checkcircleicon')).toBeInTheDocument();
    // Check that the container has the correct background color for success
    const container = screen.getByText('Success message').closest('.MuiPaper-root');
    expect(container).toHaveStyle('background-color: rgb(232, 245, 233)');
  });

  it('shows correct icon and styles for warning severity', () => {
    render(
      <WithTheme>
        <AlertBanner message="Warning message" severity="warning" />
      </WithTheme>
    );

    expect(screen.getByText('Warning message')).toBeInTheDocument();
    expect(screen.getByTestId('warningicon')).toBeInTheDocument();
    // Check that the container has the correct background color for warning
    const container = screen.getByText('Warning message').closest('.MuiPaper-root');
    expect(container).toHaveStyle('background-color: rgb(255, 243, 224)');
  });

  it('shows correct icon and styles for error severity', () => {
    render(
      <WithTheme>
        <AlertBanner message="Error message" severity="error" />
      </WithTheme>
    );

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByTestId('erroricon')).toBeInTheDocument();
    // Check that the container has the correct background color for error
    const container = screen.getByText('Error message').closest('.MuiPaper-root');
    expect(container).toHaveStyle('background-color: rgb(255, 235, 238)');
  });

  it('does not show close button when not dismissible', () => {
    render(
      <WithTheme>
        <AlertBanner message="Test message" dismissible={false} />
      </WithTheme>
    );

    expect(screen.queryByTestId('closeicon')).not.toBeInTheDocument();
  });

  it('shows close button when dismissible and onClose provided', () => {
    const mockOnClose = jest.fn();
    render(
      <WithTheme>
        <AlertBanner message="Test message" dismissible={true} onClose={mockOnClose} />
      </WithTheme>
    );

    expect(screen.getByTestId('closeicon')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const mockOnClose = jest.fn();
    render(
      <WithTheme>
        <AlertBanner message="Test message" dismissible={true} onClose={mockOnClose} />
      </WithTheme>
    );

    const closeButton = screen.getByTestId('closeicon');
    await userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not show close button when dismissible but no onClose provided', () => {
    render(
      <WithTheme>
        <AlertBanner message="Test message" dismissible={true} />
      </WithTheme>
    );

    expect(screen.queryByTestId('closeicon')).not.toBeInTheDocument();
  });

  it('applies custom styles when provided', () => {
    render(
      <WithTheme>
        <AlertBanner 
          message="Test message" 
          sx={{ 
            marginTop: 4,
            backgroundColor: 'purple'
          }} 
        />
      </WithTheme>
    );

    const container = screen.getByText('Test message').closest('.MuiPaper-root');
    expect(container).toHaveStyle('margin-top: 32px');
    expect(container).toHaveStyle('background-color: purple');
  });
});