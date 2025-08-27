/**
 * Generic Data Table Component
 * Reusable component for displaying tabular data with sorting, filtering, and pagination
 */

import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  GetApp as ExportIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Skeleton,
  Alert
} from '@mui/material';
import PropTypes from 'prop-types';
import React, { memo, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// Cell type constants
export const CELL_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  CURRENCY: 'currency',
  DATE: 'date',
  STATUS: 'status',
  CHIP: 'chip',
  AVATAR: 'avatar',
  ACTIONS: 'actions',
  BOOLEAN: 'boolean',
  PROGRESS: 'progress'
};

// Status color mapping
const STATUS_COLORS = {
  active: 'success',
  inactive: 'default',
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  completed: 'success',
  cancelled: 'error',
  draft: 'info'
};

// Cell renderer component
const TableCellRenderer = memo(({ value, type = CELL_TYPES.TEXT, config = {}, row }) => {
  const { t } = useTranslation();

  switch (type) {
    case CELL_TYPES.NUMBER:
      return (
        <Typography variant='body2'>
          {new Intl.NumberFormat('en-US', {
            minimumFractionDigits: config.decimals || 0,
            maximumFractionDigits: config.decimals || 2
          }).format(value)}
        </Typography>
      );

    case CELL_TYPES.CURRENCY:
      return (
        <Typography variant='body2' sx={{ fontWeight: 'medium' }}>
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: config.currency || 'USD'
          }).format(value)}
        </Typography>
      );

    case CELL_TYPES.DATE:
      return (
        <Typography variant='body2'>
          {new Date(value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...config.dateOptions
          })}
        </Typography>
      );

    case CELL_TYPES.STATUS:
      return (
        <Chip
          label={t(value?.toLowerCase()) || value}
          color={STATUS_COLORS[value?.toLowerCase()] || 'default'}
          size='small'
          variant={config.variant || 'filled'}
        />
      );

    case CELL_TYPES.CHIP:
      return (
        <Chip
          label={config.formatter ? config.formatter(value) : value}
          color={config.color || 'primary'}
          size='small'
          variant={config.variant || 'outlined'}
        />
      );

    case CELL_TYPES.AVATAR:
      return (
        <Avatar src={value} alt={config.alt || ''} sx={{ width: 32, height: 32 }}>
          {config.fallback || value?.charAt(0)?.toUpperCase()}
        </Avatar>
      );

    case CELL_TYPES.BOOLEAN:
      return (
        <Chip
          label={value ? t('yes') : t('no')}
          color={value ? 'success' : 'default'}
          size='small'
          variant='outlined'
        />
      );

    case CELL_TYPES.ACTIONS:
      return <ActionsCell row={row} actions={config.actions || []} />;

    case CELL_TYPES.TEXT:
    default:
      return (
        <Typography variant='body2'>
          {config.formatter ? config.formatter(value) : value}
        </Typography>
      );
  }
});

