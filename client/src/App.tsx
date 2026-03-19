import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { GlobalErrorBoundary } from './components/features/shared/error-handling/GlobalErrorBoundary';
import Layout from './components/features/shared/layout/Layout';
import { OfflineSyncProvider } from './context/OfflineSyncContext';
import { SeasonProvider } from './context/SeasonContext';
import i18n from './i18n';
import theme, { darkTheme } from './theme.ts';
import { RTLProvider, useRTL, createRTLTheme } from './utils/rtlUtils';
import GlobalNotification from './components/GlobalNotification';

// Lazy load pages for code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const PondManagementPage = lazy(() => import('./pages/PondManagementPage'));
const PondRedirectPage = lazy(() => import('./pages/PondRedirectPage'));
const FeedViewPage = lazy(() => import('./pages/FeedViewPage'));
const WaterQualityViewPage = lazy(() => import('./pages/WaterQualityViewPage'));
const NurseryManagementPage = lazy(() => import('./pages/NurseryManagementPage'));
const NurseryBatchDetailPage = lazy(() => import('./pages/NurseryBatchDetailPage'));
const InventoryManagementPage = lazy(() => import('./pages/InventoryManagementPage'));
const HistoricalInsightsPage = lazy(() => import('./pages/HistoricalInsightsPage'));
const ExpenseManagementPage = lazy(() => import('./pages/ExpenseManagementPage'));

// New features from feature branch
const HarvestManagementPage = lazy(() => import('./pages/HarvestManagementPage'));
const PostHarvestReportPage = lazy(() => import('./pages/PostHarvestReportPage'));
const HealthLogPage = lazy(() => import('./pages/HealthLogPage'));
const TaskManagementPage = lazy(() => import('./pages/TaskManagementPage'));
const AlertRulesPage = lazy(() => import('./pages/AlertRulesPage'));

// Loading component for suspense
const LoadingComponent = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// App content component with RTL support
const AppContent: React.FC = () => {
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
    return createRTLTheme(baseTheme as any, isRTL);
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
        <Router>
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
                      <Route path='/pond' element={<PondRedirectPage />} />
                      <Route path='/pond/:pondId' element={<PondManagementPage />} />
                      <Route path='/feed-view' element={<FeedViewPage />} />
                      <Route path='/water-quality-view' element={<WaterQualityViewPage />} />
                      <Route path='/nursery' element={<NurseryManagementPage />} />
                      <Route path='/nursery/batch/:id' element={<NurseryBatchDetailPage />} />
                      <Route path='/inventory-management' element={<InventoryManagementPage />} />
                      <Route path='/historical-insights' element={<HistoricalInsightsPage />} />
                      <Route path='/expense-management' element={<ExpenseManagementPage />} />
                      <Route path='/expenses' element={<Navigate to="/expense-management" replace />} />
                      
                      {/* New feature routes */}
                      <Route path='/harvest' element={<HarvestManagementPage />} />
                      <Route path='/post-harvest-report' element={<PostHarvestReportPage />} />
                      <Route path='/health' element={<HealthLogPage />} />
                      <Route path='/tasks' element={<TaskManagementPage />} />
                      <Route path='/alert-rules' element={<AlertRulesPage />} />
                    </Routes>
                  </Suspense>
                </AnimatePresence>
                <GlobalNotification />
              </Layout>
            </OfflineSyncProvider>
          </SeasonProvider>
        </Router>
      </ThemeProvider>
    </LazyMotion>
  );
};

// Main App component with all providers
const App: React.FC = () => {
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
