/**
 * Optimized Imports Utilities
 * Utilities for better tree shaking and selective imports
 */

// Material-UI optimized imports to reduce bundle size
export const createOptimizedMUIImports = () => {
  // Instead of importing entire @mui/material, import specific components
  // This helps with tree shaking

  return {
    // Core components
    Box: () => import('@mui/material/Box'),
    Container: () => import('@mui/material/Container'),
    Grid: () => import('@mui/material/Grid'),
    Stack: () => import('@mui/material/Stack'),

    // Typography
    Typography: () => import('@mui/material/Typography'),

    // Buttons
    Button: () => import('@mui/material/Button'),
    IconButton: () => import('@mui/material/IconButton'),
    Fab: () => import('@mui/material/Fab'),

    // Form components
    TextField: () => import('@mui/material/TextField'),
    Select: () => import('@mui/material/Select'),
    MenuItem: () => import('@mui/material/MenuItem'),
    FormControl: () => import('@mui/material/FormControl'),
    InputLabel: () => import('@mui/material/InputLabel'),
    Checkbox: () => import('@mui/material/Checkbox'),
    Radio: () => import('@mui/material/Radio'),
    RadioGroup: () => import('@mui/material/RadioGroup'),
    Switch: () => import('@mui/material/Switch'),

    // Layout components
    Card: () => import('@mui/material/Card'),
    CardContent: () => import('@mui/material/CardContent'),
    CardActions: () => import('@mui/material/CardActions'),
    Paper: () => import('@mui/material/Paper'),
    Divider: () => import('@mui/material/Divider'),

    // Data display
    Table: () => import('@mui/material/Table'),
    TableBody: () => import('@mui/material/TableBody'),
    TableCell: () => import('@mui/material/TableCell'),
    TableContainer: () => import('@mui/material/TableContainer'),
    TableHead: () => import('@mui/material/TableHead'),
    TableRow: () => import('@mui/material/TableRow'),
    Chip: () => import('@mui/material/Chip'),
    Avatar: () => import('@mui/material/Avatar'),

    // Feedback
    CircularProgress: () => import('@mui/material/CircularProgress'),
    LinearProgress: () => import('@mui/material/LinearProgress'),
    Alert: () => import('@mui/material/Alert'),
    Snackbar: () => import('@mui/material/Snackbar'),

    // Navigation
    Tabs: () => import('@mui/material/Tabs'),
    Tab: () => import('@mui/material/Tab'),
    Breadcrumbs: () => import('@mui/material/Breadcrumbs'),

    // Overlay
    Dialog: () => import('@mui/material/Dialog'),
    DialogTitle: () => import('@mui/material/DialogTitle'),
    DialogContent: () => import('@mui/material/DialogContent'),
    DialogActions: () => import('@mui/material/DialogActions'),
    Modal: () => import('@mui/material/Modal'),
    Popover: () => import('@mui/material/Popover'),
    Tooltip: () => import('@mui/material/Tooltip')
  };
};

// Icons optimized imports
export const createOptimizedIconImports = () => {
  return {
    // Common icons
    Add: () => import('@mui/icons-material/Add'),
    Edit: () => import('@mui/icons-material/Edit'),
    Delete: () => import('@mui/icons-material/Delete'),
    Save: () => import('@mui/icons-material/Save'),
    Cancel: () => import('@mui/icons-material/Cancel'),
    Close: () => import('@mui/icons-material/Close'),
    Search: () => import('@mui/icons-material/Search'),
    FilterList: () => import('@mui/icons-material/FilterList'),

    // Navigation icons
    ArrowBack: () => import('@mui/icons-material/ArrowBack'),
    ArrowForward: () => import('@mui/icons-material/ArrowForward'),
    Home: () => import('@mui/icons-material/Home'),
    Dashboard: () => import('@mui/icons-material/Dashboard'),
    Settings: () => import('@mui/icons-material/Settings'),

    // Trend icons
    TrendingUp: () => import('@mui/icons-material/TrendingUp'),
    TrendingDown: () => import('@mui/icons-material/TrendingDown'),
    TrendingFlat: () => import('@mui/icons-material/TrendingFlat'),

    // Aquaculture specific
    Agriculture: () => import('@mui/icons-material/Agriculture'),
    WaterDrop: () => import('@mui/icons-material/WaterDrop'),
    Restaurant: () => import('@mui/icons-material/Restaurant'),
    Waves: () => import('@mui/icons-material/Waves'),

    // Status icons
    CheckCircle: () => import('@mui/icons-material/CheckCircle'),
    Error: () => import('@mui/icons-material/Error'),
    Warning: () => import('@mui/icons-material/Warning'),
    Info: () => import('@mui/icons-material/Info')
  };
};

