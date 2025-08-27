import localforage from 'localforage';

import logger from './logger';

// Initialize localForage
const offlineStore = localforage.createInstance({
  name: 'ShrimpFarmManagement',
  storeName: 'offlineData'
});

// Queue for offline data
const syncQueue = localforage.createInstance({
  name: 'ShrimpFarmManagement',
  storeName: 'syncQueue'
});

/**
 * Save data locally when offline
 * @param {string} key - Unique key for the data
 * @param {any} data - Data to save
 */
export const saveOfflineData = async (key, data) => {
  try {
    await offlineStore.setItem(key, data);
    return true;
  } catch (error) {
    logger.error('Error saving offline data:', error);
    return false;
  }
};

/**
 * Get offline data by key
 * @param {string} key - Key of the data to retrieve
 */
export const getOfflineData = async key => {
  try {
    return await offlineStore.getItem(key);
  } catch (error) {
    logger.error('Error retrieving offline data:', error);
    return null;
  }
};

/**
 * Remove offline data by key
 * @param {string} key - Key of the data to remove
 */
export const removeOfflineData = async key => {
  try {
    await offlineStore.removeItem(key);
    return true;
  } catch (error) {
    logger.error('Error removing offline data:', error);
    return false;
  }
};

/**
 * Add data to sync queue
 * @param {string} endpoint - API endpoint to sync to
 * @param {string} method - HTTP method (POST, PUT, DELETE)
 * @param {any} data - Data to sync
 * @param {string} identifier - Unique identifier for the record
 */
export const addToSyncQueue = async (endpoint, method, data, identifier) => {
  try {
    const queueItem = {
      id: Date.now() + Math.random(), // Unique ID for the queue item
      endpoint,
      method,
      data,
      identifier,
      timestamp: new Date().toISOString()
    };

    await syncQueue.setItem(queueItem.id.toString(), queueItem);
    return queueItem.id;
  } catch (error) {
    logger.error('Error adding to sync queue:', error);
    return null;
  }
};

/**
 * Process sync queue when online
 * @param {Function} apiCall - Function to make API calls
 */
export const processSyncQueue = async apiCall => {
  try {
    const keys = await syncQueue.keys();

    if (keys.length === 0) {
      logger.info('Sync queue is empty');
      return { success: true, processed: 0, failed: 0 };
    }

    logger.info(`Processing ${keys.length} items in sync queue`);

    let processed = 0;
    let failed = 0;

    for (const key of keys) {
      try {
        const item = await syncQueue.getItem(key);

        if (!item) continue;

        // Make API call
        const response = await apiCall(item.endpoint, item.method, item.data);

        if (response.ok) {
          // Remove from queue on success
          await syncQueue.removeItem(key);
          processed++;
          logger.info(`Successfully synced item ${item.id}`);
        } else {
          // Keep in queue on failure
          failed++;
          logger.error(`Failed to sync item ${item.id}:`, response.status, response.statusText);
        }
      } catch (error) {
        failed++;
        logger.error(`Error processing sync item ${key}:`, error);
      }
    }

    return { success: true, processed, failed };
  } catch (error) {
    logger.error('Error processing sync queue:', error);
    return { success: false, processed: 0, failed: 0, error: error.message };
  }
};

/**
 * Get all items in sync queue
 */
export const getSyncQueueItems = async () => {
  try {
    const keys = await syncQueue.keys();
    const items = [];

    for (const key of keys) {
      const item = await syncQueue.getItem(key);
      if (item) items.push(item);
    }

    return items;
  } catch (error) {
    logger.error('Error getting sync queue items:', error);
    return [];
  }
};

/**
 * Clear sync queue
 */
export const clearSyncQueue = async () => {
  try {
    await syncQueue.clear();
    return true;
  } catch (error) {
    logger.error('Error clearing sync queue:', error);
    return false;
  }
};

const offlineSync = {
  saveOfflineData,
  getOfflineData,
  removeOfflineData,
  addToSyncQueue,
  processSyncQueue,
  getSyncQueueItems,
  clearSyncQueue
};

export default offlineSync;
