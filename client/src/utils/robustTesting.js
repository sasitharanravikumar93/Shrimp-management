/**
 * Robust Testing Strategies
 * Utilities and patterns to create more reliable, non-brittle tests
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const DEFAULT_WAIT_TIMEOUT = 3000; // milliseconds
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 100; // milliseconds

// Robust selectors that don't rely on implementation details
export const robustSelectors = {
  // Semantic selectors (preferred)
  byRole: (role, options = {}) => ({
    get: () => screen.getByRole(role, options),
    query: () => screen.queryByRole(role, options),
    find: () => screen.findByRole(role, options),
    getAll: () => screen.getAllByRole(role, options),
    queryAll: () => screen.queryAllByRole(role, options),
    findAll: () => screen.findAllByRole(role, options)
  }),

  // Accessible name selectors
  byLabelText: (text, options = {}) => ({
    get: () => screen.getByLabelText(text, options),
    query: () => screen.queryByLabelText(text, options),
    find: () => screen.findByLabelText(text, options)
  }),

  // Text content selectors (with flexible matching)
  byText: (text, options = {}) => {
    const flexibleOptions = {
      exact: false,
      ...options
    };

    return {
      get: () => screen.getByText(text, flexibleOptions),
      query: () => screen.queryByText(text, flexibleOptions),
      find: () => screen.findByText(text, flexibleOptions),
      getAll: () => screen.getAllByText(text, flexibleOptions),
      queryAll: () => screen.queryAllByText(text, flexibleOptions),
      findAll: () => screen.findAllByText(text, flexibleOptions)
    };
  },

  // Test ID selectors (for specific testing needs)
  byTestId: testId => ({
    get: () => screen.getByTestId(testId),
    query: () => screen.queryByTestId(testId),
    find: () => screen.findByTestId(testId),
    getAll: () => screen.getAllByTestId(testId),
    queryAll: () => screen.queryAllByTestId(testId),
    findAll: () => screen.findAllByTestId(testId)
  }),

  // Compound selectors for complex scenarios
  byAriaLabel: label => ({
    get: () => screen.getByLabelText(label),
    query: () => screen.queryByLabelText(label),
    find: () => screen.findByLabelText(label)
  }),

  // Form field selectors
  formField: name => ({
    get: () => screen.getByDisplayValue(name) || screen.getByLabelText(name),
    query: () => screen.queryByDisplayValue(name) || screen.queryByLabelText(name)
  })
};

// Robust assertions that are less likely to break
export const robustAssertions = {
  // Content assertions that handle whitespace and formatting
  hasTextContent: (element, expectedText, options = {}) => {
    const { exact = false, trim = true } = options;
    const actualText = trim ? element.textContent.trim() : element.textContent;

    if (exact) {
      expect(actualText).toBe(expectedText);
    } else {
      expect(actualText).toContain(expectedText);
    }
  },

  // Visibility assertions that handle different visibility states
  isVisible: element => {
    expect(element).toBeInTheDocument();
    expect(element).toBeVisible();

    // Additional checks for actual visibility
    const style = window.getComputedStyle(element);
    expect(style.display).not.toBe('none');
    expect(style.visibility).not.toBe('hidden');
    expect(style.opacity).not.toBe('0');
  },

  // Accessibility assertions
  isAccessible: (element, role, label) => {
    if (role) {
      expect(element).toHaveAttribute('role', role);
    }
    if (label) {
      expect(element).toHaveAccessibleName(label);
    }

    // Check for basic accessibility attributes
    const tagName = element.tagName.toLowerCase();
    if (['input', 'textarea', 'select'].includes(tagName)) {
      const id = element.getAttribute('id');
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledBy = element.getAttribute('aria-labelledby');

      expect(id || ariaLabel || ariaLabelledBy).toBeTruthy();
    }
  },

  // State assertions that handle async state changes
  hasState: async (element, expectedState, timeout = DEFAULT_WAIT_TIMEOUT) => {
    await waitFor(
      () => {
        switch (expectedState) {
          case 'loading':
            expect(element).toHaveAttribute('aria-busy', 'true');
            break;
          case 'disabled':
            expect(element).toBeDisabled();
            break;
          case 'enabled':
            expect(element).toBeEnabled();
            break;
          case 'selected':
            expect(element).toHaveAttribute('aria-selected', 'true');
            break;
          case 'expanded':
            expect(element).toHaveAttribute('aria-expanded', 'true');
            break;
          case 'collapsed':
            expect(element).toHaveAttribute('aria-expanded', 'false');
            break;
          default:
            throw new Error(`Unknown state: ${expectedState}`);
        }
      },
      { timeout }
    );
  },

  // Error state assertions
  hasError: (element, errorMessage) => {
    expect(element).toHaveAttribute('aria-invalid', 'true');

    if (errorMessage) {
      const errorId = element.getAttribute('aria-describedby');
      if (errorId) {
        const errorElement = document.getElementById(errorId);
        expect(errorElement).toHaveTextContent(errorMessage);
      }
    }
  },

  // Value assertions for form fields
  hasValue: (element, expectedValue) => {
    const tagName = element.tagName.toLowerCase();

    if (tagName === 'input' || tagName === 'textarea') {
      expect(element).toHaveValue(expectedValue);
    } else if (tagName === 'select') {
      expect(element).toHaveValue(expectedValue);
    } else {
      expect(element).toHaveTextContent(expectedValue);
    }
  }
};

// Robust user interactions that handle timing and state
export const robustInteractions = {
  // Click with proper waiting and error handling
  click: async (element, options = {}) => {
    const { waitForEnable = true, timeout = DEFAULT_WAIT_TIMEOUT } = options;

    if (waitForEnable) {
      await waitFor(
        () => {
          expect(element).toBeEnabled();
        },
        { timeout }
      );
    }

    const user = userEvent.setup();
    await user.click(element);
  },

  // Type with proper clearing and validation
  type: async (element, text, options = {}) => {
    const { clear = true, validate = true } = options;

    const user = userEvent.setup();

    if (clear) {
      await user.clear(element);
    }

    await user.type(element, text);

    if (validate) {
      await waitFor(() => {
        expect(element).toHaveValue(text);
      });
    }
  },

  // Select with proper option handling
  select: async (element, value, options = {}) => {
    const { waitForOptions = true } = options;

    const user = userEvent.setup();

    if (waitForOptions) {
      await waitFor(() => {
        const option = within(element).getByDisplayValue(value);
        expect(option).toBeInTheDocument();
      });
    }

    await user.selectOptions(element, value);

    await waitFor(() => {
      expect(element).toHaveValue(value);
    });
  },

  // Form submission with validation
  submitForm: async (form, options = {}) => {
    const { waitForSubmit = true, expectSuccess = true } = options;

    const user = userEvent.setup();

    // Find submit button or use form submission
    const submitButton = within(form).queryByRole('button', { name: /submit|save|create/i });

    if (submitButton) {
      await robustInteractions.click(submitButton);
    } else {
      await user.keyboard('{Enter}');
    }

    if (waitForSubmit && expectSuccess) {
      await waitFor(() => {
        // Check for success indicators
        const successMessage = screen.queryByText(/success|saved|created/i);
        const errorMessage = screen.queryByText(/error|failed/i);

        if (expectSuccess) {
          expect(successMessage || !errorMessage).toBeTruthy();
        }
      });
    }
  }
};

// Test data builders for consistent test data
export const testDataBuilders = {
  // User builder with sensible defaults
  user: (overrides = {}) => ({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    isActive: true,
    createdAt: new Date().toISOString(),
    ...overrides
  }),

  // Pond builder
  pond: (overrides = {}) => ({
    _id: '1',
    name: 'Test Pond',
    size: 1000,
    capacity: 500,
    status: 'Active',
    location: 'Test Location',
    waterQuality: {
      pH: 7.0,
      temperature: 28.5,
      dissolvedOxygen: 6.2
    },
    ...overrides
  }),

  // Form data builder
  formData: (fields = {}) => {
    const defaultFields = {
      name: 'Test Name',
      email: 'test@example.com',
      phone: '123-456-7890',
      date: new Date().toISOString().split('T')[0]
    };

    return { ...defaultFields, ...fields };
  },

  // API response builder
  apiResponse: (data, overrides = {}) => ({
    success: true,
    data,
    message: 'Success',
    timestamp: new Date().toISOString(),
    ...overrides
  }),

  // Error response builder
  errorResponse: (message = 'An error occurred', overrides = {}) => ({
    success: false,
    error: {
      message,
      code: 'GENERIC_ERROR',
      details: {}
    },
    timestamp: new Date().toISOString(),
    ...overrides
  })
};

// Page object patterns for complex interactions
export const createPageObject = containerSelector => {
  const getContainer = () => {
    if (containerSelector) {
      return screen.getByTestId(containerSelector);
    }
    return document.body;
  };

  return {
    // Find elements within the page/component
    find: {
      byRole: (role, options) => within(getContainer()).getByRole(role, options),
      byText: (text, options) => within(getContainer()).getByText(text, options),
      byTestId: testId => within(getContainer()).getByTestId(testId),
      byLabelText: label => within(getContainer()).getByLabelText(label)
    },

    // Query elements (returns null if not found)
    query: {
      byRole: (role, options) => within(getContainer()).queryByRole(role, options),
      byText: (text, options) => within(getContainer()).queryByText(text, options),
      byTestId: testId => within(getContainer()).queryByTestId(testId),
      byLabelText: label => within(getContainer()).queryByLabelText(label)
    },

    // Wait for elements to appear
    waitFor: {
      byRole: (role, options) => within(getContainer()).findByRole(role, options),
      byText: (text, options) => within(getContainer()).findByText(text, options),
      byTestId: testId => within(getContainer()).findByTestId(testId),
      byLabelText: label => within(getContainer()).findByLabelText(label)
    },

    // Complex interactions
    fillForm: async formData => {
      const container = getContainer();

      for (const [field, value] of Object.entries(formData)) {
        const input = within(container).getByLabelText(new RegExp(field, 'i'));
        // eslint-disable-next-line no-await-in-loop
        await robustInteractions.type(input, String(value));
      }
    },

    submitForm: async () => {
      const container = getContainer();
      const form = within(container).getByRole('form') || container.querySelector('form');

      if (form) {
        await robustInteractions.submitForm(form);
      }
    },

    // Assertions specific to this page/component
    assertVisible: () => {
      expect(getContainer()).toBeInTheDocument();
      expect(getContainer()).toBeVisible();
    },

    assertLoading: () => {
      const container = getContainer();
      const loadingIndicator =
        within(container).queryByRole('status') || within(container).queryByText(/loading|Loading/);
      expect(loadingIndicator).toBeInTheDocument();
    },

    assertError: errorMessage => {
      const container = getContainer();
      const errorElement =
        within(container).getByRole('alert') || within(container).getByText(/error/i);
      expect(errorElement).toBeInTheDocument();

      if (errorMessage) {
        expect(errorElement).toHaveTextContent(errorMessage);
      }
    }
  };
};

// Retry mechanisms for flaky assertions
export const retryAssertion = async (
  assertion,
  maxRetries = DEFAULT_MAX_RETRIES,
  delay = DEFAULT_RETRY_DELAY
) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await assertion();
      return; // Success
    } catch (error) {
      lastError = error;

      if (i < maxRetries - 1) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
};

const robustTesting = {
  robustSelectors,
  robustAssertions,
  robustInteractions,
  testDataBuilders,
  createPageObject,
  retryAssertion
};

export default robustTesting;
