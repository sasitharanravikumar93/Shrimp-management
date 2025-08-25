/**
 * Enhanced Material-UI Theme Configuration
 * Utilizes design tokens for consistent styling across the application
 */

import { createTheme } from '@mui/material/styles';

import { designTokens } from './designTokens';

const { colors, spacing, typography, borderRadius, shadows, transitions, components } =
  designTokens;

// Base theme configuration
const baseTheme = {
  // Color palette
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
      contrastText: colors.primary.contrastText,
      ...colors.primary
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
      contrastText: colors.secondary.contrastText,
      ...colors.secondary
    },
    error: {
      main: colors.error.main,
      light: colors.error.light,
      dark: colors.error.dark,
      contrastText: colors.error.contrastText,
      ...colors.error
    },
    warning: {
      main: colors.warning.main,
      light: colors.warning.light,
      dark: colors.warning.dark,
      contrastText: colors.warning.contrastText,
      ...colors.warning
    },
    info: {
      main: colors.info.main,
      light: colors.info.light,
      dark: colors.info.dark,
      contrastText: colors.info.contrastText,
      ...colors.info
    },
    success: {
      main: colors.success.main,
      light: colors.success.light,
      dark: colors.success.dark,
      contrastText: colors.success.contrastText,
      ...colors.success
    },
    grey: colors.grey,
    text: colors.text,
    background: colors.background,
    divider: colors.divider,
    action: colors.action
  },

  // Typography
  typography: {
    fontFamily: typography.fontFamily.primary,
    fontWeightLight: typography.fontWeight.light,
    fontWeightRegular: typography.fontWeight.regular,
    fontWeightMedium: typography.fontWeight.medium,
    fontWeightBold: typography.fontWeight.bold,

    // Typography variants
    h1: {
      ...typography.variants.h1,
      fontFamily: typography.fontFamily.primary,
      color: colors.text.primary
    },
    h2: {
      ...typography.variants.h2,
      fontFamily: typography.fontFamily.primary,
      color: colors.text.primary
    },
    h3: {
      ...typography.variants.h3,
      fontFamily: typography.fontFamily.primary,
      color: colors.text.primary
    },
    h4: {
      ...typography.variants.h4,
      fontFamily: typography.fontFamily.primary,
      color: colors.text.primary
    },
    h5: {
      ...typography.variants.h5,
      fontFamily: typography.fontFamily.primary,
      color: colors.text.primary
    },
    h6: {
      ...typography.variants.h6,
      fontFamily: typography.fontFamily.primary,
      color: colors.text.primary
    },
    subtitle1: {
      ...typography.variants.subtitle1,
      color: colors.text.primary
    },
    subtitle2: {
      ...typography.variants.subtitle2,
      color: colors.text.secondary
    },
    body1: {
      ...typography.variants.body1,
      color: colors.text.primary
    },
    body2: {
      ...typography.variants.body2,
      color: colors.text.secondary
    },
    button: {
      ...typography.variants.button,
      textTransform: components.button.textTransform
    },
    caption: {
      ...typography.variants.caption,
      color: colors.text.secondary
    },
    overline: {
      ...typography.variants.overline,
      color: colors.text.secondary
    }
  },

  // Spacing
  spacing: spacing.base,

  // Breakpoints
  breakpoints: {
    values: designTokens.breakpoints.values
  },

  // Z-index
  zIndex: designTokens.zIndex,

  // Transitions
  transitions: {
    duration: {
      shortest: transitions.duration.fastest,
      shorter: transitions.duration.faster,
      short: transitions.duration.fast,
      standard: transitions.duration.normal,
      complex: transitions.duration.slow,
      enteringScreen: transitions.duration.slow,
      leavingScreen: transitions.duration.faster
    },
    easing: {
      easeInOut: transitions.easing.easeInOut,
      easeOut: transitions.easing.easeOut,
      easeIn: transitions.easing.easeIn,
      sharp: transitions.easing.easeInQuart
    }
  },

  // Shadows (Material-UI format)
  shadows: [
    'none',
    shadows.xs,
    shadows.sm,
    shadows.base,
    shadows.md,
    shadows.lg,
    shadows.xl,
    shadows['2xl'],
    '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
    '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
    '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
    '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
    '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
    '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
    '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
    '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
    '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
    '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
    '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
    '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)'
  ],

  // Shape
  shape: {
    borderRadius: parseInt(borderRadius.md.replace('rem', '')) * 16 // Convert rem to px for MUI
  }
};

// Component overrides
const componentOverrides = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.md,
        textTransform: components.button.textTransform,
        fontWeight: typography.fontWeight.medium,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: shadows.sm
        }
      },
      sizeSmall: {
        height: components.button.height.sm,
        padding: components.button.padding.sm,
        fontSize: typography.fontSize.sm
      },
      sizeMedium: {
        height: components.button.height.md,
        padding: components.button.padding.md,
        fontSize: typography.fontSize.base
      },
      sizeLarge: {
        height: components.button.height.lg,
        padding: components.button.padding.lg,
        fontSize: typography.fontSize.lg
      }
    }
  },

  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.lg,
        boxShadow: shadows.base,
        '&:hover': {
          boxShadow: shadows.md
        }
      }
    }
  },

  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.md
      },
      elevation1: {
        boxShadow: shadows.sm
      },
      elevation2: {
        boxShadow: shadows.base
      },
      elevation3: {
        boxShadow: shadows.md
      }
    }
  },

  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: borderRadius.md,
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary[300]
            }
          }
        }
      }
    }
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.md,
        '&.MuiInputBase-sizeSmall': {
          height: components.input.height.sm
        }
      }
    }
  },

  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.full,
        fontWeight: typography.fontWeight.medium
      }
    }
  },

  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.md,
        border: 'none'
      }
    }
  },

  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: borderRadius.lg,
        boxShadow: shadows.xl
      }
    }
  },

  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: borderRadius.md,
        border: `1px solid ${colors.grey[200]}`,
        boxShadow: shadows.lg
      }
    }
  },

  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: borderRadius.md,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        backgroundColor: colors.grey[800]
      }
    }
  },

  MuiTableHead: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-head': {
          backgroundColor: colors.grey[50],
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary
        }
      }
    }
  },

  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: `1px solid ${colors.grey[200]}`
      }
    }
  },

  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: shadows.sm,
        backgroundColor: colors.background.paper,
        color: colors.text.primary
      }
    }
  },

  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: `1px solid ${colors.grey[200]}`,
        boxShadow: 'none'
      }
    }
  }
};

// Create the theme
export const createAppTheme = (mode = 'light') => {
  const theme = createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      mode
    }
  });

  // Add component overrides to the created theme
  theme.components = componentOverrides;

  return theme;
};

// Default light theme
export const lightTheme = createAppTheme('light');

// Dark theme (for future implementation)
export const darkTheme = createAppTheme('dark');

// Export default theme
export default lightTheme;
