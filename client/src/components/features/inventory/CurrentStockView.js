import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Typography,
  Box
} from '@mui/material';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSeason } from '../../../context/SeasonContext';
import useApi from '../../../hooks/useApi';

const CurrentStockView = () => {
  const { t } = useTranslation();
  const { selectedSeason } = useSeason();
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useApi();

  useEffect(() => {
    const fetchStockItems = async () => {
      if (!selectedSeason || !selectedSeason._id) {
        setStockItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await api.get(`/inventory-items/stock?seasonId=${selectedSeason._id}`);
        setStockItems(Array.isArray(response) ? response : response.data || []);
      } catch (err) {
        console.error('Error fetching stock items:', err);
        setError(t('failed_to_fetch_stock_items'));
      } finally {
        setLoading(false);
      }
    };

    fetchStockItems();
  }, [selectedSeason, api, t]);

  const getItemStatus = item => {
    const currentQty = item.currentQuantity;
    if (currentQty <= 0) return t('out_of_stock');
    if (item.lowStockThreshold && currentQty <= item.lowStockThreshold) return t('low_stock');
    return t('in_stock');
  };

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('itemName')}</TableCell>
              <TableCell>{t('itemType')}</TableCell>
              <TableCell align='right'>{t('current_quantity')}</TableCell>
              <TableCell>{t('status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align='center'>
                  {t('no_stock_items_found')}
                </TableCell>
              </TableRow>
            ) : (
              stockItems.map(item => (
                <TableRow key={item._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component='th' scope='row'>
                    {item.itemName.en || item.itemName}
                  </TableCell>
                  <TableCell>{item.itemType}</TableCell>
                  <TableCell align='right'>{item.currentQuantity}</TableCell>
                  <TableCell align='right'>{item.lowStockThreshold}</TableCell>
                  <TableCell>
                    <Typography
                      variant='body2'
                      sx={{
                        color:
                          getItemStatus(item) === t('low_stock')
                            ? 'orange'
                            : getItemStatus(item) === t('out_of_stock')
                            ? 'red'
                            : 'green',
                        fontWeight: 'bold'
                      }}
                    >
                      {getItemStatus(item)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default CurrentStockView;
