/**
 * Testing Utilities
 * Provides utilities to fix flaky tests and improve test reliability
 */

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, renderHook, act } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// Enhanced wait utilities to fix timing issues
export const waitUtils = {
  // Wait for async operations with timeout
  waitForAsync: async (callback, timeout = 5000) => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const result = await callback();
        if (result) return result;
      } catch (error) {
        // Continue waiting unless timeout is reached
        if (Date.now() - startTime >= timeout) {
          throw error;
        }
      }

      // Wait a small amount before trying again
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    throw new Error(`Timeout after ${timeout}ms`);
  },

  // Wait for DOM updates
  waitForDOMUpdate: async () => {
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  },

  // Wait for state updates
  waitForStateUpdate: async (checkFn, timeout = 3000) => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (checkFn()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    throw new Error(`State update timeout after ${timeout}ms`);
  },

  // Debounced wait for rapid changes
  waitForStable: async (checkFn, stableTime = 100, timeout = 3000) => {
    const startTime = Date.now();
    let lastChangeTime = Date.now();
    let lastValue = checkFn();

    while (Date.now() - startTime < timeout) {
      const currentValue = checkFn();

      if (currentValue !== lastValue) {
        lastChangeTime = Date.now();
        lastValue = currentValue;
      }

      // If value has been stable for stableTime, return it
      if (Date.now() - lastChangeTime >= stableTime) {
        return currentValue;
      }

      await new Promise(resolve => setTimeout(resolve, 10));
    }

    throw new Error(`Value did not stabilize within ${timeout}ms`);
  }
};

// Mock utilities for consistent test environment
export const mockUtils = {
  // Mock timers with cleanup
  createMockTimers: () => {
    jest.useFakeTimers();
    return {
      advance: time => jest.advanceTimersByTime(time),
      cleanup: () => jest.useRealTimers()
    };
  },

  // Mock fetch with predictable responses
  createMockFetch: (responses = {}) => {
    const mockFetch = jest.fn();

    Object.entries(responses).forEach(([url, response]) => {
      mockFetch.mockImplementation(input => {
        const url_to_check = typeof input === 'string' ? input : input.url;

        if (url_to_check.includes(url)) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(response),
            text: () => Promise.resolve(JSON.stringify(response))
          });
        }

        return Promise.reject(new Error(`Unmocked fetch: ${url_to_check}`));
      });
    });

    global.fetch = mockFetch;
    return {
      mockFetch,
      cleanup: () => {
        global.fetch = undefined;
        mockFetch.mockRestore();
      }
    };
  },

  // Mock localStorage
  createMockLocalStorage: () => {
    const storage = {};

    const mockLocalStorage = {
      getItem: jest.fn(key => storage[key] || null),
      setItem: jest.fn((key, value) => {
        storage[key] = value;
      }),
      removeItem: jest.fn(key => {
        delete storage[key];
      }),
      clear: jest.fn(() => {
        Object.keys(storage).forEach(key => delete storage[key]);
      })
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    return {
      storage,
      mockLocalStorage,
      cleanup: () => {
        Object.keys(storage).forEach(key => delete storage[key]);
      }
    };
  },

  // Mock window object properties
  mockWindowProperty: (property, value) => {
    const originalProperty = window[property];
    Object.defineProperty(window, property, {
      value,
      writable: true
    });

    return {
      cleanup: () => {
        Object.defineProperty(window, property, {
          value: originalProperty,
          writable: true
        });
      }
    };
  }
};

// Enhanced render utilities
export const renderUtils = {
  // Render with all necessary providers
  renderWithProviders: (ui, options = {}) => {
    const { theme = createTheme(), router = true, ...renderOptions } = options;

    const Providers = ({ children }) => {
      let wrapped = <ThemeProvider theme={theme}>{children}</ThemeProvider>;

      if (router) {
        wrapped = <BrowserRouter>{wrapped}</BrowserRouter>;
      }

      return wrapped;
    };

    return render(ui, { wrapper: Providers, ...renderOptions });
  },

  // Render hook with providers
  renderHookWithProviders: (hook, options = {}) => {
    const { theme = createTheme(), ...hookOptions } = options;

    const wrapper = ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>;

    return renderHook(hook, { wrapper, ...hookOptions });
  }
};

