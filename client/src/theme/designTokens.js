/**
 * Design System Tokens
 * Centralized design tokens for consistent UI across the application
 */

// Color Palette
export const colors = {
  // Primary colors for aquaculture theme
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main primary
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    contrastText: '#ffffff'
  },

  // Secondary colors (aqua/teal theme)
  secondary: {
    50: '#E0F2F1',
    100: '#B2DFDB',
    200: '#80CBC4',
    300: '#4DB6AC',
    400: '#26A69A',
    500: '#009688', // Main secondary
    600: '#00897B',
    700: '#00796B',
    800: '#00695C',
    900: '#004D40',
    main: '#009688',
    light: '#4DB6AC',
    dark: '#00796B',
    contrastText: '#ffffff'
  },

  // Semantic colors
  success: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Main success
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
    contrastText: '#ffffff'
  },

  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107', // Main warning
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
    main: '#FFC107',
    light: '#FFD54F',
    dark: '#FFA000',
    contrastText: '#000000'
  },

  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336', // Main error
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
    main: '#F44336',
    light: '#E57373',
    dark: '#D32F2F',
    contrastText: '#ffffff'
  },

  info: {
    50: '#E1F5FE',
    100: '#B3E5FC',
    200: '#81D4FA',
    300: '#4FC3F7',
    400: '#29B6F6',
    500: '#03A9F4', // Main info
    600: '#039BE5',
    700: '#0288D1',
    800: '#0277BD',
    900: '#01579B',
    main: '#03A9F4',
    light: '#4FC3F7',
    dark: '#0288D1',
    contrastText: '#ffffff'
  },

  // Neutral colors
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    A100: '#F5F5F5',
    A200: '#EEEEEE',
    A400: '#BDBDBD',
    A700: '#616161'
  },

  // Text colors
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
    hint: 'rgba(0, 0, 0, 0.38)'
  },

  // Background colors
  background: {
    paper: '#ffffff',
    default: '#fafafa',
    level1: '#ffffff',
    level2: '#f5f5f5'
  },

  // Divider colors
  divider: 'rgba(0, 0, 0, 0.12)',

  // Action colors
  action: {
    active: 'rgba(0, 0, 0, 0.54)',
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(0, 0, 0, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
    focus: 'rgba(0, 0, 0, 0.12)'
  }
};

// Spacing system (8px base)
export const spacing = {
  base: 8,
  xs: 4, // 0.5 * base
  sm: 8, // 1 * base
  md: 16, // 2 * base
  lg: 24, // 3 * base
  xl: 32, // 4 * base
  xxl: 48, // 6 * base
  xxxl: 64, // 8 * base

  // Component specific spacing
  component: {
    padding: {
      xs: 8,
      sm: 12,
      md: 16,
      lg: 24
    },
    margin: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24
    },
    gap: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16
    }
  }
};

// Typography system
export const typography = {
  // Font families
  fontFamily: {
    primary: '"Roboto", "Helvetica", "Arial", sans-serif',
    secondary: '"Roboto Condensed", "Helvetica", "Arial", sans-serif',
    mono: '"Roboto Mono", "Courier New", monospace'
  },

  // Font weights
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },

  // Font sizes
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem' // 60px
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  },

  // Material-UI typography variants
  variants: {
    h1: {
      fontSize: '2.125rem',
      fontWeight: 300,
      lineHeight: 1.167
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 400,
      lineHeight: 1.2
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 400,
      lineHeight: 1.167
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 400,
      lineHeight: 1.235
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.334
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.6
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.75
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      textTransform: 'uppercase'
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.66
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 2.66,
      textTransform: 'uppercase'
    }
  }
};

// Border radius system
export const borderRadius = {
  none: 0,
  xs: '0.125rem', // 2px
  sm: '0.25rem', // 4px
  base: '0.375rem', // 6px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '1.75rem', // 28px
  full: '9999px'
};

// Shadow system
export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
};

// Animation/transition system
export const transitions = {
  duration: {
    fastest: 150,
    faster: 200,
    fast: 250,
    normal: 300,
    slow: 500,
    slower: 700,
    slowest: 1000
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    easeInQuart: 'cubic-bezier(0.5, 0, 0.75, 0)',
    easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
    easeInOutQuart: 'cubic-bezier(0.76, 0, 0.24, 1)'
  }
};

// Z-index system
export const zIndex = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
};

// Breakpoints for responsive design
export const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536
  },

  // Media query helpers
  up: breakpoint => `@media (min-width:${breakpoints.values[breakpoint]}px)`,
  down: breakpoint => `@media (max-width:${breakpoints.values[breakpoint] - 0.05}px)`,
  between: (start, end) =>
    `@media (min-width:${breakpoints.values[start]}px) and (max-width:${
      breakpoints.values[end] - 0.05
    }px)`,
  only: breakpoint => {
    const keys = Object.keys(breakpoints.values);
    const index = keys.indexOf(breakpoint);
    if (index === keys.length - 1) {
      return breakpoints.up(breakpoint);
    }
    return breakpoints.between(breakpoint, keys[index + 1]);
  }
};

// Component-specific design tokens
export const components = {
  button: {
    height: {
      sm: 32,
      md: 40,
      lg: 48
    },
    padding: {
      sm: '6px 16px',
      md: '8px 22px',
      lg: '10px 28px'
    },
    borderRadius: borderRadius.md,
    textTransform: 'none' // Override Material-UI default
  },

  card: {
    borderRadius: borderRadius.lg,
    padding: {
      sm: spacing.md,
      md: spacing.lg,
      lg: spacing.xl
    },
    elevation: 2
  },

  input: {
    height: {
      sm: 32,
      md: 40,
      lg: 48
    },
    borderRadius: borderRadius.md,
    borderWidth: 1
  },

  table: {
    headerHeight: 56,
    rowHeight: 52,
    padding: {
      sm: spacing.sm,
      md: spacing.md
    }
  },

  modal: {
    borderRadius: borderRadius.lg,
    maxWidth: {
      xs: '90vw',
      sm: '500px',
      md: '700px',
      lg: '900px',
      xl: '1200px'
    }
  }
};

// Layout system
export const layout = {
  container: {
    maxWidth: {
      sm: '540px',
      md: '720px',
      lg: '960px',
      xl: '1140px',
      xxl: '1320px'
    },
    padding: {
      xs: spacing.md,
      sm: spacing.lg,
      md: spacing.xl
    }
  },

  sidebar: {
    width: {
      collapsed: 64,
      expanded: 280
    }
  },

  header: {
    height: 64
  },

  footer: {
    height: 80
  }
};

// Export design tokens
export const designTokens = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  components,
  layout
};

export default designTokens;
