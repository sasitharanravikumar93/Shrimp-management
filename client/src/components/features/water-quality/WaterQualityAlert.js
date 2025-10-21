import {
  WaterDrop as WaterIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Alert,
  AlertTitle
} from '@mui/material';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import React from 'react';

const WaterQualityAlert = ({
  pondName,
  pH,
  dissolvedOxygen,
  temperature,
  salinity,
  ammonia,
  nitrite
}) => {
  // Optimal ranges for shrimp farming
  const optimalRanges = {
    pH: { min: 6.5, max: 8.5, unit: '' },
    do: { min: 5, max: 7, unit: 'mg/L' },
    temp: { min: 28, max: 32, unit: '°C' },
    salinity: { min: 15, max: 35, unit: 'ppt' },
    ammonia: { min: 0, max: 0.02, unit: 'mg/L' },
    nitrite: { min: 0, max: 0.2, unit: 'mg/L' }
  };

  // Check if parameters are within optimal ranges
  const isParameterOk = (value, param) => {
    if (value === undefined || value === null) return true;
    const range = optimalRanges[param];
    return value >= range.min && value <= range.max;
  };

  // Get status color for parameter
  const getParameterStatus = (value, param) => {
    if (value === undefined || value === null) return 'default';
    return isParameterOk(value, param) ? 'success' : 'error';
  };

  // Get status icon for parameter
  const getParameterIcon = (value, param) => {
    if (value === undefined || value === null) return null;
    return isParameterOk(value, param) ? (
      <CheckIcon sx={{ fontSize: 16 }} />
    ) : (
      <WarningIcon sx={{ fontSize: 16 }} />
    );
  };

  // Check overall water quality
  const checkOverallQuality = () => {
    const parameters = [
      { value: pH, param: 'pH' },
      { value: dissolvedOxygen, param: 'do' },
      { value: temperature, param: 'temp' },
      { value: salinity, param: 'salinity' },
      { value: ammonia, param: 'ammonia' },
      { value: nitrite, param: 'nitrite' }
    ];

    const invalidParams = parameters.filter(
      p => p.value !== undefined && p.value !== null && !isParameterOk(p.value, p.param)
    );

    if (invalidParams.length === 0) return 'good';
    if (invalidParams.length <= 2) return 'fair';
    return 'poor';
  };

  const overallQuality = checkOverallQuality();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant='outlined' sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WaterIcon sx={{ color: 'primary.main', mr: 1 }} />
            <Typography variant='h6' component='h3'>
              Water Quality Alert
            </Typography>
          </Box>

          <Alert
            severity={
              overallQuality === 'good'
                ? 'success'
                : overallQuality === 'fair'
                ? 'warning'
                : 'error'
            }
            sx={{ mb: 2 }}
          >
            <AlertTitle>
              {overallQuality === 'good'
                ? 'Good Water Quality'
                : overallQuality === 'fair'
                ? 'Fair Water Quality'
                : 'Poor Water Quality'}
            </AlertTitle>
            {pondName && `Pond: ${pondName} - `}
            {overallQuality === 'good'
              ? 'All parameters within optimal ranges'
              : 'Some parameters outside optimal ranges'}
          </Alert>

          <Box sx={{ mb: 2 }}>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
              Parameter Status:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {pH !== undefined && pH !== null && (
                <Chip
                  label={`pH: ${pH}`}
                  color={getParameterStatus(pH, 'pH')}
                  icon={getParameterIcon(pH, 'pH')}
                  size='small'
                />
              )}
              {dissolvedOxygen !== undefined && dissolvedOxygen !== null && (
                <Chip
                  label={`DO: ${dissolvedOxygen} mg/L`}
                  color={getParameterStatus(dissolvedOxygen, 'do')}
                  icon={getParameterIcon(dissolvedOxygen, 'do')}
                  size='small'
                />
              )}
              {temperature !== undefined && temperature !== null && (
                <Chip
                  label={`Temp: ${temperature}°C`}
                  color={getParameterStatus(temperature, 'temp')}
                  icon={getParameterIcon(temperature, 'temp')}
                  size='small'
                />
              )}
              {salinity !== undefined && salinity !== null && (
                <Chip
                  label={`Salinity: ${salinity} ppt`}
                  color={getParameterStatus(salinity, 'salinity')}
                  icon={getParameterIcon(salinity, 'salinity')}
                  size='small'
                />
              )}
              {ammonia !== undefined && ammonia !== null && (
                <Chip
                  label={`Ammonia: ${ammonia} mg/L`}
                  color={getParameterStatus(ammonia, 'ammonia')}
                  icon={getParameterIcon(ammonia, 'ammonia')}
                  size='small'
                />
              )}
              {nitrite !== undefined && nitrite !== null && (
                <Chip
                  label={`Nitrite: ${nitrite} mg/L`}
                  color={getParameterStatus(nitrite, 'nitrite')}
                  icon={getParameterIcon(nitrite, 'nitrite')}
                  size='small'
                />
              )}
            </Box>
          </Box>

          {(pH !== undefined || dissolvedOxygen !== undefined || temperature !== undefined) && (
            <Box sx={{ mb: 1 }}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
                Optimal Ranges:
              </Typography>
              <Typography variant='body2'>
                {pH !== undefined && `pH: ${optimalRanges.pH.min}-${optimalRanges.pH.max} | `}
                {dissolvedOxygen !== undefined &&
                  `DO: ${optimalRanges.do.min}-${optimalRanges.do.max} mg/L | `}
                {temperature !== undefined &&
                  `Temp: ${optimalRanges.temp.min}-${optimalRanges.temp.max}°C`}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WaterQualityAlert;

// Add PropTypes validation
WaterQualityAlert.propTypes = {
  pondName: PropTypes.string,
  pH: PropTypes.number,
  dissolvedOxygen: PropTypes.number,
  temperature: PropTypes.number,
  salinity: PropTypes.number,
  ammonia: PropTypes.number,
  nitrite: PropTypes.number
};
