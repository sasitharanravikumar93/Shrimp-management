/**
 * Performance Optimization Utilities Tests
 * Comprehensive test coverage for performance optimization features
 */

import { renderHook, act } from '@testing-library/react';
import React from 'react';

import {
  useStableCallback,
  useStableMemo,
  useStableObject,
  useStableArray,
  useDebounce,
  useThrottle,
  deepMemo,
  performanceMonitor
} from '../../utils/performanceOptimization';
import { waitUtils, mockUtils } from '../../utils/testUtils';

describe('Performance Optimization Utilities', () => {
  describe('useStableCallback', () => {
    it('returns same callback reference for same dependencies', () => {
      const mockFn = jest.fn();

      const { result, rerender } = renderHook(({ deps }) => useStableCallback(mockFn, deps), {
        initialProps: { deps: [1, 2, 3] }
      });

      const firstCallback = result.current;

      // Rerender with same dependencies
      rerender({ deps: [1, 2, 3] });

      expect(result.current).toBe(firstCallback);
    });

    it('returns new callback reference when dependencies change', () => {
      const mockFn = jest.fn();

      const { result, rerender } = renderHook(({ deps }) => useStableCallback(mockFn, deps), {
        initialProps: { deps: [1, 2, 3] }
      });

      const firstCallback = result.current;

      // Rerender with different dependencies
      rerender({ deps: [1, 2, 4] });

      expect(result.current).not.toBe(firstCallback);
    });

    it('executes callback with correct arguments', () => {
      const mockFn = jest.fn();

      const { result } = renderHook(() => useStableCallback((a, b) => mockFn(a, b), []));

      act(() => {
        result.current('arg1', 'arg2');
      });

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('useStableMemo', () => {
    it('returns same value for same dependencies', () => {
      const expensiveCalculation = jest.fn(() => ({ result: 'calculated' }));

      const { result, rerender } = renderHook(
        ({ deps }) => useStableMemo(expensiveCalculation, deps),
        { initialProps: { deps: [1, 2, 3] } }
      );

      const firstResult = result.current;

      // Rerender with same dependencies
      rerender({ deps: [1, 2, 3] });

      expect(result.current).toBe(firstResult);
      expect(expensiveCalculation).toHaveBeenCalledTimes(1);
    });

    it('recalculates when dependencies change', () => {
      const expensiveCalculation = jest.fn(() => ({ result: Math.random() }));

      const { result, rerender } = renderHook(
        ({ deps }) => useStableMemo(expensiveCalculation, deps),
        { initialProps: { deps: [1] } }
      );

      const firstResult = result.current;

      // Rerender with different dependencies
      rerender({ deps: [2] });

      expect(result.current).not.toBe(firstResult);
      expect(expensiveCalculation).toHaveBeenCalledTimes(2);
    });
  });

  describe('useStableObject', () => {
    it('returns same reference for objects with same content', () => {
      const { result, rerender } = renderHook(({ obj }) => useStableObject(obj), {
        initialProps: { obj: { a: 1, b: 2 } }
      });

      const firstResult = result.current;

      // Rerender with object with same content but different reference
      rerender({ obj: { a: 1, b: 2 } });

      expect(result.current).toBe(firstResult);
    });

    it('returns new reference when object content changes', () => {
      const { result, rerender } = renderHook(({ obj }) => useStableObject(obj), {
        initialProps: { obj: { a: 1, b: 2 } }
      });

      const firstResult = result.current;

      // Rerender with different content
      rerender({ obj: { a: 1, b: 3 } });

      expect(result.current).not.toBe(firstResult);
    });

    it('handles nested objects correctly', () => {
      const { result, rerender } = renderHook(({ obj }) => useStableObject(obj), {
        initialProps: { obj: { a: 1, nested: { x: 10, y: 20 } } }
      });

      const firstResult = result.current;

      // Rerender with same nested content
      rerender({ obj: { a: 1, nested: { x: 10, y: 20 } } });

      expect(result.current).toBe(firstResult);

      // Rerender with different nested content
      rerender({ obj: { a: 1, nested: { x: 10, y: 21 } } });

      expect(result.current).not.toBe(firstResult);
    });
  });

  describe('useStableArray', () => {
    it('returns same reference for arrays with same content', () => {
      const { result, rerender } = renderHook(({ arr }) => useStableArray(arr), {
        initialProps: { arr: [1, 2, 3] }
      });

      const firstResult = result.current;

      // Rerender with array with same content but different reference
      rerender({ arr: [1, 2, 3] });

      expect(result.current).toBe(firstResult);
    });

    it('returns new reference when array content changes', () => {
      const { result, rerender } = renderHook(({ arr }) => useStableArray(arr), {
        initialProps: { arr: [1, 2, 3] }
      });

      const firstResult = result.current;

      // Rerender with different content
      rerender({ arr: [1, 2, 4] });

      expect(result.current).not.toBe(firstResult);
    });

    it('handles arrays of objects correctly', () => {
      const { result, rerender } = renderHook(({ arr }) => useStableArray(arr), {
        initialProps: { arr: [{ id: 1 }, { id: 2 }] }
      });

      const firstResult = result.current;

      // Rerender with same content
      rerender({ arr: [{ id: 1 }, { id: 2 }] });

      expect(result.current).toBe(firstResult);

      // Rerender with different content
      rerender({ arr: [{ id: 1 }, { id: 3 }] });

      expect(result.current).not.toBe(firstResult);
    });
  });

  describe('useDebounce', () => {
    let timers;

    beforeEach(() => {
      timers = mockUtils.createMockTimers();
    });

    afterEach(() => {
      timers.cleanup();
    });

    it('debounces value changes correctly', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
        initialProps: { value: 'initial' }
      });

      expect(result.current).toBe('initial');

      // Change value multiple times quickly
      rerender({ value: 'change1' });
      rerender({ value: 'change2' });
      rerender({ value: 'final' });

      // Value should still be initial before delay
      expect(result.current).toBe('initial');

      // Fast forward time
      act(() => {
        timers.advance(500);
      });

      // Now should have the final value
      expect(result.current).toBe('final');
    });

    it('resets debounce timer on new changes', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value, 1000), {
        initialProps: { value: 'initial' }
      });

      rerender({ value: 'change1' });

      // Advance time partially
      act(() => {
        timers.advance(500);
      });

      // Make another change (should reset timer)
      rerender({ value: 'change2' });

      // Advance the partial time again
      act(() => {
        timers.advance(500);
      });

      // Should still be initial value
      expect(result.current).toBe('initial');

      // Complete the full delay
      act(() => {
        timers.advance(500);
      });

      expect(result.current).toBe('change2');
    });
  });

  describe('useThrottle', () => {
    let timers;

    beforeEach(() => {
      timers = mockUtils.createMockTimers();
    });

    afterEach(() => {
      timers.cleanup();
    });

    it('throttles function calls correctly', () => {
      const mockFn = jest.fn();

      const { result } = renderHook(() => useThrottle(mockFn, 1000));

      // Call multiple times quickly
      act(() => {
        result.current();
        result.current();
        result.current();
      });

      // Should only be called once initially
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Advance time
      act(() => {
        timers.advance(1000);
      });

      // Should allow calls again
      act(() => {
        result.current();
      });

      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('deepMemo', () => {
    it('prevents re-renders for components with same deep props', () => {
      const Component = deepMemo(({ data }) => (
        <div data-testid='deep-memo-component'>{JSON.stringify(data)}</div>
      ));

      const { rerender } = renderHook(() =>
        React.createElement(Component, {
          data: { nested: { value: 1 } }
        })
      );

      // Spy on React.createElement to detect re-renders
      const createElementSpy = jest.spyOn(React, 'createElement');
      const initialCallCount = createElementSpy.mock.calls.length;

      // Rerender with same deep content
      rerender({ data: { nested: { value: 1 } } });

      // Should not have triggered additional React.createElement calls
      expect(createElementSpy.mock.calls.length).toBe(initialCallCount);

      createElementSpy.mockRestore();
    });

    it('allows re-renders when deep props actually change', () => {
      const renderSpy = jest.fn();
      const Component = deepMemo(({ data }) => {
        renderSpy();
        return <div>{JSON.stringify(data)}</div>;
      });

      const { rerender } = renderHook(() =>
        React.createElement(Component, {
          data: { nested: { value: 1 } }
        })
      );

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Rerender with different deep content
      rerender({ data: { nested: { value: 2 } } });

      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('performanceMonitor', () => {
    it('measures render time in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = performanceMonitor.measureRender('TestComponent', () => {
        // Simulate some work
        return 'result';
      });

      expect(result).toBe('result');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('TestComponent render time:')
      );

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('does not log in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = performanceMonitor.measureRender('TestComponent', () => {
        return 'result';
      });

      expect(result).toBe('result');
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('logs re-render information in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      performanceMonitor.logRerender('TestComponent', { prop1: 'value1' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('TestComponent re-rendered with props:'),
        { prop1: 'value1' }
      );

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Scenarios', () => {
    it('handles null/undefined values gracefully in useStableObject', () => {
      const { result, rerender } = renderHook(({ obj }) => useStableObject(obj), {
        initialProps: { obj: null }
      });

      expect(result.current).toBe(null);

      rerender({ obj: undefined });
      expect(result.current).toBe(undefined);

      rerender({ obj: { a: 1 } });
      expect(result.current).toEqual({ a: 1 });
    });

    it('handles circular references in useStableObject', () => {
      const circularObj = { a: 1 };
      circularObj.self = circularObj;

      const { result } = renderHook(() => useStableObject(circularObj));

      // Should not crash, but behavior may vary
      expect(result.current).toBeDefined();
    });

    it('handles invalid delay values in useDebounce', () => {
      const { result, rerender } = renderHook(({ delay }) => useDebounce('test', delay), {
        initialProps: { delay: -100 }
      });

      // Should handle negative delays gracefully
      expect(result.current).toBe('test');

      rerender({ delay: null });
      expect(result.current).toBe('test');
    });
  });

  describe('Memory Leak Prevention', () => {
    it('cleans up debounce timers on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const { unmount } = renderHook(() => useDebounce('test', 1000));

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it('cleans up throttle timers on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const { result, unmount } = renderHook(() => useThrottle(() => {}, 1000));

      // Trigger the throttle
      act(() => {
        result.current();
      });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });
});
