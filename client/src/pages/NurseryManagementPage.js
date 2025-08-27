import { Typography, Container } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import LoadingAndError from '../components/common/LoadingAndError';
import NurseryBatchDialog from '../components/nursery/NurseryBatchDialog';
import NurseryManagementContent from '../components/nursery/NurseryManagementContent';
import { useNurseryManagement } from '../hooks/useNurseryManagement';

const NurseryManagementPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const {
    nurseryBatches,
    seasons,
    loading,
    error,
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
  } = useNurseryManagement();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewBatch = batchId => {
    navigate(`/nursery/batch/${batchId}`);
  };

  return (
    <LoadingAndError loading={loading} error={error}>
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          {t('nursery_management')}
        </Typography>

        <NurseryManagementContent
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          nurseryBatches={nurseryBatches}
          seasons={seasons}
          handleOpenDialog={handleOpenDialog}
          handleDeleteBatch={handleDeleteBatch}
          handleViewBatch={handleViewBatch}
          deleteBatchLoading={deleteBatchLoading}
        />

        <NurseryBatchDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
          onDateChange={handleDateChange}
          formData={formData}
          seasons={seasons}
          editing={!!editingBatch}
          loading={createBatchLoading || updateBatchLoading}
        />
      </Container>
    </LoadingAndError>
  );
};

export default NurseryManagementPage;
