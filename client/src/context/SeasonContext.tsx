import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode
} from 'react';

import { getSeasons } from '../services/api';
import { createAsyncReducer, createAsyncActions, createAsyncState } from '../utils/stateManagement';

interface Season {
  id: string;
  _id?: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Inactive' | 'Planning';
}

interface SeasonState {
  data: Season[];
  loading: boolean;
  error: string | null;
  selectedSeason: Season | null;
  lastUpdated: string | null;
}

interface SeasonContextValue {
  seasons: Season[];
  selectedSeason: Season | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  selectSeason: (season: Season) => void;
  setSelectedSeason: (season: Season) => void;
  refetchSeasons: () => Promise<void>;
  refreshSeasons: () => Promise<void>;
  [key: string]: any; // For other actions from createAsyncActions
}

const SeasonContext = createContext<SeasonContextValue | undefined>(undefined);

// Custom actions for season-specific functionality
const seasonActions = {
  SELECT_SEASON: 'SELECT_SEASON',
  SET_DEFAULT_SEASON: 'SET_DEFAULT_SEASON'
};

// Enhanced reducer with season-specific actions
const seasonReducer = createAsyncReducer({
  [seasonActions.SELECT_SEASON]: (state: SeasonState, action: any) => ({
    ...state,
    selectedSeason: action.payload
  }),
  [seasonActions.SET_DEFAULT_SEASON]: (state: SeasonState) => {
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

interface SeasonProviderProps {
  children: ReactNode;
}

export const SeasonProvider: React.FC<SeasonProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(seasonReducer, {
    ...createAsyncState([]),
    selectedSeason: null
  });

  // Memoize actions to prevent infinite re-renders
  const actions = React.useMemo(() => createAsyncActions(dispatch), [dispatch]);

  // Enhanced actions for season management
  const selectSeason = useCallback((season: Season) => {
    dispatch({ type: seasonActions.SELECT_SEASON, payload: season });
  }, []);

  const fetchSeasons = useCallback(async () => {
    // Dispatch loading state
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await getSeasons();
      // Dispatch data
      dispatch({ type: 'SET_DATA', payload: response || [] });
      // Set default season after data is loaded
      dispatch({ type: seasonActions.SET_DEFAULT_SEASON });
    } catch (err: any) {
      console.error('SeasonContext: API Error:', err);
      // Dispatch error
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to fetch seasons' });
    }
  }, []);

  // Only run once on mount
  useEffect(() => {
    if ((!state.data || state.data.length === 0) && !state.error) {
      fetchSeasons();
    }
  }, [fetchSeasons, state.data, state.error]);

  // Context value with standardized state structure
  const contextValue: SeasonContextValue = {
    seasons: state.data,
    selectedSeason: state.selectedSeason,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    // Actions
    selectSeason,
    setSelectedSeason: selectSeason, // Backward compatibility
    refetchSeasons: fetchSeasons,
    refreshSeasons: fetchSeasons,
    ...actions
  };

  return <SeasonContext.Provider value={contextValue}>{children}</SeasonContext.Provider>;
};
