import { useApiData, useApiMutation } from '../hooks/useApi';
import { 
  getHistoricalSeasons, 
  getHistoricalPondsForCurrentSeason, 
  getHistoricalPondsBySeasonId,
  comparePondsCurrentSeason,
  comparePondsHistorical,
  exportComparisonData
} from '../services/api';

// Custom hook for fetching available seasons for historical comparison
export const useHistoricalSeasons = (dependencies = []) => {
  return useApiData(getHistoricalSeasons, dependencies, 'historical-seasons');
};

// Custom hook for fetching ponds for current season
export const useHistoricalPondsForCurrentSeason = (dependencies = []) => {
  return useApiData(getHistoricalPondsForCurrentSeason, dependencies, 'historical-ponds-current');
};

// Custom hook for fetching ponds for a specific season
export const useHistoricalPondsBySeason = (seasonId, dependencies = []) => {
  // Don't fetch if seasonId is empty
  const shouldFetch = seasonId && seasonId !== '';
  return useApiData(
    shouldFetch ? () => getHistoricalPondsBySeasonId(seasonId) : null, 
    dependencies, 
    `historical-ponds-${seasonId}`
  );
};

// Custom hook for comparing ponds in current season (with date range)
export const usePondComparisonCurrentSeason = () => {
  return useApiMutation(comparePondsCurrentSeason);
};

// Custom hook for comparing ponds historically (without date range)
export const usePondComparisonHistorical = () => {
  return useApiMutation(comparePondsHistorical);
};

// Custom hook for exporting comparison data
export const useExportComparison = () => {
  return useApiMutation(exportComparisonData);
};