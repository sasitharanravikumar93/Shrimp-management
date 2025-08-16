import { renderHook, act } from '@testing-library/react-hooks';
import { useApiData, useApiMutation, clearAllCache } from '../hooks/useApi';

// Mock API functions
const mockApiFunction = jest.fn();
const mockApiMutationFunction = jest.fn();

describe('useApiData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAllCache();
  });

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test Data' };
    mockApiFunction.mockResolvedValue(mockData);

    const { result, waitForNextUpdate } = renderHook(() =>
      useApiData(mockApiFunction, [])
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(mockApiFunction).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors', async () => {
    const errorMessage = 'API Error';
    mockApiFunction.mockRejectedValue(new Error(errorMessage));

    const { result, waitForNextUpdate } = renderHook(() =>
      useApiData(mockApiFunction, [])
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    // Wait for the error to be handled
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(errorMessage);
    expect(mockApiFunction).toHaveBeenCalledTimes(1);
  });

  it('should refetch data when called', async () => {
    const mockData = { id: 1, name: 'Test Data' };
    mockApiFunction.mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useApiData(mockApiFunction, [])
    );

    // Wait for initial fetch
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockApiFunction).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    // The refetch should call the API again
    expect(mockApiFunction).toHaveBeenCalledTimes(2);
  });

  it('should use cache when available', async () => {
    const mockData = { id: 1, name: 'Test Data' };
    mockApiFunction.mockResolvedValue(mockData);

    const { result, rerender } = renderHook(
      ({ cacheKey }) => useApiData(mockApiFunction, [], cacheKey),
      { initialProps: { cacheKey: 'test-cache-key' } }
    );

    // Wait for initial fetch
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockApiFunction).toHaveBeenCalledTimes(1);

    // Rerender with same cache key
    rerender({ cacheKey: 'test-cache-key' });

    // Should not call API again if cache is used
    expect(mockApiFunction).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockData);
  });
});

describe('useApiMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute mutation successfully', async () => {
    const mockData = { id: 1, name: 'Created Item' };
    mockApiMutationFunction.mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useApiMutation(mockApiMutationFunction)
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);

    await act(async () => {
      await result.current.mutate({ name: 'Test Item' });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(mockApiMutationFunction).toHaveBeenCalledWith({ name: 'Test Item' });
  });

  it('should handle mutation errors', async () => {
    const errorMessage = 'Mutation Error';
    mockApiMutationFunction.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() =>
      useApiMutation(mockApiMutationFunction)
    );

    await act(async () => {
      await result.current.mutate({ name: 'Test Item' });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });
});