/**
 * Custom hooks for data management patterns
 * Extracts common list/table management logic
 */

import { useState, useCallback, useMemo, useEffect } from 'react';

import { useDebounce } from '../utils/performanceOptimization';

/**
 * Hook for managing search, filter, and pagination state
 * @param {Array} data - Source data to search/filter
 * @param {Object} options - Configuration options
 * @returns {Object} Processed data and control functions
 */
export const useDataTable = (data = [], options = {}) => {
  const {
    searchFields = [],
    filterField = null,
    defaultFilter = 'all',
    itemsPerPage = 10,
    searchDebounceMs = 300
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState(defaultFilter);
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' });

  // Debounce search term to improve performance
  const debouncedSearchTerm = useDebounce(searchTerm, searchDebounceMs);

  // Filtered and searched data
  const processedData = useMemo(() => {
    let result = [...(data || [])];

    // Apply search
    if (debouncedSearchTerm && searchFields.length > 0) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const value = getNestedValue(item, field);
          return value?.toString().toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply filter
    if (filter !== defaultFilter && filterField) {
      result = result.filter(item => {
        const value = getNestedValue(item, filterField);
        return value?.toString().toLowerCase() === filter.toLowerCase();
      });
    }

    // Apply sorting
    if (sortConfig.field) {
      result.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.field);
        const bValue = getNestedValue(b, sortConfig.field);

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, debouncedSearchTerm, filter, sortConfig, searchFields, filterField, defaultFilter]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, page, itemsPerPage]);

  // Total pages
  const totalPages = useMemo(
    () => Math.ceil(processedData.length / itemsPerPage),
    [processedData.length, itemsPerPage]
  );

  // Reset page when search/filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, filter]);

  // Event handlers
  const handleSearch = useCallback(value => {
    setSearchTerm(value);
  }, []);

  const handleFilter = useCallback(value => {
    setFilter(value);
  }, []);

  const handleSort = useCallback(field => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handlePageChange = useCallback(
    newPage => {
      setPage(Math.max(1, Math.min(newPage, totalPages)));
    },
    [totalPages]
  );

  const reset = useCallback(() => {
    setSearchTerm('');
    setFilter(defaultFilter);
    setPage(1);
    setSortConfig({ field: null, direction: 'asc' });
  }, [defaultFilter]);

  return {
    // Processed data
    data: paginatedData,
    allData: processedData,
    totalItems: processedData.length,

    // Pagination
    page,
    totalPages,
    itemsPerPage,

    // Search and filter
    searchTerm,
    filter,
    sortConfig,

    // Handlers
    handleSearch,
    handleFilter,
    handleSort,
    handlePageChange,
    reset,

    // Helper functions
    setPage,
    setSearchTerm,
    setFilter
  };
};

/**
 * Hook for managing CRUD operations with optimistic updates
 * @param {Object} apiMethods - Object containing CRUD API methods
 * @param {Object} options - Configuration options
 * @returns {Object} CRUD handlers and state
 */
export const useCrudOperations = (apiMethods = {}, options = {}) => {
  const { onSuccess = () => {}, onError = () => {}, optimisticUpdates = true } = options;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  // Generic operation handler
  const handleOperation = useCallback(
    async (operation, operationType, itemId = null, data = null) => {
      const loadingKey = itemId ? `${operationType}_${itemId}` : operationType;

      setLoading(prev => ({ ...prev, [loadingKey]: true }));
      setErrors(prev => ({ ...prev, [loadingKey]: null }));

      try {
        let result;
        let optimisticUpdate = null;

        // Apply optimistic update for immediate UI feedback
        if (optimisticUpdates && itemId) {
          switch (operationType) {
            case 'update':
              optimisticUpdate = items.map(item =>
                item.id === itemId ? { ...item, ...data } : item
              );
              setItems(optimisticUpdate);
              break;
            case 'delete':
              optimisticUpdate = items.filter(item => item.id !== itemId);
              setItems(optimisticUpdate);
              break;
          }
        }

        // Perform actual operation
        result = await operation();

        // Update state based on operation type
        switch (operationType) {
          case 'create':
            setItems(prev => [result, ...prev]);
            break;
          case 'update':
            if (!optimisticUpdates) {
              setItems(prev => prev.map(item => (item.id === itemId ? result : item)));
            }
            break;
          case 'delete':
            if (!optimisticUpdates) {
              setItems(prev => prev.filter(item => item.id !== itemId));
            }
            break;
          case 'fetch':
            setItems(Array.isArray(result) ? result : [result]);
            break;
        }

        onSuccess(result, operationType);
        return result;
      } catch (error) {
        // Revert optimistic update on error
        if (optimisticUpdate && optimisticUpdates) {
          setItems(items); // Revert to original state
        }

        setErrors(prev => ({ ...prev, [loadingKey]: error }));
        onError(error, operationType);
        throw error;
      } finally {
        setLoading(prev => ({ ...prev, [loadingKey]: false }));
      }
    },
    [items, optimisticUpdates, onSuccess, onError]
  );

  // CRUD operation wrappers
  const create = useCallback(
    data => {
      if (!apiMethods.create) throw new Error('Create method not provided');
      return handleOperation(() => apiMethods.create(data), 'create', null, data);
    },
    [apiMethods.create, handleOperation]
  );

  const update = useCallback(
    (id, data) => {
      if (!apiMethods.update) throw new Error('Update method not provided');
      return handleOperation(() => apiMethods.update(id, data), 'update', id, data);
    },
    [apiMethods.update, handleOperation]
  );

  const remove = useCallback(
    id => {
      if (!apiMethods.delete) throw new Error('Delete method not provided');
      return handleOperation(() => apiMethods.delete(id), 'delete', id);
    },
    [apiMethods.delete, handleOperation]
  );

  const fetch = useCallback(
    (params = {}) => {
      if (!apiMethods.fetch) throw new Error('Fetch method not provided');
      return handleOperation(() => apiMethods.fetch(params), 'fetch');
    },
    [apiMethods.fetch, handleOperation]
  );

  const refresh = useCallback(() => {
    return fetch();
  }, [fetch]);

  return {
    items,
    setItems,
    loading,
    errors,
    create,
    update,
    remove,
    fetch,
    refresh,
    clearError: key => setErrors(prev => ({ ...prev, [key]: null })),
    clearAllErrors: () => setErrors({})
  };
};

/**
 * Hook for managing selection state (checkboxes, multi-select)
 * @param {Array} items - Available items for selection
 * @param {string} keyField - Field to use as unique key
 * @returns {Object} Selection state and handlers
 */
export const useSelection = (items = [], keyField = 'id') => {
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Get selected items
  const selectedItems = useMemo(
    () => items.filter(item => selectedIds.has(item[keyField])),
    [items, selectedIds, keyField]
  );

  // Selection handlers
  const toggleItem = useCallback(id => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(item => item[keyField])));
  }, [items, keyField]);

  const selectNone = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      selectNone();
    } else {
      selectAll();
    }
  }, [selectedIds.size, items.length, selectAll, selectNone]);

  const isSelected = useCallback(id => selectedIds.has(id), [selectedIds]);

  const isAllSelected = useMemo(
    () => items.length > 0 && selectedIds.size === items.length,
    [items.length, selectedIds.size]
  );

  const isIndeterminate = useMemo(
    () => selectedIds.size > 0 && selectedIds.size < items.length,
    [selectedIds.size, items.length]
  );

  return {
    selectedIds: Array.from(selectedIds),
    selectedItems,
    selectedCount: selectedIds.size,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    selectAll,
    selectNone,
    toggleAll,
    clear: selectNone
  };
};

// Helper function to get nested object values
const getNestedValue = (obj, path) => {
  if (typeof path === 'string') {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  return obj?.[path];
};
