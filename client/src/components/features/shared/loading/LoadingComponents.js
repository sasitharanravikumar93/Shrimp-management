import {
  CircularProgress,
  LinearProgress,
  Skeleton,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Spinner Loading Component
 * Simple circular progress indicator
 */
export const SpinnerLoader = ({
  size = 40,
  color = 'primary',
  centered = true,
  message,
  ...props
}) => {
  const spinner = <CircularProgress size={size} color={color} {...props} />;

  if (!centered && !message) {
    return spinner;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 2
      }}
    >
      {spinner}
      {message && (
        <Typography variant='body2' color='text.secondary'>
          {message}
        </Typography>
      )}
    </Box>
  );
};

/**
 * Linear Progress Loading Component
 * For operations with progress indication
 */
export const LinearLoader = ({ progress, message, showPercentage = false, ...props }) => {
  return (
    <Box sx={{ width: '100%', py: 1 }}>
      {message && (
        <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
          {message}
          {showPercentage && progress && ` (${Math.round(progress)}%)`}
        </Typography>
      )}
      <LinearProgress
        variant={progress !== undefined ? 'determinate' : 'indeterminate'}
        value={progress}
        {...props}
      />
    </Box>
  );
};

/**
 * Skeleton Loading Components
 * For content placeholders while loading
 */
export const SkeletonCard = ({ height = 200, showAvatar = false, lines = 3, ...props }) => {
  return (
    <Card {...props}>
      <CardContent>
        <Stack spacing={1}>
          {showAvatar && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Skeleton variant='circular' width={40} height={40} />
              <Skeleton variant='text' width='40%' />
            </Box>
          )}
          <Skeleton variant='rectangular' height={height} />
          {Array.from({ length: lines }, (_, index) => (
            <Skeleton key={index} variant='text' width={index === lines - 1 ? '60%' : '100%'} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export const SkeletonTable = ({ rows = 5, columns = 4 }) => {
  return (
    <Box>
      {/* Table header */}
      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton key={index} variant='text' width='100%' height={40} />
        ))}
      </Box>
      {/* Table rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <Box key={rowIndex} sx={{ display: 'flex', gap: 2, mb: 1 }}>
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton key={colIndex} variant='text' width='100%' height={30} />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export const SkeletonChart = ({ height = 300 }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Skeleton variant='text' width='40%' height={30} sx={{ mb: 2 }} />
      <Skeleton variant='rectangular' height={height} />
    </Paper>
  );
};

/**
 * Page Loading Component
 * Full page loading overlay
 */
export const PageLoader = ({ message = 'Loading...', backdrop = true, minHeight = '400px' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        backgroundColor: backdrop ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
        position: backdrop ? 'fixed' : 'static',
        top: backdrop ? 0 : 'auto',
        left: backdrop ? 0 : 'auto',
        right: backdrop ? 0 : 'auto',
        bottom: backdrop ? 0 : 'auto',
        zIndex: backdrop ? 1300 : 'auto'
      }}
    >
      <CircularProgress size={60} />
      <Typography variant='h6' sx={{ mt: 2, color: 'text.secondary' }}>
        {message}
      </Typography>
    </Box>
  );
};

/**
 * Section Loading Component
 * For loading sections within a page
 */
export const SectionLoader = ({
  message,
  height = 200,
  variant = 'skeleton' // 'spinner', 'skeleton', 'linear'
}) => {
  if (variant === 'spinner') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height,
          border: 1,
          borderColor: 'grey.200',
          borderRadius: 1,
          backgroundColor: 'grey.50'
        }}
      >
        <CircularProgress />
        {message && (
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  if (variant === 'linear') {
    return (
      <Box sx={{ p: 2 }}>
        <LinearLoader message={message} />
      </Box>
    );
  }

  // Default to skeleton
  return <SkeletonCard height={height} />;
};

/**
 * Button Loading Component
 * For buttons with loading states
 */
export const LoadingButton = ({
  loading = false,
  children,
  loadingText = 'Loading...',
  startIcon,
  ...props
}) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <button
        disabled={loading}
        {...props}
        style={{
          ...props.style,
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            {loadingText}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {startIcon}
            {children}
          </Box>
        )}
      </button>
    </Box>
  );
};

/**
 * Data Loading States Hook
 * Manage different loading states for data fetching
 */
export const useLoadingStates = (initialState = {}) => {
  const [loadingStates, setLoadingStates] = React.useState({
    initial: true,
    refetch: false,
    submit: false,
    delete: false,
    ...initialState
  });

  const setLoading = (key, value) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const isAnyLoading = React.useMemo(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  return {
    loadingStates,
    setLoading,
    isAnyLoading
  };
};

export default {
  SpinnerLoader,
  LinearLoader,
  SkeletonCard,
  SkeletonTable,
  SkeletonChart,
  PageLoader,
  SectionLoader,
  LoadingButton,
  useLoadingStates
};

// PropTypes for runtime type checking
SpinnerLoader.propTypes = {
  size: PropTypes.number,
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success']),
  centered: PropTypes.bool,
  message: PropTypes.string
};

LinearLoader.propTypes = {
  progress: PropTypes.number,
  message: PropTypes.string,
  showPercentage: PropTypes.bool
};

SkeletonCard.propTypes = {
  height: PropTypes.number,
  showAvatar: PropTypes.bool,
  lines: PropTypes.number
};

SkeletonTable.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number
};

SkeletonChart.propTypes = {
  height: PropTypes.number
};

PageLoader.propTypes = {
  message: PropTypes.string,
  backdrop: PropTypes.bool,
  minHeight: PropTypes.string
};

SectionLoader.propTypes = {
  message: PropTypes.string,
  height: PropTypes.number,
  variant: PropTypes.oneOf(['spinner', 'skeleton', 'linear'])
};

LoadingButton.propTypes = {
  loading: PropTypes.bool,
  children: PropTypes.node,
  loadingText: PropTypes.string,
  startIcon: PropTypes.element,
  style: PropTypes.object
};