// Test data factories for consistent test data
export const testDataFactories = {
  // Create pond data
  createPond: (overrides = {}) => ({
    _id: 'pond-1',
    name: 'Test Pond',
    size: 1000,
    capacity: 500,
    status: 'Active',
    seasonId: { _id: 'season-1', name: 'Season 1' },
    waterQualityScore: 85,
    growthRate: 1.2,
    feedEfficiency: 1.4,
    ...overrides
  }),

  // Create expense data
  createExpense: (overrides = {}) => ({
    _id: 'expense-1',
    description: 'Test Expense',
    amount: 100,
    date: new Date().toISOString(),
    mainCategory: 'Culture',
    subCategory: 'Feed',
    ...overrides
  }),

  // Create season data
  createSeason: (overrides = {}) => ({
    _id: 'season-1',
    name: 'Season 2024',
    status: 'Active',
    startDate: new Date().toISOString(),
    ...overrides
  }),

  // Create user data
  createUser: (overrides = {}) => ({
    _id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...overrides
  })
};

// Assertion helpers for better test reliability
export const assertionHelpers = {
  // Wait for element to appear
  waitForElement: async (getElement, timeout = 3000) => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const element = getElement();
        if (element) return element;
      } catch (error) {
        // Element not found yet, continue waiting
      }

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    throw new Error(`Element not found within ${timeout}ms`);
  },

  // Assert async conditions
  assertEventually: async (assertion, timeout = 3000) => {
    const startTime = Date.now();
    let lastError;

    while (Date.now() - startTime < timeout) {
      try {
        await assertion();
        return; // Success
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    throw lastError || new Error(`Assertion failed within ${timeout}ms`);
  },

  // Assert with retry for flaky conditions
  assertWithRetry: async (assertion, maxRetries = 3) => {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        await assertion();
        return; // Success
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
        }
      }
    }

    throw lastError;
  }
};

// Test environment setup
export const testSetup = {
  // Setup test environment
  setupTestEnvironment: () => {
    // Mock console methods to reduce noise
    const originalConsole = { ...console };
    console.warn = jest.fn();
    console.error = jest.fn();

    // Mock ResizeObserver
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }));

    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }));

    return {
      cleanup: () => {
        Object.assign(console, originalConsole);
        delete global.ResizeObserver;
        delete global.IntersectionObserver;
      }
    };
  },

  // Setup consistent test time
  setupTestTime: (date = '2024-01-01T00:00:00.000Z') => {
    const fixedDate = new Date(date);
    const originalDate = Date;

    global.Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          return fixedDate;
        }
        return new originalDate(...args);
      }

      static now() {
        return fixedDate.getTime();
      }
    };

    return {
      cleanup: () => {
        global.Date = originalDate;
      }
    };
  }
};

// Performance testing utilities
export const performanceUtils = {
  // Measure render time
  measureRenderTime: async renderFn => {
    const start = performance.now();
    const result = await renderFn();
    const end = performance.now();

    return {
      result,
      renderTime: end - start
    };
  },

  // Test for memory leaks
  detectMemoryLeaks: testFn => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;

    return {
      run: async () => {
        await testFn();

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }

        const finalMemory = performance.memory?.usedJSHeapSize || 0;
        const memoryIncrease = finalMemory - initialMemory;

        return {
          initialMemory,
          finalMemory,
          memoryIncrease,
          hasLeak: memoryIncrease > 1024 * 1024 // 1MB threshold
        };
      }
    };
  }
};

export default {
  waitUtils,
  mockUtils,
  renderUtils,
  testDataFactories,
  assertionHelpers,
  testSetup,
  performanceUtils
};
