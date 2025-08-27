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
  Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useSeason } from '../../../context/SeasonContext';
import useApi from '../../../hooks/useApi';

const itemTypes = ['Feed', 'Chemical', 'Probiotic', 'Other'];
const units = ['kg', 'g', 'litre', 'ml', 'bag', 'bottle'];

const InventoryForm = ({ open, onClose, item, onSave }) => {
  const { t } = useTranslation();
  const api = useApi();
  const { selectedSeason } = useSeason();
  const [formData, setFormData] = useState({
    itemName: '',
    itemType: '',
    supplier: '',
    purchaseDate: null,
    unit: '',
    costPerUnit: '',
    quantityBought: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        itemName: typeof item.itemName === 'object' ? item.itemName.en || '' : item.itemName || '',
        itemType: item.itemType || '',
        supplier: item.supplier || '',
        purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : null,
        unit: item.unit || '',
        costPerUnit: item.costPerUnit || '',
        quantityBought: item.quantityBought || ''
      });
    } else {
      setFormData({
        itemName: '',
        itemType: '',
        supplier: '',
        purchaseDate: null,
        unit: '',
        costPerUnit: '',
        quantityBought: ''
      });
    }
    setErrors({});
  }, [item]);

  // Handle form input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleDateChange = date => {
    setFormData({ ...formData, purchaseDate: date });
    if (errors.purchaseDate) {
      setErrors({ ...errors, purchaseDate: null });
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!selectedSeason) {
      tempErrors.season = t('please_select_a_season_before_adding_inventory_items');
    }
    if (!formData.itemName) {
      tempErrors.itemName = t('item_name_required');
    }
    if (!formData.itemType) tempErrors.itemType = t('item_type_required');
    if (!formData.purchaseDate) tempErrors.purchaseDate = t('purchase_date_required');
    if (!formData.unit) tempErrors.unit = t('unit_required');
    if (formData.costPerUnit === '' || isNaN(formData.costPerUnit) || formData.costPerUnit < 0) {
      tempErrors.costPerUnit = t('cost_per_unit_must_be_non_negative');
    }
    if (
      !item &&
      (formData.quantityBought === '' ||
        isNaN(formData.quantityBought) ||
        formData.quantityBought <= 0)
    ) {
      tempErrors.quantityBought = t('quantity_bought_must_be_a_positive_number');
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        const dataToSend = {
          itemName: { en: formData.itemName },
          itemType: formData.itemType,
          supplier: formData.supplier,
          purchaseDate: formData.purchaseDate ? formData.purchaseDate.toISOString() : null,
          unit: formData.unit,
          costPerUnit: parseFloat(formData.costPerUnit),
          seasonId: selectedSeason._id
        };

        if (item) {
          const updatedItem = await api.put(`/inventory-items/${item._id}`, dataToSend);
          onSave(updatedItem.data);
        } else {
          dataToSend.quantityBought =
            formData.quantityBought !== '' ? parseFloat(formData.quantityBought) : 0;
          const newItem = await api.post(`/inventory-items`, dataToSend);
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>{item ? t('edit_inventory_item') : t('add_new_inventory_item')}</DialogTitle>
      <DialogContent>
        {!selectedSeason && (
          <Alert severity='warning' sx={{ mb: 2 }}>
            {t('please_select_a_season_before_adding_inventory_items')}
          </Alert>
        )}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box component='form' noValidate autoComplete='off' sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('itemName')}
                  name='itemName'
                  value={formData.itemName}
                  onChange={handleChange}
                  error={!!errors.itemName}
                  helperText={errors.itemName}
                  disabled={!selectedSeason}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.itemType}>
                  <InputLabel>{t('itemType')}</InputLabel>
                  <Select
                    name='itemType'
                    value={formData.itemType}
                    label={t('itemType')}
                    onChange={handleChange}
                    disabled={!selectedSeason}
                  >
                    {itemTypes.map(type => (
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
                  name='supplier'
                  value={formData.supplier}
                  onChange={handleChange}
                  disabled={!selectedSeason}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label={t('purchaseDate')}
                  value={formData.purchaseDate}
                  onChange={handleDateChange}
                  renderInput={params => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.purchaseDate}
                      helperText={errors.purchaseDate}
                      disabled={!selectedSeason}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.unit}>
                  <InputLabel>{t('unit')}</InputLabel>
                  <Select
                    name='unit'
                    value={formData.unit}
                    label={t('unit')}
                    onChange={handleChange}
                    disabled={!selectedSeason}
                  >
                    {units.map(unit => (
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
                  name='costPerUnit'
                  type='number'
                  value={formData.costPerUnit}
                  onChange={handleChange}
                  error={!!errors.costPerUnit}
                  helperText={errors.costPerUnit}
                  disabled={!selectedSeason}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('quantity_bought')}
                  name='quantityBought'
                  type='number'
                  value={formData.quantityBought}
                  onChange={handleChange}
                  error={!!errors.quantityBought}
                  helperText={errors.quantityBought}
                  disabled={!selectedSeason || !!item}
                />
              </Grid>
            </Grid>
          </Box>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={handleSubmit} variant='contained' disabled={!selectedSeason}>
          {item ? t('save_changes') : t('add_item')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InventoryForm;

// Add PropTypes validation
InventoryForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.object,
  onSave: PropTypes.func.isRequired
};
