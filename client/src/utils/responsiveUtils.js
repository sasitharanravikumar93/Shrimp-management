/**
 * Responsive Design Utilities
 * Utilities for creating responsive layouts and mobile-optimized interfaces
 */

import { useTheme, useMediaQuery } from '@mui/material';

import { designTokens } from '../theme/designTokens';

const { breakpoints } = designTokens;

// Responsive utilities
export const responsiveUtils = {
  // Breakpoint helpers
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536
  },

  // Media query generators
  mediaQuery: {
    up: breakpoint => `(min-width: ${breakpoints.values[breakpoint]}px)`,
    down: breakpoint => `(max-width: ${breakpoints.values[breakpoint] - 0.05}px)`,
    between: (start, end) =>
      `(min-width: ${breakpoints.values[start]}px) and (max-width: ${
        breakpoints.values[end] - 0.05
      }px)`,
    only: breakpoint => {
      const keys = Object.keys(breakpoints.values);
      const index = keys.indexOf(breakpoint);
      if (index === keys.length - 1) {
        return responsiveUtils.mediaQuery.up(breakpoint);
      }
      return responsiveUtils.mediaQuery.between(breakpoint, keys[index + 1]);
    }
  },

  // Responsive value calculators
  getResponsiveValue: (values, currentBreakpoint) => {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl'];
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

    // Find the closest defined value
    for (let i = currentIndex; i >= 0; i--) {
      const bp = breakpointOrder[i];
      if (values[bp] !== undefined) {
        return values[bp];
      }
    }

    return values.xs || values[Object.keys(values)[0]];
  },

  // Container sizes for different breakpoints
  getContainerSize: breakpoint => {
    const sizes = {
      xs: '100%',
      sm: '540px',
      md: '720px',
      lg: '960px',
      xl: '1140px'
    };
    return sizes[breakpoint] || sizes.lg;
  },

  // Responsive spacing
  getResponsiveSpacing: breakpoint => {
    const spacing = {
      xs: 8,
      sm: 12,
      md: 16,
      lg: 24,
      xl: 32
    };
    return spacing[breakpoint] || spacing.md;
  },

  // Responsive font sizes
  getResponsiveFontSize: (breakpoint, variant = 'body1') => {
    const fontSizes = {
      h1: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
      h2: { xs: '1.375rem', sm: '1.5rem', md: '1.5rem' },
      h3: { xs: '1.125rem', sm: '1.25rem', md: '1.25rem' },
      h4: { xs: '1rem', sm: '1.125rem', md: '1.125rem' },
      h5: { xs: '0.875rem', sm: '1rem', md: '1rem' },
      h6: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
      body1: { xs: '0.875rem', sm: '1rem', md: '1rem' },
      body2: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
      button: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' },
      caption: { xs: '0.6875rem', sm: '0.75rem', md: '0.75rem' }
    };

    const sizes = fontSizes[variant] || fontSizes.body1;
    return responsiveUtils.getResponsiveValue(sizes, breakpoint);
  }
};

// React hooks for responsive design
export const useResponsive = () => {
  const theme = useTheme();

  const breakpoints = {
    xs: useMediaQuery(theme.breakpoints.only('xs')),
    sm: useMediaQuery(theme.breakpoints.only('sm')),
    md: useMediaQuery(theme.breakpoints.only('md')),
    lg: useMediaQuery(theme.breakpoints.only('lg')),
    xl: useMediaQuery(theme.breakpoints.only('xl'))
  };

  const up = {
    xs: useMediaQuery(theme.breakpoints.up('xs')),
    sm: useMediaQuery(theme.breakpoints.up('sm')),
    md: useMediaQuery(theme.breakpoints.up('md')),
    lg: useMediaQuery(theme.breakpoints.up('lg')),
    xl: useMediaQuery(theme.breakpoints.up('xl'))
  };

  const down = {
    xs: useMediaQuery(theme.breakpoints.down('xs')),
    sm: useMediaQuery(theme.breakpoints.down('sm')),
    md: useMediaQuery(theme.breakpoints.down('md')),
    lg: useMediaQuery(theme.breakpoints.down('lg')),
    xl: useMediaQuery(theme.breakpoints.down('xl'))
  };

  // Get current breakpoint
  const getCurrentBreakpoint = () => {
    if (breakpoints.xl) return 'xl';
    if (breakpoints.lg) return 'lg';
    if (breakpoints.md) return 'md';
    if (breakpoints.sm) return 'sm';
    return 'xs';
  };

  const currentBreakpoint = getCurrentBreakpoint();

  return {
    breakpoints,
    up,
    down,
    currentBreakpoint,
    isMobile: down.md,
    isTablet: breakpoints.md,
    isDesktop: up.lg,
    isSmallScreen: down.sm,
    isMediumScreen: breakpoints.md || breakpoints.lg,
    isLargeScreen: up.xl
  };
};

// Hook for responsive values
export const useResponsiveValue = values => {
  const { currentBreakpoint } = useResponsive();
  return responsiveUtils.getResponsiveValue(values, currentBreakpoint);
};

// Mobile detection hook
export const useMobileDetection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return {
    isMobile,
    isTablet,
    isTouch,
    isMobileOrTablet: isMobile || isTablet,
    isDesktop: !isMobile && !isTablet
  };
};

