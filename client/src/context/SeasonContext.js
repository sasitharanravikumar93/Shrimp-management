import PropTypes from 'prop-types';
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

import { getSeasons } from '../services/api';
import { createAsyncReducer, createAsyncActions, createAsyncState } from '../utils/stateManagement';

const SeasonContext = createContext();

// Custom actions for season-specific functionality
const seasonActions = {
  SELECT_SEASON: 'SELECT_SEASON',
  SET_DEFAULT_SEASON: 'SET_DEFAULT_SEASON'
};

// Enhanced reducer with season-specific actions
const seasonReducer = createAsyncReducer({
  [seasonActions.SELECT_SEASON]: (state, action) => ({
    ...state,
    selectedSeason: action.payload
  }),
  [seasonActions.SET_DEFAULT_SEASON]: (state, action) => {
    if (!state.selectedSeason && state.data && state.data.length > 0) {
      // Find the active season or use the first one
      const activeSeason = state.data.find(season => season.status === 'Active') || state.data[0];
      return {
        ...state,
        selectedSeason: activeSeason
      };
    }
    return state;
  }
});

export const useSeason = () => {
  const context = useContext(SeasonContext);
  if (!context) {
    throw new Error('useSeason must be used within a SeasonProvider');
  }
  return context;
};

export const SeasonProvider = ({ children }) => {
  const [state, dispatch] = useReducer(seasonReducer, {
    ...createAsyncState([]),
    selectedSeason: null
  });

  const actions = createAsyncActions(dispatch);

  // Enhanced actions for season management
  const selectSeason = useCallback(season => {
    dispatch({ type: seasonActions.SELECT_SEASON, payload: season });
  }, []);

  const fetchSeasons = useCallback(async () => {
    actions.setLoading(true);
    try {
      const data = await getSeasons();
      actions.setData(data);
      // Set default season after data is loaded
      dispatch({ type: seasonActions.SET_DEFAULT_SEASON });
    } catch (err) {
      actions.setError(err);
    }
  }, [actions]);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  // Context value with standardized state structure
  const contextValue = {
    seasons: state.data,
    selectedSeason: state.selectedSeason,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    // Actions
    selectSeason,
    setSelectedSeason: selectSeason, // Backward compatibility
    refetchSeasons: fetchSeasons,
    ...actions
  };

  return <SeasonContext.Provider value={contextValue}>{children}</SeasonContext.Provider>;
};

SeasonProvider.propTypes = {
  children: PropTypes.node.isRequired
};
