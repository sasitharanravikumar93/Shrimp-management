import { FormControl, InputLabel, Select, MenuItem, FormHelperText, Box } from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';

/**
 * ValidatedSelect - A Select component with built-in validation
 */
const ValidatedSelect = ({
  name,
  value,
  onChange,
  onBlur,
  errors = [],
  touched = false,
  label,
  options = [],
  required = false,
  disabled = false,
  fullWidth = true,
  variant = 'outlined',
  size = 'medium',
  placeholder = 'Select an option',
  ...props
}) => {
  const hasError = touched && errors.length > 0;
  const displayErrors = hasError ? errors : [];

  return (
    <Box>
      <FormControl
        fullWidth={fullWidth}
        variant={variant}
        size={size}
        error={hasError}
        disabled={disabled}
        required={required}
      >
        <InputLabel>{label}</InputLabel>
        <Select
          name={name}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          label={label}
          {...props}
        >
          {!required && (
            <MenuItem value=''>
              <em>{placeholder}</em>
            </MenuItem>
          )}
          {options.map(option => (
            <MenuItem key={option.value || option} value={option.value || option}>
              {option.label || option}
            </MenuItem>
          ))}
        </Select>
        {displayErrors.length > 0 && (
          <Box sx={{ mt: 0.5 }}>
            {displayErrors.map((error, index) => (
              <FormHelperText key={index} error>
                {error}
              </FormHelperText>
            ))}
          </Box>
        )}
      </FormControl>
    </Box>
  );
};

export default ValidatedSelect;

// Add PropTypes validation
ValidatedSelect.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  errors: PropTypes.arrayOf(PropTypes.string),
  touched: PropTypes.bool,
  label: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.any.isRequired,
        label: PropTypes.string
      })
    ])
  ),
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
  size: PropTypes.oneOf(['small', 'medium']),
  placeholder: PropTypes.string
};

// Add default props
ValidatedSelect.defaultProps = {
  errors: [],
  touched: false,
  options: [],
  required: false,
  disabled: false,
  fullWidth: true,
  variant: 'outlined',
  size: 'medium',
  placeholder: 'Select an option'
};
