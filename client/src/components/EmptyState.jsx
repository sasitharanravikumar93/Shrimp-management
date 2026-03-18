import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { 
  InboxOutlined as InboxIcon,
  ScienceOutlined as ScienceIcon,
  WaterDropOutlined as WaterIcon,
  RestaurantMenuOutlined as FeedIcon,
  WavesOutlined as PondIcon,
  CalendarMonthOutlined as SeasonIcon,
  InventoryOutlined as InventoryIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const iconMap = {
  default: InboxIcon,
  science: ScienceIcon,
  water: WaterIcon,
  feed: FeedIcon,
  pond: PondIcon,
  season: SeasonIcon,
  inventory: InventoryIcon,
};

const EmptyState = ({ 
  icon = 'default',
  title = 'No data yet',
  description = 'Get started by adding your first entry.',
  actionLabel,
  onAction,
  compact = false
}) => {
  const IconComponent = iconMap[icon] || iconMap.default;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: compact ? 4 : 8,
          px: 3,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: compact ? 64 : 80,
            height: compact ? 64 : 80,
            borderRadius: '50%',
            bgcolor: 'rgba(37, 99, 235, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <IconComponent 
            sx={{ 
              fontSize: compact ? 32 : 40, 
              color: 'primary.main',
              opacity: 0.7
            }} 
          />
        </Box>
        <Typography 
          variant={compact ? 'subtitle1' : 'h6'} 
          color="text.primary" 
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          {title}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ maxWidth: 360, mb: actionLabel ? 3 : 0 }}
        >
          {description}
        </Typography>
        {actionLabel && onAction && (
          <Button
            variant="contained"
            onClick={onAction}
            sx={{ mt: 1 }}
          >
            {actionLabel}
          </Button>
        )}
      </Box>
    </motion.div>
  );
};

export default EmptyState;
