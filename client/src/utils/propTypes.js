/**
 * Standardized PropTypes Definitions
 *
 * This file provides reusable PropTypes definitions that ensure consistent
 * prop validation across all JavaScript components in the application.
 *
 * Import these instead of defining custom PropTypes to maintain consistency.
 */

import PropTypes from 'prop-types';
import React from 'react';

// ===================
// BASE PROP TYPES
// ===================

/**
 * Base props that all components should support
 */
export const baseComponentPropTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  testId: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool
};

/**
 * Default props for base component
 */
export const baseComponentDefaultProps = {
  disabled: false,
  loading: false
};

/**
 * Children prop types
 */
export const childrenPropTypes = {
  children: PropTypes.node
};

/**
 * Theme-aware component prop types
 */
export const themePropTypes = {
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['outlined', 'contained', 'text'])
};

export const themeDefaultProps = {
  color: 'primary',
  size: 'medium',
  variant: 'contained'
};

// ===================
// MODAL/DIALOG PROP TYPES
// ===================

/**
 * Modal component prop types
 */
export const modalPropTypes = {
  ...baseComponentPropTypes,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
  fullWidth: PropTypes.bool,
  fullScreen: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  closeButtonText: PropTypes.string
};

export const modalDefaultProps = {
  ...baseComponentDefaultProps,
  maxWidth: 'sm',
  fullWidth: false,
  fullScreen: false,
  showCloseButton: true,
  closeButtonText: 'Close'
};

/**
 * Form modal prop types
 */
export const formModalPropTypes = {
  ...modalPropTypes,
  submitButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
  isSubmitting: PropTypes.bool,
  submitDisabled: PropTypes.bool,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func
};

export const formModalDefaultProps = {
  ...modalDefaultProps,
  submitButtonText: 'Save',
  cancelButtonText: 'Cancel',
  isSubmitting: false,
  submitDisabled: false
};

// ===================
// FORM PROP TYPES
// ===================

/**
 * Form component prop types
 */
export const formPropTypes = {
  ...baseComponentPropTypes,
  initialValues: PropTypes.object,
  validationSchema: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  resetOnSubmit: PropTypes.bool
};

export const formDefaultProps = {
  ...baseComponentDefaultProps,
  initialValues: {},
  resetOnSubmit: false
};

/**
 * Form field prop types
 */
export const formFieldPropTypes = {
  ...baseComponentPropTypes,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  type: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  onBlur: PropTypes.func
};

export const formFieldDefaultProps = {
  ...baseComponentDefaultProps,
  required: false,
  type: 'text'
};

/**
 * Select field prop types
 */
export const selectFieldPropTypes = {
  ...formFieldPropTypes,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool
    })
  ).isRequired,
  multiple: PropTypes.bool,
  emptyOptionText: PropTypes.string
};

export const selectFieldDefaultProps = {
  ...formFieldDefaultProps,
  multiple: false,
  emptyOptionText: 'Select an option'
};

// ===================
// DATA DISPLAY PROP TYPES
// ===================

/**
 * KPI Card prop types
 */
export const kpiCardPropTypes = {
  ...baseComponentPropTypes,
  ...themePropTypes,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.node,
  change: PropTypes.number,
  changeText: PropTypes.string,
  progressValue: PropTypes.number,
  isCurrency: PropTypes.bool,
  suffix: PropTypes.string,
  animationDelay: PropTypes.number,
  onClick: PropTypes.func
};

export const kpiCardDefaultProps = {
  ...baseComponentDefaultProps,
  ...themeDefaultProps,
  change: 0,
  isCurrency: false,
  suffix: '',
  animationDelay: 0
};

/**
 * Data table column prop types
 */
export const tableColumnPropType = PropTypes.shape({
  key: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sortable: PropTypes.bool,
  render: PropTypes.func,
  align: PropTypes.oneOf(['left', 'center', 'right'])
});

/**
 * Data table prop types
 */
