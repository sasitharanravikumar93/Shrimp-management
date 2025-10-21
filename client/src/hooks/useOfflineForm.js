import { useState, useCallback } from 'react';

import { useOfflineSync } from '../context/OfflineSyncContext';

/**
 * Custom hook for handling form submissions with offline support
 * @param {string} endpoint - API endpoint for form submission
 * @param {string} method - HTTP method (POST, PUT, DELETE)
 * @param {Function} onSuccess - Callback function for successful submission
 * @param {Function} onError - Callback function for error handling
 */
const useOfflineForm = (endpoint, method, onSuccess, onError) => {
  const { isOnline, addToQueue } = useOfflineSync();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  /**
   * Submit form data
   * @param {any} data - Form data to submit
   * @param {string} identifier - Unique identifier for the record
   */
  const submit = useCallback(
    async (data, identifier) => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        if (isOnline) {
          // Online: Submit directly to API
          const url = `${
            process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api'
          }${endpoint}`;

          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });

          if (response.ok) {
            const result = await response.json();
            onSuccess && onSuccess(result);
            return result;
          }
          const error = await response.json();
          throw new Error(error.message || 'Submission failed');
        } else {
          // Offline: Queue for later sync
          await addToQueue(endpoint, method, data, identifier);
          onSuccess &&
            onSuccess({
              message: 'Data saved offline. Will be synced when online.',
              offline: true,
              data
            });
          return {
            message: 'Data saved offline. Will be synced when online.',
            offline: true,
            data
          };
        }
      } catch (error) {
        setSubmitError(error.message);
        onError && onError(error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [endpoint, method, isOnline, addToQueue, onSuccess, onError]
  );

  return {
    submit,
    isSubmitting,
    submitError,
    isOnline
  };
};

export default useOfflineForm;
