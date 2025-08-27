/**
 * Generic Filter Panel Component
 * Reusable component for filtering data across different views
 */

import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import PropTypes from 'prop-types';
import React, { memo, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Filter type constants
export const FILTER_TYPES = {
  SELECT: 'select',
  MULTI_SELECT: 'multiSelect',
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  DATE_RANGE: 'dateRange',
  BOOLEAN: 'boolean',
  SLIDER: 'slider',
  AUTOCOMPLETE: 'autocomplete'
};

// Default filter configuration
const defaultFilterConfig = {
  type: FILTER_TYPES.SELECT,
  required: false,
  clearable: true,
  multiple: false
};

// Individual filter component
const FilterComponent = memo(({ filter, value, onChange, disabled = false }) => {
  const { t } = useTranslation();

  const handleChange = useCallback(
    newValue => {
      onChange(filter.key, newValue);
    },
    [filter.key, onChange]
  );

  const commonProps = {
    disabled,
    fullWidth: true,
    size: 'small',
    variant: 'outlined'
  };

  switch (filter.type) {
    case FILTER_TYPES.SELECT:
      return (
        <FormControl {...commonProps}>
          <InputLabel>{t(filter.label)}</InputLabel>
          <Select
            value={value || ''}
            onChange={e => handleChange(e.target.value)}
            label={t(filter.label)}
          >
            {filter.clearable && (
              <MenuItem value=''>
                <em>{t('all')}</em>
              </MenuItem>
            )}
            {filter.options?.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {t(option.label)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );

    case FILTER_TYPES.MULTI_SELECT:
      return (
        <FormControl {...commonProps}>
          <InputLabel>{t(filter.label)}</InputLabel>
          <Select
            multiple
            value={value || []}
            onChange={e => handleChange(e.target.value)}
            label={t(filter.label)}
            renderValue={selected => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map(val => {
                  const option = filter.options?.find(opt => opt.value === val);
                  return <Chip key={val} label={t(option?.label || val)} size='small' />;
                })}
              </Box>
            )}
          >
            {filter.options?.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {t(option.label)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );

    case FILTER_TYPES.TEXT:
      return (
        <TextField
          {...commonProps}
          label={t(filter.label)}
          value={value || ''}
          onChange={e => handleChange(e.target.value)}
          placeholder={filter.placeholder ? t(filter.placeholder) : ''}
          InputProps={
            filter.searchable
              ? {
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }
              : undefined
          }
        />
      );

    case FILTER_TYPES.NUMBER:
      return (
        <TextField
          {...commonProps}
          type='number'
          label={t(filter.label)}
          value={value || ''}
          onChange={e => handleChange(Number(e.target.value) || null)}
          inputProps={{
            min: filter.min,
            max: filter.max,
            step: filter.step || 1
          }}
        />
      );

    case FILTER_TYPES.DATE:
      return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MuiDatePicker
            label={t(filter.label)}
            value={value || null}
            onChange={handleChange}
            renderInput={params => <TextField {...commonProps} {...params} />}
            disabled={disabled}
          />
        </LocalizationProvider>
      );

    case FILTER_TYPES.DATE_RANGE:
      return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <MuiDatePicker
              label={t('from_date')}
              value={value?.from || null}
              onChange={date => handleChange({ ...value, from: date })}
              renderInput={params => <TextField {...commonProps} {...params} />}
              disabled={disabled}
            />
            <MuiDatePicker
              label={t('to_date')}
              value={value?.to || null}
              onChange={date => handleChange({ ...value, to: date })}
              renderInput={params => <TextField {...commonProps} {...params} />}
              disabled={disabled}
            />
          </Box>
        </LocalizationProvider>
      );

    case FILTER_TYPES.BOOLEAN:
      return (
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(value)}
              onChange={e => handleChange(e.target.checked)}
              disabled={disabled}
            />
          }
          label={t(filter.label)}
        />
      );

    case FILTER_TYPES.SLIDER:
      return (
        <Box>
          <Typography variant='body2' gutterBottom>
            {t(filter.label)}
          </Typography>
          <Slider
            value={value || [filter.min || 0, filter.max || 100]}
            onChange={(e, newValue) => handleChange(newValue)}
            valueLabelDisplay='auto'
            min={filter.min || 0}
            max={filter.max || 100}
            step={filter.step || 1}
            disabled={disabled}
            marks={filter.marks}
            valueLabelFormat={filter.formatter || (x => x)}
          />
        </Box>
      );

    case FILTER_TYPES.AUTOCOMPLETE:
      return (
        <Autocomplete
          options={filter.options || []}
          getOptionLabel={option => t(option.label)}
          value={filter.multiple ? value || [] : value || null}
          onChange={(e, newValue) => handleChange(newValue)}
          multiple={filter.multiple}
          disabled={disabled}
          renderInput={params => (
            <TextField
              {...params}
              {...commonProps}
              label={t(filter.label)}
              placeholder={filter.placeholder ? t(filter.placeholder) : ''}
            />
          )}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => (
              <Chip
                label={t(option.label)}
                {...getTagProps({ index })}
                key={option.value}
                size='small'
              />
            ))
          }
        />
      );

    default:
      return null;
  }
});

