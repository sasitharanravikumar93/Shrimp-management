import { TextField, FormHelperText, Box } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * ValidatedDatePicker - A date input component with built-in validation
 * Note: Using TextField with type="date" for simplicity
 * In production, consider using @mui/x-date-pickers for better functionality
 */
const ValidatedDatePicker = ({
  name,
  value,
  onChange,
  onBlur,
  errors = [],
  touched = false,
  label,
  required = false,
  disabled = false,
  fullWidth = true,
  variant = 'outlined',
  size = 'medium',
  minDate,
  maxDate,
  helperText,
  ...props
}) => {
  const hasError = touched && errors.length > 0;
  const displayErrors = hasError ? errors : [];

  // Format date value for input
  const formatDateForInput = date => {
    if (!date) return '';

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';

    return dateObj.toISOString().split('T')[0];
  };

  // Handle date change
  const handleDateChange = event => {
    const dateValue = event.target.value;
    if (onChange) {
      // Create a proper event object for consistency
      const syntheticEvent = {
        target: {
          name,
          value: dateValue ? new Date(dateValue).toISOString() : ''
        }
      };
      onChange(syntheticEvent);
    }
  };

  return (
    <Box>
      <TextField
        name={name}
        value={formatDateForInput(value)}
        onChange={handleDateChange}
        onBlur={onBlur}
        label={label}
        type='date'
        required={required}
        disabled={disabled}
        fullWidth={fullWidth}
        variant={variant}
        size={size}
        error={hasError}
        helperText={helperText && !hasError ? helperText : undefined}
        inputProps={{
          min: minDate ? formatDateForInput(minDate) : undefined,
          max: maxDate ? formatDateForInput(maxDate) : undefined
        }}
        InputLabelProps={{
          shrink: true
        }}
        {...props}
      />
      {displayErrors.length > 0 && (
        <Box sx={{ mt: 0.5 }}>
          {displayErrors.map(error => (
            <FormHelperText key={`${name}-${error}`} error>
              {error}
            </FormHelperText>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ValidatedDatePicker;

// Add PropTypes validation
ValidatedDatePicker.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  errors: PropTypes.arrayOf(PropTypes.string),
  touched: PropTypes.bool,
  label: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
  size: PropTypes.oneOf(['small', 'medium']),
  minDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  maxDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  helperText: PropTypes.string
};

// Add default props
ValidatedDatePicker.defaultProps = {
  errors: [],
  touched: false,
  required: false,
  disabled: false,
  fullWidth: true,
  variant: 'outlined',
  size: 'medium'
};
