import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Box,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import useApi from '../hooks/useApi';

const itemTypes = ['Feed', 'Chemical', 'Probiotic', 'Other'];
const units = ['kg', 'g', 'litre', 'ml', 'bag', 'bottle'];

const InventoryForm = ({ open, onClose, item, onSave }) => {
  const api = useApi();
  const [formData, setFormData] = useState({
    itemName: '',
    itemType: '',
    supplier: '',
    purchaseDate: null,
    unit: '',
    costPerUnit: '',
    lowStockThreshold: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        itemName: item.itemName || '',
        itemType: item.itemType || '',
        supplier: item.supplier || '',
        purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : null,
        unit: item.unit || '',
        costPerUnit: item.costPerUnit || '',
        lowStockThreshold: item.lowStockThreshold || '',
      });
    } else {
      setFormData({
        itemName: '',
        itemType: '',
        supplier: '',
        purchaseDate: null,
        unit: '',
        costPerUnit: '',
        lowStockThreshold: '',
      });
    }
    setErrors({});
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, purchaseDate: date });
    if (errors.purchaseDate) {
      setErrors({ ...errors, purchaseDate: null });
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.itemName) tempErrors.itemName = 'Item Name is required';
    if (!formData.itemType) tempErrors.itemType = 'Item Type is required';
    if (!formData.purchaseDate) tempErrors.purchaseDate = 'Purchase Date is required';
    if (!formData.unit) tempErrors.unit = 'Unit is required';
    if (formData.costPerUnit === '' || isNaN(formData.costPerUnit) || formData.costPerUnit < 0) {
      tempErrors.costPerUnit = 'Cost Per Unit must be a non-negative number';
    }
    if (formData.lowStockThreshold !== '' && (isNaN(formData.lowStockThreshold) || formData.lowStockThreshold < 0)) {
      tempErrors.lowStockThreshold = 'Low Stock Threshold must be a non-negative number';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        const dataToSend = {
          ...formData,
          costPerUnit: parseFloat(formData.costPerUnit),
          lowStockThreshold: formData.lowStockThreshold !== '' ? parseFloat(formData.lowStockThreshold) : undefined,
          purchaseDate: formData.purchaseDate ? formData.purchaseDate.toISOString() : null,
        };

        if (item) {
          const updatedItem = await api.put(`/inventory/${item._id}`, dataToSend);
          onSave(updatedItem.data);
        } else {
          const newItem = await api.post('/inventory', dataToSend);
          onSave(newItem.data);
        }
        onClose();
      } catch (err) {
        console.error('Error saving inventory item:', err);
        // Handle error, maybe show an alert
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{item ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Item Name"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  error={!!errors.itemName}
                  helperText={errors.itemName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.itemType}>
                  <InputLabel>Item Type</InputLabel>
                  <Select
                    name="itemType"
                    value={formData.itemType}
                    label="Item Type"
                    onChange={handleChange}
                  >
                    {itemTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.itemType && <FormHelperText>{errors.itemType}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Purchase Date"
                  value={formData.purchaseDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.purchaseDate}
                      helperText={errors.purchaseDate}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.unit}>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    name="unit"
                    value={formData.unit}
                    label="Unit"
                    onChange={handleChange}
                  >
                    {units.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.unit && <FormHelperText>{errors.unit}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cost Per Unit"
                  name="costPerUnit"
                  type="number"
                  value={formData.costPerUnit}
                  onChange={handleChange}
                  error={!!errors.costPerUnit}
                  helperText={errors.costPerUnit}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Low Stock Threshold"
                  name="lowStockThreshold"
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  error={!!errors.lowStockThreshold}
                  helperText={errors.lowStockThreshold}
                />
              </Grid>
            </Grid>
          </Box>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {item ? 'Save Changes' : 'Add Item'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryForm;
