/**
 * Optimized Data Structures and Utilities
 *
 * This module provides efficient data structures and utilities to replace
 * inefficient array operations (O(n)) with optimized alternatives (O(1) or O(log n)).
 *
 * Key optimizations:
 * - Use Map for fast lookups instead of array.find()
 * - Use Set for selection management instead of array.indexOf()
 * - Use specialized data structures for search and filtering
 * - Implement virtualization for large datasets
 * - Provide memoized data transformations
 */

import { useMemo, useCallback, useRef, useState, useEffect } from 'react';

// ===================
// OPTIMIZED DATA STRUCTURES
// ===================

/**
 * IndexedCollection - Fast lookups using Map
 * Replaces inefficient array.find() operations
 */
export class IndexedCollection {
  constructor(items = [], keyField = 'id') {
    this.keyField = keyField;
    this.items = new Map();
    this.orderedKeys = [];

    items.forEach(item => this.add(item));
  }

  add(item) {
    const key = item[this.keyField];
    if (!this.items.has(key)) {
      this.orderedKeys.push(key);
    }
    this.items.set(key, item);
    return this;
  }

  remove(key) {
    if (this.items.has(key)) {
      this.items.delete(key);
      this.orderedKeys = this.orderedKeys.filter(k => k !== key);
    }
    return this;
  }

  get(key) {
    return this.items.get(key);
  }

  update(key, updates) {
    const item = this.items.get(key);
    if (item) {
      this.items.set(key, { ...item, ...updates });
    }
    return this;
  }

  has(key) {
    return this.items.has(key);
  }

  getAll() {
    return this.orderedKeys.map(key => this.items.get(key));
  }

  filter(predicate) {
    return this.orderedKeys.map(key => this.items.get(key)).filter(predicate);
  }

  map(transform) {
    return this.orderedKeys.map(key => transform(this.items.get(key)));
  }

  find(predicate) {
    for (const key of this.orderedKeys) {
      const item = this.items.get(key);
      if (predicate(item)) {
        return item;
      }
    }
    return undefined;
  }

  size() {
    return this.items.size;
  }

  clear() {
    this.items.clear();
    this.orderedKeys = [];
    return this;
  }

  // Bulk operations for better performance
  bulkAdd(items) {
    items.forEach(item => this.add(item));
    return this;
  }

  bulkRemove(keys) {
    keys.forEach(key => this.remove(key));
    return this;
  }

  bulkUpdate(updates) {
    Object.entries(updates).forEach(([key, update]) => {
      this.update(key, update);
    });
    return this;
  }
}

/**
 * SelectionManager - Efficient selection state management
 * Replaces inefficient array.indexOf() operations with Set
 */
export class SelectionManager {
  constructor(initialSelected = []) {
    this.selected = new Set(initialSelected);
  }

  select(id) {
    this.selected.add(id);
    return this;
  }

  deselect(id) {
    this.selected.delete(id);
    return this;
  }

  toggle(id) {
    if (this.selected.has(id)) {
      this.selected.delete(id);
    } else {
      this.selected.add(id);
    }
    return this;
  }

  isSelected(id) {
    return this.selected.has(id);
  }

  selectAll(ids) {
    this.selected.clear();
    ids.forEach(id => this.selected.add(id));
    return this;
  }

  deselectAll() {
    this.selected.clear();
    return this;
  }

  getSelected() {
    return Array.from(this.selected);
  }

  getSelectedSet() {
    return new Set(this.selected);
  }

  size() {
    return this.selected.size;
  }

  isEmpty() {
    return this.selected.size === 0;
  }

  clone() {
    return new SelectionManager(Array.from(this.selected));
  }

  // Bulk operations
  bulkToggle(ids) {
    ids.forEach(id => this.toggle(id));
    return this;
  }

  bulkSelect(ids) {
    ids.forEach(id => this.selected.add(id));
    return this;
  }

