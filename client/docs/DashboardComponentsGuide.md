# Dashboard Components Documentation

Dashboard components provide high-level overview and analytics functionality for the application. These components are designed for displaying key metrics, alerts, insights, and quick actions.

## Component Overview

- **KPICard** - Key Performance Indicator display with trends and interactions
- **AlertBanner** - System alerts and notification display  
- **PredictiveInsight** - Data-driven insights and recommendations
- **QuickActions** - Shortcut buttons for common tasks

---

## KPICard

**File:** `src/components/features/dashboard/KPICard.standardized.js`

A standardized component for displaying key performance indicators with consistent styling, trend indicators, and interactive capabilities.

### Purpose
KPICard displays numerical metrics in a visually appealing card format with optional trend indicators, progress bars, and click interactions. It follows standardized prop interfaces for consistency across the application.

### Props Interface

```typescript
interface KPICardProps extends BaseComponentProps, ThemeProps {
  // Content props
  title: string;                    // Main title/label (required)
  value: number | string;           // Primary value to display (required)
  icon?: ReactNode;                 // Optional icon component
  subtitle?: string;                // Secondary descriptive text
  description?: string;             // Detailed description for tooltip

  // Display formatting
  change?: number;                  // Percentage change value
  changeText?: string;              // Custom change description
  progressValue?: number;           // Progress bar value (0-100)
  progressColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  isCurrency?: boolean;             // Format value as currency
  suffix?: string;                  // Value suffix (e.g., '%', 'kg', 'units')

  // Interaction handlers
  onClick?: () => void;             // Click handler for navigation
  onHover?: () => void;             // Hover handler for preloading

  // Animation configuration
  animationDelay?: number;          // Animation delay in seconds (default: 0)
  animationDuration?: number;       // Animation duration in seconds (default: 0.5)

  // Feature toggles
  showTrend?: boolean;              // Show trend arrow indicator (default: true)
  showProgress?: boolean;           // Show progress bar (default: false)
  customIcon?: ReactNode;           // Custom icon override

  // Accessibility
  ariaLabel?: string;               // Custom aria-label
  ariaDescription?: string;         // Detailed description for screen readers
}
```

### Key Features

✅ **Standardized Props** - Follows consistent prop naming conventions
✅ **Performance Optimized** - Memoized with stable references  
✅ **Accessibility** - Full keyboard navigation and screen reader support
✅ **Responsive Design** - Adapts to different screen sizes
✅ **Theme Integration** - Uses Material-UI theme values
✅ **Animation Support** - Smooth entry animations with configurable timing
✅ **Trend Indicators** - Visual trend arrows with semantic colors
✅ **Progress Visualization** - Optional progress bars for completion metrics
✅ **Interactive States** - Hover effects and click handling
✅ **Loading States** - Built-in loading indicator support

### Usage Examples

#### Basic KPI Display
```jsx
import { KPICard } from 'src/components/features/dashboard';

function BasicDashboard() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title="Total Revenue"
          value={125000}
          isCurrency={true}
          icon={<MonetizationOnIcon />}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title="Active Ponds"
          value={12}
          suffix=" ponds"
          icon={<PoolIcon />}
          color="primary"
        />
      </Grid>
    </Grid>
  );
}
```

