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
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStableCallback, useStableMemo } from '../../../utils/performanceOptimization';

// Type definitions for KPICard props
export interface KPICardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
  change?: number;
  changeText?: string;
  progressValue?: number | null;
  progressColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  isCurrency?: boolean;
  suffix?: string;
  delay?: number;
}

export interface CircularKPICardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
  change?: number;
  changeText?: string;
  size?: number;
  delay?: number;
}

// Enhanced type definitions for better type safety
type TrendDirection = 'up' | 'down' | 'flat';
type MUIColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

interface MotionVariants {
  initial: { opacity: number; y?: number; scale?: number };
  animate: { opacity: number; y?: number; scale?: number };
  transition: { duration: number; delay: number };
  whileHover: { y?: number; scale?: number; transition: { duration: number } };
}

const KPICard: React.FC<KPICardProps> = memo(
  ({
    title,
    value,
    icon,
    color = '#1976d2',
    change = 0,
    changeText = '',
    progressValue = null,
    progressColor = 'primary',
    isCurrency = false,
    suffix = '',
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

    // Memoize trend color with proper typing
    const trendColor: string = useStableMemo(() => {
      if (change > 0) return 'success.main';
      if (change < 0) return 'error.main';
      return 'warning.main';
    }, [change]);

    // Memoize avatar styles with proper typing
    const avatarStyles = useStableMemo(
      () => ({
        bgcolor: color,
        width: 50,
        height: 50
      }),
      [color]
    );

    // Memoize motion variants with proper typing
    const motionVariants: MotionVariants = useStableMemo(
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
              {icon && <Avatar sx={avatarStyles}>{icon}</Avatar>}
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

// Circular KPI Card variant with performance optimizations and TypeScript
export const CircularKPICard: React.FC<CircularKPICardProps> = memo(
  ({
    title,
    value,
    icon,
    color = '#1976d2',
    change = 0,
    changeText = '',
    size = 120,
    delay = 0
  }) => {
    const { t } = useTranslation();

    // Memoize calculations and styles with proper typing
    const progressValue: number = useStableMemo(
      () => (value > 100 ? 100 : Math.max(0, value)),
      [value]
    );

    const avatarSize = useStableMemo(
      () => ({
        width: size / 3,
        height: size / 3
      }),
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
      if (change > 0) return <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />;
      if (change < 0) return <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />;
      return <TrendingFlatIcon sx={{ fontSize: 16, color: 'warning.main' }} />;
    }, [change]);

    const trendColor: string = useStableMemo(() => {
      if (change > 0) return 'success.main';
      if (change < 0) return 'error.main';
      return 'warning.main';
    }, [change]);

    const motionVariants: MotionVariants = useStableMemo(
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
              value={100}
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
              sx={{ color }}
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
              {icon && <Avatar sx={avatarStyles}>{icon}</Avatar>}
            </Box>
          </Box>

          <Typography variant='body2' color='text.secondary' align='center' gutterBottom>
            {t(title)}
          </Typography>

          <Typography variant='h6' component='div' sx={{ fontWeight: 600, mb: 0.5 }}>
            {value}%
          </Typography>

          {(change !== 0 || changeText) && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {trendIcon}
              <Typography
                variant='caption'
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

// Set display names for better debugging
KPICard.displayName = 'KPICard';
CircularKPICard.displayName = 'CircularKPICard';

export default KPICard;
