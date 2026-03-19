# Custom Hooks Documentation

This document provides comprehensive guidance on using the custom hooks to reduce code duplication and improve maintainability.

## 🎯 UI State Management Hooks

### `useModal`
Manages modal open/close state with automatic reset functionality.

```javascript
import { useModal } from '../hooks';

const MyComponent = () => {
  const modal = useModal(() => {
    // Optional reset callback when modal closes
    console.log('Modal closed, cleanup complete');
  });

  const handleEdit = (item) => {
    modal.open(item); // Open modal with data
  };

  return (
    <>
      <Button onClick={() => modal.open()}>Open Modal</Button>
      <MyModal 
        open={modal.isOpen} 
        data={modal.data}
        onClose={modal.close} 
      />
    </>
  );
};
```

### `useFormState`
Comprehensive form state management with validation and submission handling.

```javascript
import { useFormState } from '../hooks';

const ContactForm = () => {
  const validateForm = (values) => {
    const errors = {};
    if (!values.email) errors.email = 'Email is required';
    if (!values.name) errors.name = 'Name is required';
    return errors;
  };

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset
  } = useFormState(
    { name: '', email: '', message: '' }, // Initial values
    async (formData) => {
      // Submit function
      await api.post('/contact', formData);
      alert('Form submitted!');
      reset();
    },
    validateForm
  );

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        name="name"
        value={values.name}
        onChange={handleChange}
        error={!!errors.name}
        helperText={errors.name}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send'}
      </Button>
    </form>
  );
};
```

### `useToggle`
Simple boolean state management with multiple control functions.

```javascript
import { useToggle } from '../hooks';

const ExpandableCard = () => {
  const [isExpanded, toggle, expand, collapse] = useToggle(false);

  return (
    <Card>
      <CardHeader 
        title="Title"
        action={
          <IconButton onClick={toggle}>
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        }
      />
      <Collapse in={isExpanded}>
        <CardContent>Content here...</CardContent>
      </Collapse>
    </Card>
  );
};
```

## 📊 Data Management Hooks

### `useDataTable`
Comprehensive table management with search, filter, sort, and pagination.

```javascript
import { useDataTable } from '../hooks';

const UsersList = ({ users }) => {
  const table = useDataTable(users, {
    searchFields: ['name', 'email', 'department'],
    filterField: 'status',
    defaultFilter: 'all',
    itemsPerPage: 10
  });

  return (
    <>
      {/* Search */}
      <TextField
        placeholder="Search users..."
        value={table.searchTerm}
        onChange={(e) => table.handleSearch(e.target.value)}
      />

      {/* Filter */}
      <Select
        value={table.filter}
        onChange={(e) => table.handleFilter(e.target.value)}
      >
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="inactive">Inactive</MenuItem>
      </Select>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell 
              onClick={() => table.handleSort('name')}
              style={{ cursor: 'pointer' }}
            >
              Name {table.sortConfig.field === 'name' && 
                (table.sortConfig.direction === 'asc' ? '↑' : '↓')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {table.data.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Pagination
        count={table.totalPages}
        page={table.page}
        onChange={(_, page) => table.handlePageChange(page)}
      />
    </>
  );
};
```

### `useCrudOperations`
Standardized CRUD operations with optimistic updates and error handling.

```javascript
import { useCrudOperations } from '../hooks';
import * as api from '../services/api';

const ProductManager = () => {
  const crud = useCrudOperations(
    {
      fetch: api.getProducts,
      create: api.createProduct,
      update: api.updateProduct,
      delete: api.deleteProduct
    },
    {
      onSuccess: (result, operation) => {
        console.log(`${operation} successful:`, result);
      },
      onError: (error, operation) => {
        console.error(`${operation} failed:`, error);
      },
      optimisticUpdates: true // Enable optimistic UI updates
    }
  );

  useEffect(() => {
    crud.fetch(); // Load initial data
  }, []);

  const handleCreate = async (productData) => {
    try {
      await crud.create(productData);
      // UI already updated optimistically
    } catch (error) {
      // Error handled by hook, UI reverted
    }
  };

  return (
    <div>
      {crud.loading.fetch && <CircularProgress />}
      {crud.items.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={(id, data) => crud.update(id, data)}
          onDelete={(id) => crud.remove(id)}
          isDeleting={crud.loading[`delete_${product.id}`]}
        />
      ))}
      <Button onClick={() => handleCreate(newProductData)}>
        Add Product
      </Button>
    </div>
  );
};
```

### `useSelection`
Multi-select functionality for tables and lists.

