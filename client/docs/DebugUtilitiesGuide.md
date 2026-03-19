# Debug Utilities and Enhanced Error Handling Guide

This document provides comprehensive documentation for the enhanced debugging and error handling system implemented in the application.

## Overview

The debug utilities provide powerful development tools for tracking component behavior, performance monitoring, error context enhancement, and real-time debugging capabilities.

## Key Features

✅ **Component Tracking** - Monitor renders, props, and state changes
✅ **Performance Monitoring** - Track render times and function execution
✅ **Network Debugging** - Intercept and monitor API calls
✅ **User Action Tracking** - Log user interactions and behaviors
✅ **Enhanced Error Context** - Rich error information with debug data
✅ **Real-time Debug Panel** - Interactive debugging interface
✅ **Error Boundaries** - Comprehensive error catching and recovery

---

## Debug Utilities

### ComponentDebugger

Tracks component lifecycle events, renders, and state changes.

```javascript
import { ComponentDebugger } from 'src/utils/debugUtils';

// Track component render
ComponentDebugger.trackComponent('MyComponent', props, state);

// Track state changes
ComponentDebugger.trackStateChange('MyComponent', prevState, newState, 'useState');

// Track prop changes
ComponentDebugger.trackProps('MyComponent', prevProps, newProps);
```

### PerformanceDebugger

Monitors performance metrics and execution times.

```javascript
import { PerformanceDebugger } from 'src/utils/debugUtils';

// Measure function execution
const duration = PerformanceDebugger.measureFunction('expensiveFunction', () => {
  // Expensive operation
});

// Measure async operations
const result = await PerformanceDebugger.measureAsync('apiCall', async () => {
  return await fetch('/api/data');
});

// Start/end marks
const mark = PerformanceDebugger.startMark('custom-operation');
// ... operation
mark.end();
```

### NetworkDebugger

Tracks API calls and network requests.

```javascript
import { NetworkDebugger } from 'src/utils/debugUtils';

// Track request
const requestId = NetworkDebugger.trackRequest({
  method: 'POST',
  url: '/api/ponds',
  data: pondData
});

// Track response
NetworkDebugger.trackResponse(requestId, response, error);
```

### UserActionDebugger

Logs user interactions and behaviors.

```javascript
import { UserActionDebugger } from 'src/utils/debugUtils';

// Track user actions
UserActionDebugger.trackAction('button_click', 'PondForm');
UserActionDebugger.trackFormSubmit('create-pond', formData, 'PondForm');
UserActionDebugger.trackNavigation('/ponds', '/ponds/create');
```

---

## React Debug Hooks

### useDebug (Comprehensive)

All-in-one debug hook for components.

```javascript
import { useDebug } from 'src/hooks/useDebug';

function MyComponent(props) {
  const [state, setState] = useState(initialState);
  
  const debug = useDebug('MyComponent', props, state, {
    trackRenders: true,
    trackProps: true,
    trackState: true,
    logToConsole: true
  });

  const handleClick = (event) => {
    debug.trackClick(event, { action: 'submit' });
    // Handle click
  };

  return (
    <button onClick={handleClick}>
      Rendered {debug.renderCount} times
    </button>
  );
}
```

### useComponentDebug

Track component-specific debugging information.

```javascript
import { useComponentDebug } from 'src/hooks/useDebug';

function TrackedComponent(props) {
  const [state, setState] = useState({});
  
  const { renderCount, logRender } = useComponentDebug(
    'TrackedComponent',
    props,
    state,
    { trackRenders: true, logToConsole: true }
  );

  return <div>Render #{renderCount}</div>;
}
```

### usePerformanceDebug

Monitor component performance.

```javascript
import { usePerformanceDebug } from 'src/hooks/useDebug';

function PerformanceTrackedComponent() {
  const { measureEffect, measureAsyncEffect } = usePerformanceDebug('MyComponent');

  useEffect(() => {
    measureEffect('data-processing', () => {
      // Expensive synchronous operation
    });
  }, []);

  const handleAsyncOperation = async () => {
    await measureAsyncEffect('api-call', async () => {
      return await fetchData();
    });
  };

  return <div>Performance Tracked Component</div>;
}
```

### useStateDebug

Track state changes in detail.

```javascript
import { useStateDebug } from 'src/hooks/useDebug';

function StateTrackedComponent() {
  const [count, setCount] = useState(0);
  
  const { changeCount, history, logHistory } = useStateDebug(
    count,
    'count',
    'StateTrackedComponent'
  );

  return (
    <div>
      <p>Count: {count} (Changed {changeCount} times)</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={logHistory}>Log History</button>
    </div>
  );
}
```

---

## Enhanced Error Boundary

The enhanced error boundary provides comprehensive error handling with debug context.

```javascript
import { EnhancedErrorBoundary } from 'src/components/features/shared/error-handling';

function App() {
  return (
    <EnhancedErrorBoundary
      title="Application Error"
      message="Something went wrong in the application"
      context={{ module: 'main-app' }}
      onError={(error, errorInfo, errorId) => {
        // Custom error handling
        reportToService(error, errorId);
      }}
      recoveryActions={[
        {
          label: 'Go to Dashboard',
          handler: () => navigate('/dashboard'),
          icon: <HomeIcon />
        }
      ]}
    >
      <MainApplication />
    </EnhancedErrorBoundary>
  );
}
```

### Features

- **Enhanced Error Context** - Includes debug data, user actions, network calls
- **Recovery Actions** - Customizable recovery options
- **Debug Information** - Expandable debug details in development
- **Error Reporting** - Integration with external error services
- **User-Friendly UI** - Clean error display with helpful information

---

