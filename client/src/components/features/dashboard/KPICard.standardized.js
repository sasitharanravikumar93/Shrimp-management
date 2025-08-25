import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStableMemo } from '../../../utils/performanceOptimization';
import { kpiCardPropTypes, kpiCardDefaultProps } from '../../../utils/propTypes';

/**
 * KPICard - Displays key performance indicator with standardized prop interface
 *
 * This component follows the standardized prop naming conventions:
 * - Consistent camelCase naming
 * - Clear semantic prop names
 * - Standard event handler patterns
 * - Theme-aware styling props
 */
const KPICard = memo(
  ({
    // Base props (inherited from baseComponentPropTypes)
    id,
    className,
    style,
    testId,
    disabled,
    loading,

    // Theme props (inherited from themePropTypes)
    color,
    size,
    variant,

    // Content props (specific to KPICard)
    title,
    value,
    icon,
    subtitle,
    description,

    // Display props
    change,
    changeText,
    progressValue,
    progressColor,
    isCurrency,
    suffix,

    // Interaction props
    onClick,
    onHover,

    // Animation props
    animationDelay,
    animationDuration,

    // Accessibility props
    ariaLabel,
    ariaDescription,

    // Advanced props
    showTrend,
    showProgress,
    customIcon,

    ...rest
  }) => {
    const { t } = useTranslation();

    // Memoize formatted value to prevent recalculation
    const formattedValue = useStableMemo(() => {
      if (loading) return '---';
      if (isCurrency) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      }
      return `${value}${suffix}`;
    }, [value, isCurrency, suffix, loading]);

    // Memoize trend icon based on change value
    const trendIcon = useStableMemo(() => {
      if (!showTrend || change === 0) return null;

      const iconProps = {
        sx: {
          fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
          color: change > 0 ? 'success.main' : 'error.main'
        }
      };

      return change > 0 ? <TrendingUpIcon {...iconProps} /> : <TrendingDownIcon {...iconProps} />;
    }, [change, showTrend, size]);

    // Memoize trend color
    const trendColor = useStableMemo(() => {
      if (change > 0) return 'success.main';
      if (change < 0) return 'error.main';
      return 'warning.main';
    }, [change]);

    // Memoize avatar styles based on size and color
    const avatarStyles = useStableMemo(() => {
      const sizeMap = {
        small: { width: 40, height: 40 },
        medium: { width: 50, height: 50 },
        large: { width: 60, height: 60 }
      };

      return {
        bgcolor:
          color === 'primary'
            ? 'primary.main'
            : color === 'secondary'
            ? 'secondary.main'
            : color || '#1976d2',
        ...sizeMap[size]
      };
    }, [color, size]);

    // Memoize motion variants for animation
    const motionVariants = useStableMemo(
      () => ({
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: animationDuration,
          delay: animationDelay
        },
        whileHover: onClick
          ? {
              y: -5,
              transition: { duration: 0.2 }
            }
          : {}
      }),
      [animationDelay, animationDuration, onClick]
    );

    // Card interaction handlers
    const handleClick = () => {
      if (!disabled && !loading && onClick) {
        onClick();
      }
    };

    const handleMouseEnter = () => {
      if (!disabled && !loading && onHover) {
        onHover();
      }
    };

    return (
      <motion.div {...motionVariants} data-testid={testId} className={className} style={style}>
        <Card
          id={id}
          elevation={variant === 'outlined' ? 0 : 3}
          variant={variant === 'outlined' ? 'outlined' : 'elevation'}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            opacity: disabled ? 0.6 : 1,
            cursor: onClick && !disabled && !loading ? 'pointer' : 'default',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover':
              onClick && !disabled && !loading
                ? {
                    boxShadow: 6,
                    transform: 'translateY(-2px)'
                  }
                : {},
            ...style
          }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          aria-label={ariaLabel || `KPI Card: ${title}`}
          aria-description={ariaDescription}
          role={onClick ? 'button' : 'article'}
          tabIndex={onClick && !disabled ? 0 : -1}
          {...rest}
        >
          <CardContent
            sx={{
              flexGrow: 1,
              p: size === 'small' ? 1.5 : size === 'large' ? 3 : 2
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Title */}
                <Typography
                  variant={size === 'small' ? 'caption' : 'body2'}
                  color='text.secondary'
                  gutterBottom
                  noWrap
                >
                  {t(title)}
                </Typography>

                {/* Subtitle */}
                {subtitle && (
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    display='block'
                    sx={{ mb: 0.5 }}
                  >
                    {t(subtitle)}
                  </Typography>
                )}

                {/* Main Value */}
                <Typography
                  variant={size === 'small' ? 'h6' : size === 'large' ? 'h4' : 'h5'}
                  component='div'
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    wordBreak: 'break-word'
                  }}
                >
                  {loading ? (
                    <CircularProgress size={size === 'small' ? 16 : 20} />
                  ) : (
                    formattedValue
                  )}
                </Typography>

                {/* Change/Trend Display */}
                {showTrend && !loading && (change !== 0 || changeText) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {trendIcon}
                    <Typography
                      variant={size === 'small' ? 'caption' : 'body2'}
                      sx={{
                        ml: 0.5,
                        color: trendColor,
                        fontWeight: 500
                      }}
                    >
                      {changeText || `${change > 0 ? '+' : ''}${change}%`}
                    </Typography>
                  </Box>
                )}

                {/* Description */}
                {description && (
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ mt: 1, display: 'block' }}
                  >
                    {t(description)}
                  </Typography>
                )}
              </Box>

              {/* Icon */}
              <Avatar sx={avatarStyles}>{customIcon || icon}</Avatar>
            </Box>

            {/* Progress Bar */}
            {showProgress && progressValue !== null && !loading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant='determinate'
                  value={Math.min(Math.max(progressValue, 0), 100)}
                  color={progressColor}
                  sx={{
                    borderRadius: 2,
                    height: size === 'small' ? 6 : size === 'large' ? 10 : 8
                  }}
                />
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ mt: 0.5, display: 'block' }}
                >
                  {Math.round(progressValue)}% Complete
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);