// Active filters display component
const ActiveFilters = memo(({ filters, filterValues, onClear, onClearAll }) => {
  const { t } = useTranslation();

  const activeFilters = useMemo(() => {
    return filters.filter(filter => {
      const value = filterValues[filter.key];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== null && v !== undefined);
      }
      return value !== null && value !== undefined && value !== '';
    });
  }, [filters, filterValues]);

  if (activeFilters.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant='body2' color='text.secondary'>
          {t('active_filters')}:
        </Typography>
        <Button size='small' onClick={onClearAll} startIcon={<ClearIcon />} color='error'>
          {t('clear_all')}
        </Button>
      </Box>
      <Stack direction='row' spacing={1} flexWrap='wrap'>
        {activeFilters.map(filter => {
          const value = filterValues[filter.key];
          let displayValue = '';

          if (Array.isArray(value)) {
            displayValue = value
              .map(v => {
                const option = filter.options?.find(opt => opt.value === v);
                return t(option?.label || v);
              })
              .join(', ');
          } else if (typeof value === 'object' && value !== null) {
            if (filter.type === FILTER_TYPES.DATE_RANGE) {
              displayValue = `${value.from ? new Date(value.from).toLocaleDateString() : ''} - ${
                value.to ? new Date(value.to).toLocaleDateString() : ''
              }`;
            }
          } else {
            const option = filter.options?.find(opt => opt.value === value);
            displayValue = t(option?.label || value);
          }

          return (
            <Chip
              key={filter.key}
              label={`${t(filter.label)}: ${displayValue}`}
              onDelete={() => onClear(filter.key)}
              size='small'
              variant='outlined'
            />
          );
        })}
      </Stack>
    </Box>
  );
});

// Main FilterPanel component
const FilterPanel = memo(
  ({
    filters = [],
    values = {},
    onChange = () => {},
    onApply = null,
    onReset = () => {},

    // Layout options
    layout = 'vertical', // 'vertical', 'horizontal', 'grid', 'accordion'
    columns = 2,
    spacing = 2,

    // Display options
    title = null,
    showActiveFilters = true,
    showApplyButton = false,
    showResetButton = true,
    collapsible = false,
    defaultExpanded = true,

    // Styling
    elevation = 1,
    className = '',
    disabled = false,

    ...cardProps
  }) => {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(defaultExpanded);

    // Process filters with defaults
    const processedFilters = useMemo(() => {
      return filters.map(filter => ({
        ...defaultFilterConfig,
        ...filter
      }));
    }, [filters]);

    // Handle filter value changes
    const handleFilterChange = useCallback(
      (key, value) => {
        const newValues = { ...values, [key]: value };
        onChange(newValues);
      },
      [values, onChange]
    );

    // Handle clearing individual filters
    const handleClearFilter = useCallback(
      key => {
        const newValues = { ...values };
        delete newValues[key];
        onChange(newValues);
      },
      [values, onChange]
    );

    // Handle clearing all filters
    const handleClearAll = useCallback(() => {
      onChange({});
      onReset();
    }, [onChange, onReset]);

    // Handle apply filters
    const handleApply = useCallback(() => {
      if (onApply) {
        onApply(values);
      }
    }, [onApply, values]);

    // Render filter grid
    const renderFilters = () => {
      const filterComponents = processedFilters.map(filter => (
        <Box
          key={filter.key}
          sx={{
            gridColumn: layout === 'grid' && filter.span ? `span ${filter.span}` : undefined
          }}
        >
          <FilterComponent
            filter={filter}
            value={values[filter.key]}
            onChange={handleFilterChange}
            disabled={disabled}
          />
        </Box>
      ));

      if (layout === 'horizontal') {
        return (
          <Stack direction='row' spacing={spacing} flexWrap='wrap'>
            {filterComponents}
          </Stack>
        );
      }

      if (layout === 'grid') {
        return (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: spacing
            }}
          >
            {filterComponents}
          </Box>
        );
      }

      if (layout === 'accordion') {
        return (
          <Stack spacing={1}>
            {processedFilters.map(filter => (
              <Accordion key={filter.key} variant='outlined'>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{t(filter.label)}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FilterComponent
                    filter={filter}
                    value={values[filter.key]}
                    onChange={handleFilterChange}
                    disabled={disabled}
                  />
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        );
      }

      // Default vertical layout
      return <Stack spacing={spacing}>{filterComponents}</Stack>;
    };

    const content = (
      <>
        {showActiveFilters && (
          <ActiveFilters
            filters={processedFilters}
            filterValues={values}
            onClear={handleClearFilter}
            onClearAll={handleClearAll}
          />
        )}

        {renderFilters()}

        {(showApplyButton || showResetButton) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Stack direction='row' spacing={1} justifyContent='flex-end'>
              {showResetButton && (
                <Button
                  variant='outlined'
                  onClick={handleClearAll}
                  startIcon={<ClearIcon />}
                  disabled={disabled}
                >
                  {t('reset')}
                </Button>
              )}
              {showApplyButton && (
                <Button
                  variant='contained'
                  onClick={handleApply}
                  startIcon={<FilterListIcon />}
                  disabled={disabled}
                >
                  {t('apply_filters')}
                </Button>
              )}
            </Stack>
          </>
        )}
      </>
    );

    if (collapsible) {
      return (
        <Card elevation={elevation} className={className} {...cardProps}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterListIcon />
                {title && <Typography variant='h6'>{t(title)}</Typography>}
              </Box>
            }
            action={
              <IconButton onClick={() => setExpanded(!expanded)}>
                <ExpandMoreIcon
                  sx={{
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                />
              </IconButton>
            }
          />
          {expanded && <CardContent>{content}</CardContent>}
        </Card>
      );
    }

    return (
      <Card elevation={elevation} className={className} {...cardProps}>
        {title && (
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterListIcon />
                <Typography variant='h6'>{t(title)}</Typography>
              </Box>
            }
          />
        )}
        <CardContent>{content}</CardContent>
      </Card>
    );
  }
);

