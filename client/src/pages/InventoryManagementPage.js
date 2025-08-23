import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import InventoryForm from '../components/InventoryForm';
import InventoryAdjustmentModal from '../components/InventoryAdjustmentModal';
import AdjustmentHistoryModal from '../components/AdjustmentHistoryModal'; // New import
import useApi from '../hooks/useApi';
import { useSeason } from '../context/SeasonContext';
import { useTranslation } from 'react-i18next';

const InventoryManagementPage = () => {
  const { t, i18n } = useTranslation();
  const { selectedSeason } = useSeason();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [openAdjustmentModal, setOpenAdjustmentModal] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [historyItem, setHistoryItem] = useState(null);

  const api = useApi();

  const fetchInventoryItems = useCallback(async () => {
    // Don't fetch if no season is selected
    if (!selectedSeason || !selectedSeason._id) {
      setInventoryItems([]);
      setLoading(false);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/inventory-items?seasonId=${selectedSeason._id}`);
      setInventoryItems(Array.isArray(response) ? response : response.data || []);
    } catch (err) {
      console.error('Error fetching inventory items:', err);
      setError(t('failed_to_fetch_inventory_items'));
    } finally {
      setLoading(false);
    }
  }, [selectedSeason?._id]);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredItems = useMemo(() => inventoryItems.filter(item =>
    (item.itemName && 
      (typeof item.itemName === 'object' 
        ? (item.itemName[i18n.language] || item.itemName.en || '').toLowerCase().includes(searchTerm.toLowerCase())
        : item.itemName.toLowerCase().includes(searchTerm.toLowerCase()))) ||
    (item.itemType && item.itemType.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [inventoryItems, searchTerm, i18n.language]);

  const handleOpenForm = (item = null) => {
    setEditingItem(item);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingItem(null);
    fetchInventoryItems(); // Refresh data after form submission
  };

  const handleSaveForm = (savedItem) => {
    fetchInventoryItems(); // Refresh data
  };

  const handleOpenAdjustmentModal = (item) => {
    setAdjustingItem(item);
    setOpenAdjustmentModal(true);
  };

  const handleCloseAdjustmentModal = () => {
    setOpenAdjustmentModal(false);
    setAdjustingItem(null);
    fetchInventoryItems(); // Refresh data after adjustment
  };

  const handleOpenHistoryModal = (item) => {
    setHistoryItem(item);
    setOpenHistoryModal(true);
  };

  const handleCloseHistoryModal = () => {
    setOpenHistoryModal(false);
    setHistoryItem(null);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm(`${t('areYouSure')} ${t('delete')} ${t('inventory_item')}? ${t('action_not_reversible')}`)) {
      try {
        await api.delete(`/inventory-items/${id}`);
        fetchInventoryItems(); // Refresh list
      } catch (err) {
        console.error('Error deleting inventory item:', err);
        setError(t('failed_to_delete_inventory_item'));
      }
    }
  };

  // Helper to determine status
  const getItemStatus = (item) => {
    const currentQty = item.currentQuantity;
    if (currentQty <= 0) return t('out_of_stock');
    if (item.lowStockThreshold && currentQty <= item.lowStockThreshold) return t('low_stock');
    return t('in_stock');
  };

  // Helper to get item name based on language
  const getItemName = (item) => {
    if (typeof item.itemName === 'object') {
      return item.itemName[i18n.language] || item.itemName.en || '';
    }
    return item.itemName || '';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t('inventory_management')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          {t('add_new_item')}
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          label={t('search_inventory')}
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {loading && (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('itemName')}</TableCell>
                  <TableCell>{t('itemType')}</TableCell>
                  <TableCell>{t('supplier')}</TableCell>
                  <TableCell>{t('unit')}</TableCell>
                  <TableCell align="right">{t('costPerUnit')}</TableCell>
                  <TableCell align="right">{t('current_quantity')}</TableCell>
                  <TableCell>{t('status')}</TableCell>
                  <TableCell>{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      {t('no_inventory_items_found')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row">
                        {getItemName(item)}
                      </TableCell>
                      <TableCell>{item.itemType}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell align="right">{item.costPerUnit}</TableCell>
                      <TableCell align="right">{item.currentQuantity}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              getItemStatus(item) === t('low_stock')
                                ? 'orange'
                                : getItemStatus(item) === t('out_of_stock')
                                ? 'red'
                                : 'green',
                            fontWeight: 'bold',
                          }}
                        >
                          {getItemStatus(item)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => handleOpenForm(item)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="secondary" onClick={() => handleOpenAdjustmentModal(item)}>
                          <AddIcon />
                        </IconButton>
                        <IconButton onClick={() => handleOpenHistoryModal(item)}>
                          <HistoryIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDeleteItem(item._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {openForm && (
        <InventoryForm
          open={openForm}
          onClose={handleCloseForm}
          item={editingItem}
          onSave={handleSaveForm}
        />
      )}

      {openAdjustmentModal && (
        <InventoryAdjustmentModal
          open={openAdjustmentModal}
          onClose={handleCloseAdjustmentModal}
          item={adjustingItem}
        />
      )}

      {openHistoryModal && (
        <AdjustmentHistoryModal
          open={openHistoryModal}
          onClose={handleCloseHistoryModal}
          item={historyItem}
        />
      )}
    </Container>
  );
};

export default InventoryManagementPage;
