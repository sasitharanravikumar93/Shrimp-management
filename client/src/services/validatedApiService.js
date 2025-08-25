/**
 * Validated API Service
 *
 * This service demonstrates how to integrate data validation with API calls,
 * ensuring all data coming from and going to the server is properly validated.
 *
 * Features:
 * - Automatic request/response validation
 * - Schema-based data validation
 * - Error handling and recovery
 * - Performance monitoring
 * - Caching with validation
 * - Retry logic with validation
 */

import { useApiValidation } from '../hooks/useDataValidation';
import {
  validateApiResponse,
  validateFormData,
  ValidationError,
  createValidationMiddleware
} from '../utils/dataValidation';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

class ValidatedApiService {
  constructor() {
    this.cache = new Map();
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  /**
   * Make validated API request
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      data = null,
      schema = null,
      validateRequest = true,
      validateResponse = true,
      useCache = method === 'GET',
      retries = this.retryAttempts
    } = options;

    // Generate cache key
    const cacheKey = `${method}:${endpoint}:${JSON.stringify(data)}`;

    // Check cache for GET requests
    if (useCache && this.cache.has(cacheKey)) {
      const cachedData = this.cache.get(cacheKey);
      const now = Date.now();

      if (now - cachedData.timestamp < 5 * 60 * 1000) {
        // 5 minutes cache
        console.log(`📋 Cache hit for ${endpoint}`);
        return cachedData.data;
      }
    }

    let attempt = 0;
    let lastError;

    while (attempt <= retries) {
      try {
        // Validate request data
        if (validateRequest && data && schema) {
          console.log(`🔍 Validating request data for ${endpoint}`);
          const validatedData = validateFormData(data, schema);
          data = validatedData.data;
        }

        // Make API request
        console.log(
          `🌐 API Request: ${method} ${endpoint}${attempt > 0 ? ` (retry ${attempt})` : ''}`
        );

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          body: data ? JSON.stringify(data) : undefined
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        let responseData = await response.json();

        // Validate response data
        if (validateResponse && schema) {
          console.log(`✅ Validating response data for ${endpoint}`);

          const validationResult = validateApiResponse(responseData, schema);

          if (!validationResult.isValid) {
            console.error('❌ Response validation failed:', validationResult.errors);

            // Try to use the original data if validation fails but we want to be lenient
            if (options.lenientValidation) {
              console.warn('⚠️  Using unvalidated data due to lenient mode');
              // Log but don't throw
            } else {
              throw new ValidationError('Response validation failed', validationResult.errors);
            }
          } else {
            responseData = validationResult.data;

            if (validationResult.warnings.length > 0) {
              console.warn('⚠️  Response validation warnings:', validationResult.warnings);
            }
          }
        }

        // Cache successful responses
        if (useCache && method === 'GET') {
          this.cache.set(cacheKey, {
            data: responseData,
            timestamp: Date.now()
          });
        }

        console.log(`✅ API Request successful: ${method} ${endpoint}`);
        return responseData;
      } catch (error) {
        lastError = error;
        attempt++;

        if (attempt <= retries && this.isRetryableError(error)) {
          console.warn(
            `🔄 Retrying request ${attempt}/${retries} for ${endpoint}: ${error.message}`
          );
          await this.delay(this.retryDelay * attempt);
        } else {
          break;
        }
      }
    }

    console.error(`❌ API Request failed after ${attempt} attempts: ${endpoint}`, lastError);
    throw lastError;
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    if (error instanceof ValidationError) {
      return false; // Don't retry validation errors
    }

    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout')
    );
  }

  /**
   * Delay function for retries
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  // ===================
  // EXPENSE API METHODS
  // ===================

  async getExpenses(seasonId) {
    return this.request(`/expenses?seasonId=${seasonId}`, {
      schema: 'Expense',
      validateResponse: true
    });
  }

  async createExpense(expenseData) {
    return this.request('/expenses', {
      method: 'POST',
      data: expenseData,
      schema: 'Expense',
      validateRequest: true,
      validateResponse: true
    });
  }

  async updateExpense(id, expenseData) {
    return this.request(`/expenses/${id}`, {
      method: 'PUT',
      data: expenseData,
      schema: 'Expense',
      validateRequest: true,
      validateResponse: true
    });
  }

  async deleteExpense(id) {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE',
      validateResponse: false
    });
  }

  // ===================
  // POND API METHODS
  // ===================

  async getPonds() {
    return this.request('/ponds', {
      schema: 'Pond',
      validateResponse: true,
      useCache: true
    });
  }

  async createPond(pondData) {
    return this.request('/ponds', {
      method: 'POST',
      data: pondData,
      schema: 'Pond',
      validateRequest: true,
      validateResponse: true
    });
  }

  async updatePond(id, pondData) {
    return this.request(`/ponds/${id}`, {
      method: 'PUT',
      data: pondData,
      schema: 'Pond',
      validateRequest: true,
      validateResponse: true
    });
  }

  // ===================
  // INVENTORY API METHODS
  // ===================

  async getInventoryItems(seasonId) {
    return this.request(`/inventory-items?seasonId=${seasonId}`, {
      schema: 'InventoryItem',
      validateResponse: true
    });
  }

  async createInventoryItem(itemData) {
    return this.request('/inventory-items', {
      method: 'POST',
      data: itemData,
      schema: 'InventoryItem',
      validateRequest: true,
      validateResponse: true
    });
  }

  async updateInventoryItem(id, itemData) {
    return this.request(`/inventory-items/${id}`, {
      method: 'PUT',
      data: itemData,
      schema: 'InventoryItem',
      validateRequest: true,
      validateResponse: true
    });
  }

  // ===================
  // WATER QUALITY API METHODS
  // ===================

  async getWaterQualityReadings(pondId, dateRange = {}) {
    const params = new URLSearchParams({
      pondId,
      ...dateRange
    });

    return this.request(`/water-quality?${params}`, {
      schema: 'WaterQuality',
      validateResponse: true
    });
  }

  async createWaterQualityReading(readingData) {
    return this.request('/water-quality', {
      method: 'POST',
      data: readingData,
      schema: 'WaterQuality',
      validateRequest: true,
      validateResponse: true
    });
  }

  // ===================
  // USER API METHODS
  // ===================

  async getUsers() {
    return this.request('/users', {
      schema: 'User',
      validateResponse: true,
      useCache: true
    });
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      data: userData,
      schema: 'User',
      validateRequest: true,
      validateResponse: true
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      data: userData,
      schema: 'User',
      validateRequest: true,
      validateResponse: true
    });
  }

  // ===================
  // BULK OPERATIONS
  // ===================

  async bulkCreateExpenses(expensesData) {
    // Validate all expenses before sending
    const validationResults = expensesData.map((expense, index) => {
      try {
        return validateFormData(expense, 'Expense');
      } catch (error) {
        throw new ValidationError(`Validation failed for expense ${index + 1}: ${error.message}`);
      }
    });

    const validatedData = validationResults.map(result => result.data);

    return this.request('/expenses/bulk', {
      method: 'POST',
      data: { expenses: validatedData },
      validateResponse: true,
      lenientValidation: true // Some might fail on server side
    });
  }

  // ===================
  // HEALTH CHECK
  // ===================

  async healthCheck() {
    return this.request('/health', {
      validateResponse: false,
      useCache: false,
      retries: 0
    });
  }
}

// Create singleton instance
const validatedApiService = new ValidatedApiService();

// ===================
// REACT HOOK INTEGRATION
// ===================

/**
 * Custom hook for validated API calls
 */
export const useValidatedApi = () => {
  return {
    // Expense operations
    getExpenses: validatedApiService.getExpenses.bind(validatedApiService),
    createExpense: validatedApiService.createExpense.bind(validatedApiService),
    updateExpense: validatedApiService.updateExpense.bind(validatedApiService),
    deleteExpense: validatedApiService.deleteExpense.bind(validatedApiService),

    // Pond operations
    getPonds: validatedApiService.getPonds.bind(validatedApiService),
    createPond: validatedApiService.createPond.bind(validatedApiService),
    updatePond: validatedApiService.updatePond.bind(validatedApiService),

    // Inventory operations
    getInventoryItems: validatedApiService.getInventoryItems.bind(validatedApiService),
    createInventoryItem: validatedApiService.createInventoryItem.bind(validatedApiService),
    updateInventoryItem: validatedApiService.updateInventoryItem.bind(validatedApiService),

    // Water quality operations
    getWaterQualityReadings: validatedApiService.getWaterQualityReadings.bind(validatedApiService),
    createWaterQualityReading:
      validatedApiService.createWaterQualityReading.bind(validatedApiService),

    // User operations
    getUsers: validatedApiService.getUsers.bind(validatedApiService),
    createUser: validatedApiService.createUser.bind(validatedApiService),
    updateUser: validatedApiService.updateUser.bind(validatedApiService),

    // Bulk operations
    bulkCreateExpenses: validatedApiService.bulkCreateExpenses.bind(validatedApiService),

    // Utility operations
    healthCheck: validatedApiService.healthCheck.bind(validatedApiService),
    clearCache: validatedApiService.clearCache.bind(validatedApiService)
  };
};

/**
 * Hook for specific entity validation
 */
export const useEntityValidation = entityType => {
  const { validate } = useApiValidation(entityType);

  return {
    validate,
    validateAndSanitize: data => {
      const result = validate(data);
      if (!result.isValid) {
        throw new ValidationError('Validation failed', result.errors);
      }
      return result.data;
    }
  };
};

/**
 * Error boundary for validation errors
 */
export class ValidationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    if (error instanceof ValidationError) {
      return { hasError: true, error };
    }
    return null;
  }

