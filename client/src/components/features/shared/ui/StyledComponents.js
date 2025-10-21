/**
 * Styled Components Library
 * Consistent UI components following design system guidelines
 */

import { Box, Card, Button, Typography, Container, Chip, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

import { designTokens } from '../../theme/designTokens';

const { colors, borderRadius, shadows, typography } = designTokens;

const SPACING_UNIT = 3;
const SECTION_MARGIN_BOTTOM = 4;
const METRIC_CARD_GAP = 0.5;
const BADGE_DOT_OFFSET = -4;
const BADGE_DOT_SIZE = 8;
const BADGE_VARIANT_SIZE = 16;
const SECTION_PADDING = 6;

// Layout Components
export const AppContainer = styled(Container)(({ theme }) => ({
  maxWidth: designTokens.layout.container.maxWidth.xl,
  padding: theme.spacing(0, 2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(0, SPACING_UNIT)
  }
}));

export const PageHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(SPACING_UNIT, 0),
  borderBottom: `1px solid ${colors.grey[200]}`,
  marginBottom: theme.spacing(SPACING_UNIT),

  '& h1, & h2': {
    margin: 0,
    marginBottom: theme.spacing(1)
  },

  '& .subtitle': {
    color: colors.text.secondary,
    fontSize: typography.fontSize.lg
  }
}));

export const ContentSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(SECTION_MARGIN_BOTTOM),

  '&:last-child': {
    marginBottom: 0
  }
}));

export const GridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),

  '&.grid-cols-1': {
    gridTemplateColumns: 'repeat(1, 1fr)'
  },
  '&.grid-cols-2': {
    gridTemplateColumns: 'repeat(2, 1fr)',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(1, 1fr)'
    }
  },
  '&.grid-cols-3': {
    gridTemplateColumns: 'repeat(3, 1fr)',
    [theme.breakpoints.down('lg')]: {
      gridTemplateColumns: 'repeat(2, 1fr)'
    },
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(1, 1fr)'
    }
  },
  '&.grid-cols-4': {
    gridTemplateColumns: 'repeat(4, 1fr)',
    [theme.breakpoints.down('xl')]: {
      gridTemplateColumns: 'repeat(3, 1fr)'
    },
    [theme.breakpoints.down('lg')]: {
      gridTemplateColumns: 'repeat(2, 1fr)'
    },
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(1, 1fr)'
    }
  }
}));

// Card Components
export const StyledCard = styled(Card)(({ theme, variant = 'default' }) => ({
  borderRadius: borderRadius.lg,
  border: `1px solid ${colors.grey[200]}`,
  transition: theme.transitions.create(['box-shadow', 'transform'], {
    duration: theme.transitions.duration.short
  }),

  '&:hover': {
    boxShadow: shadows.md,
    transform: 'translateY(-2px)'
  },

  ...(variant === 'interactive' && {
    cursor: 'pointer',

    '&:hover': {
      boxShadow: shadows.lg,
      transform: 'translateY(-4px)'
    }
  }),

  ...(variant === 'outlined' && {
    boxShadow: 'none',
    border: `2px solid ${colors.grey[300]}`,

    '&:hover': {
      borderColor: colors.primary[300],
      boxShadow: shadows.sm
    }
  })
}));

export const MetricCard = styled(StyledCard)(({ theme }) => ({
  padding: theme.spacing(SPACING_UNIT),
  textAlign: 'center',

  '& .metric-value': {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.main,
    lineHeight: 1.2,
    marginBottom: theme.spacing(1)
  },

  '& .metric-label': {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: typography.fontWeight.medium
  },

  '& .metric-change': {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginTop: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(METRIC_CARD_GAP)
  }
}));

// Button Components
export const PrimaryButton = styled(Button)(({ ..._ }) => ({
  backgroundColor: colors.primary.main,
  color: colors.primary.contrastText,
  borderRadius: borderRadius.md,
  fontWeight: typography.fontWeight.medium,
  textTransform: 'none',
  boxShadow: 'none',

  '&:hover': {
    backgroundColor: colors.primary[600],
    boxShadow: shadows.sm
  },

  '&:active': {
    backgroundColor: colors.primary[700]
  },

  '&:disabled': {
    backgroundColor: colors.grey[300],
    color: colors.text.disabled
  }
}));

export const SecondaryButton = styled(Button)(({ ..._ }) => ({
  backgroundColor: 'transparent',
  color: colors.primary.main,
  border: `1px solid ${colors.primary.main}`,
  borderRadius: borderRadius.md,
  fontWeight: typography.fontWeight.medium,
  textTransform: 'none',

  '&:hover': {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600]
  }
}));

export const GhostButton = styled(Button)(({ ..._ }) => ({
  backgroundColor: 'transparent',
  color: colors.text.secondary,
  borderRadius: borderRadius.md,
  fontWeight: typography.fontWeight.medium,
  textTransform: 'none',

  '&:hover': {
    backgroundColor: colors.grey[100],
    color: colors.text.primary
  }
}));

// Status Components
export const StatusChip = styled(Chip)(({ status = 'default' }) => {
  const statusColors = {
    success: {
      backgroundColor: colors.success[100],
      color: colors.success[800],
      borderColor: colors.success[300]
    },
    warning: {
      backgroundColor: colors.warning[100],
      color: colors.warning[800],
      borderColor: colors.warning[300]
    },
    error: {
      backgroundColor: colors.error[100],
      color: colors.error[800],
      borderColor: colors.error[300]
    },
    info: {
      backgroundColor: colors.info[100],
      color: colors.info[800],
      borderColor: colors.info[300]
    },
    default: {
      backgroundColor: colors.grey[100],
      color: colors.grey[800],
      borderColor: colors.grey[300]
    }
  };

  return {
    borderRadius: borderRadius.full,
    fontWeight: typography.fontWeight.medium,
    fontSize: typography.fontSize.sm,
    border: '1px solid',
    ...statusColors[status]
  };
});

