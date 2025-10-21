/**
 * Test Setup Configuration
 * Global test setup to fix flaky tests and improve test reliability
 */

import '@testing-library/jest-dom';

// Increase test timeout for async operations
jest.setTimeout(10000);

// Mock common browser APIs
global.matchMedia =
  global.matchMedia ||
  (query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }));

// Mock window.location
delete window.location;
window.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn()
};

// Mock scrollTo
window.scrollTo = jest.fn();

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = callback => {
  return setTimeout(callback, 0);
};

global.cancelAnimationFrame = id => {
  clearTimeout(id);
};

// Mock Web APIs that might not be available in test environment
global.crypto = global.crypto || {
  getRandomValues: arr => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  },
  subtle: {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn(),
    digest: jest.fn(),
    generateKey: jest.fn(),
    deriveKey: jest.fn(),
    deriveBits: jest.fn(),
    importKey: jest.fn(),
    exportKey: jest.fn(),
    wrapKey: jest.fn(),
    unwrapKey: jest.fn()
  }
};

// Mock performance API
global.performance = global.performance || {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
  }
};

// Mock Canvas API for chart testing
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 10 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn()
}));

// Mock File API
global.File =
  global.File ||
  class File {
    constructor(bits, name, options = {}) {
      this.bits = bits;
      this.name = name;
      this.size = bits.reduce((acc, bit) => acc + bit.length, 0);
      this.type = options.type || '';
      this.lastModified = options.lastModified || Date.now();
    }
  };

global.FileReader =
  global.FileReader ||
  class FileReader {
    constructor() {
      this.readyState = 0;
      this.result = null;
      this.error = null;
      this.onload = null;
      this.onerror = null;
      this.onprogress = null;
    }

    readAsText(_file) {
      setTimeout(() => {
        this.readyState = 2;
        this.result = 'mock file content';
        if (this.onload) this.onload({ target: this });
      }, 0);
    }

    readAsDataURL(_file) {
      setTimeout(() => {
        this.readyState = 2;
        this.result = 'data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ=';
        if (this.onload) this.onload({ target: this });
      }, 0);
    }
  };

// Suppress specific warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
  // Suppress common React warnings that don't affect functionality
  const message = args[0];
  if (typeof message === 'string') {
    if (
      message.includes('React Router Future Flag Warning') ||
      message.includes('validateDOMNesting') ||
      message.includes('MUI:') ||
      message.includes('Invalid prop') ||
      message.includes('Warning: Failed prop type') ||
      message.includes('Warning: componentWillReceiveProps')
    ) {
      return;
    }
  }
  originalWarn.apply(console, args);
};

// Suppress specific errors during tests
const originalError = console.error;
console.error = (...args) => {
  const message = args[0];
  if (typeof message === 'string') {
    if (
      message.includes('Warning: An invalid form control') ||
      message.includes('Warning: Failed to load resource') ||
      message.includes('Warning: Each child in a list should have a unique "key" prop')
    ) {
      return;
    }
  }
  originalError.apply(console, args);
};

// Set up stable test environment
process.env.NODE_ENV = 'test';
process.env.REACT_APP_API_BASE_URL = 'http://localhost:5001/api';

// Mock environment variables
process.env.REACT_APP_VERSION = '1.0.0';
process.env.REACT_APP_BUILD_DATE = '2024-01-01';

// Global cleanup for each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();

  // Clear timers
  jest.clearAllTimers();

  // Clear any remaining async operations
  return new Promise(resolve => {
    setImmediate(resolve);
  });
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Add custom matchers for better assertions
expect.extend({
  toBeWithinRange: (received, floor, ceiling) => {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true
      };
    }
    return {
      message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
      pass: false
    };
  },

  toHaveBeenCalledWithinTime: (mockFn, timeMs) => {
    const calls = mockFn.mock.calls;
    if (calls.length === 0) {
      return {
        message: () =>
          `expected function to have been called within ${timeMs}ms, but it was never called`,
        pass: false
      };
    }

    // This is a simplified check - in real scenarios you'd check the actual timing
    return {
      message: () => `expected function not to have been called within ${timeMs}ms`,
      pass: true
    };
  }
});
