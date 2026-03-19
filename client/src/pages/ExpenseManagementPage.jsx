import { Add as AddIcon } from '@mui/icons-material';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React, { useState, useEffect } from 'react';

import { useSeason } from '../context/SeasonContext';
import { getExpenses, createExpense, getPonds } from '../services/api';

const CATEGORIES = ['Labor', 'Electricity', 'Fuel', 'Maintenance', 'Equipment', 'Other'];

const ExpenseManagementPage = () => {
  const { selectedSeason } = useSeason();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [ponds, setPonds] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date(),
    category: '',
    amount: '',
    description: '',
    pondId: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expRes, pondsRes] = await Promise.all([getExpenses(selectedSeason?.id), getPonds()]);
      setExpenses(expRes);
      setPonds(pondsRes.filter(p => !selectedSeason || p.seasonId === selectedSeason.id));
    } catch (err) {
      setError(err.message || 'Error fetching expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSeason]);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await createExpense({
        ...formData,
        seasonId: selectedSeason.id,
        amount: Number(formData.amount),
        pondId: formData.pondId || undefined
      });
      setOpen(false);
      fetchData();
    } catch (err) {
      alert(`Error logging expense: ${err.message}`);
    }
  };

  if (loading)
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );

  return (
    <Container maxWidth='xl' sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4' component='h1'>
          Expense Management
        </Typography>
        <Button variant='contained' startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Add Expense
        </Button>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card elevation={3}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align='right'>Amount ($)</TableCell>
                <TableCell>Pond (Optional)</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align='center'>
                    No expenses recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map(row => (
                  <TableRow key={row._id}>
                    <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell align='right'>
                      {row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{row.pondId?.name || 'Season-wide'}</TableCell>
                    <TableCell>{row.description}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Log New Expense</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label='Category'
                  required
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(c => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label='Date'
                    value={formData.date}
                    onChange={date => setFormData({ ...formData, date })}
                    renderInput={params => <TextField {...params} fullWidth required />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Amount ($)'
                  type='number'
                  inputProps={{ step: '0.01' }}
                  required
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label='Pond (Optional)'
                  value={formData.pondId}
                  onChange={e => setFormData({ ...formData, pondId: e.target.value })}
                  helperText='Leave blank if this is a general/season-wide expense.'
                >
                  <MenuItem value=''>
                    <em>None (Season-wide)</em>
                  </MenuItem>
                  {ponds.map(p => (
                    <MenuItem key={p._id} value={p._id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Description'
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type='submit' variant='contained'>
              Save Expense
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ExpenseManagementPage;
