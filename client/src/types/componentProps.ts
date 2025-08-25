/**
 * Standardized Component Prop Interfaces
 *
 * This file defines consistent prop interfaces for all components in the application.
 * These interfaces ensure type safety, consistent naming, and better developer experience.
 *
 * Guidelines:
 * 1. Use consistent naming patterns (camelCase)
 * 2. Group related props into interfaces
 * 3. Use generic types for reusability
 * 4. Document all props with JSDoc comments
 * 5. Mark optional props with ?
 * 6. Use union types for controlled values
 * 7. Extend base interfaces when appropriate
 */

import { ReactNode, ComponentType, CSSProperties, MouseEvent } from 'react';

// ===================
// BASE INTERFACES
// ===================

/**
 * Base props that all components should support
 */
export interface BaseComponentProps {
  /** Unique identifier for the component */
  id?: string;
  /** CSS class name(s) to apply */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Test ID for testing purposes */
  testId?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Loading state indicator */
  loading?: boolean;
  /** Additional props to spread */
  [key: string]: any;
}

/**
 * Props for components that accept children
 */
export interface ChildrenProps {
  /** React children */
  children?: ReactNode;
}

/**
 * Props for theme-aware components
 */
export interface ThemeProps {
  /** Color variant */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Visual variant */
  variant?: 'outlined' | 'contained' | 'text';
}

// ===================
// MODAL/DIALOG INTERFACES
// ===================

/**
 * Standard modal/dialog component props
 */
export interface ModalProps extends BaseComponentProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback fired when the modal is closed */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Maximum width of the modal */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  /** Whether the modal should be full width */
  fullWidth?: boolean;
  /** Whether the modal should be full screen */
  fullScreen?: boolean;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Custom close button text */
  closeButtonText?: string;
}

/**
 * Form modal specific props
 */
export interface FormModalProps extends ModalProps {
  /** Submit button text */
  submitButtonText?: string;
  /** Cancel button text */
  cancelButtonText?: string;
  /** Whether the form is submitting */
  isSubmitting?: boolean;
  /** Whether the submit button should be disabled */
  submitDisabled?: boolean;
  /** Callback fired when form is submitted */
  onSubmit?: () => void;
  /** Callback fired when form is cancelled */
  onCancel?: () => void;
}

// ===================
// FORM INTERFACES
// ===================

/**
 * Standard form component props
 */
export interface FormProps extends BaseComponentProps {
  /** Initial form values */
  initialValues?: Record<string, any>;
  /** Form validation schema or function */
  validationSchema?: any;
  /** Callback fired when form is submitted */
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  /** Callback fired when form values change */
  onChange?: (values: Record<string, any>) => void;
  /** Whether to reset form after successful submission */
  resetOnSubmit?: boolean;
}

/**
 * Form field props
 */
export interface FormFieldProps extends BaseComponentProps {
  /** Field name */
  name: string;
  /** Field label */
  label?: string;
  /** Field placeholder */
  placeholder?: string;
  /** Help text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Field type */
  type?: string;
  /** Field value */
  value?: any;
  /** Change handler */
  onChange?: (value: any) => void;
  /** Blur handler */
  onBlur?: () => void;
}

/**
 * Select field specific props
 */
export interface SelectFieldProps extends FormFieldProps {
  /** Options for select field */
  options: Array<{
    value: any;
    label: string;
    disabled?: boolean;
  }>;
  /** Whether multiple selection is allowed */
  multiple?: boolean;
  /** Empty option text */
  emptyOptionText?: string;
}

// ===================
// DATA DISPLAY INTERFACES
// ===================

/**
 * KPI Card component props
 */