```javascript
import { useSelection } from '../hooks';

const SelectableList = ({ items }) => {
  const selection = useSelection(items, 'id');

  return (
    <>
      <Checkbox
        checked={selection.isAllSelected}
        indeterminate={selection.isIndeterminate}
        onChange={selection.toggleAll}
      />
      Select All ({selection.selectedCount} selected)

      {items.map(item => (
        <ListItem key={item.id}>
          <Checkbox
            checked={selection.isSelected(item.id)}
            onChange={() => selection.toggleItem(item.id)}
          />
          <ListItemText primary={item.name} />
        </ListItem>
      ))}

      <Button 
        disabled={selection.selectedCount === 0}
        onClick={() => handleBulkDelete(selection.selectedIds)}
      >
        Delete Selected ({selection.selectedCount})
      </Button>
    </>
  );
};
```

## ⚡ Async Operations Hooks

### `useAsyncOperation`
Single async operation with retry, loading states, and error handling.

```javascript
import { useAsyncOperation } from '../hooks';

const DataLoader = () => {
  const {
    data,
    loading,
    error,
    execute,
    retry
  } = useAsyncOperation(
    async () => {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    {
      immediate: true, // Execute on mount
      retryCount: 3,
      retryDelay: 1000,
      onSuccess: (data) => console.log('Data loaded:', data),
      onError: (error) => console.error('Load failed:', error)
    }
  );

  if (loading) return <CircularProgress />;
  if (error) return (
    <Alert severity="error">
      {error.message}
      <Button onClick={retry}>Retry</Button>
    </Alert>
  );

  return <DataDisplay data={data} />;
};
```

### `useAsyncOperations`
Multiple async operations with individual state tracking.

```javascript
import { useAsyncOperations } from '../hooks';

const DashboardPage = () => {
  const operations = useAsyncOperations({
    loadUsers: () => api.getUsers(),
    loadProducts: () => api.getProducts(),
    loadOrders: () => api.getOrders()
  });

  useEffect(() => {
    // Load all data in parallel
    Promise.all([
      operations.executors.loadUsers(),
      operations.executors.loadProducts(),
      operations.executors.loadOrders()
    ]);
  }, []);

  const usersState = operations.getOperationState('loadUsers');
  const productsState = operations.getOperationState('loadProducts');

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <Card>
          <CardHeader title="Users" />
          <CardContent>
            {usersState.loading && <CircularProgress />}
            {usersState.error && <Alert severity="error">{usersState.error.message}</Alert>}
            {usersState.data && <UsersList users={usersState.data} />}
          </CardContent>
        </Card>
      </Grid>
      {/* Similar cards for products and orders */}
    </Grid>
  );
};
```

## 🚀 Performance Hooks

### `useDebounce`
Debounce values to prevent excessive API calls or re-renders.

```javascript
import { useDebounce } from '../hooks';

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Only trigger search when debounced value changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <TextField
      placeholder="Search..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
};
```

## 🔄 Migration Examples

### Before: Traditional Component
```javascript
const OldExpenseForm = ({ open, onClose, expense }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (expense) {
      setFormData(expense);
    } else {
      setFormData({ amount: '', description: '', category: '' });
    }
    setErrors({});
    setSubmitError(null);
  }, [expense, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.amount) newErrors.amount = 'Required';
    if (!formData.description) newErrors.description = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitError(null);
    
    try {
      if (expense) {
        await api.updateExpense(expense.id, formData);
      } else {
        await api.createExpense(formData);
      }
      onClose();
    } catch (error) {
      setSubmitError(error);
    } finally {
      setLoading(false);
    }
  };

  // ... 50 more lines of JSX
};
```

### After: Using Custom Hooks
```javascript
const NewExpenseForm = ({ open, onClose, expense }) => {
  const validateForm = (values) => {
    const errors = {};
    if (!values.amount) errors.amount = 'Required';
    if (!values.description) errors.description = 'Required';
    return errors;
  };

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset
  } = useFormState(
    { amount: '', description: '', category: '' },
    async (formData) => {
      if (expense) {
        await api.updateExpense(expense.id, formData);
      } else {
        await api.createExpense(formData);
      }
      onClose();
    },
    validateForm
  );

  useEffect(() => {
    if (open) {
      reset(expense || { amount: '', description: '', category: '' });
    }
  }, [expense, open, reset]);

  // ... Same JSX with handleChange, handleSubmit, values, errors, isSubmitting
};
```

## 📝 Best Practices

1. **Choose the Right Hook**: Use specific hooks for specific patterns
2. **Combine Hooks**: Multiple hooks can work together (e.g., `useModal` + `useFormState`)
3. **Error Boundaries**: Wrap components using async hooks in error boundaries
4. **Testing**: Test hooks independently using `@testing-library/react-hooks`
5. **Performance**: Use `useCallback` and `useMemo` within custom hooks when needed
6. **TypeScript**: Add proper TypeScript types for better developer experience

## 🧪 Testing Examples

