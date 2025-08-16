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
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import useApi from '../hooks/useApi';
import { useTranslation } from 'react-i18next';

const itemTypes = ['Feed', 'Chemical', 'Probiotic', 'Other'];
const units = ['kg', 'g', 'litre', 'ml', 'bag', 'bottle'];

const InventoryForm = ({ open, onClose, item, onSave }) => {
  const { t } = useTranslation();
  const api = useApi();
  const [formData, setFormData] = useState({
    itemName: { en: '', hi: '', ta: '' },
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
        itemName: typeof item.itemName === 'object' ? item.itemName : { en: item.itemName || '', hi: '', ta: '' },
        itemType: item.itemType || '',
        supplier: item.supplier || '',
        purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : null,
        unit: item.unit || '',
        costPerUnit: item.costPerUnit || '',
        lowStockThreshold: item.lowStockThreshold || '',
      });
    } else {
      setFormData({
        itemName: { en: '', hi: '', ta: '' },
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

  // Handle multilingual item name input changes
  const handleItemNameChange = (language, value) => {
    setFormData(prev => ({
      ...prev,
      itemName: {
        ...prev.itemName,
        [language]: value
      }
    }));
    if (errors.itemName) {
      setErrors({ ...errors, itemName: null });
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
    if (!formData.itemName.en || !formData.itemName.hi || !formData.itemName.ta) {
      tempErrors.itemName = t('item_name_required_all_languages');
    }
    if (!formData.itemType) tempErrors.itemType = t('item_type_required');
    if (!formData.purchaseDate) tempErrors.purchaseDate = t('purchase_date_required');
    if (!formData.unit) tempErrors.unit = t('unit_required');
    if (formData.costPerUnit === '' || isNaN(formData.costPerUnit) || formData.costPerUnit < 0) {
      tempErrors.costPerUnit = t('cost_per_unit_must_be_non_negative');
    }
    if (formData.lowStockThreshold !== '' && (isNaN(formData.lowStockThreshold) || formData.lowStockThreshold < 0)) {
      tempErrors.lowStockThreshold = t('low_stock_threshold_must_be_non_negative');
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
      <DialogTitle>{item ? t('edit_inventory_item') : t('add_new_inventory_item')}</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {t('item_name')} ({t('english')})
                </Typography>
                <TextField
                  fullWidth
                  label={`${t('item_name')} (${t('english')})`}
                  name="itemName.en"
                  value={formData.itemName.en}
                  onChange={(e) => handleItemNameChange('en', e.target.value)}
                  error={!!errors.itemName}
                  helperText={errors.itemName}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {t('item_name')} ({t('hindi')})
                </Typography>
                <TextField
                  fullWidth
                  label={`${t('item_name')} (${t('hindi')})`}
                  name="itemName.hi"
                  value={formData.itemName.hi}
                  onChange={(e) => handleItemNameChange('hi', e.target.value)}
                  error={!!errors.itemName}
                  helperText={errors.itemName}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {t('item_name')} ({t('tamil')})
                </Typography>
                <TextField
                  fullWidth
                  label={`${t('item_name')} (${t('tamil')})`}
                  name="itemName.ta"
                  value={formData.itemName.ta}
                  onChange={(e) => handleItemNameChange('ta', e.target.value)}
                  error={!!errors.itemName}
                  helperText={errors.itemName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.itemType}>
                  <InputLabel>{t('itemType')}</InputLabel>
                  <Select
                    name="itemType"
                    value={formData.itemType}
                    label={t('itemType')}
                    onChange={handleChange}
                  >
                    {itemTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {t(type.toLowerCase())}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.itemType && <FormHelperText>{errors.itemType}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('supplier')}
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label={t('purchaseDate')}
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
                  <InputLabel>{t('unit')}</InputLabel>
                  <Select
                    name="unit"
                    value={formData.unit}
                    label={t('unit')}
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
                  label={t('costPerUnit')}
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
                  label={t('lowStockThreshold')}
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
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained">
          {item ? t('save_changes') : t('add_item')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryForm;