// Recharts optimized imports
export const createOptimizedRechartsImports = () => {
  return {
    // Core components
    ResponsiveContainer: () => import('recharts/lib/component/ResponsiveContainer'),

    // Chart types
    BarChart: () => import('recharts/lib/chart/BarChart'),
    LineChart: () => import('recharts/lib/chart/LineChart'),
    PieChart: () => import('recharts/lib/chart/PieChart'),
    AreaChart: () => import('recharts/lib/chart/AreaChart'),

    // Chart elements
    Bar: () => import('recharts/lib/cartesian/Bar'),
    Line: () => import('recharts/lib/cartesian/Line'),
    Area: () => import('recharts/lib/cartesian/Area'),
    Pie: () => import('recharts/lib/polar/Pie'),
    Cell: () => import('recharts/lib/component/Cell'),

    // Axes and grid
    XAxis: () => import('recharts/lib/cartesian/XAxis'),
    YAxis: () => import('recharts/lib/cartesian/YAxis'),
    CartesianGrid: () => import('recharts/lib/cartesian/CartesianGrid'),

    // Interactive elements
    Tooltip: () => import('recharts/lib/component/Tooltip'),
    Legend: () => import('recharts/lib/component/Legend'),
    Brush: () => import('recharts/lib/cartesian/Brush')
  };
};

// Date utilities optimized imports
export const createOptimizedDateImports = () => {
  return {
    // date-fns specific functions
    format: () => import('date-fns/format'),
    parseISO: () => import('date-fns/parseISO'),
    isValid: () => import('date-fns/isValid'),
    addDays: () => import('date-fns/addDays'),
    subDays: () => import('date-fns/subDays'),
    startOfWeek: () => import('date-fns/startOfWeek'),
    endOfWeek: () => import('date-fns/endOfWeek'),
    startOfMonth: () => import('date-fns/startOfMonth'),
    endOfMonth: () => import('date-fns/endOfMonth')
  };
};

// Framer Motion optimized imports
export const createOptimizedFramerImports = () => {
  return {
    motion: () => import('framer-motion').then(mod => ({ motion: mod.motion })),
    AnimatePresence: () =>
      import('framer-motion').then(mod => ({ AnimatePresence: mod.AnimatePresence })),
    LazyMotion: () => import('framer-motion').then(mod => ({ LazyMotion: mod.LazyMotion })),
    domAnimation: () => import('framer-motion').then(mod => ({ domAnimation: mod.domAnimation }))
  };
};

// Bundle analyzer utilities
export const bundleAnalyzer = {
  // Analyze bundle size
  analyzeBundleSize: () => {
    if (process.env.NODE_ENV === 'development') {
      // Dynamic import for bundle analyzer (only in development)
      return import('webpack-bundle-analyzer').catch(() => {
        // Silent in production, log only in development
        if (process.env.NODE_ENV === 'development') {
          const logger = require('./logger').default;
          logger.warn('webpack-bundle-analyzer not available');
        }
      });
    }
  },

  // Log chunk sizes
  logChunkSizes: () => {
    if (process.env.NODE_ENV === 'development' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      const logger = require('./logger').default;
      logger.debug('Initial bundle size:', navigation.transferSize);
    }
  },

  // Monitor lazy chunk loading
  monitorChunkLoading: () => {
    if (process.env.NODE_ENV === 'development') {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.name.includes('chunk')) {
            const logger = require('./logger').default;
            logger.debug(`Lazy chunk loaded: ${entry.name} (${entry.transferSize} bytes)`);
          }
        });
      });
      observer.observe({ entryTypes: ['resource'] });
    }
  }
};

// Tree shaking optimization
export const treeShakingOptimization = {
  // Create barrel exports that support tree shaking
  createOptimizedBarrel: exports => {
    return Object.keys(exports).reduce((acc, key) => {
      // Use dynamic imports for better tree shaking
      acc[key] = () => exports[key];
      return acc;
    }, {});
  },

  // Mark side effects for webpack
  markSideEffectFree: module => {
    // This helps webpack understand which modules are side-effect free
    if (typeof module === 'object' && module !== null) {
      module.__esModule = true;
      module[Symbol.toStringTag] = 'Module';
    }
    return module;
  },

  // Conditional imports based on feature flags
  conditionalImport: async (feature, importPath) => {
    // Only import if feature is enabled
    const featureFlags = window.FEATURE_FLAGS || {};
    if (featureFlags[feature]) {
      return await import(importPath);
    }
    return null;
  }
};

const optimizedImports = {
  createOptimizedMUIImports,
  createOptimizedIconImports,
  createOptimizedRechartsImports,
  createOptimizedDateImports,
  createOptimizedFramerImports,
  bundleAnalyzer,
  treeShakingOptimization
};

export default optimizedImports;
