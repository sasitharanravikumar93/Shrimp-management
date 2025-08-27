/**
 * Enhanced Debug Utilities
 * Provides comprehensive debugging tools, error context, and development helpers
 */

import React from 'react';

import { LOG_LEVELS } from './logger';

// ===================
// DEBUG CONFIGURATION
// ===================

const DEBUG_CONFIG = {
  enabled: process.env.NODE_ENV === 'development',
  persistLogs: true,
  maxDebugEntries: 1000,
  enablePerformanceMonitoring: true,
  enableComponentTracking: true,
  enableStateDebugging: true,
  enableNetworkDebugging: true
};

// ===================
// DEBUG STORE
// ===================

class DebugStore {
  constructor() {
    this.entries = [];
    this.componentStates = new Map();
    this.performanceMarks = new Map();
    this.networkCalls = [];
    this.userActions = [];
    this.renderCounts = new Map();
  }

  addEntry(entry) {
    this.entries.push({
      ...entry,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString()
    });

    if (this.entries.length > DEBUG_CONFIG.maxDebugEntries) {
      this.entries.shift();
    }
  }

  getEntries(filter = {}) {
    let filtered = this.entries;

    if (filter.type) {
      filtered = filtered.filter(entry => entry.type === filter.type);
    }

    if (filter.component) {
      filtered = filtered.filter(entry => entry.component === filter.component);
    }

    if (filter.level) {
      filtered = filtered.filter(entry => entry.level >= filter.level);
    }

    return filtered.slice(-filter.limit || 100);
  }

  clear() {
    this.entries = [];
    this.componentStates.clear();
    this.performanceMarks.clear();
    this.networkCalls = [];
    this.userActions = [];
    this.renderCounts.clear();
  }
}

const debugStore = new DebugStore();

// ===================
// COMPONENT DEBUGGER
// ===================

export class ComponentDebugger {
  static trackComponent(componentName, props, state) {
    if (!DEBUG_CONFIG.enabled || !DEBUG_CONFIG.enableComponentTracking) return;

    const componentInfo = {
      type: 'component',
      level: LOG_LEVELS.DEBUG,
      component: componentName,
      data: {
        props: this.sanitizeProps(props),
        state: this.sanitizeState(state),
        renderCount: this.updateRenderCount(componentName)
      }
    };

    debugStore.addEntry(componentInfo);
    debugStore.componentStates.set(componentName, componentInfo.data);
  }

  static trackStateChange(componentName, prevState, newState, action) {
    if (!DEBUG_CONFIG.enabled || !DEBUG_CONFIG.enableStateDebugging) return;

    debugStore.addEntry({
      type: 'state_change',
      level: LOG_LEVELS.DEBUG,
      component: componentName,
      data: {
        action,
        prevState: this.sanitizeState(prevState),
        newState: this.sanitizeState(newState),
        diff: this.calculateStateDiff(prevState, newState)
      }
    });
  }

  static trackProps(componentName, prevProps, newProps) {
    if (!DEBUG_CONFIG.enabled) return;

    const propsDiff = this.calculatePropsDiff(prevProps, newProps);

    if (Object.keys(propsDiff).length > 0) {
      debugStore.addEntry({
        type: 'props_change',
        level: LOG_LEVELS.DEBUG,
        component: componentName,
        data: {
          prevProps: this.sanitizeProps(prevProps),
          newProps: this.sanitizeProps(newProps),
          diff: propsDiff
        }
      });
    }
  }

  static updateRenderCount(componentName) {
    const current = debugStore.renderCounts.get(componentName) || 0;
    const newCount = current + 1;
    debugStore.renderCounts.set(componentName, newCount);
    return newCount;
  }

  static sanitizeProps(props) {
    const sanitized = {};
    Object.keys(props || {}).forEach(key => {
      const value = props[key];
      if (typeof value === 'function') {
        sanitized[key] = '[Function]';
      } else if (React.isValidElement(value)) {
        sanitized[key] = '[React Element]';
      } else if (value && typeof value === 'object') {
        sanitized[key] = JSON.stringify(value, null, 2).substring(0, 200);
      } else {
        sanitized[key] = value;
      }
    });
    return sanitized;
  }

  static sanitizeState(state) {
    if (!state || typeof state !== 'object') return state;

    try {
      return JSON.parse(JSON.stringify(state, null, 2));
    } catch (e) {
      return '[Unserializable State]';
    }
  }

  static calculateStateDiff(prev, next) {
    const diff = {};
    const allKeys = new Set([...Object.keys(prev || {}), ...Object.keys(next || {})]);

    allKeys.forEach(key => {
      if (prev?.[key] !== next?.[key]) {
        diff[key] = {
          prev: prev?.[key],
          next: next?.[key]
        };
      }
    });

    return diff;
  }

