// Global test setup for both unit and integration tests
const path = require('path');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_SALT_ROUNDS = '10';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Increase test timeout for integration tests
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Helper to wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to generate random test data
  randomString: (length = 8) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Helper to generate test dates
  testDate: (daysOffset = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date;
  }
};

// Global cleanup handlers
let cleanupHandlers = [];

global.addCleanupHandler = (handler) => {
  cleanupHandlers.push(handler);
};

// Run cleanup after each test
afterEach(async () => {
  for (const handler of cleanupHandlers) {
    try {
      await handler();
    } catch (error) {
      console.error('Cleanup handler failed:', error);
    }
  }
  cleanupHandlers = [];
});

// Mock external services that should not be called during tests
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  }))
}));

// Mock file system operations for tests
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  unlinkSync: jest.fn(),
  existsSync: jest.fn(() => true)
}));

// Custom matchers for better test assertions
expect.extend({
  toBeValidObjectId(received) {
    const mongoose = require('mongoose');
    const pass = mongoose.Types.ObjectId.isValid(received);

    if (pass) {
      return {
        message: () => `Expected ${received} not to be a valid ObjectId`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected ${received} to be a valid ObjectId`,
        pass: false
      };
    }
  },

  toBeWithinRange(received, min, max) {
    const pass = received >= min && received <= max;

    if (pass) {
      return {
        message: () => `Expected ${received} not to be within range ${min}-${max}`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected ${received} to be within range ${min}-${max}`,
        pass: false
      };
    }
  },

  toHaveValidationError(received, field) {
    const hasError = received.body &&
      received.body.error &&
      received.body.error.includes(field);

    if (hasError) {
      return {
        message: () => `Expected response not to have validation error for ${field}`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected response to have validation error for ${field}`,
        pass: false
      };
    }
  }
});

// Console output control for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress expected error logs during tests
  console.error = (message, ...args) => {
    if (typeof message === 'string' && (
      message.includes('Cast to ObjectId failed') ||
      message.includes('ValidationError') ||
      message.includes('Expected') // Jest error messages
    )) {
      return; // Suppress expected validation errors
    }
    originalConsoleError(message, ...args);
  };

  console.warn = (message, ...args) => {
    if (typeof message === 'string' && (
      message.includes('deprecated') ||
      message.includes('warning')
    )) {
      return; // Suppress deprecation warnings
    }
    originalConsoleWarn(message, ...args);
  };
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process during tests
});

// Export configuration for tests that need it
module.exports = {
  testConfig: {
    timeout: 30000,
    retries: 1
  }
};
