/**
 * RTL (Right-to-Left) Support Utilities
 * Comprehensive RTL support for Arabic and other RTL languages
 */

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { styled, createTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import React, { createContext, useContext, useEffect } from 'react';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

import { useLanguage } from '../i18n/index';

// RTL languages configuration
export const rtlLanguages = ['ar'];

// Create RTL cache for emotion
export const createRTLCache = () => {
  return createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin]
  });
};

// Create LTR cache for emotion
export const createLTRCache = () => {
  return createCache({
    key: 'muiltr'
  });
};

// RTL Context
const RTLContext = createContext({
  isRTL: false,
  direction: 'ltr',
  toggleDirection: () => {},
  setDirection: () => {}
});

// RTL Provider Component
export const RTLProvider = ({ children }) => {
  const { isRTL: languageIsRTL } = useLanguage();
  const [isRTL, setIsRTL] = React.useState(languageIsRTL);
  const [direction, setDirection] = React.useState(languageIsRTL ? 'rtl' : 'ltr');

  // Update RTL state when language changes
  useEffect(() => {
    setIsRTL(languageIsRTL);
    setDirection(languageIsRTL ? 'rtl' : 'ltr');

    // Update document direction
    document.dir = languageIsRTL ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', languageIsRTL ? 'rtl' : 'ltr');

    // Add RTL class to body for CSS targeting
    document.body.classList.toggle('rtl', languageIsRTL);
    document.body.classList.toggle('ltr', !languageIsRTL);
  }, [languageIsRTL]);

  const toggleDirection = () => {
    const newIsRTL = !isRTL;
    setIsRTL(newIsRTL);
    setDirection(newIsRTL ? 'rtl' : 'ltr');
    document.dir = newIsRTL ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', newIsRTL);
    document.body.classList.toggle('ltr', !newIsRTL);
  };

  const setDirectionValue = dir => {
    const newIsRTL = dir === 'rtl';
    setIsRTL(newIsRTL);
    setDirection(dir);
    document.dir = dir;
    document.body.classList.toggle('rtl', newIsRTL);
    document.body.classList.toggle('ltr', !newIsRTL);
  };

  // Create appropriate cache
  const cache = isRTL ? createRTLCache() : createLTRCache();

  return (
    <RTLContext.Provider
      value={{
        isRTL,
        direction,
        toggleDirection,
        setDirection: setDirectionValue
      }}
    >
      <CacheProvider value={cache}>{children}</CacheProvider>
    </RTLContext.Provider>
  );
};

RTLProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Hook to use RTL context
export const useRTL = () => {
  const context = useContext(RTLContext);
  if (!context) {
    throw new Error('useRTL must be used within RTLProvider');
  }
  return context;
};

// RTL-aware theme creation
export const createRTLTheme = (baseTheme, isRTL) => {
  return createTheme({
    ...baseTheme,
    direction: isRTL ? 'rtl' : 'ltr',

    components: {
      ...baseTheme.components,

      // Override component styles for RTL
      MuiButton: {
        ...baseTheme.components?.MuiButton,
        styleOverrides: {
          ...baseTheme.components?.MuiButton?.styleOverrides,
          startIcon: {
            ...(isRTL && {
              marginLeft: 8,
              marginRight: -4
            })
          },
          endIcon: {
            ...(isRTL && {
              marginLeft: -4,
              marginRight: 8
            })
          }
        }
      },

      MuiChip: {
        ...baseTheme.components?.MuiChip,
        styleOverrides: {
          ...baseTheme.components?.MuiChip?.styleOverrides,
          deleteIcon: {
            ...(isRTL && {
              marginLeft: 5,
              marginRight: -6
            })
          }
        }
      },

      MuiAlert: {
        ...baseTheme.components?.MuiAlert,
        styleOverrides: {
          ...baseTheme.components?.MuiAlert?.styleOverrides,
          icon: {
            ...(isRTL && {
              marginLeft: 12,
              marginRight: 0
            })
          },
          action: {
            ...(isRTL && {
              marginLeft: 0,
              marginRight: 16,
              paddingLeft: 0,
              paddingRight: 16
            })
          }
        }
      },

      MuiListItemIcon: {
        ...baseTheme.components?.MuiListItemIcon,
        styleOverrides: {
          ...baseTheme.components?.MuiListItemIcon?.styleOverrides,
          root: {
            ...(isRTL && {
              marginLeft: 16,
              marginRight: 0,
              minWidth: 40
            })
          }
        }
      },

      MuiDrawer: {
        ...baseTheme.components?.MuiDrawer,
        styleOverrides: {
          ...baseTheme.components?.MuiDrawer?.styleOverrides,
          paperAnchorLeft: {
            ...(isRTL && {
              borderLeft: 'none',
              borderRight: '1px solid rgba(0, 0, 0, 0.12)'
            })
          },
          paperAnchorRight: {
            ...(isRTL && {
              borderRight: 'none',
              borderLeft: '1px solid rgba(0, 0, 0, 0.12)'
            })
          }
        }
      }
    }
  });
};

// RTL-aware styled components
export const RTLBox = styled('div')(({ theme }) => ({
  direction: 'inherit',

  // RTL-specific styles
  '&[dir="rtl"]': {
    '& .margin-left': {
      marginLeft: 0,
      marginRight: theme.spacing(1)
    },
    '& .margin-right': {
      marginRight: 0,
      marginLeft: theme.spacing(1)
    },
    '& .padding-left': {
      paddingLeft: 0,
      paddingRight: theme.spacing(1)
    },
    '& .padding-right': {
      paddingRight: 0,
      paddingLeft: theme.spacing(1)
    },
    '& .text-left': {
      textAlign: 'right'
    },
    '& .text-right': {
      textAlign: 'left'
    },
    '& .float-left': {
      float: 'right'
    },
    '& .float-right': {
      float: 'left'
    }
  }
}));

