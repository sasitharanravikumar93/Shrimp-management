import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { GlobalErrorBoundary } from './components/features/shared/error-handling/GlobalErrorBoundary';
import Layout from './components/features/shared/layout/Layout';
import { OfflineSyncProvider } from './context/OfflineSyncContext';
import { SeasonProvider } from './context/SeasonContext';
import i18n from './i18n';
import theme, { darkTheme } from './theme.ts';
import { RTLProvider, useRTL, createRTLTheme } from './utils/rtlUtils';

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
const ExpenseManagementPage = lazy(() => import('./pages/ExpenseManagementPage'));

// Loading component for suspense
const LoadingComponent = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// App content component with RTL support
const AppContent = () => {
  const [darkMode, setDarkMode] = useState(false);
  const { isRTL } = useRTL();

  // Check for saved theme preference or default to light mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Create RTL-aware theme
  const currentTheme = React.useMemo(() => {
    const baseTheme = darkMode ? darkTheme : theme;
    return createRTLTheme(baseTheme, isRTL);
  }, [darkMode, isRTL]);

  // Apply theme to document
  useEffect(() => {
    document.body.style.backgroundColor = currentTheme.palette.background.default;
  }, [currentTheme]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <LazyMotion features={domAnimation}>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <SeasonProvider>
            <OfflineSyncProvider>
              <Layout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                <AnimatePresence mode='wait'>
                  <Suspense fallback={<LoadingComponent />}>
                    <Routes>
                      <Route path='/' element={<DashboardPage />} />
                      <Route path='/dashboard/:pondId' element={<DashboardPage />} />
                      <Route path='/dashboard' element={<DashboardPage />} />
                      <Route path='/admin' element={<AdminPage />} />
                      <Route path='/pond' element={<PondManagementPage />} />
                      <Route path='/pond/:pondId' element={<PondManagementPage />} />
                      <Route path='/feed-view' element={<FeedViewPage />} />
                      <Route path='/water-quality-view' element={<WaterQualityViewPage />} />
                      <Route path='/nursery' element={<NurseryManagementPage />} />
                      <Route path='/nursery/batch/:id' element={<NurseryBatchDetailPage />} />
                      <Route path='/inventory-management' element={<InventoryManagementPage />} />
                      <Route path='/historical-insights' element={<HistoricalInsightsPage />} />
                      <Route path='/expense-management' element={<ExpenseManagementPage />} />
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
};

// Main App component with all providers
const App = () => {
  return (
    <GlobalErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <RTLProvider>
          <AppContent />
        </RTLProvider>
      </I18nextProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
