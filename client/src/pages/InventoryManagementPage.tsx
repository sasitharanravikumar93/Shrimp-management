import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
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
  ToggleButtonGroup
} from '@mui/material';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import AdjustmentHistoryModal from '../components/features/inventory/AdjustmentHistoryModal';
import CurrentStockView from '../components/features/inventory/CurrentStockView';
import InventoryForm from '../components/features/inventory/InventoryForm';
import { useSeason } from '../context/SeasonContext';
import useApi from '../hooks/useApi';

const InventoryManagementPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { selectedSeason } = useSeason();
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [openForm, setOpenForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [historyItem, setHistoryItem] = useState<any>(null);
  const [view, setView] = useState('bought'); // 'bought' or 'stock'

  const api = useApi();

  const fetchInventoryItems = useCallback(async () => {
    if (!selectedSeason || !(selectedSeason._id || selectedSeason.id)) {
      setInventoryItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const seasonId = selectedSeason._id || selectedSeason.id;
      const response = await api.get(`/inventory-items?seasonId=${seasonId}`);
      setInventoryItems(Array.isArray(response) ? response : (response.data || []));
    } catch (err: any) {
      console.error('Error fetching inventory items:', err);
      setError(t('failed_to_fetch_inventory_items'));
    } finally {
      setLoading(false);
    }
  }, [selectedSeason, api, t]);

  useEffect(() => {
    if (view === 'bought') {
      fetchInventoryItems();
    } else {
      setInventoryItems([]);
    }
  }, [view, fetchInventoryItems]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event: any, newFilter: string | null) => {
    if (newFilter !== null) setFilter(newFilter);
  };

  const filteredItems = useMemo(() => {
    let items = inventoryItems;
    if (filter !== 'all') {
      items = items.filter(
        item => item.itemType && item.itemType.toLowerCase() === filter.toLowerCase()
      );
    }

    return items.filter(
      item =>
        (item.itemName &&
          (typeof item.itemName === 'object'
            ? (item.itemName[i18n.language] || item.itemName.en || '')
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            : item.itemName.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (item.itemType && item.itemType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [inventoryItems, searchTerm, i18n.language, filter]);

  const itemTypes = useMemo(
    () => Array.from(new Set(inventoryItems.map(item => item.itemType).filter(Boolean))),
    [inventoryItems]
  );

  const handleOpenForm = (item: any = null) => {
    setEditingItem(item);
    setOpenForm(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm(`${t('areYouSure')} ${t('delete')} ${t('inventory_item')}?`)) {
      try {
        await api.delete(`/inventory-items/${id}`);
        fetchInventoryItems();
      } catch (err) {
        console.error('Error deleting inventory item:', err);
        setError(t('failed_to_delete_inventory_item'));
      }
    }
  };

  const getItemName = (item: any) => {
    if (typeof item.itemName === 'object') {
      return item.itemName[i18n.language] || item.itemName.en || '';
    }
    return item.itemName || '';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          {t('inventory_management')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
          {t('add_new_item')}
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          color="primary"
          value={view}
          exclusive
          onChange={(e, newView) => newView && setView(newView)}
        >
          <ToggleButton value="bought">{t('inventory_bought')}</ToggleButton>
          <ToggleButton value="stock">{t('current_stock')}</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <TextField
            fullWidth
            label={t('search_inventory')}
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ flexGrow: 1, minWidth: 300 }}
          />
          <ToggleButtonGroup size="small" value={filter} exclusive onChange={handleFilterChange}>
            <ToggleButton value="all">{t('all')}</ToggleButton>
            {itemTypes.map((type: any) => (
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
                  filteredItems.map(item => (
                    <TableRow key={item._id}>
                      <TableCell>{getItemName(item)}</TableCell>
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
                        <IconButton onClick={() => { setHistoryItem(item); setOpenHistoryModal(true); }}>
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
          onClose={() => { setOpenForm(false); fetchInventoryItems(); }}
          item={editingItem}
          onSave={() => { setOpenForm(false); fetchInventoryItems(); }}
        />
      )}

      {openHistoryModal && (
        <AdjustmentHistoryModal
          open={openHistoryModal}
          onClose={() => setOpenHistoryModal(false)}
          item={historyItem}
        />
      )}
    </Container>
  );
};

export default InventoryManagementPage;
