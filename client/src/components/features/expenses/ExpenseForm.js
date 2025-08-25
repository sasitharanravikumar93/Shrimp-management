import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import PropTypes from 'prop-types';

import { useSeason } from '../../../context/SeasonContext';
import { useApiData } from '../../../hooks/useApi';
import { getPonds, getEmployees } from '../../../services/api';

const ExpenseForm = ({ open, onClose, onSave, expense }) => {
  const { selectedSeason } = useSeason();
  const { handleSubmit, control, reset, watch } = useForm();
  const mainCategory = watch('mainCategory');

  const { data: ponds = [] } = useApiData(() => getPonds(), []);
  const { data: employees = [] } = useApiData(() => getEmployees(), []);

  useEffect(() => {
    if (expense) {
      reset(expense);
    } else {
      reset({
        date: new Date().toISOString().split('T')[0],
        mainCategory: 'Culture',
        season: selectedSeason?._id
      });
    }
  }, [expense, open, reset, selectedSeason]);

  const cultureSubCategories = ['Feed', 'Seed', 'Probiotics', 'Chemicals', 'Power', 'Labor'];
  const farmSubCategories = [
    'Electricity',
    'Fuel',
    'Maintenance',
    'Security',
    'Office Supplies',
    'Transportation'
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>{expense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='date'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type='date'
                    label='Date'
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='amount'
                control={control}
                render={({ field }) => (
                  <TextField {...field} type='number' label='Amount' fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='mainCategory'
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label='Main Category' fullWidth>
                    <MenuItem value='Culture'>Culture</MenuItem>
                    <MenuItem value='Farm'>Farm</MenuItem>
                    <MenuItem value='Salary'>Salary</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            {mainCategory === 'Culture' && (
              <Grid item xs={12}>
                <Controller
                  name='subCategory'
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label='Sub Category' fullWidth>
                      {cultureSubCategories.map(cat => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            )}
            {mainCategory === 'Farm' && (
              <Grid item xs={12}>
                <Controller
                  name='subCategory'
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label='Sub Category' fullWidth>
                      {farmSubCategories.map(cat => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            )}
            {mainCategory === 'Culture' && (
              <Grid item xs={12}>
                <Controller
                  name='pond'
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label='Pond' fullWidth>
                      {ponds.data?.map(pond => (
                        <MenuItem key={pond._id} value={pond._id}>
                          {pond.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            )}
            {mainCategory === 'Salary' && (
              <Grid item xs={12}>
                <Controller
                  name='employee'
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label='Employee' fullWidth>
                      {employees.map(emp => (
                        <MenuItem key={emp._id} value={emp._id}>
                          {emp.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <TextField {...field} label='Description' fullWidth multiline rows={3} />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type='submit' variant='contained'>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ExpenseForm;

// Add PropTypes validation
ExpenseForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  expense: PropTypes.object
};
