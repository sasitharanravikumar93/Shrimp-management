import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Box, 
  CircularProgress,
  LinearProgress
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const KPICard = ({ 
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
  
  // Format value based on type
  const formatValue = (val) => {
    if (isCurrency) {
      return `${val.toLocaleString()}`;
    }
    return `${val}${suffix}`;
  };

  // Determine trend icon
  const getTrendIcon = () => {
    if (change > 0) return <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />;
    if (change < 0) return <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />;
    return <TrendingFlatIcon sx={{ fontSize: 16, color: 'warning.main' }} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t(title)}
              </Typography>
              <Typography variant="h5" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                {formatValue(value)}
              </Typography>
              {(change !== 0 || changeText) && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getTrendIcon()}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      ml: 0.5,
                      color: change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'warning.main'
                    }}
                  >
                    {changeText || `${change > 0 ? '+' : ''}${change}%`}
                  </Typography>
                </Box>
              )}
            </Box>
            <Avatar sx={{ bgcolor: color, width: 50, height: 50 }}>
              {icon}
            </Avatar>
          </Box>
          
          {progressValue !== null && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
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
};

// Circular KPI Card variant
export const CircularKPICard = ({ 
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
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    >
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
            variant="determinate" 
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
            variant="determinate" 
            value={value > 100 ? 100 : value} 
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
              justifyContent: 'center',
            }}
          >
            <Avatar sx={{ bgcolor: color, width: size/3, height: size/3 }}>
              {icon}
            </Avatar>
          </Box>
        </Box>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600, textAlign: 'center' }}>
          {t(title)}
        </Typography>
        {(change !== 0 || changeText) && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            {change > 0 ? 
              <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} /> : 
              <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
            }
            <Typography 
              variant="body2" 
              sx={{ 
                ml: 0.5,
                color: change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'warning.main'
              }}
            >
              {changeText || `${change > 0 ? '+' : ''}${change}%`}
            </Typography>
          </Box>
        )}
      </Card>
    </motion.div>
  );
};

export default KPICard;