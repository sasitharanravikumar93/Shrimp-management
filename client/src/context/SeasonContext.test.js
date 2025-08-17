import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { SeasonProvider, useSeason } from './SeasonContext';
import * as api from '../services/api';

// Mock the API calls
jest.mock('../services/api');

// Test component that uses the SeasonContext
const TestComponent = () => {
  const { seasons, selectedSeason, loading, error, selectSeason } = useSeason();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <div data-testid="seasons-count">{seasons.length}</div>
      <div data-testid="selected-season">{selectedSeason ? selectedSeason.name : 'No season selected'}</div>
      <button onClick={() => selectSeason({ id: '1', name: 'Test Season 1' })} data-testid="select-season-button">
        Select Season 1
      </button>
    </div>
  );
};

describe('SeasonContext', () => {
  const mockSeasons = [
    { id: '1', name: 'Test Season 1', status: 'Completed' },
    { id: '2', name: 'Test Season 2', status: 'Active' },
    { id: '3', name: 'Test Season 3', status: 'Planned' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API functions
    api.getSeasons = jest.fn().mockResolvedValue(mockSeasons);
  });

  it('provides seasons data and selects active season by default', async () => {
    render(
      <SeasonProvider>
        <TestComponent />
      </SeasonProvider>
    );

    // Check loading state
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    // Check that seasons are loaded
    expect(screen.getByTestId('seasons-count')).toHaveTextContent('3');
    
    // Check that active season is selected by default
    expect(screen.getByTestId('selected-season')).toHaveTextContent('Test Season 2');
  });

  it('handles API error gracefully', async () => {
    // Mock API to simulate error
    api.getSeasons = jest.fn().mockRejectedValue(new Error('Failed to fetch seasons'));
    
    render(
      <SeasonProvider>
        <TestComponent />
      </SeasonProvider>
    );

    // Wait for error to be handled
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to fetch seasons');
    });
    
    // Check that loading state is false
    expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    
    // Check that no seasons are loaded
    expect(screen.getByTestId('seasons-count')).toHaveTextContent('0');
  });

  it('allows selecting a different season', async () => {
    render(
      <SeasonProvider>
        <TestComponent />
      </SeasonProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('selected-season')).toHaveTextContent('Test Season 2');
    });

    // Click the select season button
    const selectButton = screen.getByTestId('select-season-button');
    await userEvent.click(selectButton);

    // Check that the season is selected
    expect(screen.getByTestId('selected-season')).toHaveTextContent('Test Season 1');
  });

  it('throws error when useSeason is used outside of SeasonProvider', () => {
    // Suppress console error for this test
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useSeason must be used within a SeasonProvider');
    
    // Restore console error
    consoleError.mockRestore();
  });

  it('selects first season when no active season exists', async () => {
    const mockSeasonsWithoutActive = [
      { id: '1', name: 'Test Season 1', status: 'Completed' },
      { id: '3', name: 'Test Season 3', status: 'Planned' }
    ];
    
    api.getSeasons = jest.fn().mockResolvedValue(mockSeasonsWithoutActive);
    
    render(
      <SeasonProvider>
        <TestComponent />
      </SeasonProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('selected-season')).toHaveTextContent('Test Season 1');
    });
  });
});