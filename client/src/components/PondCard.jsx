import {
  Waves as PondIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  CardActions,
  Button,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';

import { getHealthColor } from '../theme.ts';

import HealthScore from './HealthScore';

const PondCard = ({ pond, onClick, onManageClick, onTimelineClick }) => {
  const healthColor = getHealthColor(pond.healthScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
          }
        }}
        onClick={onClick}
      >
        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant='h6' component='div' sx={{ fontWeight: 700, fontSize: '1rem' }}>
                {pond.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75, mt: 1 }}>
                <Chip
                  label={pond.status}
                  size='small'
                  color={pond.status === 'Active' ? 'success' : 'default'}
                  variant={pond.status === 'Active' ? 'filled' : 'outlined'}
                  sx={{ height: 22, fontSize: '0.7rem' }}
                />
                <Chip
                  label={pond.health}
                  size='small'
                  color={
                    pond.health === 'Good'
                      ? 'success'
                      : pond.health === 'Fair'
                      ? 'warning'
                      : pond.health === 'Poor'
                      ? 'error'
                      : 'default'
                  }
                  variant='outlined'
                  icon={
                    pond.health === 'Good' ? (
                      <CheckIcon sx={{ fontSize: '14px !important' }} />
                    ) : pond.health === 'Poor' ? (
                      <WarningIcon sx={{ fontSize: '14px !important' }} />
                    ) : undefined
                  }
                  sx={{ height: 22, fontSize: '0.7rem' }}
                />
              </Box>
            </Box>
            <Avatar
              sx={{
                bgcolor: `${healthColor}15`,
                color: healthColor,
                width: 44,
                height: 44
              }}
            >
              <PondIcon />
            </Avatar>
          </Box>

          <Box sx={{ my: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.8rem' }}>
                Health Score
              </Typography>
              <HealthScore score={pond.healthScore} size={36} showLabel={false} />
            </Box>

            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.8rem' }}>
                  Progress
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                  {pond.progress}%
                </Typography>
              </Box>
              <Tooltip title={`${pond.progress}% complete`} placement='top'>
                <LinearProgress
                  variant='determinate'
                  value={pond.progress}
                  color={pond.progress > 70 ? 'success' : pond.progress > 40 ? 'warning' : 'error'}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'rgba(0,0,0,0.06)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3
                    }
                  }}
                />
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.8rem' }}>
                Last Event
              </Typography>
              <Typography variant='body2' sx={{ fontSize: '0.8rem' }}>
                2 hours ago
              </Typography>
            </Box>
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 1.5 }}>
          <Button
            size='small'
            onClick={e => {
              e.stopPropagation();
              onManageClick();
            }}
            sx={{ fontWeight: 600, fontSize: '0.8rem' }}
          >
            Manage
          </Button>
          <Button
            size='small'
            endIcon={<ArrowIcon sx={{ fontSize: '14px !important' }} />}
            onClick={e => {
              e.stopPropagation();
              onTimelineClick();
            }}
            sx={{ fontWeight: 600, fontSize: '0.8rem' }}
          >
            Timeline
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
};

export default PondCard;
