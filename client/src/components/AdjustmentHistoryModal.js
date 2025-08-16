import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import useApi from '../hooks/useApi';
import { format } from 'date-fns';

const AdjustmentHistoryModal = ({ open, onClose, item }) => {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useApi();

  useEffect(() => {
    if (open && item) {
      const fetchAdjustments = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await api.get(`/inventory/${item._id}/adjustments`);
          setAdjustments(response.data);
        } catch (err) {
          console.error('Error fetching adjustment history:', err);
          setError('Failed to fetch adjustment history.');
        }
        setLoading(false);
      };
      fetchAdjustments();
    }
  }, [open, item, api]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Adjustment History for {item?.itemName}</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : adjustments.length === 0 ? (
          <Typography>No adjustment history found for this item.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Quantity Change</TableCell>
                  <TableCell>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adjustments.map((adj) => (
                  <TableRow key={adj._id}>
                    <TableCell>{format(new Date(adj.createdAt), 'yyyy-MM-dd HH:mm')}</TableCell>
                    <TableCell>{adj.adjustmentType}</TableCell>
                    <TableCell align="right">{adj.quantityChange}</TableCell>
                    <TableCell>{adj.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdjustmentHistoryModal;
