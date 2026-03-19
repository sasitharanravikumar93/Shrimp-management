/**
 * Components Master Index
 * Central export point for all components organized by features
 *
 * This index provides a clean API for importing components throughout the application.
 * Components are organized by business domain for better maintainability.
 *
 * ⚠️  STANDARDIZED PROP INTERFACES
 * All components follow standardized prop naming and structure patterns:
 * - Documentation: /src/docs/PropInterfaceStandards.md
 * - TypeScript Types: /src/types/componentProps.ts
 * - PropTypes: /src/utils/propTypes.js
 * - Analysis Tool: /src/scripts/analyzePropInterfaces.js
 *
 * Guidelines:
 * - Use camelCase for all prop names
 * - Event handlers: onClick, onSubmit, onChange
 * - Boolean states: isLoading, isDisabled, showProgress
 * - Text content: buttonText, labelText, helperText
 * - Extend base interfaces for consistency
 */

// Feature-based exports
export * from './features/ponds';
export * from './features/inventory';
export * from './features/expenses';
export * from './features/feeding';
export * from './features/dashboard';
export * from './features/farm';
export * from './features/hr';
export * from './features/water-quality';
export * from './features/reports';

// Shared components - these are available to all features
export * from './features/shared';

/**
 * Feature Directory Structure:
 *
 * features/
 * ├── ponds/           - Pond management components
 * ├── inventory/       - Inventory management components
 * ├── expenses/        - Expense tracking components
 * ├── feeding/         - Feed management and growth components
 * ├── dashboard/       - Dashboard and KPI components
 * ├── farm/           - Farm overview and mobile components
 * ├── hr/             - Employee and salary components
 * ├── water-quality/  - Water quality monitoring components
 * ├── reports/        - Reporting components
 * └── shared/         - Shared components used across features
 *     ├── ui/         - UI primitives and styled components
 *     ├── forms/      - Form controls and validation
 *     ├── charts/     - Chart and data visualization
 *     ├── layout/     - Layout and navigation components
 *     ├── loading/    - Loading states and skeletons
 *     └── error-handling/ - Error boundaries and displays
 */