  bulkDeselect(ids) {
    ids.forEach(id => this.selected.delete(id));
    return this;
  }
}

/**
 * SearchIndex - Fast text searching using inverted index
 * Replaces inefficient string.includes() searches
 */
export class SearchIndex {
  constructor(items = [], searchFields = []) {
    this.searchFields = searchFields;
    this.index = new Map(); // word -> Set of item IDs
    this.items = new Map(); // id -> item

    items.forEach(item => this.addItem(item));
  }

  addItem(item) {
    const id = item.id || item._id;
    this.items.set(id, item);

    // Index all searchable text
    this.searchFields.forEach(field => {
      const text = this._getNestedValue(item, field);
      if (text) {
        this._indexText(text.toString(), id);
      }
    });
  }

  removeItem(id) {
    const item = this.items.get(id);
    if (item) {
      // Remove from index
      this.searchFields.forEach(field => {
        const text = this._getNestedValue(item, field);
        if (text) {
          this._removeFromIndex(text.toString(), id);
        }
      });

      this.items.delete(id);
    }
  }

  search(query) {
    if (!query || query.trim() === '') {
      return Array.from(this.items.values());
    }

    const normalizedQuery = query.toLowerCase().trim();
    const words = normalizedQuery.split(/\s+/);

    if (words.length === 0) {
      return Array.from(this.items.values());
    }

    // Find intersection of all word searches
    let resultIds = null;

    for (const word of words) {
      const wordResults = this._searchWord(word);

      if (resultIds === null) {
        resultIds = wordResults;
      } else {
        // Intersection
        resultIds = resultIds.filter(id => wordResults.has(id));
      }

      // Early exit if no matches
      if (resultIds.length === 0) {
        break;
      }
    }

    return (resultIds || []).map(id => this.items.get(id));
  }

  _indexText(text, itemId) {
    const words = text.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length > 0) {
        if (!this.index.has(word)) {
          this.index.set(word, new Set());
        }
        this.index.get(word).add(itemId);
      }
    });
  }

  _removeFromIndex(text, itemId) {
    const words = text.toLowerCase().split(/\s+/);
    words.forEach(word => {
      const itemSet = this.index.get(word);
      if (itemSet) {
        itemSet.delete(itemId);
        if (itemSet.size === 0) {
          this.index.delete(word);
        }
      }
    });
  }

  _searchWord(word) {
    const exactMatches = this.index.get(word) || new Set();

    // Also search for partial matches (prefix)
    const partialMatches = new Set();
    for (const [indexedWord, itemIds] of this.index) {
      if (indexedWord.startsWith(word)) {
        itemIds.forEach(id => partialMatches.add(id));
      }
    }

    return partialMatches.size > exactMatches.size ? partialMatches : exactMatches;
  }

  _getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  clear() {
    this.index.clear();
    this.items.clear();
  }

  size() {
    return this.items.size;
  }
}

/**
 * SortedIndex - Maintains sorted order for efficient range queries
 */
export class SortedIndex {
  constructor(items = [], keyField = 'id', sortField = null) {
    this.keyField = keyField;
    this.sortField = sortField;
    this.items = new IndexedCollection([], keyField);
    this.sortedKeys = [];

    items.forEach(item => this.add(item));
  }

  add(item) {
    this.items.add(item);
    this._insertSorted(item[this.keyField]);
    return this;
  }

  remove(key) {
    this.items.remove(key);
    this.sortedKeys = this.sortedKeys.filter(k => k !== key);
    return this;
  }

  update(key, updates) {
    this.items.update(key, updates);
    // Re-sort if sort field was updated
    if (this.sortField && updates[this.sortField] !== undefined) {
      this.sortedKeys = this.sortedKeys.filter(k => k !== key);
      this._insertSorted(key);
    }
    return this;
  }

  getInOrder() {
    return this.sortedKeys.map(key => this.items.get(key));
  }

  getRange(start, end) {
    return this.sortedKeys.slice(start, end).map(key => this.items.get(key));
  }

