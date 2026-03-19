# Component Documentation Guide

This document provides comprehensive documentation for all components in the application, organized by feature domains. The components follow standardized patterns for props, TypeScript interfaces, and accessibility.

## Documentation Standards

### Component Documentation Structure

Each component should be documented with:

1. **Purpose & Overview** - What the component does and when to use it
2. **Props Interface** - Complete prop documentation with types and defaults
3. **Usage Examples** - Basic and advanced usage patterns
4. **Accessibility** - ARIA attributes and keyboard navigation
5. **Styling** - Theme integration and customization options
6. **Performance** - Memoization and optimization patterns
7. **Testing** - Test examples and considerations

### Component Categories

#### Dashboard Components
High-level overview and analytics components for the main dashboard.

- [`KPICard`](#kpicard) - Key performance indicator display
- [`AlertBanner`](#alertbanner) - System alerts and notifications
- [`PredictiveInsight`](#predictiveinsight) - Data-driven insights
- [`QuickActions`](#quickactions) - Shortcut action buttons

#### Shared Components
Reusable components used across multiple features.

- [`DataTable`](#datatable) - Generic data table with sorting and filtering
- [`OptimizedDataTable`](#optimizeddatatable) - High-performance table for large datasets
- [`FilterPanel`](#filterpanel) - Advanced filtering interface
- [`MetricsGrid`](#metricsgrid) - Grid layout for metrics display

#### Feature-Specific Components
Domain-specific components organized by business functionality.

- **Ponds** - Pond management components
- **Inventory** - Stock and inventory tracking
- **Expenses** - Financial tracking and reporting
- **Feeding** - Feed management and scheduling
- **Farm** - Farm operations and settings
- **HR** - Employee and payroll management
- **Water Quality** - Water testing and monitoring
- **Reports** - Analytics and reporting tools

---

## Component Reference

### KPICard

**File:** `src/components/features/dashboard/KPICard.standardized.js`

A standardized component for displaying key performance indicators with consistent styling and behavior.

#### Purpose
Displays numerical metrics with optional trend indicators, progress bars, and interactive capabilities. Follows standardized prop interfaces for consistency across the application.

#### Props Interface

```typescript
interface KPICardProps extends BaseComponentProps, ThemeProps {
  // Content props
  title: string;                    // Main title/label
  value: number | string;           // Primary value to display
  icon?: ReactNode;                 // Optional icon
  subtitle?: string;                // Secondary text
  description?: string;             // Detailed description

  // Display options
  change?: number;                  // Percentage change value
  changeText?: string;              // Custom change description
  progressValue?: number;           // Progress bar value (0-100)
  progressColor?: string;           // Progress bar color
  isCurrency?: boolean;             // Format as currency
  suffix?: string;                  // Value suffix (e.g., '%', 'kg')

  // Interaction
  onClick?: () => void;             // Click handler
  onHover?: () => void;             // Hover handler

  // Animation
  animationDelay?: number;          // Animation delay in seconds
  animationDuration?: number;       // Animation duration in seconds

  // Advanced features
  showTrend?: boolean;              // Show trend arrow
  showProgress?: boolean;           // Show progress bar
  customIcon?: ReactNode;           // Custom icon override
}
```

#### Usage Examples

**Basic Usage:**
```jsx
import { KPICard } from 'src/components/features/dashboard';

function Dashboard() {
  return (
    <KPICard
      title="Total Sales"
      value={125000}
      isCurrency={true}
      change={12.5}
      icon={<SalesIcon />}
    />
  );
}
```

**Advanced Usage with Interactions:**
```jsx
<KPICard
  title="Pond Capacity"
  value={87}
  suffix="%"
  progressValue={87}
  progressColor="success"
  showTrend={true}
  change={5.2}
  onClick={() => navigateToPonds()}
  onHover={() => preloadPondData()}
  animationDelay={0.2}
  size="large"
  variant="outlined"
/>
```

#### Accessibility Features
- `aria-label` for screen readers
- Keyboard navigation support
- Role-based semantics (button/article)
- Color-blind friendly trend indicators

#### Performance Optimizations
- Memoized with `React.memo`
- Stable memoization for calculated values
- Optimized re-render prevention
- Efficient animation handling

---

### DataTable

**File:** `src/components/features/shared/DataTable.js`

A comprehensive data table component with sorting, filtering, pagination, and bulk actions.

#### Purpose
Provides a standardized interface for displaying tabular data with advanced features like search, filtering, column sorting, row selection, and customizable cell renderers.

#### Props Interface

```typescript
interface DataTableProps {
  // Data
  data: Array<Record<string, any>>;     // Table data
  columns: ColumnDefinition[];          // Column configuration
  keyField?: string;                    // Unique key field (default: 'id')

  // Features
  searchable?: boolean;                 // Enable search functionality
  sortable?: boolean;                   // Enable column sorting
  filterable?: boolean;                 // Enable filtering
  selectable?: boolean;                 // Enable row selection
  pagination?: boolean;                 // Enable pagination

  // Pagination options
  pageSize?: number;                    // Rows per page
  pageSizeOptions?: number[];           // Page size options

  // Callbacks
  onRowClick?: (row: any) => void;      // Row click handler
  onSelectionChange?: (selected: any[]) => void; // Selection change handler
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  onSearch?: (query: string) => void;

  // Customization
  actions?: ActionDefinition[];         // Row actions
  bulkActions?: BulkActionDefinition[]; // Bulk actions
  emptyMessage?: string;                // Empty state message
  loading?: boolean;                    // Loading state
  dense?: boolean;                      // Compact layout
}

interface ColumnDefinition {
  id: string;                           // Column identifier
  label: string;                        // Column header
  field: string;                        // Data field path
  type?: CellType;                      // Cell type for rendering
  sortable?: boolean;                   // Enable sorting
  filterable?: boolean;                 // Enable filtering
  width?: string | number;              // Column width
  align?: 'left' | 'center' | 'right'; // Text alignment
  config?: CellConfig;                  // Cell-specific configuration
}
```

#### Cell Types

The DataTable supports various cell types with automatic formatting:

- `text` - Plain text (default)
- `number` - Formatted numbers
- `currency` - Currency formatting
- `date` - Date formatting
- `status` - Status chips with colors
- `chip` - Customizable chips
- `avatar` - User avatars
- `boolean` - Yes/No chips
- `actions` - Action buttons
- `progress` - Progress indicators

#### Usage Examples

**Basic Table:**
```jsx
import { DataTable, CELL_TYPES } from 'src/components/features/shared';

const columns = [
  { id: 'name', label: 'Name', field: 'name' },
  { id: 'email', label: 'Email', field: 'email' },
  { 
    id: 'status', 
    label: 'Status', 
    field: 'status',
    type: CELL_TYPES.STATUS 
  },
  {
    id: 'createdAt',
    label: 'Created',
    field: 'createdAt',
    type: CELL_TYPES.DATE
  }
];

function UserTable({ users }) {
  return (
    <DataTable
      data={users}
      columns={columns}
      searchable={true}
      sortable={true}
      pagination={true}
    />
  );
}
```

**Advanced Table with Actions:**
```jsx
const columns = [
  { id: 'name', label: 'Pond Name', field: 'name' },
  { 
    id: 'capacity', 
    label: 'Capacity', 
    field: 'capacity',
    type: CELL_TYPES.NUMBER,
    config: { decimals: 0, suffix: ' fish' }
  },
  {
    id: 'revenue',
    label: 'Revenue',
    field: 'totalRevenue',
    type: CELL_TYPES.CURRENCY
  },
  {
    id: 'actions',
    label: 'Actions',
    type: CELL_TYPES.ACTIONS,
    config: {
      actions: [
        {
          icon: <EditIcon />,
          label: 'Edit',
          handler: (row) => editPond(row.id),
          color: 'primary'
        },
        {
          icon: <DeleteIcon />,
          label: 'Delete',
          handler: (row) => deletePond(row.id),
          color: 'error'
        }
      ]
    }
  }
];

function PondTable({ ponds }) {
  const handleBulkDelete = (selectedRows) => {
    // Handle bulk deletion
  };

  return (
    <DataTable
      data={ponds}
      columns={columns}
      selectable={true}
      searchable={true}
      sortable={true}
      filterable={true}
      pagination={true}
      bulkActions={[
        {
          label: 'Delete Selected',
          icon: <DeleteIcon />,
          handler: handleBulkDelete,
          color: 'error'
        }
      ]}
      onRowClick={(row) => viewPondDetails(row.id)}
    />
  );
}
```

---

### PondCard

**File:** `src/components/features/ponds/PondCard.js`

A card component for displaying pond information in a compact, interactive format.

#### Purpose
Displays pond details in a card layout with selection state and click interactions. Optimized for performance with memoization.

#### Props Interface

```typescript
interface PondCardProps {
  pond: PondData;                       // Pond data object
  onClick?: (pond: PondData) => void;   // Click handler
  selected?: boolean;                   // Selection state
}

interface PondData {
  _id: string;                          // Unique identifier
  name: string;                         // Pond name
  size: number;                         // Size in square meters
  capacity: number;                     // Fish capacity
  status?: string;                      // Current status
  seasonId?: string | SeasonData;       // Associated season
}
```

#### Usage Examples

**Basic Usage:**
```jsx
import { PondCard } from 'src/components/features/ponds';

function PondList({ ponds, selectedPond, onPondSelect }) {
  return (
    <Grid container spacing={2}>
      {ponds.map(pond => (
        <Grid item xs={12} sm={6} md={4} key={pond._id}>
          <PondCard
            pond={pond}
            selected={selectedPond?._id === pond._id}
            onClick={onPondSelect}
          />
        </Grid>
      ))}
    </Grid>
  );
}
```

#### Performance Features
- Memoized with `React.memo`
- Stable callbacks to prevent re-renders
- Optimized style calculations
- Efficient re-render detection

---

## Best Practices

### Component Design Principles

1. **Single Responsibility** - Each component should have one clear purpose
2. **Composition over Inheritance** - Use composition patterns for flexibility
3. **Props Interface Consistency** - Follow standardized prop naming
4. **Performance Optimization** - Use memoization and stable references
5. **Accessibility First** - Implement proper ARIA attributes and keyboard navigation

### Prop Naming Conventions

- **Event Handlers:** `on[Event]` (e.g., `onClick`, `onSubmit`)
- **Boolean Props:** `is[State]` or `has[Feature]` (e.g., `isLoading`, `hasError`)
- **Data Props:** Semantic names (e.g., `user`, `items`, `totalCount`)
- **Config Props:** Descriptive names (e.g., `pageSize`, `sortDirection`)

### Performance Guidelines

1. **Use React.memo** for components with stable props
2. **Implement useCallback** for event handlers passed to children
3. **Use useMemo** for expensive calculations
4. **Avoid inline objects/functions** in JSX props
5. **Implement stable keys** for list items

### Testing Recommendations

1. **Test user interactions** - clicks, form submissions, keyboard navigation
2. **Test accessibility** - screen reader compatibility, keyboard navigation
3. **Test edge cases** - empty states, error conditions, loading states
4. **Test performance** - avoid unnecessary re-renders
5. **Use semantic queries** - prefer accessible queries in tests

### Styling Guidelines

1. **Use Material-UI theme** - Leverage theme values for consistency
2. **Responsive design** - Use breakpoints and flexible layouts
3. **Semantic colors** - Use theme-defined colors (primary, secondary, error, etc.)
4. **Consistent spacing** - Use theme spacing units
5. **Dark mode support** - Test components in both light and dark themes

---

## Integration Examples

### Form Integration
```jsx
import { DataTable } from 'src/components/features/shared';
import { useFormValidation } from 'src/hooks/useDataValidation';

function InventoryForm() {
  const { formData, errors, validateField } = useFormValidation(inventorySchema);
  
  return (
    <form>
      <DataTable
        data={formData.items}
        columns={inventoryColumns}
        onRowClick={(item) => validateField('selectedItem', item)}
      />
    </form>
  );
}
```

### Caching Integration
```jsx
import { useCachedData } from 'src/hooks/useCaching';
import { KPICard } from 'src/components/features/dashboard';

function DashboardMetrics() {
  const { data: metrics, loading } = useCachedData('/api/metrics', {
    strategy: 'cache-first',
    category: 'dashboard'
  });

  return (
    <Grid container spacing={3}>
      {metrics?.map(metric => (
        <Grid item xs={12} sm={6} md={3} key={metric.id}>
          <KPICard
            title={metric.title}
            value={metric.value}
            loading={loading}
            change={metric.change}
          />
        </Grid>
      ))}
    </Grid>
  );
}
```

### Error Boundary Integration
```jsx
import { ErrorBoundary } from 'src/components/features/shared/error-handling';
import { DataTable } from 'src/components/features/shared';

function SafeDataView() {
  return (
    <ErrorBoundary fallback={<TableErrorFallback />}>
      <DataTable
        data={data}
        columns={columns}
        onError={(error) => logError('table-error', error)}
      />
    </ErrorBoundary>
  );
}
```

---

## Migration Guide

### From Legacy Components

When migrating from legacy components:

1. **Update import paths** to feature-based structure
2. **Adopt standardized props** using new prop interfaces
3. **Implement performance optimizations** with memoization
4. **Add accessibility attributes** for better UX
5. **Update tests** to use new component APIs

### Example Migration
```jsx
// Before (legacy)
import DataTable from 'src/components/DataTable';

<DataTable
  rows={data}
  headers={columns}
  sortBy="name"
  sortDir="asc"
/>

// After (standardized)
import { DataTable } from 'src/components/features/shared';

<DataTable
  data={data}
  columns={columns}
  sortable={true}
  defaultSort={{ field: 'name', direction: 'asc' }}
/>
```

---

## Troubleshooting

### Common Issues

**Performance Issues:**
- Ensure components are memoized with `React.memo`
- Use stable references for props (useCallback, useMemo)
- Avoid inline functions and objects in JSX

**Styling Problems:**
- Check theme integration and Material-UI version compatibility
- Verify responsive breakpoints are correctly applied
- Ensure proper theme mode (light/dark) support

**Accessibility Concerns:**
- Add proper ARIA labels and roles
- Implement keyboard navigation
- Test with screen readers
- Ensure sufficient color contrast

**TypeScript Errors:**
- Update prop interfaces to match component APIs
- Use provided TypeScript definitions
- Check for missing or incorrect prop types

---

This documentation serves as the foundation for understanding and using components effectively. Each component includes detailed examples, performance considerations, and integration patterns to ensure consistent usage across the application.