#### Advanced KPI with Trends and Interactions
```jsx
function AdvancedDashboard() {
  const handlePondMetricsClick = () => {
    navigate('/ponds/analytics');
  };

  const preloadPondData = () => {
    // Preload pond data on hover
    prefetchQuery('/api/ponds/summary');
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title="Pond Efficiency"
          value={87.5}
          suffix="%"
          change={12.3}
          changeText="vs last month"
          progressValue={87.5}
          progressColor="success"
          showTrend={true}
          showProgress={true}
          onClick={handlePondMetricsClick}
          onHover={preloadPondData}
          icon={<TrendingUpIcon />}
          color="success"
          size="large"
          animationDelay={0.1}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title="Feed Efficiency"
          value={2.1}
          suffix=" FCR"
          change={-5.8}
          changeText="improvement"
          icon={<FeedIcon />}
          color="warning"
          showTrend={true}
          size="medium"
          animationDelay={0.2}
          description="Feed Conversion Ratio - lower is better"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title="Water Quality Score"
          value={92}
          suffix="/100"
          change={3.2}
          progressValue={92}
          progressColor="primary"
          showProgress={true}
          icon={<WaterDropIcon />}
          color="info"
          size="medium"
          animationDelay={0.3}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title="Monthly Profit"
          value={45200}
          isCurrency={true}
          change={18.7}
          changeText="vs last month"
          showTrend={true}
          icon={<AccountBalanceWalletIcon />}
          color="success"
          size="large"
          animationDelay={0.4}
          onClick={() => navigate('/financial/profit-analysis')}
        />
      </Grid>
    </Grid>
  );
}
```

#### Loading and Error States
```jsx
function DashboardWithStates() {
  const { data: metrics, loading, error } = useApiData('/api/dashboard/metrics');

  if (error) {
    return <Alert severity="error">Failed to load dashboard metrics</Alert>;
  }

  return (
    <Grid container spacing={3}>
      {metrics?.map((metric, index) => (
        <Grid item xs={12} sm={6} md={3} key={metric.id}>
          <KPICard
            title={metric.title}
            value={metric.value}
            change={metric.change}
            loading={loading}
            isCurrency={metric.type === 'currency'}
            suffix={metric.suffix}
            icon={getMetricIcon(metric.type)}
            animationDelay={index * 0.1}
          />
        </Grid>
      ))}
    </Grid>
  );
}
```

### Styling and Theming

The KPICard integrates deeply with Material-UI theming:

```jsx
// Custom theme configuration for KPICards
const theme = createTheme({
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          '&.kpi-card': {
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }
          }
        }
      }
    }
  }
});
```

### Performance Considerations

The KPICard is optimized for performance:

1. **Memoization** - Uses `React.memo` to prevent unnecessary re-renders
2. **Stable References** - Uses `useStableMemo` and `useStableCallback` for computed values
3. **Efficient Formatting** - Memoized number and currency formatting
4. **Optimized Animations** - Hardware-accelerated CSS transforms

```jsx
// Performance monitoring
import { Profiler } from 'react';

function ProfiledKPICard(props) {
  const onRender = (id, phase, actualDuration) => {
    console.log('KPICard render:', { id, phase, actualDuration });
  };

  return (
    <Profiler id="KPICard" onRender={onRender}>
      <KPICard {...props} />
    </Profiler>
  );
}
```

---

## AlertBanner

**File:** `src/components/features/dashboard/AlertBanner.js`

Displays system alerts, notifications, and important messages to users with different severity levels.

### Purpose
AlertBanner provides a consistent way to display system alerts, warnings, and informational messages. It supports different severity levels, dismissible options, and action buttons.

### Props Interface

```typescript
interface AlertBannerProps {
  // Content
  message: string;                      // Alert message (required)
  title?: string;                       // Optional alert title
  details?: string;                     // Additional details

  // Appearance
  severity: 'error' | 'warning' | 'info' | 'success'; // Alert type
  variant?: 'filled' | 'outlined' | 'standard'; // Visual variant
  icon?: ReactNode;                     // Custom icon

  // Behavior
  dismissible?: boolean;                // Can be dismissed (default: true)
  autoHide?: boolean;                   // Auto-hide after timeout
  timeout?: number;                     // Auto-hide timeout in ms (default: 5000)
  persistent?: boolean;                 // Persist across page reloads

  // Actions
  onDismiss?: () => void;               // Dismiss handler
  actions?: AlertAction[];              // Action buttons

  // Styling
  className?: string;
  sx?: SxProps;
}

interface AlertAction {
  label: string;
  handler: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}
```

### Usage Examples

