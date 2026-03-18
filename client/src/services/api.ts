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
export const createNurseryBatch = (nurseryData) => apiCall('/nursery-batches', 'POST', nurseryData);
export const updateNurseryBatch = (id, nurseryData) => apiCall(`/nursery-batches/${id}`, 'PUT', nurseryData);
export const deleteNurseryBatch = (id) => apiCall(`/nursery-batches/${id}`, 'DELETE');

// Event API calls
export const getEvents = () => apiCall('/events');
export const getEventById = (id) => apiCall(`/events/${id}`);
export const getEventsByPondId = (pondId) => apiCall(`/events/pond/${pondId}`);
export const getEventsBySeasonId = (seasonId) => apiCall(`/events/season/${seasonId}`);
export const getEventsByDateRange = (startDate, endDate) => 
  apiCall(`/events/date-range?startDate=${startDate}&endDate=${endDate}`);
export const createEvent = (eventData: any) => apiCall<any>('/events', 'POST', eventData);
export const updateEvent = (id: string, eventData: any) => apiCall<any>(`/events/${id}`, 'PUT', eventData);
export const deleteEvent = (id: string) => apiCall<{message: string}>(`/events/${id}`, 'DELETE');

// Expense API calls
export const getExpenses = (seasonId?: string, pondId?: string) => {
  let url = '/expenses?';
  if (seasonId) url += `seasonId=${seasonId}&`;
  if (pondId) url += `pondId=${pondId}`;
  return apiCall<any[]>(url);
};
export const getExpenseById = (id: string) => apiCall<any>(`/expenses/${id}`);
export const createExpense = (expenseData: any) => apiCall<any>('/expenses', 'POST', expenseData);
export const updateExpense = (id: string, expenseData: any) => apiCall<any>(`/expenses/${id}`, 'PUT', expenseData);
export const deleteExpense = (id: string) => apiCall<{message: string}>(`/expenses/${id}`, 'DELETE');

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
export const deleteHarvest = (id: string) => apiCall<{message: string}>(`/harvests/${id}`, 'DELETE');

// Sale API calls
export const getSales = () => apiCall<any[]>('/sales');
export const getSaleById = (id: string) => apiCall<any>(`/sales/${id}`);
export const createSale = (saleData: any) => apiCall<any>('/sales', 'POST', saleData);
export const deleteSale = (id: string) => apiCall<{message: string}>(`/sales/${id}`, 'DELETE');

// Health Logs API calls
export const getHealthLogs = (seasonId?: string, pondId?: string) => {
  let url = '/health-logs?';
  if (seasonId) url += `seasonId=${seasonId}&`;
  if (pondId) url += `pondId=${pondId}`;
  return apiCall<any[]>(url);
};
export const createHealthLog = (data: any) => apiCall<any>('/health-logs', 'POST', data);
export const updateHealthLog = (id: string, data: any) => apiCall<any>(`/health-logs/${id}`, 'PUT', data);
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
export const markNotificationAsRead = (id: string) => apiCall<any>(`/notifications/${id}/read`, 'PUT');
export const markAllNotificationsAsRead = () => apiCall<any>('/notifications/read-all', 'PUT');

// Alert Rules API calls
export const getAlertRules = () => apiCall<any[]>('/alert-rules');
export const createAlertRule = (data: any) => apiCall<any>('/alert-rules', 'POST', data);
export const updateAlertRule = (id: string, data: any) => apiCall<any>(`/alert-rules/${id}`, 'PUT', data);
export const deleteAlertRule = (id: string) => apiCall<any>(`/alert-rules/${id}`, 'DELETE');