export const dataTablePropTypes = {
  ...baseComponentPropTypes,
  columns: PropTypes.arrayOf(tableColumnPropType).isRequired,
  data: PropTypes.array.isRequired,
  rowKey: PropTypes.string,
  emptyMessage: PropTypes.string,
  showPagination: PropTypes.bool,
  pageSize: PropTypes.number,
  showSearch: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  onRowClick: PropTypes.func,
  onSelectionChange: PropTypes.func
};

export const dataTableDefaultProps = {
  ...baseComponentDefaultProps,
  rowKey: 'id',
  emptyMessage: 'No data available',
  showPagination: true,
  pageSize: 10,
  showSearch: true,
  searchPlaceholder: 'Search...'
};

// ===================
// NAVIGATION PROP TYPES
// ===================

/**
 * Navigation item prop types
 */
export const navigationItemPropType = PropTypes.shape({
  label: PropTypes.string.isRequired,
  path: PropTypes.string,
  icon: PropTypes.node,
  children: PropTypes.array,
  disabled: PropTypes.bool,
  onClick: PropTypes.func
});

/**
 * Navigation prop types
 */
export const navigationPropTypes = {
  ...baseComponentPropTypes,
  items: PropTypes.arrayOf(navigationItemPropType).isRequired,
  activePath: PropTypes.string,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  variant: PropTypes.oneOf(['tabs', 'pills', 'list'])
};

export const navigationDefaultProps = {
  ...baseComponentDefaultProps,
  orientation: 'horizontal',
  variant: 'tabs'
};

// ===================
// ACTION PROP TYPES
// ===================

/**
 * Action button prop types
 */
export const actionButtonPropType = PropTypes.shape({
  label: PropTypes.string.isRequired,
  icon: PropTypes.node,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info']),
  variant: PropTypes.oneOf(['outlined', 'contained', 'text']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  loading: PropTypes.bool
});

/**
 * Action bar prop types
 */
export const actionBarPropTypes = {
  ...baseComponentPropTypes,
  primaryActions: PropTypes.arrayOf(actionButtonPropType),
  secondaryActions: PropTypes.arrayOf(actionButtonPropType),
  title: PropTypes.string,
  alignment: PropTypes.oneOf(['left', 'center', 'right', 'space-between'])
};

export const actionBarDefaultProps = {
  ...baseComponentDefaultProps,
  primaryActions: [],
  secondaryActions: [],
  alignment: 'space-between'
};

// ===================
// FEEDBACK PROP TYPES
// ===================

/**
 * Alert prop types
 */
export const alertPropTypes = {
  ...baseComponentPropTypes,
  ...themePropTypes,
  message: PropTypes.string.isRequired,
  title: PropTypes.string,
  severity: PropTypes.oneOf(['success', 'info', 'warning', 'error']),
  dismissible: PropTypes.bool,
  onClose: PropTypes.func,
  actions: PropTypes.arrayOf(actionButtonPropType)
};

export const alertDefaultProps = {
  ...baseComponentDefaultProps,
  ...themeDefaultProps,
  severity: 'info',
  dismissible: false,
  actions: []
};

/**
 * Loading prop types
 */
export const loadingPropTypes = {
  ...baseComponentPropTypes,
  message: PropTypes.string,
  type: PropTypes.oneOf(['spinner', 'skeleton', 'progress']),
  progress: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

export const loadingDefaultProps = {
  ...baseComponentDefaultProps,
  type: 'spinner',
  size: 'medium'
};

// ===================
// LAYOUT PROP TYPES
// ===================

/**
 * Container prop types
 */
export const containerPropTypes = {
  ...baseComponentPropTypes,
  ...childrenPropTypes,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
  center: PropTypes.bool,
  padding: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  margin: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export const containerDefaultProps = {
  ...baseComponentDefaultProps,
  maxWidth: 'lg',
  center: true,
  padding: 2,
  margin: 0
};

/**
 * Grid prop types
 */
export const gridPropTypes = {
  ...baseComponentPropTypes,
  ...childrenPropTypes,
  container: PropTypes.bool,
  item: PropTypes.bool,
  spacing: PropTypes.number,
  xs: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]),
  sm: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]),
  md: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]),
  lg: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]),
  xl: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])])
};