// RTL utility functions
export const rtlUtils = {
  // Get appropriate margin/padding for RTL
  getSpacing: (direction, value, isRTL) => {
    const directions = {
      left: isRTL ? 'right' : 'left',
      right: isRTL ? 'left' : 'right',
      start: isRTL ? 'right' : 'left',
      end: isRTL ? 'left' : 'right'
    };

    return {
      [`margin${directions[direction] || direction}`]: value
    };
  },

  // Get RTL-aware text alignment
  getTextAlign: (align, isRTL) => {
    if (align === 'start') return isRTL ? 'right' : 'left';
    if (align === 'end') return isRTL ? 'left' : 'right';
    if (align === 'left') return isRTL ? 'right' : 'left';
    if (align === 'right') return isRTL ? 'left' : 'right';
    return align;
  },

  // Get RTL-aware transform
  getTransform: (transform, isRTL) => {
    if (!isRTL) return transform;

    // Flip translateX values
    return transform.replace(/translateX\(([^)]+)\)/g, (match, value) => {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return `translateX(${-numValue}${value.replace(/[\d.-]/g, '')})`;
      }
      return match;
    });
  },

  // Get RTL-aware border radius
  getBorderRadius: (radius, isRTL) => {
    if (!isRTL || typeof radius !== 'object') return radius;

    return {
      borderTopLeftRadius: radius.borderTopRightRadius || radius.borderTopLeftRadius,
      borderTopRightRadius: radius.borderTopLeftRadius || radius.borderTopRightRadius,
      borderBottomLeftRadius: radius.borderBottomRightRadius || radius.borderBottomLeftRadius,
      borderBottomRightRadius: radius.borderBottomLeftRadius || radius.borderBottomRightRadius
    };
  },

  // Convert logical properties to physical ones
  getLogicalProperty: (property, value, isRTL) => {
    const logicalMap = {
      'margin-inline-start': isRTL ? 'marginRight' : 'marginLeft',
      'margin-inline-end': isRTL ? 'marginLeft' : 'marginRight',
      'padding-inline-start': isRTL ? 'paddingRight' : 'paddingLeft',
      'padding-inline-end': isRTL ? 'paddingLeft' : 'paddingRight',
      'border-inline-start': isRTL ? 'borderRight' : 'borderLeft',
      'border-inline-end': isRTL ? 'borderLeft' : 'borderRight',
      'inset-inline-start': isRTL ? 'right' : 'left',
      'inset-inline-end': isRTL ? 'left' : 'right'
    };

    return {
      [logicalMap[property] || property]: value
    };
  }
};

// RTL-aware CSS helper
export const rtlCSS = {
  // Create RTL-aware styles
  create: (styles, isRTL) => {
    const processStyles = styleObj => {
      const processed = {};

      Object.entries(styleObj).forEach(([key, value]) => {
        if (key.includes('Left') && isRTL) {
          const rightKey = key.replace('Left', 'Right');
          processed[rightKey] = value;
        } else if (key.includes('Right') && isRTL) {
          const leftKey = key.replace('Right', 'Left');
          processed[leftKey] = value;
        } else if (key === 'textAlign') {
          processed[key] = rtlUtils.getTextAlign(value, isRTL);
        } else if (key === 'transform') {
          processed[key] = rtlUtils.getTransform(value, isRTL);
        } else if (typeof value === 'object' && value !== null) {
          processed[key] = processStyles(value);
        } else {
          processed[key] = value;
        }
      });

      return processed;
    };

    return processStyles(styles);
  },

  // Responsive RTL styles
  responsive: (breakpoints, styles, isRTL) => {
    const responsive = {};

    Object.entries(styles).forEach(([breakpoint, styleObj]) => {
      responsive[breakpoints.up(breakpoint)] = rtlCSS.create(styleObj, isRTL);
    });

    return responsive;
  }
};

// RTL-aware components
export const RTLContainer = ({ children, ...props }) => {
  const { isRTL } = useRTL();

  return (
    <RTLBox dir={isRTL ? 'rtl' : 'ltr'} {...props}>
      {children}
    </RTLBox>
  );
};

RTLContainer.propTypes = {
  children: PropTypes.node.isRequired
};

// Language switcher with RTL support
export const LanguageSwitcherRTL = ({ languages, currentLanguage, onLanguageChange }) => {
  const { setDirection } = useRTL();

  const handleLanguageChange = language => {
    onLanguageChange(language);
    const isRTLLanguage = rtlLanguages.includes(language);
    setDirection(isRTLLanguage ? 'rtl' : 'ltr');
  };

  return (
    <select
      value={currentLanguage}
      onChange={e => handleLanguageChange(e.target.value)}
      style={{ direction: 'ltr' }} // Keep selector itself LTR
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.nativeName}
        </option>
      ))}
    </select>
  );
};

LanguageSwitcherRTL.propTypes = {
  languages: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      flag: PropTypes.string.isRequired,
      nativeName: PropTypes.string.isRequired
    })
  ).isRequired,
  currentLanguage: PropTypes.string.isRequired,
  onLanguageChange: PropTypes.func.isRequired
};

const rtlUtilsModule = {
  RTLProvider,
  useRTL,
  createRTLTheme,
  RTLBox,
  RTLContainer,
  LanguageSwitcherRTL,
  rtlUtils,
  rtlCSS,
  rtlLanguages
};

export default rtlUtilsModule;
