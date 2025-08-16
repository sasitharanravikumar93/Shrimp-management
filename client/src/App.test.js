import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  // Just check that the app renders without crashing
  expect(screen.getByText(/Shrimp Farm Management System/i)).toBeInTheDocument();
});