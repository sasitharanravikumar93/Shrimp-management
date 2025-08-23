// api.js
const API_BASE_URL = 'http://localhost:5001/api';

// Helper function for API calls with better error handling
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If parsing fails, use the raw text if it's not empty
        if (errorText.trim()) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Season API calls
export const getSeasons = () => apiCall('/seasons');
export const getSeasonById = (id) => apiCall(`/seasons/${id}`);
export const createSeason = (seasonData) => apiCall('/seasons', 'POST', seasonData);
export const updateSeason = (id, seasonData) => apiCall(`/seasons/${id}`, 'PUT', seasonData);
export const deleteSeason = (id) => apiCall(`/seasons/${id}`, 'DELETE');
export const copyPondDetails = (sourceSeasonId, targetSeasonId) => 
  apiCall('/seasons/copy-ponds', 'POST', { sourceSeasonId, targetSeasonId });

// Pond API calls
export const getPonds = () => apiCall('/ponds');
export const getPondById = (id) => apiCall(`/ponds/${id}`);
export const getPondsBySeasonId = (seasonId) => apiCall(`/ponds/season/${seasonId}`);
export const createPond = (pondData) => apiCall('/ponds', 'POST', pondData);
export const updatePond = (id, pondData) => apiCall(`/ponds/${id}`, 'PUT', pondData);
export const deletePond = (id) => apiCall(`/ponds/${id}`, 'DELETE');

// Feed Input API calls
export const getFeedInputs = () => apiCall('/feed-inputs');
export const getFeedInputById = (id) => apiCall(`/feed-inputs/${id}`);
export const getFeedInputsByPondId = (pondId) => apiCall(`/feed-inputs/pond/${pondId}`);
export const getFeedInputsByDateRange = (startDate, endDate) => 
  apiCall(`/feed-inputs/date-range?startDate=${startDate}&endDate=${endDate}`);
export const createFeedInput = (feedData) => apiCall('/feed-inputs', 'POST', feedData);
export const updateFeedInput = (id, feedData) => apiCall(`/feed-inputs/${id}`, 'PUT', feedData);
export const deleteFeedInput = (id) => apiCall(`/feed-inputs/${id}`, 'DELETE');

// Growth Sampling API calls
export const getGrowthSamplings = () => apiCall('/growth-samplings');
export const getGrowthSamplingById = (id) => apiCall(`/growth-samplings/${id}`);
export const getGrowthSamplingsByPondId = (pondId) => apiCall(`/growth-samplings/pond/${pondId}`);
export const getGrowthSamplingsByDateRange = (startDate, endDate) => 
  apiCall(`/growth-samplings/date-range?startDate=${startDate}&endDate=${endDate}`);
export const createGrowthSampling = (growthData) => apiCall('/growth-samplings', 'POST', growthData);
export const updateGrowthSampling = (id, growthData) => apiCall(`/growth-samplings/${id}`, 'PUT', growthData);
export const deleteGrowthSampling = (id) => apiCall(`/growth-samplings/${id}`, 'DELETE');

// Water Quality Input API calls
export const getWaterQualityInputs = () => apiCall('/water-quality-inputs');
export const getWaterQualityInputById = (id) => apiCall(`/water-quality-inputs/${id}`);
export const getWaterQualityInputsByPondId = (pondId) => apiCall(`/water-quality-inputs/pond/${pondId}`);
export const getWaterQualityInputsByDateRange = (startDate, endDate) => 
  apiCall(`/water-quality-inputs/date-range?startDate=${startDate}&endDate=${endDate}`);
export const createWaterQualityInput = (waterQualityData) => 
  apiCall('/water-quality-inputs', 'POST', waterQualityData);
export const updateWaterQualityInput = (id, waterQualityData) => 
  apiCall(`/water-quality-inputs/${id}`, 'PUT', waterQualityData);
export const deleteWaterQualityInput = (id) => apiCall(`/water-quality-inputs/${id}`, 'DELETE');