  componentDidCatch(error, errorInfo) {
    if (error instanceof ValidationError) {
      console.error('Validation Error:', error.errors);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', border: '1px solid red', borderRadius: '4px' }}>
          <h3>Data Validation Error</h3>
          <p>The data received does not match the expected format.</p>
          <details>
            <summary>Error Details</summary>
            <pre>{JSON.stringify(this.state.error.errors, null, 2)}</pre>
          </details>
          <button onClick={() => this.setState({ hasError: false, error: null })}>Try Again</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default validatedApiService;

/**
 * Usage Examples:
 *
 * // In a component
 * const api = useValidatedApi();
 *
 * const handleCreateExpense = async (expenseData) => {
 *   try {
 *     const newExpense = await api.createExpense(expenseData);
 *     console.log('Created expense:', newExpense);
 *   } catch (error) {
 *     if (error instanceof ValidationError) {
 *       console.error('Validation errors:', error.errors);
 *     } else {
 *       console.error('API error:', error.message);
 *     }
 *   }
 * };
 *
 * // Wrap your app for validation error handling
 * <ValidationErrorBoundary>
 *   <App />
 * </ValidationErrorBoundary>
 *
 * Benefits:
 * - Automatic validation of all API requests and responses
 * - Consistent error handling across the application
 * - Data sanitization and type coercion
 * - Performance optimizations with caching
 * - Retry logic with intelligent error detection
 * - Development debugging with detailed validation logs
 * - Type safety and runtime validation
 */