## Debug Panel

Interactive debugging interface available in development mode.

### Features

- **Real-time Logs** - View debug entries as they happen
- **Component Tracking** - Monitor render counts and states
- **Network Monitoring** - Track API calls and responses
- **User Actions** - View user interaction history
- **Performance Metrics** - Monitor memory and FPS
- **Export Data** - Download debug information

### Usage

The debug panel automatically appears in development mode:

1. **Access** - Click the floating debug button (bottom-right)
2. **Navigate** - Use tabs to switch between different views
3. **Filter** - Search and filter debug entries
4. **Export** - Download debug data for analysis

### Debug Console

Access debug utilities via browser console:

```javascript
// Available in development mode
window.__DEBUG__.logs()           // Get all logs
window.__DEBUG__.clear()          // Clear debug data
window.__DEBUG__.components()     // Get component states
window.__DEBUG__.network()        // Get network calls
window.__DEBUG__.exportDebugData() // Export all data
```

---

## Debug Provider

Wraps the application to provide debugging context.

```javascript
import { DebugProvider } from 'src/components/features/shared/debug';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  // Your theme configuration
});

function App() {
  return (
    <DebugProvider theme={theme}>
      <Application />
    </DebugProvider>
  );
}
```

### Features

- **Network Interception** - Automatically tracks fetch and XHR requests
- **Global Error Handling** - Catches unhandled errors and rejections
- **Debug Context** - Provides debugging utilities via React context
- **Visual Indicators** - Debug mode visual feedback
- **Performance Monitoring** - Optional FPS and memory monitoring

---

## Error Context Enhancement

Errors are automatically enhanced with debug context:

```javascript
import { ErrorContextEnhancer } from 'src/utils/debugUtils';

try {
  // Risky operation
} catch (error) {
  const enhancedError = ErrorContextEnhancer.enhanceError(error, {
    component: 'MyComponent',
    operation: 'data-fetch'
  });
  
  // Enhanced error includes:
  // - Recent debug logs
  // - User actions
  // - Network calls
  // - Component states
  // - Render counts
  // - Performance marks
}
```

---

## Configuration

Debug utilities are controlled by environment variables and configuration:

```javascript
// Debug configuration
const DEBUG_CONFIG = {
  enabled: process.env.NODE_ENV === 'development',
  persistLogs: true,
  maxDebugEntries: 1000,
  enablePerformanceMonitoring: true,
  enableComponentTracking: true,
  enableStateDebugging: true,
  enableNetworkDebugging: true
};
```

### Environment Variables

```bash
# Enable/disable debug features
REACT_APP_DEBUG_ENABLED=true

# Show performance monitor overlay
REACT_APP_SHOW_PERFORMANCE_MONITOR=true

# Enable error reporting
REACT_APP_ERROR_REPORTING_ENABLED=true

# Error reporting endpoint
REACT_APP_ERROR_REPORTING_ENDPOINT=https://api.example.com/errors
```

---

## Best Practices

### Development Workflow

1. **Enable Debug Mode** - Use DebugProvider in development
2. **Track Components** - Add debug hooks to critical components
3. **Monitor Performance** - Track expensive operations
4. **Review Debug Panel** - Regular checks during development
5. **Export Debug Data** - Save debugging sessions for analysis

### Production Considerations

1. **Disable Debug Features** - Debug utilities are development-only
2. **Error Reporting** - Configure external error reporting service
3. **Performance** - Debug code has zero impact in production
4. **Security** - No debug information exposed in production builds

### Component Integration

```javascript
// Example: Comprehensive component debugging
import { useDebug } from 'src/hooks/useDebug';

function CriticalComponent(props) {
  const [state, setState] = useState(initialState);
  
  // Enable comprehensive debugging
  const debug = useDebug('CriticalComponent', props, state, {
    trackRenders: true,
    trackProps: true,
    trackState: true,
    logToConsole: process.env.NODE_ENV === 'development'
  });

  // Track API calls
  const handleApiCall = async () => {
    try {
      const result = await debug.trackApiCall(
        () => api.fetchData(),
        { endpoint: '/api/data', component: 'CriticalComponent' }
      );
      setState(result);
    } catch (error) {
      const enhancedError = debug.enhanceError(error, {
        operation: 'fetch-data',
        state: state
      });
      throw enhancedError;
    }
  };

  // Track user interactions
  const handleUserAction = (event) => {
    debug.trackClick(event, { action: 'primary-action' });
    // Handle action
  };

  return (
    <div>
      <button onClick={handleUserAction}>Action</button>
      <div>Renders: {debug.renderCount}</div>
    </div>
  );
}
```

---

## Troubleshooting

### Common Issues

**Debug Panel Not Appearing**
- Ensure `NODE_ENV=development`
- Check that DebugProvider wraps your app
- Verify no JavaScript errors preventing initialization

**Performance Impact**
- Debug utilities only run in development
- Production builds exclude all debug code
- No performance impact in production

**Missing Debug Data**
- Check DEBUG_CONFIG settings
- Ensure components use debug hooks
- Verify network interception is enabled

### Debug Console Commands

```javascript
// Check debug status
window.__DEBUG__

// Enable verbose logging
window.__DEBUG__.enableVerbose()

// Disable verbose logging
window.__DEBUG__.disableVerbose()

// Find component debug data
window.__DEBUG__.findComponent('MyComponent')

// Filter logs by type
window.__DEBUG__.findLogs('performance')

// Export debugging session
window.__DEBUG__.exportDebugData()
```

---

This comprehensive debugging system provides powerful development tools while maintaining zero impact on production performance. The enhanced error boundaries and debug utilities help identify and resolve issues quickly during development.