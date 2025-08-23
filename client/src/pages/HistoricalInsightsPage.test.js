import React from 'react';
import { render } from '@testing-library/react';
import HistoricalInsightsPage from './HistoricalInsightsPage';

// Create a simple test to check for syntax errors
test('HistoricalInsightsPage component renders without crashing', () => {
  render(<HistoricalInsightsPage />);
  expect(true).toBe(true);
});