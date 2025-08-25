import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { Box, Typography, CircularProgress, Tooltip } from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';

const HealthScore = ({ score, size = 80, showLabel = true }) => {
  // Determine color based on score
  const getColor = () => {
    if (score >= 80) return '#28A745'; // Green
    if (score >= 60) return '#FFC107'; // Yellow
    return '#DC3545'; // Red
  };

  // Determine icon based on score
  const getIcon = () => {
    if (score >= 80) return <CheckCircleIcon sx={{ color: '#28A745', fontSize: size / 3 }} />;
    if (score >= 60) return <WarningIcon sx={{ color: '#FFC107', fontSize: size / 3 }} />;
    return <ErrorIcon sx={{ color: '#DC3545', fontSize: size / 3 }} />;
  };

  // Determine status text based on score
  const getStatusText = () => {
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant='determinate'
          value={100}
          size={size}
          thickness={4}
          sx={{
            color: 'rgba(0, 0, 0, 0.08)'
          }}
        />
        <CircularProgress
          variant='determinate'
          value={score}
          size={size}
          thickness={4}
          sx={{
            color: getColor(),
            position: 'absolute',
            left: 0
          }}
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
          {getIcon()}
        </Box>
      </Box>
      {showLabel && (
        <Tooltip title={`Health Score: ${score}/100`}>
          <Typography
            variant='body2'
            sx={{
              mt: 1,
              fontWeight: 'bold',
              color: getColor()
            }}
          >
            {getStatusText()}
          </Typography>
        </Tooltip>
      )}
    </Box>
  );
};

export default HealthScore;

// Add PropTypes validation
HealthScore.propTypes = {
  score: PropTypes.number.isRequired,
  size: PropTypes.number,
  showLabel: PropTypes.bool
};

// Add default props
HealthScore.defaultProps = {
  size: 80,
  showLabel: true
};
