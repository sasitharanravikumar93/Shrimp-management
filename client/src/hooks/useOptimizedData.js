/**
 * Optimized Data Management Hooks
 *
 * This module provides hooks that replace common inefficient data management patterns
 * with optimized alternatives using proper data structures and algorithms.
 *
 * Key optimizations:
 * - Replace array.find() with Map lookups O(n) → O(1)
 * - Replace array.indexOf() with Set operations O(n) → O(1)
 * - Replace filter chains with indexed searches O(n²) → O(n)
 * - Implement efficient pagination and sorting
 * - Provide memoized transformations and computations
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';

import {
  IndexedCollection,
  SelectionManager,
  SearchIndex,
  dataPerformanceMonitor
} from '../utils/optimizedDataStructures';

/**
 * Optimized replacement for useEffect data fetching patterns
 * Includes intelligent caching and deduplication
 */
export const useOptimizedApiData = (apiFunction, dependencies = [], options = {}) => {
  const {
    cacheKey = null,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
    enableDeduplication = true,
    enablePerformanceLogging = false
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cache and deduplication
  const cache = useRef(new Map());
  const pendingRequests = useRef(new Map());

  const fetchData = useCallback(async () => {
    const key = cacheKey || JSON.stringify(dependencies);

    // Check cache first
    if (cache.current.has(key)) {
      const cachedData = cache.current.get(key);
      const now = Date.now();

      if (now - cachedData.timestamp < cacheTimeout) {
        setData(cachedData.data);
        setLoading(false);
        setError(null);
        return;
      }
    }

    // Check for pending request (deduplication)
    if (enableDeduplication && pendingRequests.current.has(key)) {
      try {
        const result = await pendingRequests.current.get(key);
        setData(result);
        setLoading(false);
        setError(null);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startTime = performance.now();

      // Create and store the promise for deduplication
      const promise = apiFunction();
      if (enableDeduplication) {
        pendingRequests.current.set(key, promise);
      }

      const result = await promise;

      // Performance logging
      if (enablePerformanceLogging) {
        const endTime = performance.now();
        // eslint-disable-next-line no-console
        console.log(`🚀 API call completed in ${(endTime - startTime).toFixed(2)}ms`);
      }

      // Cache the result
      cache.current.set(key, {
        data: result,
        timestamp: Date.now()
      });

      setData(result);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    } finally {
      // Clean up pending request
      if (enableDeduplication) {
        pendingRequests.current.delete(key);
      }
    }
  }, [
    apiFunction,
    cacheKey,
    cacheTimeout,
    enableDeduplication,
    enablePerformanceLogging,
    ...dependencies
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  const refetch = useCallback(() => {
    const key = cacheKey || JSON.stringify(dependencies);
    cache.current.delete(key);
    fetchData();
  }, [fetchData, cacheKey, dependencies]);

  return { data, loading, error, refetch, clearCache };
};

/**
 * Optimized list management hook
 * Replaces inefficient array operations with indexed collections
 */
export const useOptimizedList = (initialData = [], keyField = 'id', options = {}) => {
  const {
    enableSearch = false,
    searchFields = [],
    enableSelection = false,
    enablePerformanceLogging = false
  } = options;

  // Core data structures
  const collection = useRef(new IndexedCollection(initialData, keyField));
  const searchIndex = useRef(enableSearch ? new SearchIndex(initialData, searchFields) : null);
  const selection = useRef(enableSelection ? new SelectionManager() : null);

  const [version, setVersion] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Update data structures when initial data changes
  useEffect(() => {
    collection.current.clear();
    collection.current.bulkAdd(initialData);

    if (searchIndex.current) {
      searchIndex.current.clear();
      initialData.forEach(item => searchIndex.current.addItem(item));
    }

    setVersion(v => v + 1);
  }, [initialData, keyField]);

  // Memoized filtered data
  const filteredData = useMemo(() => {
    if (!enableSearch || !searchTerm.trim()) {
      return collection.current.getAll();
    }

    if (enablePerformanceLogging) {
      return dataPerformanceMonitor.measureOperation('search', () => {
        return searchIndex.current.search(searchTerm);
      });
    }

    return searchIndex.current.search(searchTerm);
  }, [searchTerm, version, enableSearch, enablePerformanceLogging]);

  // Data management actions
  const actions = useMemo(
    () => ({
      // CRUD operations - O(1) complexity
      add: item => {
        if (enablePerformanceLogging) {
          dataPerformanceMonitor.measureOperation('add', () => {
            collection.current.add(item);
            searchIndex.current?.addItem(item);
          });
        } else {
          collection.current.add(item);
          searchIndex.current?.addItem(item);
        }
        setVersion(v => v + 1);
      },

      remove: key => {
        if (enablePerformanceLogging) {
          dataPerformanceMonitor.measureOperation('remove', () => {
            collection.current.remove(key);
            searchIndex.current?.removeItem(key);
            selection.current?.deselect(key);
          });
        } else {
          collection.current.remove(key);
          searchIndex.current?.removeItem(key);
          selection.current?.deselect(key);
        }
        setVersion(v => v + 1);
      },

      update: (key, updates) => {
        const oldItem = collection.current.get(key);
        if (oldItem) {
          const newItem = { ...oldItem, ...updates };

          if (enablePerformanceLogging) {
            dataPerformanceMonitor.measureOperation('update', () => {
              collection.current.update(key, updates);
              searchIndex.current?.removeItem(key);
              searchIndex.current?.addItem(newItem);
            });
          } else {
            collection.current.update(key, updates);
            searchIndex.current?.removeItem(key);
            searchIndex.current?.addItem(newItem);
          }
          setVersion(v => v + 1);
        }
      },

      // Fast lookups - O(1) complexity
      get: key => collection.current.get(key),
      has: key => collection.current.has(key),

      // Bulk operations for better performance
      bulkAdd: items => {
        if (enablePerformanceLogging) {
          dataPerformanceMonitor.measureOperation('bulkAdd', () => {
            collection.current.bulkAdd(items);
            items.forEach(item => searchIndex.current?.addItem(item));
          });
        } else {
          collection.current.bulkAdd(items);
          items.forEach(item => searchIndex.current?.addItem(item));
        }
        setVersion(v => v + 1);
      },

      bulkRemove: keys => {
        if (enablePerformanceLogging) {
          dataPerformanceMonitor.measureOperation('bulkRemove', () => {
            collection.current.bulkRemove(keys);
            keys.forEach(key => {
              searchIndex.current?.removeItem(key);
              selection.current?.deselect(key);
            });
          });
        } else {
          collection.current.bulkRemove(keys);
          keys.forEach(key => {
            searchIndex.current?.removeItem(key);
            selection.current?.deselect(key);
          });
        }
        setVersion(v => v + 1);
      },

      // Search operations
      search: term => {
        setSearchTerm(term);
      },

      clearSearch: () => {
        setSearchTerm('');
      },

      // Selection operations (if enabled)
      ...(enableSelection
        ? {
            select: key => {
              selection.current.select(key);
              setVersion(v => v + 1);
            },
            deselect: key => {
              selection.current.deselect(key);
              setVersion(v => v + 1);
            },
            toggleSelection: key => {
              selection.current.toggle(key);
              setVersion(v => v + 1);
            },
            selectAll: () => {
              const allKeys = collection.current.getAll().map(item => item[keyField]);
              selection.current.selectAll(allKeys);
              setVersion(v => v + 1);
            },
            deselectAll: () => {
              selection.current.deselectAll();
              setVersion(v => v + 1);
            },
            isSelected: key => selection.current.isSelected(key),
            getSelected: () => selection.current.getSelected(),
            getSelectedItems: () => {
              return selection.current.getSelected().map(key => collection.current.get(key));
            }
          }
        : {})
    }),
    [keyField, enableSelection, enablePerformanceLogging]
  );

  // Computed values
  const computedValues = useMemo(
    () => ({
      totalItems: collection.current.size(),
      filteredCount: filteredData.length,
      searchTerm,
      hasSearch: enableSearch && searchTerm.trim().length > 0,
      ...(enableSelection
        ? {
            selectedCount: selection.current.size(),
            selectedItems: selection.current.getSelected(),
            isSelectionEmpty: selection.current.isEmpty()
          }
        : {})
    }),
    [filteredData.length, searchTerm, enableSearch, enableSelection, version]
  );

  return {
    data: filteredData,
    actions,
    ...computedValues
  };
};

/**
 * Optimized pagination hook
 * Efficiently handles large datasets with minimal memory usage
 */
export const useOptimizedPagination = (data = [], pageSize = 10, options = {}) => {
  const { enablePerformanceLogging = false, serverSide = false } = options;

  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  // Memoized pagination calculations
  const paginationData = useMemo(() => {
    if (serverSide) {
      // For server-side pagination, return data as-is
      return {
        items: data,
        totalPages: Math.ceil(data.length / rowsPerPage),
        totalItems: data.length,
        hasNextPage: false,
        hasPrevPage: false
      };
    }

    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const startIndex = currentPage * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

    const calculation = () => ({
      items: data.slice(startIndex, endIndex),
      totalPages,
      totalItems,
      hasNextPage: currentPage < totalPages - 1,
      hasPrevPage: currentPage > 0,
      startIndex,
      endIndex
    });

    if (enablePerformanceLogging) {
      return dataPerformanceMonitor.measureOperation('pagination', calculation);
    }

    return calculation();
  }, [data, currentPage, rowsPerPage, serverSide, enablePerformanceLogging]);

  // Navigation handlers
  const goToPage = useCallback(
    page => {
      const targetPage = Math.max(0, Math.min(page, paginationData.totalPages - 1));
      setCurrentPage(targetPage);
    },
    [paginationData.totalPages]
  );

  const nextPage = useCallback(() => {
    if (paginationData.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginationData.hasNextPage]);

  const prevPage = useCallback(() => {
    if (paginationData.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [paginationData.hasPrevPage]);

  const changeRowsPerPage = useCallback(newRowsPerPage => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(0); // Reset to first page
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(0);
  }, []);

  return {
    ...paginationData,
    currentPage,
    rowsPerPage,
    goToPage,
    nextPage,
    prevPage,
    changeRowsPerPage,
    resetPagination
  };
};

/**
 * Optimized sorting hook
 * Efficient sorting with stable sort algorithms and memoization
 */
export const useOptimizedSorting = (data = [], options = {}) => {
  const {
    defaultSortField = null,
    defaultSortDirection = 'asc',
    enablePerformanceLogging = false,
    enableMultiSort = false
  } = options;

  const [sortConfig, setSortConfig] = useState({
    field: defaultSortField,
    direction: defaultSortDirection,
    multiSort: enableMultiSort ? [] : null
  });

  // Memoized sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig.field && (!enableMultiSort || sortConfig.multiSort.length === 0)) {
      return data;
    }

    const sorting = () => {
      const result = [...data];

      if (enableMultiSort && sortConfig.multiSort.length > 0) {
        // Multi-column sorting
        result.sort((a, b) => {
          for (const sort of sortConfig.multiSort) {
            const aValue = getNestedValue(a, sort.field);
            const bValue = getNestedValue(b, sort.field);
            const comparison = compareValues(aValue, bValue, sort.direction);

            if (comparison !== 0) {
              return comparison;
            }
          }
          return 0;
        });
      } else {
        // Single column sorting
        result.sort((a, b) => {
          const aValue = getNestedValue(a, sortConfig.field);
          const bValue = getNestedValue(b, sortConfig.field);
          return compareValues(aValue, bValue, sortConfig.direction);
        });
      }

      return result;
    };

    if (enablePerformanceLogging) {
      return dataPerformanceMonitor.measureOperation('sorting', sorting);
    }

    return sorting();
  }, [data, sortConfig, enableMultiSort, enablePerformanceLogging]);

  // Sorting handlers
  const sort = useCallback(
    (field, direction = null) => {
      const newDirection =
        direction ||
        (sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc');

      setSortConfig({
        field,
        direction: newDirection,
        multiSort: enableMultiSort ? [{ field, direction: newDirection }] : null
      });
    },
    [sortConfig, enableMultiSort]
  );

  const addSort = useCallback(
    (field, direction = 'asc') => {
      if (!enableMultiSort) return;

      setSortConfig(prev => {
        const multiSort = [...(prev.multiSort || [])];
        const existingIndex = multiSort.findIndex(s => s.field === field);

        if (existingIndex >= 0) {
          multiSort[existingIndex].direction = direction;
        } else {
          multiSort.push({ field, direction });
        }

        return {
          ...prev,
          multiSort
        };
      });
    },
    [enableMultiSort]
  );

  const removeSort = useCallback(
    field => {
      if (!enableMultiSort) return;

      setSortConfig(prev => ({
        ...prev,
        multiSort: prev.multiSort.filter(s => s.field !== field)
      }));
    },
    [enableMultiSort]
  );

  const clearSort = useCallback(() => {
    setSortConfig({
      field: null,
      direction: 'asc',
      multiSort: enableMultiSort ? [] : null
    });
  }, [enableMultiSort]);

  return {
    data: sortedData,
    sortConfig,
    sort,
    addSort,
    removeSort,
    clearSort,
    isSorted: !!sortConfig.field || (enableMultiSort && sortConfig.multiSort.length > 0)
  };
};

// Helper functions
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const compareValues = (a, b, direction) => {
  // Handle null/undefined values
  if (a == null && b == null) return 0;
  if (a == null) return direction === 'asc' ? -1 : 1;
  if (b == null) return direction === 'asc' ? 1 : -1;

  // Type-aware comparison
  if (typeof a === 'number' && typeof b === 'number') {
    return direction === 'asc' ? a - b : b - a;
  }

  if (a instanceof Date && b instanceof Date) {
    return direction === 'asc' ? a.getTime() - b.getTime() : b.getTime() - a.getTime();
  }

  // String comparison
  const aStr = String(a).toLowerCase();
  const bStr = String(b).toLowerCase();

  if (aStr < bStr) return direction === 'asc' ? -1 : 1;
  if (aStr > bStr) return direction === 'asc' ? 1 : -1;
  return 0;
};

const optimizedDataHooks = {
  useOptimizedApiData,
  useOptimizedList,
  useOptimizedPagination,
  useOptimizedSorting
};

export default optimizedDataHooks;
