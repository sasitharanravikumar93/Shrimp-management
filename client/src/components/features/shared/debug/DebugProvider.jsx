/**
 * Debug Provider - Development Only
 * Provides debugging context and tools for the entire application
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, CssBaseline } from '@mui/material';
import DebugPanel from './DebugPanel';
import EnhancedErrorBoundary from '../error-handling/EnhancedErrorBoundary';
import {
  ComponentDebugger,
  PerformanceDebugger,
  NetworkDebugger,
  UserActionDebugger,
  DebugConsole,
  DEBUG_CONFIG
} from '../../../utils/debugUtils';
import logger from '../../../utils/logger';

// Debug provider is only available in development
const isDevelopment = process.env.NODE_ENV === 'development';

// Debug Context
const DebugContext = createContext({
  isDebugMode: false,
  enableDebugMode: () => {},
  disableDebugMode: () => {},
  trackComponent: () => {},
  trackPerformance: () => {},
  trackUserAction: () => {},
  trackNetworkCall: () => {},
  logDebug: () => {}
});

export const useDebugContext = () => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebugContext must be used within a DebugProvider');
  }
  return context;
};

// Debug Theme with visual indicators
const createDebugTheme = baseTheme => {
  return createTheme({
    ...baseTheme,
    components: {
      ...baseTheme.components,
      MuiButton: {
        ...baseTheme.components?.MuiButton,
        styleOverrides: {
          ...baseTheme.components?.MuiButton?.styleOverrides,
          root: {
            ...baseTheme.components?.MuiButton?.styleOverrides?.root,
            '&[data-debug="true"]': {
              border: '1px dashed #ff9800',
              position: 'relative',
              '&::after': {
                content: '"🐛"',
                position: 'absolute',
                top: -8,
                right: -8,
                fontSize: '12px',
                backgroundColor: '#ff9800',
                borderRadius: '50%',
                width: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }
            }
          }
        }
      }
    }
  });
};

// Network Call Interceptor
class NetworkInterceptor {
  constructor() {
    this.originalFetch = window.fetch;
    this.originalXMLHttpRequest = window.XMLHttpRequest;
    this.interceptors = [];
  }

  enable() {
    // Intercept fetch
    window.fetch = async (...args) => {
      const [url, config = {}] = args;
      const requestId = NetworkDebugger.trackRequest({
        url: url.toString(),
        method: config.method || 'GET',
        headers: config.headers,
        data: config.body
      });

      try {
        const response = await this.originalFetch(...args);
        NetworkDebugger.trackResponse(requestId, {
          status: response.status,
          statusText: response.statusText,
          data: null // We can't easily get response data without cloning
        });
        return response;
      } catch (error) {
        NetworkDebugger.trackResponse(requestId, null, error);
        throw error;
      }
    };

    // Intercept XMLHttpRequest
    const self = this;
    window.XMLHttpRequest = function () {
      const xhr = new self.originalXMLHttpRequest();
      let requestId;

      const originalOpen = xhr.open;
      const originalSend = xhr.send;

      xhr.open = function (method, url, ...args) {
        this._debugMethod = method;
        this._debugUrl = url;
        return originalOpen.apply(this, [method, url, ...args]);
      };

      xhr.send = function (data) {
        requestId = NetworkDebugger.trackRequest({
          url: this._debugUrl,
          method: this._debugMethod,
          data
        });

        const originalOnReadyStateChange = this.onreadystatechange;
        this.onreadystatechange = function () {
          if (this.readyState === 4) {
            NetworkDebugger.trackResponse(requestId, {
              status: this.status,
              statusText: this.statusText,
              data: this.responseText
            });
          }
          if (originalOnReadyStateChange) {
            originalOnReadyStateChange.apply(this, arguments);
          }
        };

        return originalSend.apply(this, arguments);
      };

      return xhr;
    };
  }

  disable() {
    window.fetch = this.originalFetch;
    window.XMLHttpRequest = this.originalXMLHttpRequest;
  }
}

const networkInterceptor = new NetworkInterceptor();

// Debug Provider Component
const DebugProvider = ({ children, theme }) => {
  const [isDebugMode, setIsDebugMode] = useState(isDevelopment);
  const [debugTheme, setDebugTheme] = useState(theme);

  useEffect(() => {
    if (!isDevelopment) return;

    // Initialize debug utilities
    logger.info('Debug mode initialized', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Enable network interception
    if (DEBUG_CONFIG.enableNetworkDebugging) {
      networkInterceptor.enable();
    }

    // Set up global error handlers
    const handleUnhandledRejection = event => {
      logger.error('Unhandled Promise Rejection', {
        type: 'unhandled_rejection',
        reason: event.reason
      });
    };

    const handleGlobalError = event => {
      logger.error(
        'Global JavaScript Error',
        {
          type: 'global_error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          message: event.message
        },
        event.error
      );
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    // Cleanup
    return () => {
      networkInterceptor.disable();
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  const enableDebugMode = () => {
    setIsDebugMode(true);
    setDebugTheme(createDebugTheme(theme));
    DebugConsole.enableVerboseLogging();
    logger.info('Debug mode enabled');
  };

  const disableDebugMode = () => {
    setIsDebugMode(false);
    setDebugTheme(theme);
    DebugConsole.disableVerboseLogging();
    logger.info('Debug mode disabled');
  };

  const trackComponent = (componentName, props, state) => {
    ComponentDebugger.trackComponent(componentName, props, state);
  };

  const trackPerformance = (label, fn) => {
    return PerformanceDebugger.measureFunction(label, fn);
  };

  const trackUserAction = (action, component, metadata) => {
    UserActionDebugger.trackAction(action, component, metadata);
  };

  const trackNetworkCall = config => {
    return NetworkDebugger.trackRequest(config);
  };

  const logDebug = (message, metadata) => {
    logger.debug(message, metadata);
  };

  const debugContextValue = {
    isDebugMode,
    enableDebugMode,
    disableDebugMode,
    trackComponent,
    trackPerformance,
    trackUserAction,
    trackNetworkCall,
    logDebug
  };

  // In production, render children without debug features
  if (!isDevelopment) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <EnhancedErrorBoundary
          context={{ provider: 'DebugProvider' }}
          onError={(error, errorInfo, errorId) => {
            // Production error reporting would go here
            console.error('Production Error:', { error, errorInfo, errorId });
          }}
        >
          {children}
        </EnhancedErrorBoundary>
      </ThemeProvider>
    );
  }

  // Development mode with full debug features
  return (
    <DebugContext.Provider value={debugContextValue}>
      <ThemeProvider theme={debugTheme}>
        <CssBaseline />
        <EnhancedErrorBoundary
          context={{ provider: 'DebugProvider' }}
          onError={(error, errorInfo, errorId) => {
            logger.error(
              'Error Boundary Triggered',
              {
                errorId,
                component: 'DebugProvider'
              },
              error
            );
          }}
        >
          <Box sx={{ position: 'relative' }}>
            {children}

            {/* Debug Panel - Only in development */}
            <DebugPanel />

            {/* Debug Mode Indicator */}
            {isDebugMode && (
              <Box
                sx={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background:
                    'linear-gradient(90deg, #ff9800, #f44336, #9c27b0, #3f51b5, #2196f3, #00bcd4, #009688, #4caf50, #8bc34a, #cddc39, #ffeb3b, #ff9800)',
                  backgroundSize: '200% 100%',
                  animation: 'debugRainbow 3s linear infinite',
                  zIndex: 9999,
                  '@keyframes debugRainbow': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '100%': { backgroundPosition: '200% 50%' }
                  }
                }}
              />
            )}

            {/* Performance Monitor Overlay */}
            {isDebugMode && process.env.REACT_APP_SHOW_PERFORMANCE_MONITOR && (
              <PerformanceMonitor />
            )}
          </Box>
        </EnhancedErrorBoundary>
      </ThemeProvider>
    </DebugContext.Provider>
  );
};

// Performance Monitor Component
const PerformanceMonitor = () => {
  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState(null);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId;

    const calculateFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;

        // Update memory info if available
        if (performance.memory) {
          setMemory({
            used: Math.round(performance.memory.usedJSHeapSize / 1048576),
            total: Math.round(performance.memory.totalJSHeapSize / 1048576)
          });
        }
      }

      animationId = requestAnimationFrame(calculateFPS);
    };

    animationId = requestAnimationFrame(calculateFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 10,
        left: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: 1,
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9998
      }}
    >
      <div>FPS: {fps}</div>
      {memory && (
        <div>
          Memory: {memory.used}MB / {memory.total}MB
        </div>
      )}
    </Box>
  );
};

export default DebugProvider;
export { DebugContext, useDebugContext };
