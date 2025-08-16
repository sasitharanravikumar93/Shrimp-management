import React, { useState, useEffect } from 'react';
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

const InventoryManagementPage = () => {
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

  const fetchInventoryItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/inventory');
      setInventoryItems(response.data);
    } catch (err) {
      console.error('Error fetching inventory items:', err);
      setError('Failed to fetch inventory items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredItems = inventoryItems.filter(item =>
    (item.itemName && item.itemName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.itemType && item.itemType.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
    // If it was a new item, open the adjustment modal to prompt for initial purchase
    if (!editingItem) {
      setAdjustingItem(savedItem);
      setOpenAdjustmentModal(true);
    }
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
    if (window.confirm('Are you sure you want to delete this inventory item? This action is not reversible.')) {
      try {
        await api.delete(`/inventory/${id}`);
        fetchInventoryItems(); // Refresh list
      } catch (err) {
        console.error('Error deleting inventory item:', err);
        setError('Failed to delete inventory item. Please try again.');
      }
    }
  };

  // Helper to determine status
  const getItemStatus = (item) => {
    const currentQty = item.currentQuantity;
    if (currentQty <= 0) return 'Out of Stock';
    if (item.lowStockThreshold && currentQty <= item.lowStockThreshold) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Add New Item
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          label="Search Inventory"
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
                  <TableCell>Item Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell align="right">Cost/Unit</TableCell>
                  <TableCell align="right">Current Qty</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No inventory items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row">
                        {item.itemName}
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
                              getItemStatus(item) === 'Low Stock'
                                ? 'orange'
                                : getItemStatus(item) === 'Out of Stock'
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
