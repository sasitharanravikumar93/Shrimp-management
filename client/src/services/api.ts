// api.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

// Validate API base URL on startup
if (!process.env.REACT_APP_API_BASE_URL) {
  console.warn('REACT_APP_API_BASE_URL environment variable not set, using default localhost');
}

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Helper function for API calls with better error handling
const apiCall = async <T = any>(
  endpoint: string,
  method: string = 'GET',
  data: any = null
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // In development mode, we might not need authentication
  // This will be handled by the server-side bypass
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
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
      return (await response.json()) as T;
    }

    return (await response.text()) as unknown as T;
  } catch (error: any) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('api-error', {
          detail: error.message || 'We could not complete your request due to a server error.'
        })
      );
    }
    console.error('API call failed centrally:', error);
    throw error;
  }
};

// Season API calls
export const getSeasons = () => apiCall<any[]>('/seasons');
export const getSeasonById = (id: string) => apiCall<any>(`/seasons/${id}`);
export const createSeason = (seasonData: any) => apiCall<any>('/seasons', 'POST', seasonData);
export const updateSeason = (id: string, seasonData: any) =>
  apiCall<any>(`/seasons/${id}`, 'PUT', seasonData);
export const deleteSeason = (id: string) => apiCall<any>(`/seasons/${id}`, 'DELETE');
export const copyPondDetails = (sourceSeasonId: string, targetSeasonId: string) =>
  apiCall<any>('/seasons/copy-ponds', 'POST', { sourceSeasonId, targetSeasonId });

// Pond API calls
export const getPonds = () => apiCall<any[]>('/ponds');
export const getPondById = (id: string) => apiCall<any>(`/ponds/${id}`);
export const getPondsBySeasonId = (seasonId: string) => apiCall<any[]>(`/ponds/season/${seasonId}`);
export const createPond = (pondData: any) => apiCall<any>('/ponds', 'POST', pondData);
export const updatePond = (id: string, pondData: any) =>
  apiCall<any>(`/ponds/${id}`, 'PUT', pondData);
export const deletePond = (id: string) => apiCall<any>(`/ponds/${id}`, 'DELETE');

// Feed Input API calls
export const getFeedInputs = () => apiCall<any[]>('/feed-inputs');
export const getFeedInputById = (id: string) => apiCall<any>(`/feed-inputs/${id}`);
export const getFeedInputsByPondId = (pondId: string) =>
  apiCall<any[]>(`/feed-inputs/pond/${pondId}`);
export const getFeedInputsByDateRange = (startDate: string, endDate: string) =>
  apiCall<any[]>(`/feed-inputs/date-range?startDate=${startDate}&endDate=${endDate}`);
export const createFeedInput = (feedData: any) => apiCall<any>('/feed-inputs', 'POST', feedData);
export const updateFeedInput = (id: string, feedData: any) =>
  apiCall<any>(`/feed-inputs/${id}`, 'PUT', feedData);
export const deleteFeedInput = (id: string) => apiCall<any>(`/feed-inputs/${id}`, 'DELETE');

// Growth Sampling API calls
export const getGrowthSamplings = () => apiCall<any[]>('/growth-samplings');
export const getGrowthSamplingById = (id: string) => apiCall<any>(`/growth-samplings/${id}`);
export const getGrowthSamplingsByPondId = (pondId: string) =>
  apiCall<any[]>(`/growth-samplings/pond/${pondId}`);
export const getGrowthSamplingsByDateRange = (startDate: string, endDate: string) =>
  apiCall<any[]>(`/growth-samplings/date-range?startDate=${startDate}&endDate=${endDate}`);
export const createGrowthSampling = (growthData: any) =>
  apiCall<any>('/growth-samplings', 'POST', growthData);
export const updateGrowthSampling = (id: string, growthData: any) =>
  apiCall<any>(`/growth-samplings/${id}`, 'PUT', growthData);
export const deleteGrowthSampling = (id: string) =>
  apiCall<any>(`/growth-samplings/${id}`, 'DELETE');

// Water Quality Input API calls
export const getWaterQualityInputs = () => apiCall<any[]>('/water-quality-inputs');
export const getWaterQualityInputById = (id: string) => apiCall<any>(`/water-quality-inputs/${id}`);
export const getWaterQualityInputsByPondId = (pondId: string) =>
  apiCall<any[]>(`/water-quality-inputs/pond/${pondId}`);
export const getWaterQualityInputsByDateRange = (startDate: string, endDate: string) =>
  apiCall<any[]>(`/water-quality-inputs/date-range?startDate=${startDate}&endDate=${endDate}`);
export const createWaterQualityInput = (waterQualityData: any) =>
  apiCall<any>('/water-quality-inputs', 'POST', waterQualityData);
export const updateWaterQualityInput = (id: string, waterQualityData: any) =>
  apiCall<any>(`/water-quality-inputs/${id}`, 'PUT', waterQualityData);