// Standardized PropTypes using the utility functions
KPICard.propTypes = {
  ...kpiCardPropTypes,

  // Additional props specific to this component
  subtitle: PropTypes.string,
  description: PropTypes.string,
  onHover: PropTypes.func,
  animationDuration: PropTypes.number,
  ariaLabel: PropTypes.string,
  ariaDescription: PropTypes.string,
  showTrend: PropTypes.bool,
  showProgress: PropTypes.bool,
  customIcon: PropTypes.node,
  progressColor: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error'])
};

KPICard.defaultProps = {
  ...kpiCardDefaultProps,

  // Component-specific defaults
  animationDuration: 0.5,
  showTrend: true,
  showProgress: false,
  progressColor: 'primary'
};

// Display name for debugging
KPICard.displayName = 'KPICard';

export default KPICard;

/**
 * Benefits of this standardization:
 *
 * 1. **Consistent Prop Naming**: All props follow camelCase and semantic naming
 * 2. **Type Safety**: PropTypes provide runtime validation
 * 3. **Accessibility**: Built-in ARIA attributes and keyboard navigation
 * 4. **Theme Integration**: Consistent color, size, and variant props
 * 5. **Performance**: Memoized calculations prevent unnecessary re-renders
 * 6. **Extensibility**: Easy to add new features while maintaining compatibility
 * 7. **Documentation**: Clear prop documentation and usage examples
 * 8. **Testing**: testId prop for reliable test targeting
 *
 * Usage Examples:
 *
 * // Basic usage
 * <KPICard
 *   title="Total Revenue"
 *   value={125000}
 *   isCurrency
 *   icon={<MoneyIcon />}
 *   change={12.5}
 * />
 *
 * // With progress and custom styling
 * <KPICard
 *   title="Project Progress"
 *   value="85"
 *   suffix="%"
 *   icon={<ProjectIcon />}
 *   showProgress
 *   progressValue={85}
 *   size="large"
 *   color="success"
 *   onClick={() => console.log('Clicked!')}
 * />
 *
 * // Loading state
 * <KPICard
 *   title="Loading Data"
 *   value={0}
 *   loading
 *   icon={<DataIcon />}
 * />
 */
