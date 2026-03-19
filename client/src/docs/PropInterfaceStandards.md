# Component Prop Interface Standards

This document outlines the standardized prop interfaces for all components in
the application. Following these standards ensures consistency, type safety, and
better developer experience.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Naming Conventions](#naming-conventions)
3. [Standard Prop Categories](#standard-prop-categories)
4. [Implementation Guidelines](#implementation-guidelines)
5. [TypeScript Integration](#typescript-integration)
6. [PropTypes for JavaScript](#proptypes-for-javascript)
7. [Migration Guide](#migration-guide)
8. [Best Practices](#best-practices)

## 🎯 Overview

All components should follow consistent prop naming and structure patterns. This
standardization:

- Improves code readability and maintainability
- Reduces learning curve for new developers
- Enables better tooling and IDE support
- Facilitates component reusability
- Ensures type safety across the application

## 📝 Naming Conventions

### Prop Naming Rules

1. **Use camelCase** for all prop names
2. **Be descriptive** but concise
3. **Use consistent prefixes** for related props
4. **Follow semantic meaning** over technical implementation

### Standard Prop Patterns

| Pattern          | Example                         | Usage                 |
| ---------------- | ------------------------------- | --------------------- |
| `on[Event]`      | `onClick`, `onSubmit`           | Event handlers        |
| `is[State]`      | `isLoading`, `isDisabled`       | Boolean states        |
| `show[Element]`  | `showCloseButton`, `showSearch` | UI element visibility |
| `[element]Text`  | `submitText`, `cancelText`      | Text content          |
| `[element]Color` | `iconColor`, `buttonColor`      | Styling properties    |

### ❌ Avoid These Patterns

```javascript
// Don't use
const BadComponent = ({
  handleClick, // Use onClick instead
  disabled_state, // Use isDisabled instead
  btn_text, // Use buttonText instead
  color_primary, // Use color="primary" instead
  submit_handler // Use onSubmit instead
}) => {
  // Component implementation
};
```

### ✅ Use These Patterns Instead

```javascript
// Do use
const GoodComponent = ({
  onClick,
  isDisabled,
  buttonText,
  color,
  onSubmit
}) => {
  // Component implementation
};
```

## 🗂️ Standard Prop Categories

### 1. Base Props

Every component should support these basic props:

```typescript
interface BaseProps {
  id?: string; // Unique identifier
  className?: string; // CSS class names
  style?: CSSProperties; // Inline styles
  testId?: string; // Test automation ID
  disabled?: boolean; // Disabled state
  loading?: boolean; // Loading state
}
```

### 2. Content Props

For components that display content:

```typescript
interface ContentProps {
  title?: string; // Primary title
  subtitle?: string; // Secondary title
  description?: string; // Detailed description
  children?: ReactNode; // Child elements
}
```

### 3. Interaction Props

For interactive components:

```typescript
interface InteractionProps {
  onClick?: () => void; // Click handler
  onSubmit?: () => void; // Submit handler
  onChange?: (value: any) => void; // Change handler
  onBlur?: () => void; // Blur handler
  onFocus?: () => void; // Focus handler
}
```

### 4. Styling Props

For consistent theming:

```typescript
interface StylingProps {
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'contained' | 'text';
}
```

### 5. Modal Props

For modal/dialog components:

```typescript
interface ModalProps extends BaseProps {
  open: boolean; // Required: modal state
  onClose: () => void; // Required: close handler
  title?: string; // Modal title
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean; // Full width flag
  showCloseButton?: boolean; // Close button visibility
}
```

### 6. Form Props

For form components:

```typescript
interface FormProps extends BaseProps {
  name: string; // Required: field name
  label?: string; // Field label
  placeholder?: string; // Placeholder text
  helperText?: string; // Help text
  error?: string; // Error message
  required?: boolean; // Required field flag
  value?: any; // Field value
  onChange?: (value: any) => void; // Change handler
}
```

## 🛠️ Implementation Guidelines

### TypeScript Components

```typescript
import React from 'react';
import { BaseComponentProps, FormModalProps } from '../types/componentProps';

interface ExpenseFormProps extends FormModalProps {
  expense?: ExpenseData;
  onSave: (expense: ExpenseData) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  open,
  onClose,
  title = 'Add Expense',
  expense,
  onSave,
  isSubmitting = false,
  ...rest
}) => {
  // Component implementation
  return (
    <Dialog open={open} onClose={onClose} {...rest}>
      {/* Component content */}
    </Dialog>
  );
};

export default ExpenseForm;
```

### JavaScript Components with PropTypes

```javascript
import React from 'react';
import PropTypes from 'prop-types';
import { formModalPropTypes, formModalDefaultProps } from '../utils/propTypes';

const ExpenseForm = ({
  open,
  onClose,
  title,
  expense,
  onSave,
  isSubmitting,
  ...rest
}) => {
  // Component implementation
  return (
    <Dialog open={open} onClose={onClose} {...rest}>
      {/* Component content */}
    </Dialog>
  );
};

ExpenseForm.propTypes = {
  ...formModalPropTypes,
  expense: PropTypes.object,
  onSave: PropTypes.func.isRequired
};

ExpenseForm.defaultProps = {
  ...formModalDefaultProps,
  title: 'Add Expense',
  expense: null
};

export default ExpenseForm;
```

## 🔄 Migration Guide

### Step 1: Audit Existing Components

Identify components that don't follow the standards:

```bash
# Find components with non-standard prop names
grep -r "handle[A-Z]" src/components/
grep -r "_[a-z]" src/components/
grep -r "[a-z]_[a-z]" src/components/
```

### Step 2: Update Prop Names

**Before:**

```javascript
const MyComponent = ({ handleClick, btn_text, is_loading, submit_handler }) => {
  // Component implementation
};
```

**After:**

```javascript
const MyComponent = ({ onClick, buttonText, isLoading, onSubmit }) => {
  // Component implementation
};
```

### Step 3: Add Standard Prop Types

**Before:**

```javascript
MyComponent.propTypes = {
  handleClick: PropTypes.func,
  btn_text: PropTypes.string,
  is_loading: PropTypes.bool
};
```

**After:**

```javascript
import {
  baseComponentPropTypes,
  baseComponentDefaultProps
} from '../utils/propTypes';

MyComponent.propTypes = {
  ...baseComponentPropTypes,
  onClick: PropTypes.func,
  buttonText: PropTypes.string,
  isLoading: PropTypes.bool
};

MyComponent.defaultProps = {
  ...baseComponentDefaultProps,
  buttonText: 'Submit',
  isLoading: false
};
```

### Step 4: Update Component Usage

Update all places where the component is used:

```javascript
// Before
<MyComponent
  handleClick={handleSave}
  btn_text="Save"
  is_loading={saving}
/>

// After
<MyComponent
  onClick={handleSave}
  buttonText="Save"
  isLoading={saving}
/>
```

## 🎨 Best Practices

### 1. Consistent Event Handlers

```javascript
// ✅ Good - consistent naming
const FormComponent = ({
  onSubmit, // Form submission
  onChange, // Field changes
  onValidate, // Validation
  onCancel // Cancel action
}) => {};

// ❌ Bad - inconsistent naming
const FormComponent = ({
  handleSubmit, // Should be onSubmit
  fieldChange, // Should be onChange
  validate, // Should be onValidate
  cancelHandler // Should be onCancel
}) => {};
```

### 2. Boolean Props

```javascript
// ✅ Good - clear boolean naming
const Modal = ({
  open, // State
  isSubmitting, // Loading state
  showCloseButton // UI element visibility
}) => {};

// ❌ Bad - unclear boolean naming
const Modal = ({
  visible, // Use 'open' instead
  submitting, // Use 'isSubmitting' instead
  closeButton // Use 'showCloseButton' instead
}) => {};
```

### 3. Consistent Text Props

```javascript
// ✅ Good - descriptive text props
const Button = ({
  text, // Button text
  loadingText, // Text during loading
  ariaLabel // Accessibility label
}) => {};

// ❌ Bad - unclear text props
const Button = ({
  label, // Use 'text' instead
  loading_text, // Use 'loadingText' instead
  aria // Use 'ariaLabel' instead
}) => {};
```

### 4. Extend Base Interfaces

```typescript
// ✅ Good - extend base interfaces
interface CustomButtonProps extends BaseComponentProps, StylingProps {
  text: string;
  onClick: () => void;
}

// ❌ Bad - redefine common props
interface CustomButtonProps {
  id?: string;
  className?: string;
  disabled?: boolean;
  text: string;
  onClick: () => void;
  color?: string;
  size?: string;
}
```

### 5. Use Generic Types

```typescript
// ✅ Good - generic for reusability
interface SelectProps<T> extends FormFieldProps {
  options: Array<{
    value: T;
    label: string;
  }>;
  value?: T;
  onChange?: (value: T) => void;
}

// ❌ Bad - hardcoded types
interface SelectProps {
  options: Array<{
    value: string; // Too restrictive
    label: string;
  }>;
}
```

## 📚 Common Patterns Reference

### Modal/Dialog Components

```typescript
interface MyModalProps extends ModalProps {
  data?: DataType;
  onSave?: (data: DataType) => void;
}
```

### Form Components

```typescript
interface MyFormProps extends FormProps {
  initialValues?: FormData;
  validationSchema?: ValidationSchema;
}
```

### Data Display Components

```typescript
interface MyTableProps extends BaseComponentProps {
  data: Array<DataType>;
  columns: TableColumn[];
  onRowClick?: (row: DataType) => void;
}
```

### Action Components

```typescript
interface MyButtonProps extends BaseComponentProps, StylingProps {
  text: string;
  onClick: () => void;
  icon?: ReactNode;
}
```

## 🔍 Validation Tools

### ESLint Rules

Add custom ESLint rules to enforce prop naming:

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'prop-naming/consistent-prop-names': [
      'error',
      {
        'handle*': 'Use on* instead of handle*',
        '*_*': 'Use camelCase instead of snake_case'
      }
    ]
  }
};
```

### TypeScript Validation

Use TypeScript strict mode to catch prop inconsistencies:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

## 📈 Benefits

Following these standards provides:

1. **Consistency**: All components follow the same patterns
2. **Type Safety**: Better TypeScript integration and error catching
3. **Developer Experience**: Improved IDE autocompletion and documentation
4. **Maintainability**: Easier to understand and modify components
5. **Reusability**: Components can be easily reused across features
6. **Testing**: Standardized props make testing more predictable

## 🎯 Enforcement

1. **Code Reviews**: Check for prop naming consistency
2. **TypeScript**: Use strict typing to catch inconsistencies
3. **ESLint**: Add custom rules for prop naming
4. **Documentation**: Keep this guide updated and accessible
5. **Team Training**: Ensure all developers understand the standards

---

_This document should be referenced when creating new components or refactoring
existing ones. Keep it updated as standards evolve._