// Actions cell component
const ActionsCell = memo(({ row, actions }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = useCallback(event => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleAction = useCallback(
    action => {
      action.handler(row);
      handleClose();
    },
    [row, handleClose]
  );

  if (actions.length <= 2) {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        {actions.map((action, index) => (
          <Tooltip key={index} title={action.label}>
            <IconButton
              size='small'
              onClick={() => action.handler(row)}
              color={action.color || 'default'}
            >
              {action.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Box>
    );
  }

  return (
    <>
      <IconButton
        size='small'
        onClick={handleClick}
        aria-controls={open ? 'actions-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id='actions-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
      >
        {actions.map((action, index) => (
          <MenuItem key={index} onClick={() => handleAction(action)}>
            {action.icon && <Box sx={{ mr: 1, display: 'flex' }}>{action.icon}</Box>}
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
});

// Table skeleton component
const TableSkeleton = memo(({ columns, rows = 5 }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column, index) => (
            <TableCell key={index}>
              <Skeleton variant='text' width='80%' />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton variant='text' />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
));

// Main DataTable component
const DataTable = memo(
  ({
    data = [],
    columns = [],
    loading = false,
    error = null,

    // Selection
    selectable = false,
    selected = [],
    onSelectionChange = () => {},

    // Sorting
    sortable = true,
    defaultSort = { field: '', direction: 'asc' },
    onSort = null,

    // Pagination
    pagination = true,
    page = 0,
    rowsPerPage = 10,
    totalCount = null,
    onPageChange = () => {},
    onRowsPerPageChange = () => {},

    // Search and filter
    searchable = false,
    searchPlaceholder = 'search_placeholder',
    onSearch = () => {},
    filterable = false,
    filters = [],
    onFilter = () => {},

    // Styling
    dense = false,
    stickyHeader = false,
    className = '',
    emptyMessage = 'no_data_available',

    // Row configuration
    rowKey = 'id',
    onRowClick = null,
    rowHeight = null,

    ...tableProps
  }) => {
    const { t } = useTranslation();

    // Local state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState(defaultSort);
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);

    // Memoized sorted and filtered data
    const processedData = useMemo(() => {
      let result = [...data];

      // Apply search filter
      if (searchTerm && !onSearch) {
        const searchLower = searchTerm.toLowerCase();
        result = result.filter(row =>
          columns.some(column => {
            const value = row[column.field];
            return value?.toString().toLowerCase().includes(searchLower);
          })
        );
      }

      // Apply sorting
      if (sortConfig.field && !onSort) {
        result.sort((a, b) => {
          const aValue = a[sortConfig.field];
          const bValue = b[sortConfig.field];

          if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }

      return result;
    }, [data, searchTerm, sortConfig, columns, onSearch, onSort]);

    // Pagination calculations
    const paginatedData = useMemo(() => {
      if (!pagination) return processedData;
      const start = page * rowsPerPage;
      return processedData.slice(start, start + rowsPerPage);
    }, [processedData, pagination, page, rowsPerPage]);

    const displayData = pagination ? paginatedData : processedData;
    const dataCount = totalCount || processedData.length;

    // Event handlers
    const handleSort = useCallback(
      field => {
        if (!sortable) return;

        const direction =
          sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';

        const newSortConfig = { field, direction };
        setSortConfig(newSortConfig);

        if (onSort) {
          onSort(newSortConfig);
        }
      },
      [sortable, sortConfig, onSort]
    );

    const handleSelectAll = useCallback(
      event => {
        if (event.target.checked) {
          const newSelected = displayData.map(row => row[rowKey]);
          onSelectionChange(newSelected);
        } else {
          onSelectionChange([]);
        }
      },
      [displayData, rowKey, onSelectionChange]
    );

    const handleSelectRow = useCallback(
      (event, id) => {
        event.stopPropagation();
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
          newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
          newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
          newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
          newSelected = newSelected.concat(
            selected.slice(0, selectedIndex),
            selected.slice(selectedIndex + 1)
          );
        }

        onSelectionChange(newSelected);
      },
      [selected, onSelectionChange]
    );

    const handleSearch = useCallback(
      event => {
        const value = event.target.value;
        setSearchTerm(value);

        if (onSearch) {
          onSearch(value);
        }
      },
      [onSearch]
    );

    const isSelected = useCallback(id => selected.indexOf(id) !== -1, [selected]);

    // Render loading state
    if (loading) {
      return <TableSkeleton columns={columns} />;
    }

    // Render error state
    if (error) {
      return (
        <Alert severity='error' sx={{ mt: 2 }}>
          {error.message || t('error_loading_data')}
        </Alert>
      );
    }

    return (
      <Box className={className}>
        {/* Search and Filter Bar */}
        {(searchable || filterable) && (
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            {searchable && (
              <TextField
                placeholder={t(searchPlaceholder)}
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                sx={{ flexGrow: 1 }}
              />
            )}

            {filterable && (
              <IconButton onClick={event => setFilterAnchorEl(event.currentTarget)}>
                <FilterIcon />
              </IconButton>
            )}
          </Box>
        )}

        {/* Table */}
        <TableContainer component={Paper} {...tableProps}>
          <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                {selectable && (
                  <TableCell padding='checkbox'>
                    <Checkbox
                      color='primary'
                      indeterminate={selected.length > 0 && selected.length < displayData.length}
                      checked={displayData.length > 0 && selected.length === displayData.length}
                      onChange={handleSelectAll}
                      inputProps={{
                        'aria-label': 'select all'
                      }}
                    />
                  </TableCell>
                )}

                {columns.map(column => (
                  <TableCell
                    key={column.field}
                    align={column.align || 'left'}
                    sx={{
                      minWidth: column.minWidth,
                      width: column.width
                    }}
                  >
                    {sortable && column.sortable !== false ? (
                      <TableSortLabel
                        active={sortConfig.field === column.field}
                        direction={sortConfig.field === column.field ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort(column.field)}
                      >
                        {t(column.headerName)}
                      </TableSortLabel>
                    ) : (
                      t(column.headerName)
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {displayData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align='center'>
                    <Typography variant='body2' color='text.secondary' sx={{ py: 4 }}>
                      {t(emptyMessage)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                displayData.map((row, index) => {
                  const rowId = row[rowKey];
                  const isItemSelected = isSelected(rowId);

                  return (
                    <TableRow
                      key={rowId}
                      hover={!!onRowClick}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      role={onRowClick ? 'button' : undefined}
                      tabIndex={onRowClick ? 0 : -1}
                      selected={isItemSelected}
                      sx={{
                        cursor: onRowClick ? 'pointer' : 'default',
                        height: rowHeight
                      }}
                    >
                      {selectable && (
                        <TableCell padding='checkbox'>
                          <Checkbox
                            color='primary'
                            checked={isItemSelected}
                            onChange={event => handleSelectRow(event, rowId)}
                            inputProps={{
                              'aria-labelledby': `row-${index}`
                            }}
                          />
                        </TableCell>
                      )}

                      {columns.map(column => (
                        <TableCell key={column.field} align={column.align || 'left'}>
                          <TableCellRenderer
                            value={row[column.field]}
                            type={column.type}
                            config={column.config}
                            row={row}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pagination && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component='div'
            count={dataCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => onPageChange(newPage)}
            onRowsPerPageChange={event => onRowsPerPageChange(parseInt(event.target.value, 10))}
          />
        )}
      </Box>
    );
  }
);

// Utility functions for creating columns
export const createColumn = ({
  field,
  headerName,
  type = CELL_TYPES.TEXT,
  width = null,
  minWidth = null,
  align = 'left',
  sortable = true,
  config = {}
}) => ({
  field,
  headerName,
  type,
  width,
  minWidth,
  align,
  sortable,
  config
});

export const createActionColumn = actions =>
  createColumn({
    field: 'actions',
    headerName: 'actions',
    type: CELL_TYPES.ACTIONS,
    sortable: false,
    align: 'center',
    width: 120,
    config: { actions }
  });

export default DataTable;

// Add PropTypes validation
DataTable.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      headerName: PropTypes.string.isRequired,
      type: PropTypes.oneOf(Object.values(CELL_TYPES)),
      width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      align: PropTypes.oneOf(['left', 'center', 'right']),
      sortable: PropTypes.bool,
      config: PropTypes.object
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.object,

  // Selection
  selectable: PropTypes.bool,
  selected: PropTypes.array,
  onSelectionChange: PropTypes.func,

  // Sorting
  sortable: PropTypes.bool,
  defaultSort: PropTypes.shape({
    field: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc'])
  }),
  onSort: PropTypes.func,

  // Pagination
  pagination: PropTypes.bool,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  totalCount: PropTypes.number,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,

  // Search and filter
  searchable: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  onSearch: PropTypes.func,
  filterable: PropTypes.bool,
  filters: PropTypes.array,
  onFilter: PropTypes.func,

  // Styling
  dense: PropTypes.bool,
  stickyHeader: PropTypes.bool,
  className: PropTypes.string,
  emptyMessage: PropTypes.string,

  // Row configuration
  rowKey: PropTypes.string,
  onRowClick: PropTypes.func,
  rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

// Add default props
DataTable.defaultProps = {
  data: [],
  columns: [],
  loading: false,
  error: null,
  selectable: false,
  selected: [],
  sortable: true,
  defaultSort: { field: '', direction: 'asc' },
  pagination: true,
  page: 0,
  rowsPerPage: 10,
  totalCount: null,
  searchable: false,
  searchPlaceholder: 'search_placeholder',
  filterable: false,
  filters: [],
  dense: false,
  stickyHeader: false,
  className: '',
  emptyMessage: 'no_data_available',
  rowKey: 'id'
};

// Add PropTypes for TableCellRenderer
TableCellRenderer.propTypes = {
  value: PropTypes.any,
  type: PropTypes.oneOf(Object.values(CELL_TYPES)),
  config: PropTypes.object,
  row: PropTypes.object
};

TableCellRenderer.defaultProps = {
  type: CELL_TYPES.TEXT,
  config: {},
  row: {}
};

// Add PropTypes for ActionsCell
ActionsCell.propTypes = {
  row: PropTypes.object.isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.element,
      handler: PropTypes.func.isRequired,
      color: PropTypes.string
    })
  ).isRequired
};

// Add PropTypes for TableSkeleton
TableSkeleton.propTypes = {
  columns: PropTypes.array.isRequired,
  rows: PropTypes.number
};

TableSkeleton.defaultProps = {
  rows: 5
};
