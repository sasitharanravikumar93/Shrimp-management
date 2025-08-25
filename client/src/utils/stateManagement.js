/**
 * Standardized State Management Utilities
 * Provides consistent patterns for state management across the application
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

// Action types
export const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_DATA: 'SET_DATA',
  UPDATE_ITEM: 'UPDATE_ITEM',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  RESET: 'RESET',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION'
};

// Standard async state shape
export const createAsyncState = (initialData = null) => ({
  data: initialData,
  loading: false,
  error: null,
  lastUpdated: null
});

// Standard list state shape
export const createListState = (initialData = []) => ({
  ...createAsyncState(initialData),
  filters: {},
  pagination: {
    page: 0,
    limit: 10,
    total: 0
  },
  selected: []
});

// Standard async reducer
export const createAsyncReducer = (customActions = {}) => {
  return (state, action) => {
    switch (action.type) {
      case ActionTypes.SET_LOADING:
        return {
          ...state,
          loading: action.payload,
          error: action.payload ? null : state.error
        };

      case ActionTypes.SET_ERROR:
        return {
          ...state,
          loading: false,
          error: action.payload
        };

      case ActionTypes.SET_DATA:
        return {
          ...state,
          loading: false,
          error: null,
          data: action.payload,
          lastUpdated: new Date().toISOString()
        };

      case ActionTypes.UPDATE_ITEM:
        if (Array.isArray(state.data)) {
          return {
            ...state,
            data: state.data.map(item =>
              item.id === action.payload.id || item._id === action.payload.id
                ? { ...item, ...action.payload.updates }
                : item
            )
          };
        }
        return {
          ...state,
          data: { ...state.data, ...action.payload.updates }
        };

      case ActionTypes.ADD_ITEM:
        return {
          ...state,
          data: Array.isArray(state.data) ? [...state.data, action.payload] : action.payload
        };

      case ActionTypes.REMOVE_ITEM:
        return {
          ...state,
          data: Array.isArray(state.data)
            ? state.data.filter(item => (item.id || item._id) !== action.payload)
            : null
        };

      case ActionTypes.SET_FILTERS:
        return {
          ...state,
          filters: { ...state.filters, ...action.payload }
        };

      case ActionTypes.SET_PAGINATION:
        return {
          ...state,
          pagination: { ...state.pagination, ...action.payload }
        };

      case ActionTypes.RESET:
        return createAsyncState(action.payload);

      default:
        if (customActions[action.type]) {
          return customActions[action.type](state, action);
        }
        return state;
    }
  };
};

// Standard action creators
export const createAsyncActions = dispatch => ({
  setLoading: loading => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
  setError: error => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
  setData: data => dispatch({ type: ActionTypes.SET_DATA, payload: data }),
  updateItem: (id, updates) =>
    dispatch({ type: ActionTypes.UPDATE_ITEM, payload: { id, updates } }),
  addItem: item => dispatch({ type: ActionTypes.ADD_ITEM, payload: item }),
  removeItem: id => dispatch({ type: ActionTypes.REMOVE_ITEM, payload: id }),
  setFilters: filters => dispatch({ type: ActionTypes.SET_FILTERS, payload: filters }),
  setPagination: pagination => dispatch({ type: ActionTypes.SET_PAGINATION, payload: pagination }),
  reset: data => dispatch({ type: ActionTypes.RESET, payload: data })
});

// Hook for async operations with standardized state management
export const useAsyncState = (initialState = null, customActions = {}) => {
  const [state, dispatch] = useReducer(
    createAsyncReducer(customActions),
    createAsyncState(initialState)
  );

  const actions = createAsyncActions(dispatch);

  return { state, actions, dispatch };
};

// Hook for list operations with standardized state management
export const useListState = (initialState = [], customActions = {}) => {
  const [state, dispatch] = useReducer(
    createAsyncReducer(customActions),
    createListState(initialState)
  );

  const actions = createAsyncActions(dispatch);

  // Enhanced actions for list operations
  const enhancedActions = {
    ...actions,
    selectItem: id => {
      const newSelected = state.selected.includes(id)
        ? state.selected.filter(selectedId => selectedId !== id)
        : [...state.selected, id];
      dispatch({ type: ActionTypes.SET_PAGINATION, payload: { selected: newSelected } });
    },
    selectAll: () => {
      const allIds = state.data.map(item => item.id || item._id);
      dispatch({ type: ActionTypes.SET_PAGINATION, payload: { selected: allIds } });
    },
    clearSelection: () => {
      dispatch({ type: ActionTypes.SET_PAGINATION, payload: { selected: [] } });
    }
  };

  return { state, actions: enhancedActions, dispatch };
};

// Context factory for creating standardized contexts
export const createStandardContext = (contextName, initialState, customActions = {}) => {
  const Context = createContext();

  const useContextHook = () => {
    const context = useContext(Context);
    if (!context) {
      throw new Error(`use${contextName} must be used within a ${contextName}Provider`);
    }
    return context;
  };

  const Provider = ({ children, apiCall, dependencies = [] }) => {
    const { state, actions, dispatch } = useAsyncState(initialState, customActions);

    // Auto-fetch data if apiCall is provided
    useEffect(() => {
      if (apiCall) {
        const fetchData = async () => {
          actions.setLoading(true);
          try {
            const data = await apiCall();
            actions.setData(data);
          } catch (error) {
            actions.setError(error);
          }
        };

        fetchData();
      }
    }, dependencies);

    const contextValue = {
      ...state,
      ...actions,
      dispatch,
      refetch: apiCall
        ? async () => {
            actions.setLoading(true);
            try {
              const data = await apiCall();
              actions.setData(data);
            } catch (error) {
              actions.setError(error);
            }
          }
        : null
    };

    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
  };

  return { Provider, useContext: useContextHook, Context };
};

// Standard error handling for state management
export const handleAsyncOperation = async (operation, actions, options = {}) => {
  const { loadingKey = null, onSuccess = null, onError = null, throwError = false } = options;

  try {
    if (loadingKey) {
      actions.setLoading(true);
    }

    const result = await operation();

    if (onSuccess) {
      onSuccess(result);
    }

    return result;
  } catch (error) {
    if (onError) {
      onError(error);
    } else {
      actions.setError(error);
    }

    if (throwError) {
      throw error;
    }

    return null;
  } finally {
    if (loadingKey) {
      actions.setLoading(false);
    }
  }
};

// Middleware for state management
export const createStateMiddleware = (middlewares = []) => {
  return (state, action) => {
    return middlewares.reduce(
      (acc, middleware) => {
        return middleware(acc, action);
      },
      { state, action }
    );
  };
};

// Logging middleware
export const loggingMiddleware = (stateAction, action) => {
  if (process.env.NODE_ENV === 'development') {
    // Use logger instead of console for better control
    const logger = require('./logger').default;
    logger.debug(`Action: ${action.type}`, {
      previousState: stateAction.state,
      action: action
    });
  }
  return stateAction;
};

// Persistence middleware
export const createPersistenceMiddleware = (key, storage = localStorage) => {
  return (stateAction, action) => {
    // Save state to storage after certain actions
    const persistableActions = [
      ActionTypes.SET_DATA,
      ActionTypes.UPDATE_ITEM,
      ActionTypes.ADD_ITEM,
      ActionTypes.REMOVE_ITEM
    ];

    if (persistableActions.includes(action.type)) {
      try {
        storage.setItem(key, JSON.stringify(stateAction.state.data));
      } catch (error) {
        const logger = require('./logger').default;
        logger.error('Failed to persist state:', error);
      }
    }

    return stateAction;
  };
};

export default {
  ActionTypes,
  createAsyncState,
  createListState,
  createAsyncReducer,
  createAsyncActions,
  useAsyncState,
  useListState,
  createStandardContext,
  handleAsyncOperation,
  createStateMiddleware,
  loggingMiddleware,
  createPersistenceMiddleware
};
