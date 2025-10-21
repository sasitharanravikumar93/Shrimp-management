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

const KPICard = memo(
  ({
    title,
    value,
    icon,
    color = '#1976d2',
    change = 0,
    changeText,
    progressValue = null,
    progressColor = 'primary',
    isCurrency = false,
    suffix,
    delay = 0
  }) => {
    const { t } = useTranslation();

    // Memoize value formatting to prevent recalculation
    const formattedValue = useStableMemo(() => {
      if (isCurrency) {
        return `${value.toLocaleString()}`;
      }
      return `${value}${suffix}`;
    }, [value, isCurrency, suffix]);

    // Memoize trend icon to prevent re-creation
    const trendIcon = useStableMemo(() => {
      if (change > 0) return <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />;
      if (change < 0) return <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />;
      return <TrendingFlatIcon sx={{ fontSize: 16, color: 'warning.main' }} />;
    }, [change]);

    // Memoize trend color
    const trendColor = useStableMemo(() => {
      if (change > 0) return 'success.main';
      if (change < 0) return 'error.main';
      return 'warning.main';
    }, [change]);

    // Memoize avatar styles
    const avatarStyles = useStableMemo(
      () => ({
        bgcolor: color,
        width: 50,
        height: 50
      }),
      [color]
    );

    // Memoize motion variants
    const motionVariants = useStableMemo(
      () => ({
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay },
        whileHover: { y: -5, transition: { duration: 0.2 } }
      }),
      [delay]
    );

    return (
      <motion.div {...motionVariants}>
        <Card
          elevation={3}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              boxShadow: 6
            }
          }}
        >
          <CardContent sx={{ flexGrow: 1, p: 2 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <Box>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  {t(title)}
                </Typography>
                <Typography variant='h5' component='div' sx={{ fontWeight: 600, mb: 1 }}>
                  {formattedValue}
                </Typography>
                {(change !== 0 || changeText) && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {trendIcon}
                    <Typography
                      variant='body2'
                      sx={{
                        ml: 0.5,
                        color: trendColor
                      }}
                    >
                      {changeText || `${change > 0 ? '+' : ''}${change}%`}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Avatar sx={avatarStyles}>{icon}</Avatar>
            </Box>

            {progressValue !== null && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant='determinate'
                  value={progressValue}
                  color={progressColor}
                  sx={{ borderRadius: 2, height: 8 }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);

// Circular KPI Card variant with performance optimizations
export const CircularKPICard = memo(
  ({ title, value, icon, color = '#1976d2', change = 0, changeText, size = 120, delay = 0 }) => {
    const { t } = useTranslation();

    const FULL_PROGRESS = 100;
    const AVATAR_SIZE_DIVISOR = 3;

    // Memoize calculations and styles
    const progressValue = useStableMemo(
      () => (value > FULL_PROGRESS ? FULL_PROGRESS : value),
      [value]
    );
    const avatarSize = useStableMemo(
      () => ({ width: size / AVATAR_SIZE_DIVISOR, height: size / AVATAR_SIZE_DIVISOR }),
      [size]
    );
    const avatarStyles = useStableMemo(
      () => ({
        bgcolor: color,
        ...avatarSize
      }),
      [color, avatarSize]
    );

    const trendIcon = useStableMemo(() => {
      return change > 0 ? (
        <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
      ) : (
        <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
      );
    }, [change]);

    const trendColor = useStableMemo(() => {
      return change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'warning.main';
    }, [change]);

    const motionVariants = useStableMemo(
      () => ({
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5, delay },
        whileHover: { scale: 1.05, transition: { duration: 0.2 } }
      }),
      [delay]
    );

    return (
      <motion.div {...motionVariants}>
        <Card
          elevation={3}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              boxShadow: 6
            }
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
            <CircularProgress
              variant='determinate'
              value={FULL_PROGRESS}
              size={size}
              thickness={3}
              sx={{
                color: 'rgba(0, 0, 0, 0.08)',
                position: 'absolute',
                left: 0
              }}
            />
            <CircularProgress
              variant='determinate'
              value={progressValue}
              size={size}
              thickness={3}
              sx={{ color: color }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Avatar sx={avatarStyles}>{icon}</Avatar>
            </Box>
          </Box>
          <Typography variant='h6' component='div' sx={{ fontWeight: 600, textAlign: 'center' }}>
            {t(title)}
          </Typography>
          {(change !== 0 || changeText) && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              {trendIcon}
              <Typography
                variant='body2'
                sx={{
                  ml: 0.5,
                  color: trendColor
                }}
              >
                {changeText || `${change > 0 ? '+' : ''}${change}%`}
              </Typography>
            </Box>
          )}
        </Card>
      </motion.div>
    );
  }
);

// Add display names for better debugging
KPICard.displayName = 'KPICard';
CircularKPICard.displayName = 'CircularKPICard';

export default KPICard;

// Add PropTypes validation
KPICard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.element,
  color: PropTypes.string,
  change: PropTypes.number,
  changeText: PropTypes.string,
  progressValue: PropTypes.number,
  progressColor: PropTypes.string,
  isCurrency: PropTypes.bool,
  suffix: PropTypes.string,
  delay: PropTypes.number
};

// Default props removed - using JavaScript default parameters instead

// Add PropTypes for CircularKPICard
CircularKPICard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.element,
  color: PropTypes.string,
  change: PropTypes.number,
  changeText: PropTypes.string,
  size: PropTypes.number,
  delay: PropTypes.number
};

// Default props removed from CircularKPICard - using JavaScript default parameters instead
