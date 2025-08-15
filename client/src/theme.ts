
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007BFF', // Primary blue
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#28A745', // Success green
      light: '#66bb6a',
      dark: '#2e7d32',
    },
    background: {
      default: '#E3F2FD', // Light blue background
      paper: '#ffffff', // White for cards and surfaces
    },
    success: {
      main: '#28A745', // Success green
      light: '#66bb6a',
      dark: '#2e7d32',
    },
    warning: {
      main: '#FD7E14', // Warning orange
      light: '#ffa726',
      dark: '#f57c00',
    },
    error: {
      main: '#DC3545', // Error red
      light: '#ef5350',
      dark: '#d32f2f',
    },
    text: {
      primary: '#333333', // Dark grey for primary text
      secondary: '#666666', // Medium grey for secondary text
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none', // Prevent uppercase buttons
    },
  },
  shape: {
    borderRadius: 12, // More rounded corners
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)', // Subtle shadow for app bar
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff', // Light background for sidebar
          color: '#333333', // Dark text for sidebar
          borderRight: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // Enhanced shadow for cards
          borderRadius: 12,
          // Glassmorphism effect
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
  },
});

// Dark mode theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#007BFF', // Primary blue
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#28A745', // Success green
      light: '#66bb6a',
      dark: '#2e7d32',
    },
    background: {
      default: '#0a1929', // Dark blue background
      paper: '#1a2c3c', // Darker paper for cards
    },
    success: {
      main: '#28A745', // Success green
      light: '#66bb6a',
      dark: '#2e7d32',
    },
    warning: {
      main: '#FD7E14', // Warning orange
      light: '#ffa726',
      dark: '#f57c00',
    },
    error: {
      main: '#DC3545', // Error red
      light: '#ef5350',
      dark: '#d32f2f',
    },
    text: {
      primary: '#ffffff', // White text
      secondary: '#cccccc', // Light grey text
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none', // Prevent uppercase buttons
    },
  },
  shape: {
    borderRadius: 12, // More rounded corners
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)', // Darker shadow for app bar
          backgroundColor: '#1a2c3c',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a2c3c', // Dark background for sidebar
          color: '#ffffff', // White text for sidebar
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)', // Enhanced shadow for cards
          borderRadius: 12,
          // Glassmorphism effect for dark mode
          background: 'rgba(26, 44, 60, 0.7)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          },
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          },
        },
      },
    },
  },
});

export default theme;