export const deleteWaterQualityInput = (id: string) =>
  apiCall<any>(`/water-quality-inputs/${id}`, 'DELETE');

// Nursery Batch API calls
export const getNurseryBatches = () => apiCall<any[]>('/nursery-batches');
export const getNurseryBatchById = (id: string) => apiCall<any>(`/nursery-batches/${id}`);
export const getNurseryBatchesBySeasonId = (seasonId: string) =>
  apiCall<any[]>(`/nursery-batches/season/${seasonId}`);
export const getEventsForNurseryBatch = (id: string) =>
  apiCall<any[]>(`/nursery-batches/${id}/events`);
export const createNurseryBatch = (nurseryData: any) =>
  apiCall<any>('/nursery-batches', 'POST', nurseryData);
export const updateNurseryBatch = (id: string, nurseryData: any) =>
  apiCall<any>(`/nursery-batches/${id}`, 'PUT', nurseryData);
export const deleteNurseryBatch = (id: string) => apiCall<any>(`/nursery-batches/${id}`, 'DELETE');

// Inventory API calls
export const getInventoryItems = (seasonId?: string) => {
  const params = new URLSearchParams();
  if (seasonId) params.append('seasonId', seasonId);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiCall<any[]>(`/inventory-items${queryString}`);
};

export const getInventoryItemById = (id: string, seasonId?: string) => {
  const params = new URLSearchParams();
  if (seasonId) params.append('seasonId', seasonId);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiCall<any>(`/inventory-items/${id}${queryString}`);
};

export const getInventoryItemsByType = (itemType: string, seasonId?: string) => {
  const params = new URLSearchParams();
  params.append('itemType', itemType);
  if (seasonId) params.append('seasonId', seasonId);
  return apiCall<any[]>(`/inventory-items?${params.toString()}`);
};

export const createInventoryItem = (inventoryData: any, seasonId?: string) => {
  const params = new URLSearchParams();
  if (seasonId) params.append('seasonId', seasonId);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiCall<any>(`/inventory-items${queryString}`, 'POST', inventoryData);
};

export const updateInventoryItem = (id: string, inventoryData: any, seasonId?: string) => {
  const params = new URLSearchParams();
  if (seasonId) params.append('seasonId', seasonId);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiCall<any>(`/inventory-items/${id}${queryString}`, 'PUT', inventoryData);
};

export const deleteInventoryItem = (id: string, seasonId?: string) => {
  const params = new URLSearchParams();
  if (seasonId) params.append('seasonId', seasonId);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiCall<any>(`/inventory-items/${id}${queryString}`, 'DELETE');
};

export const getInventoryAdjustments = (itemId: string, seasonId?: string) => {
  const params = new URLSearchParams();
  if (seasonId) params.append('seasonId', seasonId);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiCall<any[]>(`/inventory-items/${itemId}/adjustments${queryString}`);
};

// Event API calls
export const getEvents = () => apiCall<any[]>('/events');
export const getEventById = (id: string) => apiCall<any>(`/events/${id}`);
export const getEventsByPondId = (pondId: string) => apiCall<any[]>(`/events/pond/${pondId}`);
export const getEventsByNurseryBatchId = (nurseryBatchId: string) =>
  apiCall<any[]>(`/events/nursery/${nurseryBatchId}`);
export const getEventsBySeasonId = (seasonId: string) =>
  apiCall<any[]>(`/events/season/${seasonId}`);
export const getEventsByDateRange = (startDate: string, endDate: string) =>
  apiCall<any[]>(`/events/date-range?startDate=${startDate}&endDate=${endDate}`);
export const createEvent = (eventData: any) => apiCall<any>('/events', 'POST', eventData);
export const updateEvent = (id: string, eventData: any) =>
  apiCall<any>(`/events/${id}`, 'PUT', eventData);
export const deleteEvent = (id: string) => apiCall<{ message: string }>(`/events/${id}`, 'DELETE');

// Employee API calls
export const getEmployees = () => apiCall<any[]>('/employees');
export const createEmployee = (employeeData: any) =>
  apiCall<any>('/employees', 'POST', employeeData);
export const updateEmployee = (id: string, employeeData: any) =>
  apiCall<any>(`/employees/${id}`, 'PATCH', employeeData);
export const deleteEmployee = (id: string) => apiCall<any>(`/employees/${id}`, 'DELETE');

// Expense API calls
export const getExpenses = (filters: any = {}) => {
  const params = new URLSearchParams(filters);
  return apiCall<any[]>(`/expenses?${params.toString()}`);
};
export const getExpenseById = (id: string) => apiCall<any>(`/expenses/${id}`);
export const getExpenseSummary = (seasonId: string) =>
  apiCall<any>(`/expenses/summary?seasonId=${seasonId}`);