  _insertSorted(key) {
    if (!this.sortField) {
      this.sortedKeys.push(key);
      return;
    }

    const item = this.items.get(key);
    const value = item[this.sortField];

    // Binary search for insertion point
    let left = 0;
    let right = this.sortedKeys.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const midItem = this.items.get(this.sortedKeys[mid]);
      const midValue = midItem[this.sortField];

      if (midValue < value) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    this.sortedKeys.splice(left, 0, key);
  }

  resort(newSortField) {
    this.sortField = newSortField;
    this.sortedKeys.sort((a, b) => {
      const aItem = this.items.get(a);
      const bItem = this.items.get(b);
      const aValue = aItem[newSortField];
      const bValue = bItem[newSortField];

      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });
    return this;
  }
}

// ===================
// REACT HOOKS FOR OPTIMIZED DATA MANAGEMENT
// ===================

/**
 * Hook for efficient data collection management
 */
export const useIndexedCollection = (initialItems = [], keyField = 'id') => {
  const collection = useRef(new IndexedCollection(initialItems, keyField));
  const [version, setVersion] = useState(0);

  const actions = useMemo(
    () => ({
      add: item => {
        collection.current.add(item);
        setVersion(v => v + 1);
      },
      remove: key => {
        collection.current.remove(key);
        setVersion(v => v + 1);
      },
      update: (key, updates) => {
        collection.current.update(key, updates);
        setVersion(v => v + 1);
      },
      get: key => collection.current.get(key),
      has: key => collection.current.has(key),
      getAll: () => collection.current.getAll(),
      filter: predicate => collection.current.filter(predicate),
      find: predicate => collection.current.find(predicate),
      clear: () => {
        collection.current.clear();
        setVersion(v => v + 1);
      },
      bulkAdd: items => {
        collection.current.bulkAdd(items);
        setVersion(v => v + 1);
      },
      bulkRemove: keys => {
        collection.current.bulkRemove(keys);
        setVersion(v => v + 1);
      },
      bulkUpdate: updates => {
        collection.current.bulkUpdate(updates);
        setVersion(v => v + 1);
      }
    }),
    []
  );

  const data = useMemo(() => collection.current.getAll(), [version]);
  const size = useMemo(() => collection.current.size(), [version]);

  return { data, size, actions };
};

/**
 * Hook for efficient selection management
 */
export const useOptimizedSelection = (initialSelected = []) => {
  const selectionManager = useRef(new SelectionManager(initialSelected));
  const [version, setVersion] = useState(0);

  const actions = useMemo(
    () => ({
      select: id => {
        selectionManager.current.select(id);
        setVersion(v => v + 1);
      },
      deselect: id => {
        selectionManager.current.deselect(id);
        setVersion(v => v + 1);
      },
      toggle: id => {
        selectionManager.current.toggle(id);
        setVersion(v => v + 1);
      },
      selectAll: ids => {
        selectionManager.current.selectAll(ids);
        setVersion(v => v + 1);
      },
      deselectAll: () => {
        selectionManager.current.deselectAll();
        setVersion(v => v + 1);
      },
      isSelected: id => selectionManager.current.isSelected(id),
      bulkToggle: ids => {
        selectionManager.current.bulkToggle(ids);
        setVersion(v => v + 1);
      }
    }),
    []
  );

  const selected = useMemo(() => selectionManager.current.getSelected(), [version]);
  const selectedSet = useMemo(() => selectionManager.current.getSelectedSet(), [version]);
  const size = useMemo(() => selectionManager.current.size(), [version]);
  const isEmpty = useMemo(() => selectionManager.current.isEmpty(), [version]);

  return { selected, selectedSet, size, isEmpty, actions };
};

/**
 * Hook for fast search functionality
 */