#### Basic Alerts
```jsx
import { AlertBanner } from 'src/components/features/dashboard';

function DashboardAlerts() {
  return (
    <Stack spacing={2}>
      <AlertBanner
        severity="warning"
        message="Water temperature in Pond #3 is above optimal range"
        dismissible={true}
      />
      
      <AlertBanner
        severity="error"
        title="System Alert"
        message="Failed to sync data with external sensors"
        persistent={true}
        actions={[
          {
            label: 'Retry Sync',
            handler: () => retrySensorSync(),
            variant: 'contained'
          },
          {
            label: 'View Details',
            handler: () => openErrorDetails(),
            variant: 'outlined'
          }
        ]}
      />
    </Stack>
  );
}
```

#### Auto-hiding Notifications
```jsx
function NotificationSystem() {
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((alert) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { ...alert, id }]);
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  return (
    <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1300 }}>
      <Stack spacing={2}>
        {alerts.map((alert) => (
          <AlertBanner
            key={alert.id}
            severity={alert.severity}
            message={alert.message}
            autoHide={true}
            timeout={5000}
            onDismiss={() => removeAlert(alert.id)}
          />
        ))}
      </Stack>
    </Box>
  );
}
```

---

## PredictiveInsight

**File:** `src/components/features/dashboard/PredictiveInsight.js`

Displays data-driven insights and recommendations based on historical data and predictive analytics.

### Purpose
PredictiveInsight analyzes data patterns and provides actionable recommendations to improve farm operations, efficiency, and profitability.

### Props Interface

```typescript
interface PredictiveInsightProps {
  // Insight data
  insight: InsightData;                 // Insight information (required)
  
  // Display options
  showConfidence?: boolean;             // Show confidence score (default: true)
  showActions?: boolean;                // Show action buttons (default: true)
  compact?: boolean;                    // Compact layout (default: false)

  // Callbacks
  onActionClick?: (action: string) => void; // Action handler
  onDismiss?: () => void;               // Dismiss handler
}

interface InsightData {
  id: string;
  title: string;
  description: string;
  type: 'optimization' | 'warning' | 'opportunity' | 'prediction';
  confidence: number;                   // 0-100 confidence score
  impact: 'low' | 'medium' | 'high';   // Expected impact level
  category: string;                     // Insight category
  actions?: InsightAction[];            // Recommended actions
  data?: any;                          // Supporting data
  createdAt: Date;
  expiresAt?: Date;
}
```

### Usage Examples

```jsx
import { PredictiveInsight } from 'src/components/features/dashboard';

function InsightsDashboard() {
  const { data: insights } = useApiData('/api/insights');

  return (
    <Grid container spacing={3}>
      {insights?.map((insight) => (
        <Grid item xs={12} md={6} key={insight.id}>
          <PredictiveInsight
            insight={insight}
            showConfidence={true}
            onActionClick={(action) => handleInsightAction(insight.id, action)}
            onDismiss={() => dismissInsight(insight.id)}
          />
        </Grid>
      ))}
    </Grid>
  );
}
```

---

## QuickActions

**File:** `src/components/features/dashboard/QuickActions.js`

Provides shortcut buttons for commonly performed tasks and quick navigation to key features.

### Props Interface

```typescript
interface QuickActionsProps {
  actions: QuickAction[];               // Action definitions (required)
  layout?: 'grid' | 'list' | 'carousel'; // Layout style (default: 'grid')
  columns?: number;                     // Grid columns (default: 3)
  size?: 'small' | 'medium' | 'large'; // Action button size
  showLabels?: boolean;                 // Show action labels (default: true)
  orientation?: 'horizontal' | 'vertical'; // Layout orientation
}

interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: ReactNode;
  handler: () => void;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  disabled?: boolean;
  badge?: string | number;              // Notification badge
  shortcut?: string;                    // Keyboard shortcut
}
```

### Usage Examples

