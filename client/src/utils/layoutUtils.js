/**
 * Layout Utilities
 * Helper functions and components for consistent layout patterns
 */

import { Box, Container, Grid, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

import { designTokens } from '../theme/designTokens';

const { spacing, breakpoints } = designTokens;

// Responsive spacing utility
export const getResponsiveSpacing = size => {
  const spacingMap = {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
    xxl: spacing.xxl,
    xxxl: spacing.xxxl
  };

  return spacingMap[size] || spacingMap.md;
};

// Responsive container sizes
export const getContainerSize = size => {
  const containerSizes = {
    xs: '100%',
    sm: '540px',
    md: '720px',
    lg: '960px',
    xl: '1140px',
    xxl: '1320px',
    fluid: '100%'
  };

  return containerSizes[size] || containerSizes.lg;
};

// Layout Grid Component
export const LayoutGrid = styled(Grid)(({ theme, spacing: spacingProp = 'md' }) => ({
  padding: theme.spacing(0, getResponsiveSpacing(spacingProp) / 8),

  '& .MuiGrid-item': {
    paddingLeft: theme.spacing(getResponsiveSpacing(spacingProp) / 8),
    paddingRight: theme.spacing(getResponsiveSpacing(spacingProp) / 8),
    paddingTop: theme.spacing(getResponsiveSpacing(spacingProp) / 8),
    paddingBottom: theme.spacing(getResponsiveSpacing(spacingProp) / 8)
  }
}));

// Responsive Stack Component
export const ResponsiveStack = styled(Stack)(
  ({ theme, spacing: spacingProp = 'md', direction = 'column', breakpoint = 'md' }) => ({
    gap: getResponsiveSpacing(spacingProp),
    flexDirection: direction,

    [theme.breakpoints.down(breakpoint)]: {
      flexDirection: 'column',
      gap: getResponsiveSpacing('sm')
    }
  })
);

// Section Container
export const Section = styled(Box)(
  ({ theme, padding = 'lg', margin = 'lg', fullWidth = false }) => ({
    padding: theme.spacing(getResponsiveSpacing(padding) / 8),
    margin: theme.spacing(getResponsiveSpacing(margin) / 8, 0),
    width: fullWidth ? '100%' : 'auto',

    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(getResponsiveSpacing('md') / 8),
      margin: theme.spacing(getResponsiveSpacing('md') / 8, 0)
    }
  })
);

// Page Layout Component
export const PageLayout = ({
  children,
  maxWidth = 'lg',
  padding = 'lg',
  background = 'default'
}) => {
  const backgroundColors = {
    default: 'background.default',
    paper: 'background.paper',
    transparent: 'transparent'
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: backgroundColors[background] || backgroundColors.default,
        paddingTop: getResponsiveSpacing(padding) / 8,
        paddingBottom: getResponsiveSpacing(padding) / 8
      }}
    >
      <Container
        maxWidth={maxWidth}
        sx={{
          paddingX: { xs: 2, sm: 3, md: 4 }
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

// Card Layout with consistent spacing
export const CardLayout = styled(Box)(({ theme, padding = 'lg', variant = 'default' }) => ({
  padding: theme.spacing(getResponsiveSpacing(padding) / 8),
  borderRadius: theme.shape.borderRadius * 1.5,

  ...(variant === 'compact' && {
    padding: theme.spacing(getResponsiveSpacing('md') / 8)
  }),

  ...(variant === 'spacious' && {
    padding: theme.spacing(getResponsiveSpacing('xl') / 8)
  }),

  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(getResponsiveSpacing('md') / 8)
  }
}));

// Two Column Layout
export const TwoColumnLayout = ({
  left,
  right,
  leftWidth = 'auto',
  rightWidth = 'auto',
  gap = 'lg',
  breakpoint = 'md',
  reverseOnMobile = false
}) => (
  <Box
    sx={{
      display: 'flex',
      gap: getResponsiveSpacing(gap) / 8,
      flexDirection: { xs: reverseOnMobile ? 'column-reverse' : 'column', [breakpoint]: 'row' },

      '& > :first-of-type': {
        flex: leftWidth === 'auto' ? 1 : `0 0 ${leftWidth}`,
        minWidth: 0
      },

      '& > :last-of-type': {
        flex: rightWidth === 'auto' ? 1 : `0 0 ${rightWidth}`,
        minWidth: 0
      }
    }}
  >
    <Box>{left}</Box>
    <Box>{right}</Box>
  </Box>
);

// Sidebar Layout
export const SidebarLayout = ({
  sidebar,
  content,
  sidebarWidth = '280px',
  gap = 'lg',
  sidebarPosition = 'left',
  collapsible = false
}) => (
  <Box
    sx={{
      display: 'flex',
      gap: getResponsiveSpacing(gap) / 8,
      flexDirection: { xs: 'column', md: 'row' },
      minHeight: '100vh',

      ...(sidebarPosition === 'right' && {
        flexDirection: { xs: 'column', md: 'row-reverse' }
      })
    }}
  >
    <Box
      sx={{
        flex: { xs: 'none', md: `0 0 ${sidebarWidth}` },
        minWidth: 0,

        ...(collapsible && {
          transition: 'flex-basis 0.3s ease'
        })
      }}
    >
      {sidebar}
    </Box>
    <Box
      sx={{
        flex: 1,
        minWidth: 0
      }}
    >
      {content}
    </Box>
  </Box>
);

// Centered Layout
export const CenteredLayout = ({
  children,
  maxWidth = 'sm',
  minHeight = '50vh',
  padding = 'lg'
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight,
      padding: getResponsiveSpacing(padding) / 8
    }}
  >
    <Box
      sx={{
        width: '100%',
        maxWidth: getContainerSize(maxWidth)
      }}
    >
      {children}
    </Box>
  </Box>
);

