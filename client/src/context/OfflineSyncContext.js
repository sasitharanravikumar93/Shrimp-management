import PropTypes from 'prop-types';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

import { processSyncQueue, getSyncQueueItems } from '../utils/offlineSync';

// Create context
const OfflineSyncContext = createContext();

// Provider component
export const OfflineSyncProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load sync queue items
  useEffect(() => {
    const loadSyncQueue = async () => {
      const items = await getSyncQueueItems();
      setSyncQueue(items);
    };

    loadSyncQueue();
  }, []);

  // Process sync queue
  const processQueue = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);

    try {
      // This is a placeholder for the actual API call function
      // In a real implementation, you would pass the actual API call function
      const apiCall = async (endpoint, method, data) => {
        const url = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api'
          }${endpoint}`;

        const options = {
          method,
          headers: {
            'Content-Type': 'application/json'
          }
        };

        if (data) {
          options.body = JSON.stringify(data);
        }

        return await fetch(url, options);
      };

      const result = await processSyncQueue(apiCall);

      if (result.success) {
        // eslint-disable-next-line no-console
        console.log(`Sync completed: ${result.processed} processed, ${result.failed} failed`);

        // Refresh queue items
        const items = await getSyncQueueItems();
        setSyncQueue(items);
      } else {
        console.error('Sync failed:', result.error);
      }
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Process sync queue when coming online
  useEffect(() => {
    if (isOnline && syncQueue.length > 0 && !isSyncing) {
      // Process queue with a delay to ensure connectivity
      const timer = setTimeout(() => {
        processQueue();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, syncQueue, isSyncing, processQueue]);

  // Add item to sync queue
  const addToQueue = async (endpoint, method, data, identifier) => {
    // In a real implementation, you would import and use the addToSyncQueue function
    // For now, we'll just update the local state
    const newItem = {
      id: Date.now() + Math.random(),
      endpoint,
      method,
      data,
      identifier,
      timestamp: new Date().toISOString()
    };

    setSyncQueue(prev => [...prev, newItem]);

    // In a real implementation, you would also call:
    // await addToSyncQueue(endpoint, method, data, identifier);
  };

  // Value for context
  const value = {
    isOnline,
    syncQueue,
    isSyncing,
    processQueue,
    addToQueue
  };

  return <OfflineSyncContext.Provider value={value}>{children}</OfflineSyncContext.Provider>;
};

OfflineSyncProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Hook to use the context
export const useOfflineSync = () => {
  const context = useContext(OfflineSyncContext);

  if (!context) {
    throw new Error('useOfflineSync must be used within an OfflineSyncProvider');
  }

  return context;
};

export default OfflineSyncContext;
