import { Box } from '@mui/material';
import React, { useState, useEffect } from 'react';

import AlertBanner from './AlertBanner';

// Assuming inventory api calls are not in api.ts maybe they are in 'services/inventory' or in 'api.ts'. I will fetch directly since we're in Vite.
const API_BASE_URL = 'http://localhost:5001/api';

const LowStockAlert = () => {
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    // We fetch inventory items directly to avoid complex imports if they aren't exposed
    fetch(`${API_BASE_URL}/inventory-items`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const lows = data.filter(item => item.currentQuantity <= (item.alertThreshold || 0));
          setLowStockItems(lows);
        } else if (data.data && Array.isArray(data.data)) {
          const lows = data.data.filter(item => item.currentQuantity <= (item.alertThreshold || 0));
          setLowStockItems(lows);
        }
      })
      .catch(console.error);
  }, []);

  if (lowStockItems.length === 0) return null;

  const message = `Low Stock Alert: ${
    lowStockItems.length
  } item(s) are below threshold (${lowStockItems
    .map(i => `${i.itemName} [${i.currentQuantity}]`)
    .join(', ')}).`;

  return (
    <Box sx={{ mb: 2 }}>
      <AlertBanner severity='error' message={message} dismissible />
    </Box>
  );
};

export default LowStockAlert;
