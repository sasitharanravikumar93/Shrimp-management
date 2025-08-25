/**
 * Custom Hooks Index
 * Central export point for all custom hooks
 */

// UI State Management Hooks
export { useModal, useFormState, useConfirmation, useToggle, useLocalStorage } from './useUIState';

// Data Management Hooks
export { useDataTable, useCrudOperations, useSelection } from './useDataManagement';

// Async Operations Hooks
export {
  useAsyncOperation,
  useAsyncOperations,
  useErrorHandler,
  useCancellation
} from './useAsyncOperations';

// Caching and Performance Hooks
export {
  useCachedData,
  useCachedForm,
  useCacheInvalidation,
  useCacheMetrics,
  useCacheWarmup,
  useCachedComputation,
  useCacheDependencies,
  useCachedState
} from './useCaching';

// Existing API Hooks (enhanced versions)
export { useApiData, useApiMutation, usePaginatedApi } from './useApi';

// Performance Optimization Hooks
export {
  useDebounce,
  useThrottle,
  useStableMemo,
  useStableObject,
  useStableArray
} from '../utils/performanceOptimization';

// RTL and Internationalization Hooks
export { useRTL, useLanguage } from '../utils/rtlUtils';

// Offline Form Hooks
export { default as useOfflineForm } from './useOfflineForm';

/**
 * Hook Categories:
 *
 * 🎯 UI State Management:
 * - useModal: Modal open/close/reset logic
 * - useFormState: Form values, validation, submission
 * - useConfirmation: Confirmation dialogs
 * - useToggle: Boolean state toggles
 * - useLocalStorage: localStorage integration
 *
 * 📊 Data Management:
 * - useDataTable: Search, filter, pagination for tables
 * - useCrudOperations: Create, read, update, delete operations
 * - useSelection: Multi-select with checkboxes
 *
 * ⚡ Async Operations:
 * - useAsyncOperation: Single async operation with retry
 * - useAsyncOperations: Multiple async operations
 * - useErrorHandler: Error handling with retry logic
 * - useCancellation: Request cancellation support
 *
 * 🌐 API & Network:
 * - useApiData: Data fetching with caching
 * - useApiMutation: API mutations (POST/PUT/DELETE)
 * - usePaginatedApi: Paginated API requests
 * - useOfflineForm: Offline-capable form submissions
 *
 * 🚀 Performance:
 * - useDebounce: Debounce values
 * - useThrottle: Throttle function calls
 * - useStableMemo: Stable memoization
 * - useStableObject/Array: Prevent re-renders
 *
 * 💾 Caching & Storage:
 * - useCachedData: API data caching with strategies
 * - useCachedForm: Form draft caching with auto-save
 * - useCacheInvalidation: Cache invalidation patterns
 * - useCacheMetrics: Cache performance monitoring
 * - useCacheWarmup: Cache preloading and warming
 * - useCachedComputation: Expensive computation caching
 * - useCacheDependencies: Cache dependency management
 * - useCachedState: Cache-aware state management
 *
 * 🌍 Internationalization:
 * - useRTL: Right-to-left language support
 * - useLanguage: Language switching
 */