export interface KPICardProps extends BaseComponentProps, ThemeProps {
  /** Card title */
  title: string;
  /** Main value to display */
  value: number | string;
  /** Icon component */
  icon?: ReactNode;
  /** Change percentage or value */
  change?: number;
  /** Custom change text */
  changeText?: string;
  /** Progress value (0-100) */
  progressValue?: number;
  /** Whether value represents currency */
  isCurrency?: boolean;
  /** Value suffix */
  suffix?: string;
  /** Animation delay in seconds */
  animationDelay?: number;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Data table column definition
 */
export interface TableColumn {
  /** Column key */
  key: string;
  /** Column header label */
  label: string;
  /** Column width */
  width?: string | number;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Custom render function */
  render?: (value: any, row: any, index: number) => ReactNode;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
}

/**
 * Data table component props
 */
export interface DataTableProps extends BaseComponentProps {
  /** Table columns */
  columns: TableColumn[];
  /** Table data */
  data: Array<Record<string, any>>;
  /** Row key field */
  rowKey?: string;
  /** Whether table is loading */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Whether to show pagination */
  showPagination?: boolean;
  /** Items per page */
  pageSize?: number;
  /** Whether to show search */
  showSearch?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Row click handler */
  onRowClick?: (row: any, index: number) => void;
  /** Selection change handler */
  onSelectionChange?: (selectedRows: any[]) => void;
}

// ===================
// NAVIGATION INTERFACES
// ===================

/**
 * Navigation item
 */
export interface NavigationItem {
  /** Item label */
  label: string;
  /** Item path */
  path?: string;
  /** Item icon */
  icon?: ReactNode;
  /** Child items */
  children?: NavigationItem[];
  /** Whether item is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Navigation component props
 */
export interface NavigationProps extends BaseComponentProps {
  /** Navigation items */
  items: NavigationItem[];
  /** Current active path */
  activePath?: string;
  /** Navigation orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Navigation variant */
  variant?: 'tabs' | 'pills' | 'list';
}

// ===================
// ACTION INTERFACES
// ===================

/**
 * Action button definition
 */
export interface ActionButton {
  /** Button label */
  label: string;
  /** Button icon */
  icon?: ReactNode;
  /** Button color */
  color?: ThemeProps['color'];
  /** Button variant */
  variant?: ThemeProps['variant'];
  /** Whether button is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick: () => void;
  /** Loading state */
  loading?: boolean;
}

/**
 * Action bar component props
 */
export interface ActionBarProps extends BaseComponentProps {
  /** Primary actions */
  primaryActions?: ActionButton[];
  /** Secondary actions */
  secondaryActions?: ActionButton[];
  /** Action bar title */
  title?: string;
  /** Action bar alignment */
  alignment?: 'left' | 'center' | 'right' | 'space-between';
}

// ===================
// FEEDBACK INTERFACES
// ===================

/**
 * Alert/notification component props
 */
export interface AlertProps extends BaseComponentProps, ThemeProps {
  /** Alert message */
  message: string;
  /** Alert title */
  title?: string;
  /** Alert severity */
  severity?: 'success' | 'info' | 'warning' | 'error';
  /** Whether alert is dismissible */
  dismissible?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Action buttons */
  actions?: ActionButton[];
}

/**
 * Loading component props
 */
export interface LoadingProps extends BaseComponentProps {
  /** Loading message */
  message?: string;
  /** Loading type */
  type?: 'spinner' | 'skeleton' | 'progress';
  /** Progress value (0-100) for progress type */
  progress?: number;
  /** Loading size */
  size?: 'small' | 'medium' | 'large';
}

// ===================
// LAYOUT INTERFACES
// ===================

/**
 * Container component props
 */
export interface ContainerProps extends BaseComponentProps, ChildrenProps {
  /** Container max width */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  /** Whether to center the container */
  center?: boolean;
  /** Container padding */
  padding?: number | string;
  /** Container margin */
  margin?: number | string;
}

/**
 * Grid component props
 */
export interface GridProps extends BaseComponentProps, ChildrenProps {
  /** Grid container */
  container?: boolean;
  /** Grid item */
  item?: boolean;
  /** Grid spacing */
  spacing?: number;
  /** Extra small breakpoint */
  xs?: number | 'auto';
  /** Small breakpoint */
  sm?: number | 'auto';
  /** Medium breakpoint */
  md?: number | 'auto';
  /** Large breakpoint */
  lg?: number | 'auto';
  /** Extra large breakpoint */
  xl?: number | 'auto';
}

// ===================
// MEDIA INTERFACES
// ===================

/**
 * Image component props
 */
export interface ImageProps extends BaseComponentProps {
  /** Image source */
  src: string;
  /** Image alt text */
  alt: string;
  /** Image width */
  width?: number | string;
  /** Image height */
  height?: number | string;
  /** Object fit */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /** Lazy loading */
  lazy?: boolean;
  /** Error handler */
  onError?: () => void;
  /** Load handler */
  onLoad?: () => void;
}

// ===================
// UTILITY TYPES
// ===================

/**
 * Callback function type for common events
 */
export type EventCallback<T = any> = (event: T) => void;

/**
 * Async callback function type
 */
export type AsyncCallback<T = any> = (data: T) => Promise<void>;

/**
 * Component with forwarded ref
 */
export type ComponentWithRef<T = HTMLElement, P = {}> = ComponentType<P & { ref?: React.Ref<T> }>;

/**
 * Responsive value type
 */
export type ResponsiveValue<T> =
  | T
  | {
      xs?: T;
      sm?: T;
      md?: T;
      lg?: T;
      xl?: T;
    };

/**
 * Common event handlers
 */
export interface CommonEventHandlers {
  onClick?: EventCallback<MouseEvent>;
  onDoubleClick?: EventCallback<MouseEvent>;
  onMouseEnter?: EventCallback<MouseEvent>;
  onMouseLeave?: EventCallback<MouseEvent>;
  onFocus?: EventCallback;
  onBlur?: EventCallback;
}

// ===================
// EXPORTS
// ===================

// Re-export commonly used types for convenience
export type { ReactNode, ComponentType, CSSProperties, MouseEvent } from 'react';