  static calculatePropsDiff(prev, next) {
    return this.calculateStateDiff(prev, next);
  }
}

// ===================
// PERFORMANCE DEBUGGER
// ===================

export class PerformanceDebugger {
  static startMark(label, metadata = {}) {
    if (!DEBUG_CONFIG.enabled || !DEBUG_CONFIG.enablePerformanceMonitoring) return null;

    const markId = `${label}-${Date.now()}`;
    const startTime = performance.now();

    debugStore.performanceMarks.set(markId, {
      label,
      startTime,
      metadata
    });

    debugStore.addEntry({
      type: 'performance_start',
      level: LOG_LEVELS.DEBUG,
      data: { label, markId, metadata }
    });

    return {
      end: () => this.endMark(markId),
      markId
    };
  }

  static endMark(markId) {
    if (!DEBUG_CONFIG.enabled) return;

    const mark = debugStore.performanceMarks.get(markId);
    if (!mark) return;

    const endTime = performance.now();
    const duration = endTime - mark.startTime;

    debugStore.addEntry({
      type: 'performance_end',
      level: LOG_LEVELS.DEBUG,
      data: {
        label: mark.label,
        markId,
        duration,
        metadata: mark.metadata
      }
    });

    debugStore.performanceMarks.delete(markId);
    return duration;
  }

  static measureRender(componentName) {
    return this.startMark(`render-${componentName}`, { type: 'render', component: componentName });
  }

  static measureFunction(functionName, fn, context = {}) {
    if (!DEBUG_CONFIG.enabled) return fn();

    const mark = this.startMark(`function-${functionName}`, { type: 'function', context });

    try {
      const result = fn();
      mark.end();
      return result;
    } catch (error) {
      mark.end();

      debugStore.addEntry({
        type: 'function_error',
        level: LOG_LEVELS.ERROR,
        data: {
          functionName,
          error: error.message,
          context
        }
      });

      throw error;
    }
  }

  static async measureAsync(label, asyncFn, context = {}) {
    if (!DEBUG_CONFIG.enabled) return await asyncFn();

    const mark = this.startMark(`async-${label}`, { type: 'async', context });

    try {
      const result = await asyncFn();
      mark.end();
      return result;
    } catch (error) {
      mark.end();

      debugStore.addEntry({
        type: 'async_error',
        level: LOG_LEVELS.ERROR,
        data: {
          label,
          error: error.message,
          context
        }
      });

      throw error;
    }
  }
}

// ===================
// NETWORK DEBUGGER
// ===================

export class NetworkDebugger {
  static trackRequest(config) {
    if (!DEBUG_CONFIG.enabled || !DEBUG_CONFIG.enableNetworkDebugging) return;

    const requestId = Date.now() + Math.random();
    const startTime = performance.now();

    debugStore.addEntry({
      type: 'network_request',
      level: LOG_LEVELS.DEBUG,
      data: {
        requestId,
        method: config.method,
        url: config.url,
        headers: config.headers,
        data: config.data,
        startTime
      }
    });

    return requestId;
  }

  static trackResponse(requestId, response, error = null) {
    if (!DEBUG_CONFIG.enabled) return;

    const endTime = performance.now();
    const request = debugStore.entries.find(
      entry => entry.type === 'network_request' && entry.data.requestId === requestId
    );

    const duration = request ? endTime - request.data.startTime : 0;

    debugStore.addEntry({
      type: 'network_response',
      level: error ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG,
      data: {
        requestId,
        status: response?.status,
        statusText: response?.statusText,
        data: response?.data,
        error: error?.message,
        duration
      }
    });

    debugStore.networkCalls.push({
      requestId,
      method: request?.data.method,
      url: request?.data.url,
      status: response?.status,
      duration,
      error: error?.message,
      timestamp: new Date().toISOString()
    });
  }
}

// ===================
// USER ACTION DEBUGGER
// ===================

export class UserActionDebugger {
  static trackAction(action, component, metadata = {}) {
    if (!DEBUG_CONFIG.enabled) return;

    const actionEntry = {
      type: 'user_action',
      level: LOG_LEVELS.INFO,
      component,
      data: {
        action,
        metadata,
        path: window.location.pathname,
        timestamp: new Date().toISOString()
      }
    };

    debugStore.addEntry(actionEntry);
    debugStore.userActions.push(actionEntry);
  }

  static trackClick(element, component, metadata = {}) {
    this.trackAction('click', component, {
      ...metadata,
      elementType: element.tagName,
      elementId: element.id,
      elementClass: element.className
    });
  }

