import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import NurseryBatchForm from './NurseryBatchForm';

const NurseryBatchDialog = ({
  open,
  onClose,
  onSubmit,
  onInputChange,
  onDateChange,
  formData,
  seasons,
  editing,
  loading
}) => {
  const { t } = useTranslation();

  const getDialogTitle = () => {
    return editing ? t('edit_nursery_batch') : t('add_new_nursery_batch');
  };

  const getButtonText = () => {
    if (loading) return t('saving');
    if (editing) return t('update_batch');
    return t('save_batch');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>{getDialogTitle()}</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <NurseryBatchForm
            formData={formData}
            onInputChange={onInputChange}
            onDateChange={onDateChange}
            seasons={seasons}
          />
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={onSubmit} variant='contained' disabled={loading}>
          {getButtonText()}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

NurseryBatchDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  seasons: PropTypes.array.isRequired,
  editing: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired
};

export default NurseryBatchDialog;
