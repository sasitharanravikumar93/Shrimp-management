import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './i18n'; // Import i18n configuration
import { GlobalErrorProvider } from './components/features/shared/error-handling/GlobalErrorProvider';
import * as serviceWorker from './serviceWorker';

/**
 * Global Error Handlers
 * Capture uncaught errors and unhandled promise rejections
 * This provides a fallback for errors not caught by ErrorBoundary
 */
const setupGlobalErrorHandlers = () => {
  // Function to safely call global error handler
  const showGlobalError = (error) => {
    const handler = window.showGlobalError || window.__GLOBAL_ERROR_HANDLER__?.showError;
    if (handler) {
      handler(error);
    } else {
      // Fallback: log to console if handler isn't ready yet
      console.error('Global error handler not ready:', error);
    }
  };

  // Capture uncaught JavaScript errors
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message || 'Unknown runtime error');
    console.error('Uncaught error:', error);

    // Only show modal in production or if development error modal is enabled
    if (process.env.NODE_ENV === 'production' || window.__DEV_ERROR_MODAL__) {
      showGlobalError(error);
    }
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(`Unhandled promise rejection: ${event.reason || 'Unknown error'}`);
    console.error('Unhandled promise rejection:', error);

    // Only show modal in production or if development error modal is enabled
    if (process.env.NODE_ENV === 'production' || window.__DEV_ERROR_MODAL__) {
      showGlobalError(error);
    }
  });

  // Override console.error to capture additional errors
  if (process.env.NODE_ENV === 'production') {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError(...args);

      // Check if any argument looks like an error
      const errorArg = args.find(arg => arg instanceof Error || arg?.message || arg?.stack);
      if (errorArg instanceof Error) {
        showGlobalError(errorArg);
      } else if (typeof errorArg === 'string' && (
        errorArg.includes('Error') ||
        errorArg.includes('Exception') ||
        errorArg.includes('Failed')
      )) {
        showGlobalError(new Error(errorArg));
      }
    };
  }
};

// Set up global error handlers immediately
setupGlobalErrorHandlers();

// Wrapper component with global error handling
const AppWithGlobalErrorHandling = () => {
  return (
    <GlobalErrorProvider showDetails={process.env.NODE_ENV === 'development'}>
      <App />
    </GlobalErrorProvider>
  );
};

// Initialize and render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWithGlobalErrorHandling />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Register service worker for PWA functionality
serviceWorker.register();
