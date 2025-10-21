/**
 * Shared Error Handling Components
 * Exports all error handling components for centralized imports
 */

export { default as ErrorBoundary } from './ErrorBoundary';
export { ErrorBoundary as ErrorBoundaryTS } from './ErrorBoundary.tsx';
export { default as SectionErrorBoundary } from './SectionErrorBoundary';
export { default as ErrorDisplay } from './ErrorDisplay';
export { default as EnhancedErrorBoundary } from './EnhancedErrorBoundary';

// Global error handling components
export { default as GlobalErrorModal } from './GlobalErrorModal';
export {
  GlobalErrorProvider,
  useGlobalError,
  withGlobalErrorHandling
} from './GlobalErrorProvider';
export { GlobalErrorBoundary } from './GlobalErrorBoundary';

// Export the existing error page for consistency
export { default as ErrorPage } from './ErrorPage';
