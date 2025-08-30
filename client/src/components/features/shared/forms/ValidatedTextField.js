import { TextField, FormHelperText, Box } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * ValidatedTextField - A TextField component with built-in validation
 */
const ValidatedTextField = ({
  name,
  value,
  onChange,
  onBlur,
  errors = [],
  touched = false,
  label,
  placeholder,
  type = 'text',
  multiline = false,
  rows = 1,
  required = false,
  disabled = false,
  fullWidth = true,
  variant = 'outlined',
  size = 'medium',
  helperText,
  startAdornment,
  endAdornment,
  ...props
}) => {
  const hasError = touched && errors.length > 0;
  const displayErrors = hasError ? errors : [];

  return (
    <Box>
      <TextField
        name={name}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        label={label}
        placeholder={placeholder}
        type={type}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        required={required}
        disabled={disabled}
        fullWidth={fullWidth}
        variant={variant}
        size={size}
        error={hasError}
        helperText={helperText && !hasError ? helperText : undefined}
        InputProps={{
          startAdornment,
          endAdornment
        }}
        {...props}
      />
      {displayErrors.length > 0 && (
        <Box sx={{ mt: 0.5 }}>
          {displayErrors.map((error, index) => (
            <FormHelperText key={`${name}-${error}`} error>
              {error}
            </FormHelperText>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ValidatedTextField;

// Add PropTypes validation
ValidatedTextField.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  errors: PropTypes.arrayOf(PropTypes.string),
  touched: PropTypes.bool,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
  size: PropTypes.oneOf(['small', 'medium']),
  helperText: PropTypes.string,
  startAdornment: PropTypes.element,
  endAdornment: PropTypes.element
};

// Add default props
ValidatedTextField.defaultProps = {
  errors: [],
  touched: false,
  type: 'text',
  multiline: false,
  rows: 1,
  required: false,
  disabled: false,
  fullWidth: true,
  variant: 'outlined',
  size: 'medium'
};