```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import { useFormState } from '../hooks';

describe('useFormState', () => {
  it('should handle form submission', async () => {
    const mockSubmit = jest.fn();
    const { result } = renderHook(() => 
      useFormState({ name: '' }, mockSubmit)
    );

    // Change form value
    act(() => {
      result.current.setValue('name', 'John');
    });

    expect(result.current.values.name).toBe('John');

    // Submit form
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockSubmit).toHaveBeenCalledWith({ name: 'John' });
  });
});
```

This documentation provides comprehensive examples of how to use the custom hooks to reduce code duplication and improve maintainability across the application.

## 🔄 Migration Guide

This section provides step-by-step guidance on how to migrate existing components to use custom hooks.

### Migrating Form Components

#### Step 1: Identify Form Patterns
Look for components with these patterns:
- Multiple `useState` calls for form fields
- Manual form validation logic
- Custom change handlers
- Form submission logic

#### Step 2: Replace with useFormState

**Before Migration:**
```javascript
const MyForm = ({ onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of component
};
```

**After Migration:**
```javascript
import { useFormState } from '../hooks';

const MyForm = ({ onSave, initialData }) => {
  const validateForm = (values) => {
    const errors = {};
    if (!values.name) errors.name = 'Name is required';
    if (!values.email) errors.email = 'Email is required';
    return errors;
  };

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset
  } = useFormState(
    { name: '', email: '', phone: '' },
    onSave,
    validateForm
  );

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // ... rest of component
};
```

**Benefits:**
- 60% reduction in form management code
- Automatic error clearing
- Built-in loading states
- Consistent validation patterns

### Migrating Modal Components

#### Step 1: Identify Modal Patterns
Look for components with:
- `useState` for modal open/close state
- Props drilling for modal data
- Manual reset logic when modal closes

#### Step 2: Replace with useModal

**Before Migration:**
```javascript
const ParentComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const openModal = (data) => {
    setModalData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
    // Manual cleanup
  };

  return (
    <>
      <Button onClick={() => openModal(item)}>Edit</Button>
      <MyModal 
        open={isModalOpen} 
        data={modalData}
        onClose={closeModal} 
      />
    </>
  );
};
```

**After Migration:**
```javascript
import { useModal } from '../hooks';

const ParentComponent = () => {
  const modal = useModal(() => {
    // Optional cleanup callback
    console.log('Modal closed, cleanup complete');
  });

  return (
    <>
      <Button onClick={() => modal.open(item)}>Edit</Button>
      <MyModal 
        open={modal.isOpen} 
        data={modal.data}
        onClose={modal.close} 
      />
    </>
  );
};
```

### Migrating Data Table Components

#### Step 1: Identify Table Patterns
Look for components with:
- Search/filter state management
- Pagination logic
- Sorting functionality
- Selection handling

#### Step 2: Replace with useDataTable + useSelection

**Before Migration:**
```javascript
const DataTable = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Complex filtering, sorting, pagination logic...
  
  return (
    // Table JSX with manual event handlers
  );
};
```

**After Migration:**
```javascript
import { useDataTable, useSelection } from '../hooks';

const DataTable = ({ data }) => {
  const table = useDataTable(data, {
    searchFields: ['name', 'email', 'phone'],
    itemsPerPage: 10
  });
  
  const selection = useSelection(table.data, 'id');
  
  return (
    // Clean JSX with provided handlers
  );
};
```

### Migration Checklist

- [ ] **Forms**: Replace useState + validation with useFormState
- [ ] **Modals**: Replace manual modal state with useModal
- [ ] **Tables**: Replace pagination/search logic with useDataTable
- [ ] **API Calls**: Replace manual loading states with useAsyncOperation
- [ ] **Toggle States**: Replace boolean useState with useToggle
- [ ] **Local Storage**: Replace manual localStorage with useLocalStorage

### Testing Migrated Components

```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import { useFormState } from '../hooks';

describe('Migrated Form Component', () => {
  it('should handle form validation correctly', async () => {
    const mockSubmit = jest.fn();
    const { result } = renderHook(() => 
      useFormState({ name: '' }, mockSubmit, (values) => 
        !values.name ? { name: 'Required' } : {}
      )
    );

    // Test validation
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors.name).toBe('Required');
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
```

### Performance Considerations

1. **Re-render Optimization**: Custom hooks use useCallback and useMemo internally
2. **Memory Management**: Automatic cleanup in useEffect return functions
3. **Debouncing**: Built-in debouncing for search and validation
4. **Memoization**: Expensive calculations are memoized automatically

### Common Migration Pitfalls

1. **Don't migrate everything at once**: Start with the most complex components
2. **Test thoroughly**: Ensure behavior remains the same after migration
3. **Update dependencies**: Make sure all related components work with new patterns
4. **Consider TypeScript**: Add type definitions for better developer experience

### Migration Priority Order

1. **High Priority**: Complex forms with validation
2. **Medium Priority**: Modal components and data tables
3. **Low Priority**: Simple toggle states and utility components

---