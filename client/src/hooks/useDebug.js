/**
 * Debug Hooks for React Components
 * Provides easy-to-use hooks for debugging React components and tracking state changes
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';

import {
  ComponentDebugger,
  PerformanceDebugger,
  UserActionDebugger,
  ErrorContextEnhancer,
  DEBUG_CONFIG
} from './debugUtils';

// ===================
// COMPONENT DEBUG HOOK
// ===================

/**
 * Hook to debug component renders, props, and state changes
 * @param {string} componentName - Name of the component
 * @param {Object} props - Component props
 * @param {Object} state - Component state (optional)
 * @param {Object} options - Debug options
 */
export const useComponentDebug = (componentName, props = {}, state = null, options = {}) => {
  const {
    trackRenders = true,
    trackProps = true,
    trackState = true,
    logToConsole = false
  } = options;

  const prevPropsRef = useRef(props);
  const prevStateRef = useRef(state);
  const renderCountRef = useRef(0);

  useEffect(() => {
    if (!DEBUG_CONFIG.enabled) return;

    renderCountRef.current += 1;

    if (trackRenders) {
      ComponentDebugger.trackComponent(componentName, props, state);
    }

    if (logToConsole && renderCountRef.current > 1) {
      console.group(`🔄 ${componentName} Render #${renderCountRef.current}`);
      console.log('Props:', props);
      if (state) console.log('State:', state);
      console.groupEnd();
    }
  });

  useEffect(() => {
    if (!DEBUG_CONFIG.enabled || !trackProps) return;

    const prevProps = prevPropsRef.current;
    if (prevProps && JSON.stringify(prevProps) !== JSON.stringify(props)) {
      ComponentDebugger.trackProps(componentName, prevProps, props);

      if (logToConsole) {
        console.group(`🔧 ${componentName} Props Changed`);
        console.log('Previous:', prevProps);
        console.log('Current:', props);
        console.groupEnd();
      }
    }
    prevPropsRef.current = props;
  }, [props, componentName, trackProps, logToConsole]);

  useEffect(() => {
    if (!DEBUG_CONFIG.enabled || !trackState || !state) return;

    const prevState = prevStateRef.current;
    if (prevState && JSON.stringify(prevState) !== JSON.stringify(state)) {
      ComponentDebugger.trackStateChange(componentName, prevState, state, 'useState');

      if (logToConsole) {
        console.group(`📊 ${componentName} State Changed`);
        console.log('Previous:', prevState);
        console.log('Current:', state);
        console.groupEnd();
      }
    }
    prevStateRef.current = state;
  }, [state, componentName, trackState, logToConsole]);

  return {
    renderCount: renderCountRef.current,
    logRender: () => {
      console.log(`${componentName} rendered ${renderCountRef.current} times`);
    }
  };
};

// ===================
// PERFORMANCE DEBUG HOOK
// ===================

/**
 * Hook to measure and debug component performance
 * @param {string} componentName - Name of the component
 * @param {Object} options - Performance options
 */
