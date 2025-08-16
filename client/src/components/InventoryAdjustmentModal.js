import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import useApi from '../hooks/useApi';

const InventoryAdjustmentModal = ({ open, onClose, item }) => {
  const api = useApi();
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setAdjustmentQuantity('');
      setReason('');
      setError(null);
    }
  }, [open]);

  const handleQuantityChange = (e) => {
    setAdjustmentQuantity(e.target.value);
    setError(null);
  };

  const handleReasonChange = (e) => {
    setReason(e.target.value);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!adjustmentQuantity || isNaN(adjustmentQuantity) || parseFloat(adjustmentQuantity) === 0) {
      setError('Please enter a valid non-zero quantity for adjustment.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for the adjustment.');
      return;
    }

    try {
      // Assuming an API endpoint for inventory adjustments
      // This might be a new endpoint or an update to an existing one
      // For now, we'll use a placeholder that updates the item directly
      // In a real scenario, you'd likely have a dedicated adjustment endpoint
      // that logs the adjustment and updates the current quantity.

      // Example: If the backend has an endpoint like POST /api/inventory/adjustments
      await api.post('/inventory/adjustments', {
        inventoryItemId: item._id,
        quantity: parseFloat(adjustmentQuantity),
        reason: reason,
      });

      onClose();
    } catch (err) {
      console.error('Error making inventory adjustment:', err);
      setError('Failed to make adjustment. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Adjust Inventory for {item?.itemName}</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Current Quantity: {item?.initialQuantity} {item?.unit}
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          label="Adjustment Quantity (e.g., -5 for deduction, 10 for addition)"
          type="number"
          fullWidth
          value={adjustmentQuantity}
          onChange={handleQuantityChange}
          error={!!error}
          helperText={error}
        />
        <TextField
          margin="dense"
          label="Reason for Adjustment"
          type="text"
          fullWidth
          multiline
          rows={3}
          value={reason}
          onChange={handleReasonChange}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Adjust
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryAdjustmentModal;