export const gridDefaultProps = {
  ...baseComponentDefaultProps,
  container: false,
  item: false,
  spacing: 1
};

// ===================
// MEDIA PROP TYPES
// ===================

/**
 * Image prop types
 */
export const imagePropTypes = {
  ...baseComponentPropTypes,
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  objectFit: PropTypes.oneOf(['contain', 'cover', 'fill', 'none', 'scale-down']),
  lazy: PropTypes.bool,
  onError: PropTypes.func,
  onLoad: PropTypes.func
};

export const imageDefaultProps = {
  ...baseComponentDefaultProps,
  objectFit: 'cover',
  lazy: true
};

// ===================
// UTILITY FUNCTIONS
// ===================

/**
 * Creates a component with standardized prop types
 * @param {Object} propTypes - Component specific prop types
 * @param {Object} defaultProps - Component specific default props
 * @returns {Object} Combined prop types and default props
 */
export const createStandardPropTypes = (propTypes = {}, defaultProps = {}) => ({
  propTypes: {
    ...baseComponentPropTypes,
    ...propTypes
  },
  defaultProps: {
    ...baseComponentDefaultProps,
    ...defaultProps
  }
});

/**
 * Validates that a component has required standard props
 * @param {Object} props - Component props to validate
 * @returns {boolean} Whether props are valid
 */
export const validateStandardProps = props => {
  const warnings = [];

  // Check for common anti-patterns
  if (props.onClick && typeof props.onClick !== 'function') {
    warnings.push('onClick prop should be a function');
  }

  if (
    props.children &&
    !React.isValidElement(props.children) &&
    typeof props.children !== 'string'
  ) {
    warnings.push('children prop should be a valid React element or string');
  }

  if (props.className && typeof props.className !== 'string') {
    warnings.push('className prop should be a string');
  }

  if (warnings.length > 0) {
    console.warn('Component prop validation warnings:', warnings);
    return false;
  }

  return true;
};

/**
 * Higher-order component that adds standard prop validation
 * @param {ComponentType} Component - Component to wrap
 * @param {Object} additionalPropTypes - Additional prop types
 * @param {Object} additionalDefaultProps - Additional default props
 * @returns {ComponentType} Wrapped component with prop validation
 */
export const withStandardProps = (
  Component,
  additionalPropTypes = {},
  additionalDefaultProps = {}
) => {
  const WrappedComponent = props => {
    // Validate props in development
    if (process.env.NODE_ENV === 'development') {
      validateStandardProps(props);
    }

    return React.createElement(Component, props);
  };

  WrappedComponent.propTypes = {
    ...baseComponentPropTypes,
    ...additionalPropTypes
  };

  WrappedComponent.defaultProps = {
    ...baseComponentDefaultProps,
    ...additionalDefaultProps
  };

  WrappedComponent.displayName = `withStandardProps(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

// ===================
// COMPONENT FACTORIES
// ===================

/**
 * Creates a standardized form component with consistent prop interface
 */
export const createFormComponent = (additionalPropTypes = {}, additionalDefaultProps = {}) =>
  createStandardPropTypes(
    { ...formPropTypes, ...additionalPropTypes },
    { ...formDefaultProps, ...additionalDefaultProps }
  );

/**
 * Creates a standardized modal component with consistent prop interface
 */
export const createModalComponent = (additionalPropTypes = {}, additionalDefaultProps = {}) =>
  createStandardPropTypes(
    { ...modalPropTypes, ...additionalPropTypes },
    { ...modalDefaultProps, ...additionalDefaultProps }
  );

/**
 * Creates a standardized data display component with consistent prop interface
 */
export const createDataComponent = (additionalPropTypes = {}, additionalDefaultProps = {}) =>
  createStandardPropTypes(
    { ...baseComponentPropTypes, ...themePropTypes, ...additionalPropTypes },
    { ...baseComponentDefaultProps, ...themeDefaultProps, ...additionalDefaultProps }
  );

// Default export for convenience
export default {
  baseComponentPropTypes,
  baseComponentDefaultProps,
  createStandardPropTypes,
  withStandardProps,
  validateStandardProps
};
