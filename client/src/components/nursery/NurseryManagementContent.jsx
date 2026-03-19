import { Add as AddIcon } from '@mui/icons-material';
import {
  Tabs,
  Tab,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import NurseryBatchTable from './NurseryBatchTable';

const NurseryManagementContent = ({
  activeTab,
  handleTabChange,
  nurseryBatches,
  seasons,
  handleOpenDialog,
  handleDeleteBatch,
  handleViewBatch,
  deleteBatchLoading
}) => {
  const { t } = useTranslation();

  return (
    <Card elevation={3}>
      <CardContent>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label='nursery tabs'
          variant='scrollable'
          scrollButtons='auto'
        >
          <Tab label={t('nursery_batches')} />
        </Tabs>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ p: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant='outlined'>
                <CardHeader
                  title={t('manage_nursery_batches')}
                  action={
                    <Button
                      variant='contained'
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog()}
                    >
                      {t('add_new_batch')}
                    </Button>
                  }
                />
                <CardContent>
                  <NurseryBatchTable
                    batches={nurseryBatches}
                    seasons={seasons}
                    onEdit={handleOpenDialog}
                    onDelete={handleDeleteBatch}
                    onView={handleViewBatch}
                    deleteLoading={deleteBatchLoading}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

NurseryManagementContent.propTypes = {
  activeTab: PropTypes.number.isRequired,
  handleTabChange: PropTypes.func.isRequired,
  nurseryBatches: PropTypes.array.isRequired,
  seasons: PropTypes.array.isRequired,
  handleOpenDialog: PropTypes.func.isRequired,
  handleDeleteBatch: PropTypes.func.isRequired,
  handleViewBatch: PropTypes.func.isRequired,
  deleteBatchLoading: PropTypes.bool
};

export default NurseryManagementContent;
