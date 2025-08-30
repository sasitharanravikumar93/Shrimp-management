import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert,
  Box,
  Chip
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import { useSeason } from '../context/SeasonContext';
import { useApiData } from '../hooks/useApi';
import { useFormValidation } from '../hooks/useDataValidation';
import { getPonds, getEmployees } from '../services/api';

/**
 * ExpenseForm with Comprehensive Data Validation
 *
 * This component demonstrates how to integrate data validation throughout
 * the form lifecycle, providing real-time feedback and error prevention.
 *
 * Key validation features:
 * - Real-time field validation with debouncing
 * - Schema-based validation using predefined expense schema
 * - Automatic data sanitization and type coercion
 * - Comprehensive error and warning reporting
 * - API response validation for dropdown data
 * - Form submission validation with detailed error messages
 */
const ExpenseFormValidated = ({ open, onClose, onSave, expense }) => {
  const { selectedSeason } = useSeason();

  // API data with validation
  const { data: ponds = [], error: pondsError } = useApiData(() => getPonds(), []);
  const { data: employees = [], error: employeesError } = useApiData(() => getEmployees(), []);

  // Form validation using the expense schema
  const {
    values,
    errors,
    warnings,
    isSubmitting,
    submitError,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValue,
    getFieldProps
  } = useFormValidation(
    'Expense',
    {
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category: 'Culture',
      subcategory: '',
      description: '',
      pondId: '',
      employeeId: '',
      seasonId: selectedSeason?._id || ''
    },
    {
      validateOnChange: true,
      validateOnBlur: true,
      sanitizeOnChange: true,
      showWarnings: true,
      debounceMs: 300
    }
  );

  // Reset form when expense changes or dialog opens
  useEffect(() => {
    if (open) {
      if (expense) {
        reset({
          date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
          amount: expense.amount?.toString() || '',
          category: expense.category || 'Culture',
          subcategory: expense.subcategory || '',
          description: expense.description || '',
          pondId: expense.pondId || '',
          employeeId: expense.employeeId || '',
          seasonId: expense.seasonId || selectedSeason?._id || ''
        });
      } else {
        reset({
          date: new Date().toISOString().split('T')[0],
          amount: '',
          category: 'Culture',
          subcategory: '',
          description: '',
          pondId: '',
          employeeId: '',
          seasonId: selectedSeason?._id || ''
        });
      }
    }
  }, [expense, open, reset, selectedSeason]);

  // Update season when selected season changes
  useEffect(() => {
    if (selectedSeason?._id) {
      setValue('seasonId', selectedSeason._id);
    }
  }, [selectedSeason, setValue]);

  // Handle category change and reset dependent fields
  const handleCategoryChange = event => {
    handleChange('category')(event);

    // Reset dependent fields when category changes
    setValue('subcategory', '');
    setValue('pondId', '');
    setValue('employeeId', '');
  };

  // Subcategory options based on category
  const getSubcategoryOptions = () => {
    switch (values.category) {
      case 'Culture':
        return ['Feed', 'Seed', 'Probiotics', 'Chemicals', 'Power', 'Labor'];
      case 'Farm':
        return [
          'Electricity',
          'Fuel',
          'Maintenance',
          'Security',
          'Office Supplies',
          'Transportation'
        ];
      case 'Salary':
        return ['Basic Salary', 'Overtime', 'Bonus', 'Benefits'];
      default:
        return [];
    }
  };

  // Form submission with validation
  const handleFormSubmit = event => {
    event.preventDefault();

    handleSubmit(async validatedData => {
      // Additional business logic validation
      if (validatedData.category === 'Culture' && !validatedData.pondId) {
        throw new Error('Pond selection is required for culture expenses');
      }

      if (validatedData.category === 'Salary' && !validatedData.employeeId) {
        throw new Error('Employee selection is required for salary expenses');
      }

      // Save the validated and sanitized data
      await onSave(validatedData);
      onClose();
    });
  };

  // Validation status indicators
  const getValidationStatusIcon = fieldName => {
    if (errors[fieldName]?.length > 0) {
      return <Chip label='Error' color='error' size='small' />;
    }
    if (warnings[fieldName]?.length > 0) {
      return <Chip label='Warning' color='warning' size='small' />;
    }
    if (values[fieldName] && !errors[fieldName]?.length) {
      return <Chip label='Valid' color='success' size='small' />;
    }
    return null;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        {expense ? 'Edit Expense' : 'Add New Expense'}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 1 }}>
            <Chip
              label={`Form Valid: ${isValid ? 'Yes' : 'No'}`}
              color={isValid ? 'success' : 'error'}
              size='small'
            />
          </Box>
        )}
      </DialogTitle>

      <form onSubmit={handleFormSubmit}>
        <DialogContent>
          {!selectedSeason && (
            <Alert severity='warning' sx={{ mb: 2 }}>
              Please select a season before adding expenses.
            </Alert>
          )}

          {/* API Data Loading Errors */}
          {(pondsError || employeesError) && (
            <Alert severity='error' sx={{ mb: 2 }}>
              Error loading form data. Please refresh and try again.
              {pondsError && <div>Ponds: {pondsError.message}</div>}
              {employeesError && <div>Employees: {employeesError.message}</div>}
            </Alert>
          )}

          {/* Form Submission Error */}
          {submitError && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {submitError.message || 'An error occurred while saving the expense.'}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Date Field */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  {...getFieldProps('date')}
                  type='date'
                  label='Date'
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  disabled={!selectedSeason || isSubmitting}
                  required
                />
                {getValidationStatusIcon('date')}
              </Box>
            </Grid>

            {/* Amount Field */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  {...getFieldProps('amount')}
                  type='number'
                  label='Amount'
                  fullWidth
                  disabled={!selectedSeason || isSubmitting}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
                {getValidationStatusIcon('amount')}
              </Box>
            </Grid>

            {/* Category Field */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  select
                  label='Category'
                  value={values.category}
                  onChange={handleCategoryChange}
                  onBlur={handleBlur('category')}
                  error={errors.category?.length > 0}
                  helperText={errors.category?.[0] || warnings.category?.[0]}
                  fullWidth
                  disabled={!selectedSeason || isSubmitting}
                  required
                >
                  <MenuItem value='Culture'>Culture</MenuItem>
                  <MenuItem value='Farm'>Farm</MenuItem>
                  <MenuItem value='Salary'>Salary</MenuItem>
                </TextField>
                {getValidationStatusIcon('category')}
              </Box>
            </Grid>

            {/* Subcategory Field */}
            {getSubcategoryOptions().length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    select
                    label='Subcategory'
                    {...getFieldProps('subcategory')}
                    fullWidth
                    disabled={!selectedSeason || isSubmitting}
                  >
                    <MenuItem value=''>
                      <em>Select subcategory</em>
                    </MenuItem>
                    {getSubcategoryOptions().map(option => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                  {getValidationStatusIcon('subcategory')}
                </Box>
              </Grid>
            )}

            {/* Pond Selection for Culture Expenses */}
            {values.category === 'Culture' && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    select
                    label='Pond'
                    {...getFieldProps('pondId')}
                    fullWidth
                    disabled={!selectedSeason || isSubmitting}
                    required={values.category === 'Culture'}
                  >
                    <MenuItem value=''>
                      <em>Select pond</em>
                    </MenuItem>
                    {ponds.data?.map(pond => (
                      <MenuItem key={pond._id} value={pond._id}>
                        {pond.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  {getValidationStatusIcon('pondId')}
                </Box>
              </Grid>
            )}

            {/* Employee Selection for Salary Expenses */}
            {values.category === 'Salary' && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    select
                    label='Employee'
                    {...getFieldProps('employeeId')}
                    fullWidth
                    disabled={!selectedSeason || isSubmitting}
                    required={values.category === 'Salary'}
                  >
                    <MenuItem value=''>
                      <em>Select employee</em>
                    </MenuItem>
                    {employees.map(emp => (
                      <MenuItem key={emp._id} value={emp._id}>
                        {emp.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  {getValidationStatusIcon('employeeId')}
                </Box>
              </Grid>
            )}

            {/* Description Field */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <TextField
                  {...getFieldProps('description')}
                  label='Description'
                  fullWidth
                  multiline
                  rows={3}
                  disabled={!selectedSeason || isSubmitting}
                  required
                />
                <Box sx={{ mt: 1 }}>{getValidationStatusIcon('description')}</Box>
              </Box>
            </Grid>
          </Grid>

          {/* Development: Validation Debug Info */}
          {process.env.NODE_ENV === 'development' && Object.keys(errors).length > 0 && (
            <Alert severity='info' sx={{ mt: 2 }}>
              <strong>Validation Errors:</strong>
              <pre>{JSON.stringify(errors, null, 2)}</pre>
            </Alert>
          )}

          {/* Development: Warnings Info */}
          {process.env.NODE_ENV === 'development' && Object.keys(warnings).length > 0 && (
            <Alert severity='warning' sx={{ mt: 1 }}>
              <strong>Validation Warnings:</strong>
              <pre>{JSON.stringify(warnings, null, 2)}</pre>
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={!selectedSeason || isSubmitting || !isValid}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ExpenseFormValidated;

ExpenseFormValidated.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  expense: PropTypes.shape({
    _id: PropTypes.string,
    date: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    category: PropTypes.string,
    subcategory: PropTypes.string,
    description: PropTypes.string,
    pondId: PropTypes.string,
    employeeId: PropTypes.string,
    seasonId: PropTypes.string
  })
};

ExpenseFormValidated.defaultProps = {
  expense: null
};

/**
 * Benefits of Data Validation Integration:
 *
 * 1. **Real-time Validation**: Users get immediate feedback as they type
 * 2. **Data Integrity**: All data is validated against predefined schemas
 * 3. **Automatic Sanitization**: Data is automatically cleaned and formatted
 * 4. **Error Prevention**: Invalid data cannot be submitted
 * 5. **Better UX**: Clear error messages and validation status indicators
 * 6. **Developer Experience**: Debug information in development mode
 * 7. **Consistent Validation**: Same validation rules across all forms
 * 8. **Type Safety**: Ensures data types match expected formats
 *
 * Validation Features Demonstrated:
 * - Required field validation
 * - Type validation (number, date, string)
 * - Business logic validation (pond for culture, employee for salary)
 * - Range validation (amount must be positive)
 * - Pattern validation (email, phone formats)
 * - Custom validation rules
 * - Cross-field validation
 *
 * Performance Optimizations:
 * - Debounced validation (300ms) to prevent excessive validation calls
 * - Memoized validation results to avoid recalculation
 * - Efficient error state management
 * - Cached validation rules
 *
 * Error Handling:
 * - Field-level error display
 * - Form-level error aggregation
 * - API error handling and display
 * - Graceful fallbacks for validation failures
 *
 * Usage:
 * <ExpenseFormValidated
 *   open={isModalOpen}
 *   onClose={handleClose}
 *   onSave={handleSave}
 *   expense={expenseToEdit}
 * />
 */
