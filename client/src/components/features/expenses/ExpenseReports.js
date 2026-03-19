import AssessmentIcon from '@mui/icons-material/Assessment';
import { Typography, Paper, Button, Box, Grid, TextField, MenuItem } from '@mui/material';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';

import { useSeason } from '../../../context/SeasonContext';
import logger from '../../../utils/logger';

const ExpenseReports = () => {
  const { selectedSeason } = useSeason();
  const { control, handleSubmit } = useForm();

  const handleGenerateReport = data => {
    logger.info('Generating expense report', {
      reportType: data.reportType,
      season: selectedSeason?._id,
      component: 'ExpenseReports'
    });
    // Actual report generation logic will be implemented later
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant='h6' gutterBottom>
        Expense Reports
      </Typography>
      <form onSubmit={handleSubmit(handleGenerateReport)}>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} sm={4}>
            <Controller
              name='reportType'
              control={control}
              defaultValue='summary'
              render={({ field }) => (
                <TextField {...field} select label='Report Type' fullWidth>
                  <MenuItem value='summary'>Summary by Category</MenuItem>
                  <MenuItem value='per-pond'>Expenses per Pond</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              name='season'
              control={control}
              defaultValue={selectedSeason?._id || ''}
              render={({ field }) => (
                <TextField {...field} label='Season' fullWidth disabled>
                  {/* This would typically be a dropdown, but is fixed to selected season for now */}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button type='submit' variant='contained' startIcon={<AssessmentIcon />}>
              Generate Report
            </Button>
          </Grid>
        </Grid>
      </form>
      <Box mt={4}>
        {/* Placeholder for displaying the generated report */}
        <Typography>Report results will be displayed here.</Typography>
      </Box>
    </Paper>
  );
};

export default ExpenseReports;
