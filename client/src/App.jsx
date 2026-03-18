import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { LazyMotion, domAnimation } from 'framer-motion';
import theme, { darkTheme } from './theme.ts';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import PondManagementPage from './pages/PondManagementPage';
import PondRedirectPage from './pages/PondRedirectPage';
import FeedViewPage from './pages/FeedViewPage';
import WaterQualityViewPage from './pages/WaterQualityViewPage';
import NurseryManagementPage from './pages/NurseryManagementPage';
import InventoryManagementPage from './pages/InventoryManagementPage';
import ExpenseManagementPage from './pages/ExpenseManagementPage';
import PostHarvestReportPage from './pages/PostHarvestReportPage';
import HealthLogPage from './pages/HealthLogPage';
import TaskManagementPage from './pages/TaskManagementPage';
import AlertRulesPage from './pages/AlertRulesPage';
import HistoricalInsightsPage from './pages/HistoricalInsightsPage';
import HarvestManagementPage from './pages/HarvestManagementPage';
import Layout from './components/Layout';
import { SeasonProvider } from './context/SeasonContext';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import GlobalNotification from './components/GlobalNotification';

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
    <GlobalErrorBoundary>
      <LazyMotion features={domAnimation}>
        <ThemeProvider theme={darkMode ? darkTheme : theme}>
          <CssBaseline />
          <Router>
            <SeasonProvider>
              <Layout toggleDarkMode={toggleDarkMode} darkMode={darkMode}>
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/pond" element={<PondRedirectPage />} />
                    <Route path="/pond/:pondId" element={<PondManagementPage />} />
                    <Route path="/feed-view" element={<FeedViewPage />} />
                    <Route path="/water-quality-view" element={<WaterQualityViewPage />} />
                    <Route path="/nursery" element={<NurseryManagementPage />} />
                    <Route path="/inventory-management" element={<InventoryManagementPage />} />
                    <Route path="/expenses" element={<ExpenseManagementPage />} />
                    <Route path="/harvest" element={<HarvestManagementPage />} />
                    <Route path="/post-harvest-report" element={<PostHarvestReportPage />} />
                    <Route path="/health" element={<HealthLogPage />} />
                    <Route path="/tasks" element={<TaskManagementPage />} />
                    <Route path="/alert-rules" element={<AlertRulesPage />} />
                    <Route path="/historical-insights" element={<HistoricalInsightsPage />} />
                  </Routes>
                </AnimatePresence>
                <GlobalNotification />
              </Layout>
            </SeasonProvider>
          </Router>
        </ThemeProvider>
      </LazyMotion>
    </GlobalErrorBoundary>
  );
}

export default App;