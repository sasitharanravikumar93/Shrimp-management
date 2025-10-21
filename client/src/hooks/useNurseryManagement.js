import { useState } from 'react';

import {
  createNurseryBatch,
  deleteNurseryBatch,
  getNurseryBatches,
  getSeasons,
  updateNurseryBatch
} from '../services/api';

import { useApiData, useApiMutation } from './useApi';

export const useNurseryManagement = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formData, setFormData] = useState({
    batchName: '',
    startDate: new Date(),
    initialCount: '',
    species: '',
    source: '',
    seasonId: '',
    size: '',
    capacity: '',
    status: 'Planning'
  });

  const {
    data: nurseryBatchesData,
    loading: nurseryBatchesLoading,
    error: nurseryBatchesError,
    refetch: refetchNurseryBatches
  } = useApiData(getNurseryBatches, []);

  const {
    data: seasonsData,
    loading: seasonsLoading,
    error: seasonsError
  } = useApiData(getSeasons, []);

  const { mutate: createBatchMutation, loading: createBatchLoading } =
    useApiMutation(createNurseryBatch);
  const { mutate: updateBatchMutation, loading: updateBatchLoading } =
    useApiMutation(updateNurseryBatch);
  const { mutate: deleteBatchMutation, loading: deleteBatchLoading } =
    useApiMutation(deleteNurseryBatch);

  const getInitialFormData = (batch = null) => {
    if (batch) {
      return {
        batchName:
          typeof batch.batchName === 'object'
            ? batch.batchName.en || ''
            : batch.batchName || batch.name || '',
        startDate: batch.startDate ? new Date(batch.startDate) : new Date(),
        initialCount: batch.initialCount || '',
        species: batch.species || '',
        source: batch.source || '',
        seasonId: batch.seasonId || '',
        size: batch.size || '',
        capacity: batch.capacity || '',
        status: batch.status || 'Planning'
      };
    }
    return {
      batchName: '',
      startDate: new Date(),
      initialCount: '',
      species: '',
      source: '',
      seasonId: '',
      size: '',
      capacity: '',
      status: 'Planning'
    };
  };

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

  const handleSubmit = async e => {
    handleBatchSubmit({
      e,
      formData,
      editingBatch,
      updateBatchMutation,
      createBatchMutation,
      handleCloseDialog,
      refetchNurseryBatches
    });
  };

  const handleDeleteBatch = async batchId => {
    handleBatchDelete(batchId, deleteBatchMutation, refetchNurseryBatches);
  };

  return {
    nurseryBatches: nurseryBatchesData || [],
    seasons: seasonsData || [],
    loading: nurseryBatchesLoading || seasonsLoading,
    error: nurseryBatchesError || seasonsError,
    openDialog,
    editingBatch,
    formData,
    createBatchLoading,
    updateBatchLoading,
    deleteBatchLoading,
    handleOpenDialog,
    handleCloseDialog,
    handleInputChange,
    handleDateChange,
    handleSubmit,
    handleDeleteBatch
  };
};

const handleBatchSubmit = async ({
  e,
  formData,
  editingBatch,
  updateBatchMutation,
  createBatchMutation,
  handleCloseDialog,
  refetchNurseryBatches
}) => {
  e.preventDefault();

  try {
    const batchData = {
      batchName: { en: formData.batchName },
      startDate: formData.startDate,
      initialCount: parseInt(formData.initialCount),
      species: formData.species,
      source: formData.source,
      seasonId: formData.seasonId,
      size: parseFloat(formData.size),
      capacity: parseInt(formData.capacity),
      status: formData.status
    };

    if (editingBatch) {
      await updateBatchMutation(editingBatch._id || editingBatch.id, batchData);
    } else {
      await createBatchMutation(batchData);
    }

    handleCloseDialog();
    refetchNurseryBatches();
  } catch (error) {
    console.error('Error saving batch:', error);
  }
};

const handleBatchDelete = async (batchId, deleteBatchMutation, refetchNurseryBatches) => {
  if (window.confirm('Are you sure you want to delete this nursery batch?')) {
    try {
      await deleteBatchMutation(batchId);
      refetchNurseryBatches();
    } catch (error) {
      console.error('Error deleting batch:', error);
    }
  }
};
