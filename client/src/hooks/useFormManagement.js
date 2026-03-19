import { useState } from 'react';

export const useFormManagement = (initialFormData, getInitialFormData) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const handleOpenDialog = (batch = null) => {
    setEditingBatch(batch);
    setFormData(getInitialFormData(batch));
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBatch(null);
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = date => {
    setFormData(prev => ({
      ...prev,
      startDate: date
    }));
  };

  return {
    openDialog,
    editingBatch,
    formData,
    handleOpenDialog,
    handleCloseDialog,
    handleInputChange,
    handleDateChange,
    setFormData
  };
};
