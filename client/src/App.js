import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, CircularProgress, Box } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { LazyMotion, domAnimation } from 'framer-motion';
import theme, { darkTheme } from './theme.ts';
import Layout from './components/Layout';
import { SeasonProvider } from './context/SeasonContext';
import { OfflineSyncProvider } from './context/OfflineSyncContext';

// Lazy load pages for code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const PondManagementPage = lazy(() => import('./pages/PondManagementPage'));
const FeedViewPage = lazy(() => import('./pages/FeedViewPage'));
const WaterQualityViewPage = lazy(() => import('./pages/WaterQualityViewPage'));
const NurseryManagementPage = lazy(() => import('./pages/NurseryManagementPage'));
const NurseryBatchDetailPage = lazy(() => import('./pages/NurseryBatchDetailPage'));
const InventoryManagementPage = lazy(() => import('./pages/InventoryManagementPage'));
const HistoricalInsightsPage = lazy(() => import('./pages/HistoricalInsightsPage'));

// Loading component for suspense
const LoadingComponent = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Check for saved theme preference or default to light mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.body.style.backgroundColor = darkMode 
      ? darkTheme.palette.background.default 
      : theme.palette.background.default;
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <LazyMotion features={domAnimation}>
      <ThemeProvider theme={darkMode ? darkTheme : theme}>
        <CssBaseline />
        <Router>
          <SeasonProvider>
            <OfflineSyncProvider>
              <Layout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                <AnimatePresence mode="wait">
                  <Suspense fallback={<LoadingComponent />}>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/admin" element={<AdminPage />} />
                      <Route path="/pond" element={<PondManagementPage />} />
                      <Route path="/pond/:pondId" element={<PondManagementPage />} />
                      <Route path="/feed-view" element={<FeedViewPage />} />
                      <Route path="/water-quality-view" element={<WaterQualityViewPage />} />
                      <Route path="/nursery" element={<NurseryManagementPage />} />
                      <Route path="/nursery/batch/:id" element={<NurseryBatchDetailPage />} />
                      <Route path="/inventory-management" element={<InventoryManagementPage />} />
                      <Route path="/historical-insights" element={<HistoricalInsightsPage />} />
                    </Routes>
                  </Suspense>
                </AnimatePresence>
              </Layout>
            </OfflineSyncProvider>
          </SeasonProvider>
        </Router>
      </ThemeProvider>
    </LazyMotion>
  );
}

export default App;