export const usePerformanceDebug = (componentName, options = {}) => {
  const {
    trackRenderTime = true,
    trackEffectTime = true,
    warnThreshold = 16 // 16ms for 60fps
  } = options;

  const renderMarkRef = useRef(null);
  const effectMarksRef = useRef(new Map());

  useEffect(() => {
    if (!DEBUG_CONFIG.enabled || !trackRenderTime) return;

    if (renderMarkRef.current) {
      const duration = renderMarkRef.current.end();

      if (duration > warnThreshold) {
        console.warn(`⚠️ Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
      }
    }

    renderMarkRef.current = PerformanceDebugger.measureRender(componentName);
  });

  const measureEffect = useCallback(
    (effectName, effectFn) => {
      if (!DEBUG_CONFIG.enabled || !trackEffectTime) {
        return effectFn();
      }

      return PerformanceDebugger.measureFunction(`${componentName}-${effectName}`, effectFn);
    },
    [componentName, trackEffectTime]
  );

  const measureAsyncEffect = useCallback(
    async (effectName, asyncFn) => {
      if (!DEBUG_CONFIG.enabled || !trackEffectTime) {
        return await asyncFn();
      }

      return await PerformanceDebugger.measureAsync(`${componentName}-${effectName}`, asyncFn);
    },
    [componentName, trackEffectTime]
  );

  return {
    measureEffect,
    measureAsyncEffect,
    startMark: label => PerformanceDebugger.startMark(`${componentName}-${label}`),
    endMark: markId => PerformanceDebugger.endMark(markId)
  };
};

// ===================
// USER ACTION DEBUG HOOK
// ===================

/**
 * Hook to track and debug user interactions
 * @param {string} componentName - Name of the component
 */
export const useUserActionDebug = componentName => {
  const trackClick = useCallback(
    (event, metadata = {}) => {
      if (!DEBUG_CONFIG.enabled) return;

      UserActionDebugger.trackClick(event.target, componentName, {
        ...metadata,
        eventType: event.type,
        button: event.button,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey
      });
    },
    [componentName]
  );

  const trackSubmit = useCallback(
    (formName, formData, metadata = {}) => {
      if (!DEBUG_CONFIG.enabled) return;

      UserActionDebugger.trackFormSubmit(formName, formData, componentName);
    },
    [componentName]
  );

  const trackCustomAction = useCallback(
    (action, metadata = {}) => {
      if (!DEBUG_CONFIG.enabled) return;

      UserActionDebugger.trackAction(action, componentName, metadata);
    },
    [componentName]
  );

  const trackInput = useCallback(
    (fieldName, value, metadata = {}) => {
      if (!DEBUG_CONFIG.enabled) return;

      UserActionDebugger.trackAction('input_change', componentName, {
        ...metadata,
        fieldName,
        valueType: typeof value,
        valueLength: value?.toString?.()?.length || 0
      });
    },
    [componentName]
  );

  return {
    trackClick,
    trackSubmit,
    trackCustomAction,
    trackInput
  };
};

// ===================
// ERROR CONTEXT HOOK
// ===================

/**
 * Hook to enhance errors with debug context
 * @param {string} componentName - Name of the component
 * @param {Object} context - Additional context information
 */
export const useErrorContext = (componentName, context = {}) => {
  const enhanceError = useCallback(
    (error, additionalContext = {}) => {
      if (!DEBUG_CONFIG.enabled) return error;

      return ErrorContextEnhancer.enhanceError(error, {
        component: componentName,
        ...context,
        ...additionalContext
      });
    },
    [componentName, context]
  );

  const reportError = useCallback(
    (error, additionalContext = {}) => {
      const enhancedError = enhanceError(error, additionalContext);

      // Log enhanced error for debugging
      console.error(`❌ Error in ${componentName}:`, enhancedError);

      return enhancedError;
    },
    [componentName, enhanceError]
  );

  return {
    enhanceError,
    reportError
  };
};

// ===================
// STATE DEBUG HOOK
// ===================

/**
 * Hook to debug state changes with detailed tracking
 * @param {*} state - State value to track
 * @param {string} stateName - Name of the state
 * @param {string} componentName - Name of the component
 */
export const useStateDebug = (state, stateName, componentName) => {
  const prevStateRef = useRef(state);
  const changeCountRef = useRef(0);
  const historyRef = useRef([]);

  useEffect(() => {
    if (!DEBUG_CONFIG.enabled) return;

    const prevState = prevStateRef.current;

    if (prevState !== state) {
      changeCountRef.current += 1;

      const change = {
        timestamp: new Date().toISOString(),
        from: prevState,
        to: state,
        changeNumber: changeCountRef.current
      };

      historyRef.current.push(change);

      // Keep only last 10 changes
      if (historyRef.current.length > 10) {
        historyRef.current.shift();
      }

      ComponentDebugger.trackStateChange(
        componentName,
        { [stateName]: prevState },
        { [stateName]: state },
        `${stateName}_change`
      );

      console.log(`🔄 ${componentName}.${stateName} changed:`, {
        from: prevState,
        to: state,
        changeCount: changeCountRef.current
      });
    }

    prevStateRef.current = state;
  }, [state, stateName, componentName]);

  return {
    changeCount: changeCountRef.current,
    history: historyRef.current,
    logHistory: () => {
      console.table(historyRef.current);
    }
  };
};

// ===================
// API DEBUG HOOK
// ===================

/**
 * Hook to debug API calls and responses
 * @param {string} componentName - Name of the component making API calls
 */
export const useApiDebug = componentName => {
  const trackApiCall = useCallback(
    async (apiCall, metadata = {}) => {
      if (!DEBUG_CONFIG.enabled) return await apiCall();

      const startTime = performance.now();
      console.log(`🌐 API call started from ${componentName}:`, metadata);

      try {
        const result = await apiCall();
        const duration = performance.now() - startTime;

        console.log(`✅ API call succeeded from ${componentName}:`, {
          duration: `${duration.toFixed(2)}ms`,
          result: result?.data || result,
          metadata
        });

        UserActionDebugger.trackAction('api_success', componentName, {
          ...metadata,
          duration,
          resultType: typeof result
        });

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;

        console.error(`❌ API call failed from ${componentName}:`, {
          duration: `${duration.toFixed(2)}ms`,
          error: error.message,
          metadata
        });

        UserActionDebugger.trackAction('api_error', componentName, {
          ...metadata,
          duration,
          error: error.message
        });

        throw error;
      }
    },
    [componentName]
  );

  return {
    trackApiCall
  };
};

// ===================
// EFFECT DEBUG HOOK
// ===================

/**
 * Hook to debug useEffect dependencies and executions
 * @param {Function} effect - Effect function
 * @param {Array} deps - Dependencies array
 * @param {string} effectName - Name for the effect
 * @param {string} componentName - Component name
 */
export const useEffectDebug = (effect, deps, effectName, componentName) => {
  const prevDepsRef = useRef(deps);
  const executionCountRef = useRef(0);

  useEffect(() => {
    if (!DEBUG_CONFIG.enabled) return effect();

    executionCountRef.current += 1;
    const prevDeps = prevDepsRef.current;

    // Log effect execution
    console.group(`⚡ Effect "${effectName}" in ${componentName} #${executionCountRef.current}`);

    if (prevDeps && deps) {
      const changedDeps = deps.reduce((acc, dep, index) => {
        if (dep !== prevDeps[index]) {
          acc.push({
            index,
            from: prevDeps[index],
            to: dep
          });
        }
        return acc;
      }, []);

      if (changedDeps.length > 0) {
        console.log('Changed dependencies:', changedDeps);
      } else {
        console.log('No dependency changes detected');
      }
    } else {
      console.log('Initial effect execution');
    }

    console.groupEnd();

    prevDepsRef.current = deps;

    const mark = PerformanceDebugger.startMark(`effect-${componentName}-${effectName}`);
    const cleanup = effect();
    mark.end();

    return cleanup;
  }, deps);

  return {
    executionCount: executionCountRef.current
  };
};

// ===================
// COMPREHENSIVE DEBUG HOOK
// ===================

/**
 * All-in-one debug hook that provides comprehensive debugging capabilities
 * @param {string} componentName - Name of the component
 * @param {Object} props - Component props
 * @param {Object} state - Component state
 * @param {Object} options - Debug options
 */
export const useDebug = (componentName, props = {}, state = null, options = {}) => {
  const componentDebug = useComponentDebug(componentName, props, state, options);
  const performanceDebug = usePerformanceDebug(componentName, options);
  const userActionDebug = useUserActionDebug(componentName);
  const errorContext = useErrorContext(componentName);
  const apiDebug = useApiDebug(componentName);

  const debugInfo = useMemo(
    () => ({
      component: componentName,
      renderCount: componentDebug.renderCount,
      props: Object.keys(props),
      state: state ? Object.keys(state) : null,
      timestamp: new Date().toISOString()
    }),
    [componentName, componentDebug.renderCount, props, state]
  );

  // Log debug summary when component unmounts
  useEffect(() => {
    return () => {
      if (DEBUG_CONFIG.enabled && options.logSummaryOnUnmount) {
        console.log(`📋 ${componentName} Debug Summary:`, debugInfo);
      }
    };
  }, [componentName, debugInfo, options.logSummaryOnUnmount]);

  return {
    ...componentDebug,
    ...performanceDebug,
    ...userActionDebug,
    ...errorContext,
    ...apiDebug,
    debugInfo
  };
};

// ===================
// EXPORTS
// ===================

export default {
  useComponentDebug,
  usePerformanceDebug,
  useUserActionDebug,
  useErrorContext,
  useStateDebug,
  useApiDebug,
  useEffectDebug,
  useDebug
};