// Responsive spacing system
export const createResponsiveSpacing = (base = 8) => ({
  xs: base * 0.5, // 4px
  sm: base, // 8px
  md: base * 2, // 16px
  lg: base * 3, // 24px
  xl: base * 4, // 32px
  xxl: base * 6, // 48px
  xxxl: base * 8 // 64px
});

// Responsive grid system
export const createResponsiveGrid = (columns = 12) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%'
  },

  item: size => ({
    flex: `0 0 ${(size / columns) * 100}%`,
    maxWidth: `${(size / columns) * 100}%`
  }),

  responsive: sizes => {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl'];
    const styles = {};

    breakpointOrder.forEach(bp => {
      if (sizes[bp]) {
        styles[`@media ${responsiveUtils.mediaQuery.up(bp)}`] = {
          flex: `0 0 ${(sizes[bp] / columns) * 100}%`,
          maxWidth: `${(sizes[bp] / columns) * 100}%`
        };
      }
    });

    return styles;
  }
});

// Mobile-first CSS-in-JS helper
export const createMobileFirstStyles = styles => {
  const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl'];
  const mobileFirstStyles = {};

  // Start with mobile styles (xs)
  if (styles.xs) {
    Object.assign(mobileFirstStyles, styles.xs);
  }

  // Add larger breakpoint styles
  breakpointOrder.slice(1).forEach(bp => {
    if (styles[bp]) {
      mobileFirstStyles[`@media ${responsiveUtils.mediaQuery.up(bp)}`] = styles[bp];
    }
  });

  return mobileFirstStyles;
};

// Responsive typography system
export const createResponsiveTypography = () => ({
  h1: createMobileFirstStyles({
    xs: { fontSize: '1.75rem', lineHeight: 1.2 },
    sm: { fontSize: '2rem' },
    md: { fontSize: '2.125rem' }
  }),

  h2: createMobileFirstStyles({
    xs: { fontSize: '1.375rem', lineHeight: 1.2 },
    sm: { fontSize: '1.5rem' },
    md: { fontSize: '1.5rem' }
  }),

  h3: createMobileFirstStyles({
    xs: { fontSize: '1.125rem', lineHeight: 1.167 },
    sm: { fontSize: '1.25rem' },
    md: { fontSize: '1.25rem' }
  }),

  body1: createMobileFirstStyles({
    xs: { fontSize: '0.875rem', lineHeight: 1.5 },
    sm: { fontSize: '1rem' }
  }),

  body2: createMobileFirstStyles({
    xs: { fontSize: '0.75rem', lineHeight: 1.43 },
    sm: { fontSize: '0.875rem' }
  })
});

// Touch target size helpers
export const touchTargets = {
  minimum: 44, // iOS recommended minimum
  comfortable: 48, // Android recommended
  large: 56, // Large touch targets

  // Helper to ensure minimum touch target size
  ensureMinimumSize: (size = touchTargets.minimum) => ({
    minHeight: size,
    minWidth: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  })
};

// Viewport utilities
export const viewport = {
  // Safe area insets for mobile devices with notches
  safeArea: {
    top: 'env(safe-area-inset-top)',
    right: 'env(safe-area-inset-right)',
    bottom: 'env(safe-area-inset-bottom)',
    left: 'env(safe-area-inset-left)'
  },

  // Viewport units
  vh: value => `${value}vh`,
  vw: value => `${value}vw`,
  vmin: value => `${value}vmin`,
  vmax: value => `${value}vmax`,

  // Dynamic viewport heights (for mobile browsers)
  dvh: value => `${value}dvh`,
  lvh: value => `${value}lvh`,
  svh: value => `${value}svh`
};

// Common responsive patterns
export const responsivePatterns = {
  // Hide element on specific breakpoints
  hideOn: breakpoint => ({
    [`@media ${responsiveUtils.mediaQuery.only(breakpoint)}`]: {
      display: 'none'
    }
  }),

  // Show element only on specific breakpoints
  showOnlyOn: breakpoint => {
    const allBreakpoints = ['xs', 'sm', 'md', 'lg', 'xl'];
    const styles = { display: 'none' };

    styles[`@media ${responsiveUtils.mediaQuery.only(breakpoint)}`] = {
      display: 'block'
    };

    return styles;
  },

  // Responsive padding
  responsivePadding: values => createMobileFirstStyles(values),

  // Responsive margin
  responsiveMargin: values => createMobileFirstStyles(values),

  // Responsive width
  responsiveWidth: values =>
    createMobileFirstStyles(
      Object.keys(values).reduce((acc, bp) => {
        acc[bp] = { width: values[bp] };
        return acc;
      }, {})
    ),

  // Stack elements on mobile
  stackOnMobile: (breakpoint = 'md') => ({
    display: 'flex',
    flexDirection: 'column',
    [`@media ${responsiveUtils.mediaQuery.up(breakpoint)}`]: {
      flexDirection: 'row'
    }
  })
};

export default {
  responsiveUtils,
  useResponsive,
  useResponsiveValue,
  useMobileDetection,
  createResponsiveSpacing,
  createResponsiveGrid,
  createMobileFirstStyles,
  createResponsiveTypography,
  touchTargets,
  viewport,
  responsivePatterns
};