// Nursery Batch API calls
export const getNurseryBatches = () => apiCall('/nursery-batches');
export const getNurseryBatchById = (id) => apiCall(`/nursery-batches/${id}`);
export const getNurseryBatchesBySeasonId = (seasonId) => apiCall(`/nursery-batches/season/${seasonId}`);
export const getEventsForNurseryBatch = (id) => apiCall(`/nursery-batches/${id}/events`);
export const createNurseryBatch = (nurseryData) => apiCall('/nursery-batches', 'POST', nurseryData);
export const updateNurseryBatch = (id, nurseryData) => apiCall(`/nursery-batches/${id}`, 'PUT', nurseryData);
export const deleteNurseryBatch = (id) => apiCall(`/nursery-batches/${id}`, 'DELETE');

// Inventory API calls
export const getInventoryItems = (seasonId) => {
  const params = new URLSearchParams();
  if (seasonId) params.append('seasonId', seasonId);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiCall(`/inventory-items${queryString}`);
};

export const getInventoryItemById = (id, seasonId) => {
  const params = new URLSearchParams();
  if (seasonId) params.append('seasonId', seasonId);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiCall(`/inventory-items/${id}${queryString}`);
};

export const getInventoryItemsByType = (itemType, seasonId) => {
  const params = new URLSearchParams();
  params.append('itemType', itemType);
  if (seasonId) params.append('seasonId', seasonId);
  return apiCall(`/inventory-items?${params.toString()}`);
};

export const createInventoryItem = (inventoryData, seasonId) => {
  const params = new URLSearchParams();
  if (seasonId) params.append('seasonId', seasonId);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiCall(`/inventory-items${queryString}`, 'POST', inventoryData);
};

export const updateInventoryItem = (id, inventoryData, seasonId) => {
  const params = new URLSearchParams();
  if (seasonId) params.append('seasonId', seasonId);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiCall(`/inventory-items/${id}${queryString}`, 'PUT', inventoryData);
};

export const deleteInventoryItem = (id, seasonId) => {
  const params = new URLSearchParams();
  if (seasonId) params.append('seasonId', seasonId);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiCall(`/inventory-items/${id}${queryString}`, 'DELETE');
};

export const getInventoryAdjustments = (itemId, seasonId) => {
  const params = new URLSearchParams();
  if (seasonId) params.append('seasonId', seasonId);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiCall(`/inventory-items/${itemId}/adjustments${queryString}`);
};

// Event API calls
export const getEvents = () => apiCall('/events');
export const getEventById = (id) => apiCall(`/events/${id}`);
export const getEventsByPondId = (pondId) => apiCall(`/events/pond/${pondId}`);
export const getEventsByNurseryBatchId = (nurseryBatchId) => apiCall(`/events/nursery/${nurseryBatchId}`);
export const getEventsBySeasonId = (seasonId) => apiCall(`/events/season/${seasonId}`);
export const getEventsByDateRange = (startDate, endDate) => 
  apiCall(`/events/date-range?startDate=${startDate}&endDate=${endDate}`);
export const createEvent = (eventData) => apiCall('/events', 'POST', eventData);
export const updateEvent = (id, eventData) => apiCall(`/events/${id}`, 'PUT', eventData);
export const deleteEvent = (id) => apiCall(`/events/${id}`, 'DELETE');

// Historical Insights API calls
export const getHistoricalSeasons = () => apiCall('/historical-insights/seasons');
export const getHistoricalPondsForCurrentSeason = () => apiCall('/historical-insights/ponds/current');
export const getHistoricalPondsBySeasonId = (seasonId) => apiCall(`/historical-insights/ponds/season/${seasonId}`);
export const comparePondsCurrentSeason = (comparisonData) => apiCall('/historical-insights/compare/current', 'POST', comparisonData);
export const comparePondsHistorical = (comparisonData) => apiCall('/historical-insights/compare/historical', 'POST', comparisonData);
export const exportComparisonData = (exportData) => apiCall('/historical-insights/export', 'POST', exportData);