export const createExpense = (expenseData: any) => apiCall<any>('/expenses', 'POST', expenseData);
export const updateExpense = (id: string, expenseData: any) =>
  apiCall<any>(`/expenses/${id}`, 'PATCH', expenseData);
export const deleteExpense = (id: string) =>
  apiCall<{ message: string }>(`/expenses/${id}`, 'DELETE');

// Finance API calls
export const getFinancialSummary = (seasonId?: string, pondId?: string) => {
  let url = '/finance/summary?';
  if (seasonId) url += `seasonId=${seasonId}&`;
  if (pondId) url += `pondId=${pondId}`;
  return apiCall<any>(url);
};

export const getProfitAndLoss = (seasonId: string) => {
  return apiCall<any>(`/finance/pnl?seasonId=${seasonId}`);
};

// Harvest API calls
export const getHarvests = (seasonId?: string, pondId?: string) => {
  let url = '/harvests?';
  if (seasonId) url += `seasonId=${seasonId}&`;
  if (pondId) url += `pondId=${pondId}`;
  return apiCall<any[]>(url);
};
export const getHarvestById = (id: string) => apiCall<any>(`/harvests/${id}`);
export const createHarvest = (harvestData: any) => apiCall<any>('/harvests', 'POST', harvestData);
export const deleteHarvest = (id: string) =>
  apiCall<{ message: string }>(`/harvests/${id}`, 'DELETE');

// Sale API calls
export const getSales = () => apiCall<any[]>('/sales');
export const getSaleById = (id: string) => apiCall<any>(`/sales/${id}`);
export const createSale = (saleData: any) => apiCall<any>('/sales', 'POST', saleData);
export const deleteSale = (id: string) => apiCall<{ message: string }>(`/sales/${id}`, 'DELETE');

// Health Logs API calls
export const getHealthLogs = (seasonId?: string, pondId?: string) => {
  let url = '/health-logs?';
  if (seasonId) url += `seasonId=${seasonId}&`;
  if (pondId) url += `pondId=${pondId}`;
  return apiCall<any[]>(url);
};
export const createHealthLog = (data: any) => apiCall<any>('/health-logs', 'POST', data);
export const updateHealthLog = (id: string, data: any) =>
  apiCall<any>(`/health-logs/${id}`, 'PUT', data);
export const deleteHealthLog = (id: string) => apiCall<any>(`/health-logs/${id}`, 'DELETE');

// Tasks API calls
export const getTasks = (seasonId?: string, pondId?: string, completed?: boolean) => {
  let url = '/tasks?';
  if (seasonId) url += `seasonId=${seasonId}&`;
  if (pondId) url += `pondId=${pondId}&`;
  if (completed !== undefined) url += `completed=${completed}`;
  return apiCall<any[]>(url);
};
export const createTask = (data: any) => apiCall<any>('/tasks', 'POST', data);
export const updateTask = (id: string, data: any) => apiCall<any>(`/tasks/${id}`, 'PUT', data);
export const deleteTask = (id: string) => apiCall<any>(`/tasks/${id}`, 'DELETE');

// Notifications API calls
export const getNotifications = (unreadOnly = false, pondId?: string) => {
  let url = `/notifications?unread=${unreadOnly}`;
  if (pondId) url += `&pondId=${pondId}`;
  return apiCall<any[]>(url);
};
export const markNotificationAsRead = (id: string) =>
  apiCall<any>(`/notifications/${id}/read`, 'PUT');
export const markAllNotificationsAsRead = () => apiCall<any>('/notifications/read-all', 'PUT');

// Alert Rules API calls
export const getAlertRules = () => apiCall<any[]>('/alert-rules');
export const createAlertRule = (data: any) => apiCall<any>('/alert-rules', 'POST', data);
export const updateAlertRule = (id: string, data: any) =>
  apiCall<any>(`/alert-rules/${id}`, 'PUT', data);
export const deleteAlertRule = (id: string) => apiCall<any>(`/alert-rules/${id}`, 'DELETE');

// Historical Insights API calls
export const getHistoricalSeasons = () => apiCall<any[]>('/historical-insights/seasons');
export const getHistoricalPondsForCurrentSeason = () =>
  apiCall<any[]>('/historical-insights/ponds/current');
export const getHistoricalPondsBySeasonId = (seasonId: string) =>
  apiCall<any[]>(`/historical-insights/ponds/season/${seasonId}`);
export const comparePondsCurrentSeason = (comparisonData: any) =>
  apiCall<any>('/historical-insights/compare/current', 'POST', comparisonData);
export const comparePondsHistorical = (comparisonData: any) =>
  apiCall<any>('/historical-insights/compare/historical', 'POST', comparisonData);
export const exportComparisonData = (exportData: any) =>
  apiCall<any>('/historical-insights/export', 'POST', exportData);