export const useSearchIndex = (items = [], searchFields = []) => {
  const searchIndex = useRef(new SearchIndex(items, searchFields));
  const [searchTerm, setSearchTerm] = useState('');

  // Update index when items change
  useEffect(() => {
    searchIndex.current.clear();
    items.forEach(item => searchIndex.current.addItem(item));
  }, [items, searchFields]);

  const results = useMemo(() => {
    return searchIndex.current.search(searchTerm);
  }, [searchTerm]);

  const search = useCallback(query => {
    setSearchTerm(query);
  }, []);

  const addItem = useCallback(item => {
    searchIndex.current.addItem(item);
  }, []);

  const removeItem = useCallback(id => {
    searchIndex.current.removeItem(id);
  }, []);

  return {
    results,
    search,
    searchTerm,
    addItem,
    removeItem,
    totalItems: searchIndex.current.size()
  };
};

/**
 * Hook for optimized table data management
 * Combines all optimizations for maximum performance
 */
export const useOptimizedTableData = (
  data = [],
  {
    keyField = 'id',
    searchFields = [],
    sortField = null,
    pageSize = 10,
    enableSelection = false
  } = {}
) => {
  // Core data structures
  const { data: collectionData, actions: collectionActions } = useIndexedCollection(data, keyField);
  const {
    results: searchResults,
    search,
    searchTerm
  } = useSearchIndex(collectionData, searchFields);
  const selection = useOptimizedSelection([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ field: sortField, direction: 'asc' });

  // Processed data with sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.field) {
      return searchResults;
    }

    return [...searchResults].sort((a, b) => {
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
  }, [searchResults, sortConfig]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = currentPage * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  // Handlers
  const handleSort = useCallback(field => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(0); // Reset to first page when sorting
  }, []);

  const handlePageChange = useCallback(newPage => {
    setCurrentPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback(newRowsPerPage => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
  }, []);

  // Calculate metadata
  const totalItems = searchResults.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  return {
    // Data
    data: paginatedData,
    totalItems,

    // Search
    search,
    searchTerm,

    // Sorting
    sortConfig,
    handleSort,

    // Pagination
    currentPage,
    totalPages,
    rowsPerPage,
    handlePageChange,
    handleRowsPerPageChange,

    // Selection (if enabled)
    ...(enableSelection
      ? {
          selection: selection.selected,
          selectedSet: selection.selectedSet,
          selectionActions: selection.actions,
          selectedCount: selection.size,
          isSelected: selection.actions.isSelected
        }
      : {}),

    // Collection management
    collectionActions
  };
};

// ===================
// UTILITY FUNCTIONS
// ===================

/**
 * Convert array-based operations to Map-based for better performance
 */
export const optimizeArrayOperations = {
  // Replace array.find() with Map lookup
  createLookupMap: (items, keyField = 'id') => {
    return items.reduce((map, item) => {
      map.set(item[keyField], item);
      return map;
    }, new Map());
  },

  // Replace array.filter() with optimized filtering
  createFilterIndex: (items, filterFn) => {
    const passedItems = new Set();
    items.forEach((item, index) => {
      if (filterFn(item)) {
        passedItems.add(index);
      }
    });
    return passedItems;
  },

  // Replace indexOf with Set
  createSelectionSet: selectedItems => {
    return new Set(selectedItems);
  }
};

/**
 * Performance monitoring for data operations
 */
export const dataPerformanceMonitor = {
  measureOperation: (operationName, operation) => {
    const start = performance.now();
    const result = operation();
    const end = performance.now();

    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Data operation "${operationName}": ${(end - start).toFixed(2)}ms`);
    }

    return result;
  },

  logDataStructureStats: (dataStructure, name) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${name} stats:`, {
        size: dataStructure.size(),
        type: dataStructure.constructor.name
      });
    }
  }
};

export default {
  IndexedCollection,
  SelectionManager,
  SearchIndex,
  SortedIndex,
  useIndexedCollection,
  useOptimizedSelection,
  useSearchIndex,
  useOptimizedTableData,
  optimizeArrayOperations,
  dataPerformanceMonitor
};
