import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught React Error in Global Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: 'background.default', p: 3 }}>
          <Paper elevation={3} sx={{ p: 5, textAlign: 'center', maxW: 500, borderRadius: 3 }}>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" color="text.primary" gutterBottom>
              Oops! Something went wrong.
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              An unexpected interface error occurred. Our team has been notified.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => window.location.href = '/'}
            >
              Return Home
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
