import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import KPICard, {
  CircularKPICard,
  type KPICardProps,
  type CircularKPICardProps
} from '../features/dashboard/KPICard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

// Mock performance optimization hooks
jest.mock('../../utils/performanceOptimization', () => ({
  useStableMemo: (fn: () => any, deps: any[]) => React.useMemo(fn, deps),
  useStableCallback: (fn: any, deps: any[]) => React.useCallback(fn, deps)
}));

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('KPICard TypeScript Migration', () => {
  const defaultProps: KPICardProps = {
    title: 'Test KPI',
    value: 100,
    icon: <div data-testid='test-icon'>📊</div>,
    color: '#007BFF'
  };

  describe('Type Safety', () => {
    it('renders with correct TypeScript props', () => {
      renderWithTheme(<KPICard {...defaultProps} />);

      expect(screen.getByText('Test KPI')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('handles optional props correctly', () => {
      const props: KPICardProps = {
        title: 'Optional Props Test',
        value: 50,
        change: 5.5,
        progressValue: 75,
        isCurrency: true,
        suffix: '%'
      };

      renderWithTheme(<KPICard {...props} />);

      expect(screen.getByText('Optional Props Test')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('enforces required props at compile time', () => {
      // This test ensures TypeScript compilation works correctly
      // If title or value are missing, TypeScript should catch it at compile time
      const validProps: KPICardProps = {
        title: 'Required Props',
        value: 42
      };

      renderWithTheme(<KPICard {...validProps} />);
      expect(screen.getByText('Required Props')).toBeInTheDocument();
    });

    it('handles progress color enum correctly', () => {
      const props: KPICardProps = {
        title: 'Progress Test',
        value: 80,
        progressValue: 60,
        progressColor: 'success' // Should only accept valid MUI color values
      };

      renderWithTheme(<KPICard {...props} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
    });
  });

  describe('CircularKPICard TypeScript', () => {
    const circularProps: CircularKPICardProps = {
      title: 'Circular Test',
      value: 75,
      icon: <div data-testid='circular-icon'>⭕</div>,
      color: '#28A745'
    };

    it('renders circular variant with TypeScript props', () => {
      renderWithTheme(<CircularKPICard {...circularProps} />);

      expect(screen.getByText('Circular Test')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByTestId('circular-icon')).toBeInTheDocument();
    });

    it('handles size prop with proper typing', () => {
      const props: CircularKPICardProps = {
        ...circularProps,
        size: 150 // Should accept number type
      };

      renderWithTheme(<CircularKPICard {...props} />);

      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars).toHaveLength(2); // Background and foreground circles
    });
  });

  describe('Type Constraints', () => {
    it('ensures value is a number', () => {
      // TypeScript should enforce that value is a number
      const props: KPICardProps = {
        title: 'Number Value',
        value: 123.45 // Must be a number, not string
      };

      renderWithTheme(<KPICard {...props} />);
      expect(screen.getByText('123.45')).toBeInTheDocument();
    });

    it('ensures title is a string', () => {
      // TypeScript should enforce that title is a string
      const props: KPICardProps = {
        title: 'String Title', // Must be a string
        value: 100
      };

      renderWithTheme(<KPICard {...props} />);
      expect(screen.getByText('String Title')).toBeInTheDocument();
    });
  });

  describe('Component Interface', () => {
    it('exports correct TypeScript interfaces', () => {
      // This test ensures the interfaces are properly exported
      // and can be imported by other TypeScript files

      const kpiProps: KPICardProps = {
        title: 'Interface Test',
        value: 50,
        change: 2.5,
        changeText: 'Up 2.5%',
        progressValue: 50,
        progressColor: 'primary',
        isCurrency: false,
        suffix: '',
        delay: 0.1
      };

      const circularProps: CircularKPICardProps = {
        title: 'Circular Interface',
        value: 80,
        change: -1.2,
        changeText: 'Down 1.2%',
        size: 120,
        delay: 0.2
      };

      // If this compiles, the interfaces are working correctly
      expect(kpiProps.title).toBe('Interface Test');
      expect(circularProps.value).toBe(80);
    });
  });
});

// Additional type checking tests that verify TypeScript compilation
describe('TypeScript Compilation Tests', () => {
  it('should compile without errors', () => {
    // These variable assignments test that TypeScript types are working
    const basicProps: KPICardProps = { title: 'Basic', value: 100 };
    const fullProps: KPICardProps = {
      title: 'Full Props',
      value: 200,
      icon: <span>🔥</span>,
      color: '#FF5722',
      change: 10,
      changeText: 'Custom change',
      progressValue: 85,
      progressColor: 'warning',
      isCurrency: true,
      suffix: ' USD',
      delay: 0.5
    };

    expect(basicProps).toBeDefined();
    expect(fullProps).toBeDefined();
  });
});