// Grid Layout with responsive columns
export const ResponsiveGrid = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  minItemWidth = '250px'
}) => (
  <Box
    sx={{
      display: 'grid',
      gap: getResponsiveSpacing(gap) / 8,
      gridTemplateColumns: {
        xs: `repeat(${columns.xs}, 1fr)`,
        sm: `repeat(${columns.sm || columns.xs}, 1fr)`,
        md: `repeat(${columns.md || columns.sm || columns.xs}, 1fr)`,
        lg: `repeat(${columns.lg || columns.md || columns.sm || columns.xs}, 1fr)`,
        xl: `repeat(${columns.xl || columns.lg || columns.md || columns.sm || columns.xs}, 1fr)`
      },

      // Auto-fit grid for dynamic columns
      ...(minItemWidth && {
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
      })
    }}
  >
    {children}
  </Box>
);

// Masonry Layout (CSS Grid based)
export const MasonryGrid = ({ children, columns = { xs: 1, sm: 2, md: 3 }, gap = 'md' }) => (
  <Box
    sx={{
      columnCount: {
        xs: columns.xs,
        sm: columns.sm || columns.xs,
        md: columns.md || columns.sm || columns.xs,
        lg: columns.lg || columns.md || columns.sm || columns.xs
      },
      columnGap: getResponsiveSpacing(gap) / 8,

      '& > *': {
        breakInside: 'avoid',
        marginBottom: getResponsiveSpacing(gap) / 8,
        display: 'inline-block',
        width: '100%'
      }
    }}
  >
    {children}
  </Box>
);

// Sticky Container
export const StickyContainer = ({ children, top = 0, zIndex = 10 }) => (
  <Box
    sx={{
      position: 'sticky',
      top,
      zIndex,
      backgroundColor: 'background.paper',
      borderBottom: '1px solid',
      borderColor: 'divider'
    }}
  >
    {children}
  </Box>
);

// Layout utilities for consistent spacing
export const layoutUtils = {
  getResponsiveSpacing,
  getContainerSize,

  // Spacing constants
  spacing: {
    component: spacing.component,
    section: spacing.lg,
    page: spacing.xl
  },

  // Common layout patterns
  patterns: {
    cardSpacing: spacing.md,
    listItemSpacing: spacing.sm,
    formFieldSpacing: spacing.md,
    buttonGroupSpacing: spacing.sm
  },

  // Responsive helpers
  responsive: {
    mobileFirst: styles => ({
      ...styles.xs,
      [breakpoints.up('sm')]: styles.sm,
      [breakpoints.up('md')]: styles.md,
      [breakpoints.up('lg')]: styles.lg,
      [breakpoints.up('xl')]: styles.xl
    })
  }
};

export default {
  LayoutGrid,
  ResponsiveStack,
  Section,
  PageLayout,
  CardLayout,
  TwoColumnLayout,
  SidebarLayout,
  CenteredLayout,
  ResponsiveGrid,
  MasonryGrid,
  StickyContainer,
  layoutUtils
};
