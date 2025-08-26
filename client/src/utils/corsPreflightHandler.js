/**
 * CORS Preflight Handler
 * Handles CORS preflight failures with retry limits and graceful degradation
 */

import React from 'react';

import logger from './logger';
import { safeNavigateHome } from './safeNavigation';

// Configuration constants
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_BASE = 1000; // 1 second
const MAX_RETRY_DELAY = 8000; // 8 seconds max
const PREFLIGHT_TIMEOUT = 10000; // 10 seconds
const CORS_ERROR_THRESHOLD = 5; // Show error page after 5 consecutive CORS failures
const RESET_TIMEOUT = 300000; // Reset failure count after 5 minutes

// Global state for tracking CORS failures
class CORSFailureTracker {
  constructor() {
    this.failures = new Map(); // endpoint -> failure info
    this.globalFailureCount = 0;
    this.lastResetTime = Date.now();
    this.isInErrorState = false;
    this.isCORSProtectionEnabled = false;
  }

  recordFailure(endpoint, error) {
    const now = Date.now();

    // Reset counts if enough time has passed
    if (now - this.lastResetTime > RESET_TIMEOUT) {
      this.reset();
    }

    const current = this.failures.get(endpoint) || { count: 0, firstFailure: now, lastFailure: 0 };
    current.count += 1;
    current.lastFailure = now;
    current.lastError = error;

    this.failures.set(endpoint, current);
    this.globalFailureCount += 1;

    logger.warn(`CORS failure #${current.count} for ${endpoint}:`, error);

    // Check if we should enter error state
    if (this.globalFailureCount >= CORS_ERROR_THRESHOLD) {
      this.enterErrorState();
    }
  }

  getFailureCount(endpoint) {
    return this.failures.get(endpoint)?.count || 0;
  }

  shouldRetry(endpoint) {
    const failureInfo = this.failures.get(endpoint);
    return !failureInfo || failureInfo.count < MAX_RETRY_ATTEMPTS;
  }

  enterErrorState() {
    if (!this.isInErrorState) {
      this.isInErrorState = true;
      logger.error('CORS Error State: Too many preflight failures, redirecting to error page');
      this.showCORSErrorPage();
    }
  }

  showCORSErrorPage() {
    // Create and show a CORS-specific error overlay
    const errorOverlay = this.createCORSErrorOverlay();
    document.body.appendChild(errorOverlay);
  }

  createCORSErrorOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'cors-error-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    overlay.innerHTML = `
      <div style="
        background: white;
        border-radius: 8px;
        padding: 32px;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      ">
        <div style="color: #d32f2f; font-size: 48px; margin-bottom: 16px;">🌐</div>
        <h2 style="color: #333; margin: 0 0 16px 0;">Connection Problem</h2>
        <p style="color: #666; margin: 0 0 24px 0;">
          We're having trouble connecting to our server. This might be due to:
        </p>
        <ul style="text-align: left; color: #666; margin: 0 0 24px 0;">
          <li>Network connectivity issues</li>
          <li>Server maintenance</li>
          <li>Firewall or security settings</li>
        </ul>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button 
            onclick="window.location.reload()" 
            style="
              background: #1976d2;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            "
          >
            Reload Page
          </button>
          <button 
            onclick="window.corsTracker.goHome()" 
            style="
              background: #666;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            "
          >
            Go Home
          </button>
        </div>
        <p style="color: #999; font-size: 12px; margin: 16px 0 0 0;">
          If this problem persists, please contact support.
        </p>
      </div>
    `;

    return overlay;
  }

  goHome() {
    // Remove error overlay
    const overlay = document.getElementById('cors-error-overlay');
    if (overlay) {
      overlay.remove();
    }
    // Navigate home safely
    safeNavigateHome();
  }

  enableCORSProtection() {
    logger.info('🛡️ CORS protection enabled');
    this.isCORSProtectionEnabled = true;
  }

  reset() {
    this.failures.clear();
    this.globalFailureCount = 0;
    this.lastResetTime = Date.now();
    this.isInErrorState = false;

    // Remove error overlay if present
    const overlay = document.getElementById('cors-error-overlay');
    if (overlay) {
      overlay.remove();
    }

    logger.info('🔄 CORS failure tracking reset');
  }
}

// Global tracker instance
const corsTracker = new CORSFailureTracker();

// Make it available globally for the error overlay
if (typeof window !== 'undefined') {
  window.corsTracker = corsTracker;
}

/**
 * Calculate exponential backoff delay
 */
const calculateBackoffDelay = retryCount => {
  return Math.min(RETRY_DELAY_BASE * Math.pow(2, retryCount - 1), MAX_RETRY_DELAY);
};

/**
 * Check if error is CORS-related
 */
const isCORSError = error => {
  return (
    (error.name === 'TypeError' && error.message.includes('fetch')) ||
    error.message.includes('CORS') ||
    error.message.includes('preflight') ||
    error.message.includes('cross-origin') ||
    error.name === 'AbortError' ||
    error.message.includes('Network request failed')
  );
};

/**
 * Enhanced fetch wrapper that handles CORS preflight failures
 */
export const corsAwareFetch = async (url, options = {}) => {
  const endpoint = url.toString();
  const method = options.method || 'GET';

  // Skip tracking for simple requests that don't trigger preflight
  const triggersPreflightRequest =
    (method !== 'GET' && method !== 'HEAD' && method !== 'POST') ||
    (options.headers &&
      Object.keys(options.headers).some(
        header =>
          !['accept', 'accept-language', 'content-language', 'content-type'].includes(
            header.toLowerCase()
          )
      ));

  let retryCount = 0;
  let lastError = null;

  while (retryCount <= MAX_RETRY_ATTEMPTS) {
    try {
      // Check if we should even attempt this request
      if (corsTracker.isInErrorState) {
        throw new Error('CORS Error State: Too many preflight failures');
      }

      if (retryCount > 0 && !corsTracker.shouldRetry(endpoint)) {
        throw new Error(`Max CORS retries exceeded for ${endpoint}`);
      }

      // Add timeout to detect hanging preflight requests
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => {
        timeoutController.abort();
      }, PREFLIGHT_TIMEOUT);

      const fetchOptions = {
        ...options,
        signal: timeoutController.signal
      };

      const response = await fetch(url, fetchOptions);

      // Clear timeout if request succeeded
      clearTimeout(timeoutId);

      // Request succeeded, reset failure count for this endpoint
      if (corsTracker.failures.has(endpoint)) {
        corsTracker.failures.delete(endpoint);
      }

      return response;
    } catch (error) {
      lastError = error;

      // Check if this is a CORS-related error
      if (isCORSError(error) && triggersPreflightRequest) {
        corsTracker.recordFailure(endpoint, error);

        retryCount++;

        const shouldRetry = retryCount <= MAX_RETRY_ATTEMPTS && corsTracker.shouldRetry(endpoint);

        if (shouldRetry) {
          logger.warn(
            `CORS-aware fetch failed for ${endpoint}, retrying (${
              retryCount + 1
            }/${MAX_RETRY_ATTEMPTS}):`,
            error
          );
        }

        if (shouldRetry) {
          // Calculate exponential backoff delay
          const delay = calculateBackoffDelay(retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      // Non-CORS error or max retries exceeded
      throw error;
    }
  }

  throw lastError;
};

/**
 * Wrap the global fetch to use CORS-aware version
 */
export const enableCORSProtection = () => {
  if (typeof window !== 'undefined' && window.fetch) {
    const originalFetch = window.fetch;

    window.fetch = async (url, options) => {
      try {
        return await corsAwareFetch(url, options);
      } catch (error) {
        // If CORS-aware fetch fails, fall back to original fetch for one final attempt
        logger.warn('CORS-aware fetch failed, attempting fallback:', error);
        try {
          return await originalFetch(url, options);
        } catch (fallbackError) {
          // Both failed, throw the original error
          throw error;
        }
      }
    };

    corsTracker.enableCORSProtection();
  }
};

/**
 * Check if current error state should show CORS error page
 */
export const shouldShowCORSErrorPage = () => {
  return corsTracker.isInErrorState;
};

/**
 * Manually reset CORS failure tracking
 */
export const resetCORSFailures = () => {
  corsTracker.reset();
};

/**
 * Get current CORS failure statistics
 */
export const getCORSStats = () => {
  return {
    globalFailureCount: corsTracker.globalFailureCount,
    isInErrorState: corsTracker.isInErrorState,
    endpointFailures: Object.fromEntries(corsTracker.failures),
    timeSinceLastReset: Date.now() - corsTracker.lastResetTime
  };
};

/**
 * Hook for React components to check CORS status
 */
export const useCORSStatus = () => {
  const [isInErrorState, setIsInErrorState] = React.useState(corsTracker.isInErrorState);
  const [failureCount, setFailureCount] = React.useState(corsTracker.globalFailureCount);

  React.useEffect(() => {
    const checkStatus = () => {
      setIsInErrorState(corsTracker.isInErrorState);
      setFailureCount(corsTracker.globalFailureCount);
    };

    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    isInErrorState,
    failureCount,
    reset: resetCORSFailures,
    stats: getCORSStats()
  };
};

export const CorsPreflightHandler = {
  corsAwareFetch,
  enableCORSProtection,
  shouldShowCORSErrorPage,
  resetCORSFailures,
  getCORSStats,
  useCORSStatus
};

export default CorsPreflightHandler;