export const Badge = styled(Box)(({ variant = 'dot', color = 'primary', ..._ }) => ({
  position: 'relative',
  display: 'inline-block',

  '&::after': {
    content: '""',
    position: 'absolute',
    top: variant === 'dot' ? 0 : BADGE_DOT_OFFSET,
    right: variant === 'dot' ? 0 : BADGE_DOT_OFFSET,
    width: variant === 'dot' ? BADGE_DOT_SIZE : BADGE_VARIANT_SIZE,
    height: variant === 'dot' ? BADGE_DOT_SIZE : BADGE_VARIANT_SIZE,
    borderRadius: '50%',
    backgroundColor: colors[color]?.main || colors.primary.main,
    border: `2px solid ${colors.background.paper}`
  }
}));

// Typography Components
export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: typography.fontSize['2xl'],
  fontWeight: typography.fontWeight.semibold,
  color: colors.text.primary,
  marginBottom: theme.spacing(2),
  lineHeight: typography.lineHeight.tight
}));

export const SectionSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.secondary,
  marginBottom: theme.spacing(SPACING_UNIT),
  lineHeight: typography.lineHeight.normal
}));

export const Label = styled(Typography)(({ theme }) => ({
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: theme.spacing(1)
}));

// Form Components
export const FormSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(SPACING_UNIT),
  backgroundColor: colors.background.paper,
  borderRadius: borderRadius.lg,
  border: `1px solid ${colors.grey[200]}`,
  marginBottom: theme.spacing(SPACING_UNIT),

  '& .form-title': {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: theme.spacing(2)
  },

  '& .form-description': {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: theme.spacing(SPACING_UNIT)
  }
}));

export const FieldGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(SPACING_UNIT),

  '&.horizontal': {
    flexDirection: 'row',
    alignItems: 'center',

    '& > *': {
      flex: 1
    }
  }
}));

// Loading and Empty States
export const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(SECTION_PADDING),

  '& .empty-icon': {
    fontSize: '3rem',
    color: colors.grey[400],
    marginBottom: theme.spacing(2)
  },

  '& .empty-title': {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: theme.spacing(1)
  },

  '& .empty-description': {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: theme.spacing(SPACING_UNIT)
  }
}));

export const LoadingBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(SECTION_PADDING),
  minHeight: 200,

  '& .loading-text': {
    marginTop: theme.spacing(2),
    color: colors.text.secondary,
    fontSize: typography.fontSize.base
  }
}));

// Utility Components
export const Divider = styled(Box)(({ theme, variant = 'horizontal' }) => ({
  backgroundColor: colors.grey[200],

  ...(variant === 'horizontal' && {
    width: '100%',
    height: 1,
    margin: theme.spacing(2, 0)
  }),

  ...(variant === 'vertical' && {
    width: 1,
    height: '100%',
    margin: theme.spacing(0, 2)
  })
}));

export const Spacer = styled(Box)(({ theme, size = 'md' }) => {
  const sizes = {
    xs: theme.spacing.xs,
    sm: theme.spacing.sm,
    md: theme.spacing.md,
    lg: theme.spacing.lg,
    xl: theme.spacing.xl
  };

  return {
    height: sizes[size] || sizes.md
  };
});

export const FlexContainer = styled(Box)(
  ({
    theme,
    direction = 'row',
    justify = 'flex-start',
    align = 'stretch',
    wrap = 'nowrap',
    gap = 'md'
  }) => {
    const gapSizes = {
      xs: theme.spacing.xs,
      sm: theme.spacing.sm,
      md: theme.spacing.md,
      lg: theme.spacing.lg,
      xl: theme.spacing.xl
    };

    return {
      display: 'flex',
      flexDirection: direction,
      justifyContent: justify,
      alignItems: align,
      flexWrap: wrap,
      gap: gapSizes[gap] || gapSizes.md
    };
  }
);

// Surface Components
export const SurfaceCard = styled(Paper)(({ level = 1, ..._ }) => ({
  borderRadius: borderRadius.lg,
  border: `1px solid ${colors.grey[200]}`,
  ...(level === 1 && {
    backgroundColor: colors.background.level1,
    boxShadow: shadows.sm
  }),
  ...(level === 2 && {
    backgroundColor: colors.background.level2,
    boxShadow: shadows.base
  })
}));

export const HighlightBox = styled(Box)(({ theme, color = 'primary', ..._ }) => ({
  padding: theme.spacing(2),
  borderRadius: borderRadius.md,
  backgroundColor: colors[color]?.[50] || colors.primary[50],
  border: `1px solid ${colors[color]?.[200] || colors.primary[200]}`,

  '& .highlight-title': {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors[color]?.[800] || colors.primary[800],
    marginBottom: theme.spacing(1)
  },

  '& .highlight-content': {
    fontSize: typography.fontSize.sm,
    color: colors[color]?.[700] || colors.primary[700]
  }
}));

// Export all components
const StyledComponents = {
  // Layout
  AppContainer,
  PageHeader,
  ContentSection,
  GridContainer,

  // Cards
  StyledCard,
  MetricCard,

  // Buttons
  PrimaryButton,
  SecondaryButton,
  GhostButton,

  // Status
  StatusChip,
  Badge,

  // Typography
  SectionTitle,
  SectionSubtitle,
  Label,

  // Forms
  FormSection,
  FieldGroup,

  // States
  EmptyState,
  LoadingBox,

  // Utilities
  Divider,
  Spacer,
  FlexContainer,

  // Surfaces
  SurfaceCard,
  HighlightBox
};

export default StyledComponents;