```jsx
import { QuickActions } from 'src/components/features/dashboard';

function DashboardQuickActions() {
  const quickActions = [
    {
      id: 'add-pond',
      label: 'Add Pond',
      description: 'Create a new pond',
      icon: <AddIcon />,
      handler: () => navigate('/ponds/create'),
      color: 'primary',
      shortcut: 'Ctrl+N'
    },
    {
      id: 'record-feeding',
      label: 'Record Feeding',
      description: 'Log feeding activity',
      icon: <RestaurantIcon />,
      handler: () => navigate('/feeding/record'),
      color: 'success',
      badge: pendingFeedings
    },
    {
      id: 'water-test',
      label: 'Water Test',
      description: 'Record water quality',
      icon: <WaterDropIcon />,
      handler: () => navigate('/water-quality/test'),
      color: 'info'
    },
    {
      id: 'expense-entry',
      label: 'Add Expense',
      description: 'Record new expense',
      icon: <ReceiptIcon />,
      handler: () => navigate('/expenses/create'),
      color: 'warning'
    }
  ];

  return (
    <QuickActions
      actions={quickActions}
      layout="grid"
      columns={4}
      size="large"
      showLabels={true}
    />
  );
}
```

---

## Integration Patterns

### With Real-time Data

```jsx
import { useWebSocket } from 'src/hooks/useWebSocket';

function RealTimeDashboard() {
  const { data: liveMetrics } = useWebSocket('/ws/metrics');

  return (
    <Grid container spacing={3}>
      {liveMetrics?.map((metric) => (
        <Grid item xs={12} sm={6} md={3} key={metric.id}>
          <KPICard
            title={metric.title}
            value={metric.value}
            change={metric.change}
            // Real-time updates trigger re-render
            key={`${metric.id}-${metric.lastUpdated}`}
          />
        </Grid>
      ))}
    </Grid>
  );
}
```

### With Caching

```jsx
import { useCachedData } from 'src/hooks/useCaching';

function CachedDashboard() {
  const { data: metrics, isStale } = useCachedData('/api/dashboard/metrics', {
    strategy: 'stale-while-revalidate',
    category: 'dashboard',
    ttl: 300000 // 5 minutes
  });

  return (
    <Box>
      {isStale && (
        <AlertBanner
          severity="info"
          message="Dashboard data is being updated..."
          autoHide={true}
        />
      )}
      
      <Grid container spacing={3}>
        {metrics?.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.id}>
            <KPICard {...metric} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
```

### With Error Boundaries

```jsx
import { ErrorBoundary } from 'src/components/features/shared/error-handling';

function SafeDashboard() {
  return (
    <ErrorBoundary
      fallback={DashboardErrorFallback}
      onError={(error) => logError('dashboard-error', error)}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <QuickActions actions={quickActions} />
        </Grid>
        
        <Grid item xs={12}>
          <KPIMetrics />
        </Grid>
        
        <Grid item xs={12}>
          <AlertsAndInsights />
        </Grid>
      </Grid>
    </ErrorBoundary>
  );
}
```

---

## Testing

### Unit Tests

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { KPICard } from '../KPICard.standardized';

describe('KPICard', () => {
  it('displays title and value correctly', () => {
    render(
      <KPICard
        title="Test Metric"
        value={100}
        suffix=" units"
      />
    );

    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('100 units')).toBeInTheDocument();
  });

  it('handles click interactions', () => {
    const handleClick = jest.fn();
    
    render(
      <KPICard
        title="Clickable Metric"
        value={50}
        onClick={handleClick}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('displays trend indicators correctly', () => {
    render(
      <KPICard
        title="Trending Metric"
        value={75}
        change={12.5}
        showTrend={true}
      />
    );

    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
  });
});
```

### Integration Tests

```jsx
describe('Dashboard Integration', () => {
  it('renders complete dashboard with all components', async () => {
    render(<Dashboard />);

    // Wait for data to load
    await waitForElementToBeRemoved(() => screen.getByText('Loading...'));

    // Verify all components are present
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getAllByText(/KPI/i)).toHaveLength(4);
    expect(screen.getByText('Recent Alerts')).toBeInTheDocument();
  });
});
```

---

This comprehensive documentation ensures that dashboard components are properly documented with clear usage examples, prop interfaces, and integration patterns.