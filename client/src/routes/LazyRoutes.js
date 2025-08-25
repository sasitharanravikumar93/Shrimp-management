/**
 * Lazy Loaded Route Components
 * Route-level code splitting for better bundle optimization
 */

import { createLazyRoute } from '../utils/lazyLoading';

// Main dashboard routes
export const LazyDashboardPage = createLazyRoute(
    () => import('../pages/DashboardPage'),
    { preload: true } // Preload since this is a critical route
);

export const LazyExpenseManagementPage = createLazyRoute(() =>
    import('../pages/ExpenseManagementPage')
);

// Component-level lazy loading for large components
export const LazyFarmOverview = createLazyRoute(() => import('../components/FarmOverview'));

export const LazyPondDetail = createLazyRoute(() => import('../components/PondDetail'));

export const LazyExpenseDashboard = createLazyRoute(() => import('../components/ExpenseDashboard'));

export const LazyExpenseList = createLazyRoute(() => import('../components/ExpenseList'));

export const LazySalaryManagement = createLazyRoute(() => import('../components/SalaryManagement'));

export const LazyExpenseReports = createLazyRoute(() => import('../components/ExpenseReports'));

// Form components (loaded on demand)
export const LazyExpenseForm = createLazyRoute(() => import('../components/ExpenseForm'));

export const LazyInventoryForm = createLazyRoute(() => import('../components/InventoryForm'));

// Modal components (loaded when needed)
export const LazyAdjustmentHistoryModal = createLazyRoute(() =>
    import('../components/features/inventory/AdjustmentHistoryModal')
);

export const LazyInventoryAdjustmentModal = createLazyRoute(() =>
    import('../components/InventoryAdjustmentModal')
);

// Chart and visualization components (heavy dependencies)
export const LazyDataTrend = createLazyRoute(() => import('../components/DataTrend'));

export const LazyOptimizedCharts = createLazyRoute(() => import('../components/OptimizedCharts'));

// Calendar and date picker components
export const LazyCustomCalendar = createLazyRoute(() => import('../components/CustomCalendar'));

// Export route configuration for easier route setup
export const lazyRoutes = {
    dashboard: LazyDashboardPage,
    expenseManagement: LazyExpenseManagementPage,

    // Component routes
    farmOverview: LazyFarmOverview,
    pondDetail: LazyPondDetail,
    expenseDashboard: LazyExpenseDashboard,
    expenseList: LazyExpenseList,
    salaryManagement: LazySalaryManagement,
    expenseReports: LazyExpenseReports,

    // Forms
    expenseForm: LazyExpenseForm,
    inventoryForm: LazyInventoryForm,

    // Modals
    adjustmentHistoryModal: LazyAdjustmentHistoryModal,
    inventoryAdjustmentModal: LazyInventoryAdjustmentModal,

    // Charts
    dataTrend: LazyDataTrend,
    optimizedCharts: LazyOptimizedCharts,

    // Calendar
    customCalendar: LazyCustomCalendar
};

// Preloading strategies
export const preloadStrategies = {
    // Preload critical routes immediately
    critical: [LazyDashboardPage, LazyFarmOverview],

    // Preload on user interaction
    interactive: [LazyExpenseManagementPage, LazyExpenseDashboard],

    // Preload on idle
    idle: [LazyExpenseList, LazyExpenseForm, LazyDataTrend]
};

export default {
    ...lazyRoutes,
    preloadStrategies
};