// Utility functions for creating filters
export const createFilter = ({
  key,
  label,
  type = FILTER_TYPES.SELECT,
  options = [],
  required = false,
  clearable = true,
  multiple = false,
  ...config
}) => ({
  key,
  label,
  type,
  options,
  required,
  clearable,
  multiple,
  ...config
});

export const createSelectFilter = (key, label, options, multiple = false) =>
  createFilter({
    key,
    label,
    type: multiple ? FILTER_TYPES.MULTI_SELECT : FILTER_TYPES.SELECT,
    options,
    multiple
  });

export const createDateRangeFilter = (key, label) =>
  createFilter({
    key,
    label,
    type: FILTER_TYPES.DATE_RANGE
  });

export const createTextFilter = (key, label, placeholder = null) =>
  createFilter({
    key,
    label,
    type: FILTER_TYPES.TEXT,
    placeholder
  });

export const createNumberFilter = (key, label, min = null, max = null) =>
  createFilter({
    key,
    label,
    type: FILTER_TYPES.NUMBER,
    min,
    max
  });

export default FilterPanel;

// Add PropTypes validation
FilterPanel.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(Object.values(FILTER_TYPES)),
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.any.isRequired,
          label: PropTypes.string.isRequired
        })
      ),
      required: PropTypes.bool,
      clearable: PropTypes.bool,
      multiple: PropTypes.bool,
      min: PropTypes.number,
      max: PropTypes.number,
      step: PropTypes.number,
      placeholder: PropTypes.string,
      searchable: PropTypes.bool,
      marks: PropTypes.array,
      formatter: PropTypes.func,
      span: PropTypes.number
    })
  ),
  values: PropTypes.object,
  onChange: PropTypes.func,
  onApply: PropTypes.func,
  onReset: PropTypes.func,

  // Layout options
  layout: PropTypes.oneOf(['vertical', 'horizontal', 'grid', 'accordion']),
  columns: PropTypes.number,
  spacing: PropTypes.number,

  // Display options
  title: PropTypes.string,
  showActiveFilters: PropTypes.bool,
  showApplyButton: PropTypes.bool,
  showResetButton: PropTypes.bool,
  collapsible: PropTypes.bool,
  defaultExpanded: PropTypes.bool,

  // Styling
  elevation: PropTypes.number,
  className: PropTypes.string,
  disabled: PropTypes.bool
};

// Add default props
FilterPanel.defaultProps = {
  filters: [],
  values: {},
  onChange: () => {},
  onReset: () => {},
  layout: 'vertical',
  columns: 2,
  spacing: 2,
  showActiveFilters: true,
  showApplyButton: false,
  showResetButton: true,
  collapsible: false,
  defaultExpanded: true,
  elevation: 1,
  className: '',
  disabled: false
};

// Add PropTypes for FilterComponent
FilterComponent.propTypes = {
  filter: PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.oneOf(Object.values(FILTER_TYPES)),
    options: PropTypes.array,
    clearable: PropTypes.bool,
    multiple: PropTypes.bool,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    placeholder: PropTypes.string,
    searchable: PropTypes.bool
  }).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

FilterComponent.defaultProps = {
  disabled: false
};

// Add PropTypes for ActiveFilters
ActiveFilters.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(Object.values(FILTER_TYPES)),
      options: PropTypes.array
    })
  ).isRequired,
  filterValues: PropTypes.object.isRequired,
  onClear: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired
};
