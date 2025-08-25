import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useSeason } from '../context/SeasonContext';
import useApi from '../hooks/useApi';
import { useErrorHandler } from '../utils/errorHandling';

import { InlineError } from './ErrorDisplay';

const InventoryAdjustmentModal = ({ open, onClose, item }) => {
  const api = useApi();
  const { selectedSeason } = useSeason();
  const { handleError } = useErrorHandler();
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setAdjustmentQuantity('');
      setReason('');
      setError(null);
    }
  }, [open]);

  const handleQuantityChange = e => {
    setAdjustmentQuantity(e.target.value);
    setError(null);
  };

  const handleReasonChange = e => {
    setReason(e.target.value);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedSeason) {
      setError(new Error('Please select a season before making inventory adjustments.'));
      return;
    }

    if (!adjustmentQuantity || isNaN(adjustmentQuantity) || parseFloat(adjustmentQuantity) === 0) {
      setError(new Error('Please enter a valid non-zero quantity for adjustment.'));
      return;
    }
    if (!reason.trim()) {
      setError(new Error('Please provide a reason for the adjustment.'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Using the new inventory adjustment endpoint with season parameter
      await api.post(`/inventory-items/adjustments?seasonId=${selectedSeason._id}`, {
        inventoryItemId: item._id,
        // For backward compatibility, we'll use quantityChange instead of quantity
        quantityChange: parseFloat(adjustmentQuantity),
        // We'll assume a default adjustment type, or you could add a dropdown for this
        adjustmentType: parseFloat(adjustmentQuantity) > 0 ? 'Purchase' : 'Manual Adjustment',
        reason: reason
      });

      onClose();
    } catch (err) {
      console.error('Error making inventory adjustment:', err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Adjust Inventory for {item?.itemName}</DialogTitle>
      <DialogContent>
        {selectedSeason ? (
          <>
            <Typography variant='body1' sx={{ mb: 2 }}>
              Current Quantity: {item?.currentQuantity} {item?.unit}
            </Typography>
            <TextField
              autoFocus
              margin='dense'
              label='Adjustment Quantity (e.g., -5 for deduction, 10 for addition)'
              type='number'
              fullWidth
              value={adjustmentQuantity}
              onChange={handleQuantityChange}
              error={!!error && !selectedSeason}
              helperText={error && !selectedSeason ? error : ''}
            />
            <TextField
              margin='dense'
              label='Reason for Adjustment'
              type='text'
              fullWidth
              multiline
              rows={3}
              value={reason}
              onChange={handleReasonChange}
              sx={{ mt: 2 }}
            />
            {error && selectedSeason && (
              <InlineError error={error} onRetry={() => setError(null)} sx={{ mt: 2 }} />
            )}
          </>
        ) : (
          <Alert severity='warning'>
            Please select a season before making inventory adjustments.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={!selectedSeason || isSubmitting}
        >
          {isSubmitting ? 'Adjusting...' : 'Adjust'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryAdjustmentModal;

// Add PropTypes validation
InventoryAdjustmentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.object.isRequired
};