  static trackFormSubmit(formName, data, component) {
    this.trackAction('form_submit', component, {
      formName,
      fieldCount: Object.keys(data || {}).length,
      hasValidationErrors: false // This would be set by validation
    });
  }

  static trackNavigation(from, to) {
    this.trackAction('navigation', 'Router', {
      from,
      to,
      navigationType: 'programmatic'
    });
  }
}

// ===================
// ERROR CONTEXT ENHANCER
// ===================

export class ErrorContextEnhancer {
  static enhanceError(error, context = {}) {
    if (!DEBUG_CONFIG.enabled) return error;

    // Get recent debug entries for context
    const recentEntries = debugStore.getEntries({ limit: 20 });
    const recentActions = debugStore.userActions.slice(-5);
    const recentNetworkCalls = debugStore.networkCalls.slice(-3);

    // Create enhanced error with debug context
    const enhancedError = new Error(error.message);
    enhancedError.name = error.name;
    enhancedError.stack = error.stack;
    enhancedError.originalError = error;

    // Add debug context
    enhancedError.debugContext = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      componentContext: context,
      recentLogs: recentEntries,
      recentUserActions: recentActions,
      recentNetworkCalls: recentNetworkCalls,
      componentStates: Object.fromEntries(debugStore.componentStates),
      renderCounts: Object.fromEntries(debugStore.renderCounts),
      performanceMarks: Array.from(debugStore.performanceMarks.entries())
    };

    return enhancedError;
  }

  static formatErrorContext(error) {
    if (!error.debugContext) return null;

    const context = error.debugContext;

    return {
      summary: {
        timestamp: context.timestamp,
        url: context.url,
        component: context.componentContext?.component || 'Unknown',
        recentActions: context.recentUserActions.map(a => a.data.action),
        recentNetworkErrors: context.recentNetworkCalls.filter(c => c.error).length
      },
      detailed: {
        componentStates: context.componentStates,
        renderCounts: context.renderCounts,
        recentLogs: context.recentLogs,
        networkCalls: context.recentNetworkCalls,
        userActions: context.recentUserActions
      }
    };
  }
}

// ===================
// DEBUG CONSOLE
// ===================

export class DebugConsole {
  static enable() {
    if (typeof window === 'undefined') return;

    // Add debug console to global window object
    window.__DEBUG__ = {
      store: debugStore,
      logs: () => debugStore.getEntries(),
      clear: () => debugStore.clear(),
      components: () => Object.fromEntries(debugStore.componentStates),
      renders: () => Object.fromEntries(debugStore.renderCounts),
      network: () => debugStore.networkCalls,
      actions: () => debugStore.userActions,
      performance: () => Array.from(debugStore.performanceMarks.entries()),

      // Utilities
      findComponent: name => debugStore.componentStates.get(name),
      findLogs: type => debugStore.getEntries({ type }),
      exportDebugData: () => this.exportDebugData(),
      enableVerbose: () => this.enableVerboseLogging(),
      disableVerbose: () => this.disableVerboseLogging()
    };

    console.log('🐛 Debug console enabled. Use window.__DEBUG__ for debugging tools.');
  }

  static exportDebugData() {
    const data = {
      entries: debugStore.entries,
      componentStates: Object.fromEntries(debugStore.componentStates),
      renderCounts: Object.fromEntries(debugStore.renderCounts),
      networkCalls: debugStore.networkCalls,
      userActions: debugStore.userActions,
      exportedAt: new Date().toISOString()
    };

    // Create downloadable file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return data;
  }

  static enableVerboseLogging() {
    DEBUG_CONFIG.enableComponentTracking = true;
    DEBUG_CONFIG.enableStateDebugging = true;
    DEBUG_CONFIG.enableNetworkDebugging = true;
    DEBUG_CONFIG.enablePerformanceMonitoring = true;
    console.log('🔊 Verbose debugging enabled');
  }

  static disableVerboseLogging() {
    DEBUG_CONFIG.enableComponentTracking = false;
    DEBUG_CONFIG.enableStateDebugging = false;
    DEBUG_CONFIG.enableNetworkDebugging = false;
    DEBUG_CONFIG.enablePerformanceMonitoring = false;
    console.log('🔇 Verbose debugging disabled');
  }
}

// ===================
// INITIALIZATION
// ===================

// Auto-enable debug console in development
if (DEBUG_CONFIG.enabled) {
  DebugConsole.enable();
}

// ===================
// EXPORTS
// ===================

export { debugStore, DEBUG_CONFIG };

export default {
  PerformanceDebugger,
  NetworkDebugger,
  UserActionDebugger,
  ErrorContextEnhancer,
  DebugConsole,
  debugStore,
  config: DEBUG_CONFIG
};
