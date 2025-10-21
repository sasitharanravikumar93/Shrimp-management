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

  // Memoize actions to prevent infinite re-renders
  const actions = React.useMemo(() => createAsyncActions(dispatch), [dispatch]);

  // Enhanced actions for season management
  const selectSeason = useCallback(season => {
    dispatch({ type: seasonActions.SELECT_SEASON, payload: season });
  }, []);

  const fetchSeasons = useCallback(async () => {
    // Dispatch loading state
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await getSeasons();
      console.log('SeasonContext: API Response:', response);
      // Dispatch data - extract the data array from the API response
      dispatch({ type: 'SET_DATA', payload: response.data || [] });
      // Set default season after data is loaded
      dispatch({ type: seasonActions.SET_DEFAULT_SEASON });
    } catch (err) {
      console.error('SeasonContext: API Error:', err);
      // Dispatch error
      dispatch({ type: 'SET_ERROR', payload: err });
    }
  }, []); // No dependencies - won't cause infinite loop

  // Only run once on mount, and if there's an error, allow manual refetch
  useEffect(() => {
    console.log('SeasonContext: useEffect triggered');
    console.log('SeasonContext: state.data:', state.data);
    console.log('SeasonContext: state.error:', state.error);
    if ((!state.data || state.data.length === 0) && !state.error) {
      console.log('SeasonContext: Fetching seasons...');
      fetchSeasons();
    }
  }, []); // Empty dependency array - only run once on mount

  // Debug selectedSeason
  useEffect(() => {
    console.log('SeasonContext: selectedSeason changed:', state.selectedSeason);
  }, [state.selectedSeason]);

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
