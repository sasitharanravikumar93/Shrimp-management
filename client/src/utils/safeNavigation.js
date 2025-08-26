/**
 * Safe Navigation Utilities
 * Provides safe navigation methods that catch errors and provide fallbacks
 */

import logger from './logger';

/**
 * Safely navigate to a path using React Router or fallback to window.location
 * @param {Function} navigate - React Router navigate function
 * @param {string} path - The path to navigate to
 * @param {Object} options - Navigation options
 */
export const safeNavigate = (navigate, path, options = {}) => {
  try {
    // First try React Router navigation
    if (navigate && typeof navigate === 'function') {
      navigate(path, options);
    } else {
      // Fallback to window.location
      safeFallbackNavigation(path);
    }
  } catch (navError) {
    logger.error('React Router navigation failed:', navError);
    // Fallback to window.location
    safeFallbackNavigation(path);
  }
};

/**
 * Safe fallback navigation using window.location
 * @param {string} path - The path to navigate to
 */
export const safeFallbackNavigation = path => {
  try {
    const fullPath = path.startsWith('/') ? window.location.origin + path : path;
    // Avoid self-assignment by checking if we're already at the path
    if (window.location.href !== fullPath) {
      window.location.href = fullPath;
    }
  } catch (locationError) {
    logger.error('Window.location navigation failed:', locationError);
    // Ultimate fallback - reload current page
    try {
      window.location.reload();
    } catch (reloadError) {
      logger.error('Page reload failed:', reloadError);
      // Last resort - try to redirect to origin
      window.location.replace(window.location.origin);
    }
  }
};

/**
 * Safely reload the current page
 * @param {boolean} forceReload - Whether to force reload from server
 */
export const safeReload = (forceReload = false) => {
  try {
    if (forceReload) {
      // Force reload from server
      window.location.reload(true);
    } else {
      // Standard reload
      window.location.reload();
    }
  } catch (reloadError) {
    logger.error('Page reload failed:', reloadError);
    // Fallback to replace with current URL
    try {
      window.location.replace(window.location.href);
    } catch (replaceError) {
      logger.error('URL replace failed:', replaceError);
      // Last resort
      window.location.href = window.location.href;
    }
  }
};

/**
 * Safely navigate to the home page
 */
export const safeNavigateHome = () => {
  try {
    // Avoid self-assignment by checking if we're already at home
    if (window.location.href !== `${window.location.origin}/`) {
      window.location.replace(window.location.origin);
    }
  } catch (homeError) {
    logger.error('Home navigation failed:', homeError);
    try {
      window.location.href = window.location.origin;
    } catch (fallbackError) {
      logger.error('Fallback home navigation failed:', fallbackError);
      window.location.reload();
    }
  }
};

/**
 * Safely execute a function with error catching
 * @param {Function} fn - The function to execute
 * @param {Function} fallback - Fallback function to execute if main function fails
 * @param {string} errorMessage - Custom error message for logging
 */
export const safeExecute = (fn, fallback, errorMessage = 'Function execution failed') => {
  try {
    if (fn && typeof fn === 'function') {
      return fn();
    } else if (fallback && typeof fallback === 'function') {
      return fallback();
    }
  } catch (executeError) {
    logger.error(`${errorMessage}:`, executeError);
    if (fallback && typeof fallback === 'function') {
      try {
        return fallback();
      } catch (fallbackError) {
        logger.error('Fallback function also failed:', fallbackError);
      }
    }
  }
  return null;
};

/**
 * Create a safe wrapper for navigation functions
 * @param {Function} navigate - React Router navigate function
 * @returns {Object} Safe navigation methods
 */
export const createSafeNavigator = navigate => ({
  goTo: (path, options) => safeNavigate(navigate, path, options),
  goHome: () => safeNavigateHome(),
  reload: force => safeReload(force),
  back: () =>
    safeExecute(
      () => {
        if (navigate) {
          navigate(-1);
        } else {
          window.history.back();
        }
      },
      () => window.history.back(),
      'Navigate back failed'
    )
});

const safeNavigation = {
  safeNavigate,
  safeFallbackNavigation,
  safeReload,
  safeNavigateHome,
  safeExecute,
  createSafeNavigator
};

export default safeNavigation;
