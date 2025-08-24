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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import InventoryForm from '../components/InventoryForm';
import AdjustmentHistoryModal from '../components/AdjustmentHistoryModal'; // New import
import CurrentStockView from '../components/CurrentStockView'; // New import
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
  const [filter, setFilter] = useState('all');
  const [openForm, setOpenForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [historyItem, setHistoryItem] = useState(null);
  const [view, setView] = useState('bought'); // 'bought' or 'stock'

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
    if (view === 'bought') {
      fetchInventoryItems();
    } else {
      setInventoryItems([]);
    }
  }, [view, fetchInventoryItems]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const filteredItems = useMemo(() => {
    let items = inventoryItems;

    if (filter !== 'all') {
      items = items.filter(item => item.itemType && item.itemType.toLowerCase() === filter.toLowerCase());
    }

    return items.filter(item =>
      (item.itemName &&
        (typeof item.itemName === 'object'
          ? (item.itemName[i18n.language] || item.itemName.en || '').toLowerCase().includes(searchTerm.toLowerCase())
          : item.itemName.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (item.itemType && item.itemType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [inventoryItems, searchTerm, i18n.language, filter]);

  const itemTypes = useMemo(() => 
    Array.from(new Set(inventoryItems.map(item => item.itemType).filter(Boolean)))
  , [inventoryItems]);

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

      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          color="primary"
          value={view}
          exclusive
          onChange={(e, newView) => { if (newView) setView(newView); }}
          aria-label="text alignment"
        >
          <ToggleButton value="bought" aria-label="left aligned">
            {t('inventory_bought')}
          </ToggleButton>
          <ToggleButton value="stock" aria-label="centered">
            {t('current_stock')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
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
            sx={{ flexGrow: 1, minWidth: 300 }}
          />
          <ToggleButtonGroup
            size="small"
            value={filter}
            exclusive
            onChange={handleFilterChange}
          >
            <ToggleButton value="all">{t('all')}</ToggleButton>
            {itemTypes.map(type => (
              <ToggleButton key={type} value={type.toLowerCase()}>
                {t(type.toLowerCase())}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
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

      {!loading && !error && view === 'bought' && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('itemName')}</TableCell>
                  <TableCell>{t('itemType')}</TableCell>
                  <TableCell>{t('purchaseDate')}</TableCell>
                  <TableCell>{t('supplier')}</TableCell>
                  <TableCell>{t('unit')}</TableCell>
                  <TableCell align="right">{t('costPerUnit')}</TableCell>
                  <TableCell align="right">{t('quantity_bought')}</TableCell>
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
                      <TableCell>{item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell align="right">{item.costPerUnit}</TableCell>
                      <TableCell align="right">{item.quantityBought}</TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => handleOpenForm(item)}>
                          <EditIcon />
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

      {!loading && !error && view === 'stock' && <CurrentStockView />}

      {openForm && (
        <InventoryForm
          open={openForm}
          onClose={handleCloseForm}
          item={editingItem}
          onSave={handleSaveForm}
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
