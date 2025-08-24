
import React, { useState } from 'react';
import { Typography, Grid, Paper, Button, Box, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useApiData, useApiMutation } from '../hooks/useApi';
import { getExpenseSummary, getExpenses, createExpense, updateExpense } from '../services/api';
import { useSeason } from '../context/SeasonContext';
import ExpenseForm from './ExpenseForm';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ExpenseDashboard = () => {
  const { selectedSeason } = useSeason();
  const [openForm, setOpenForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const { data: summary, loading: summaryLoading, refetch: refetchSummary } = useApiData(
    () => selectedSeason ? getExpenseSummary(selectedSeason._id) : Promise.resolve({ totalExpenses: 0, summaryByCategory: [] }),
    [selectedSeason]
  );

  const { data: recentExpenses, loading: expensesLoading, refetch: refetchExpenses } = useApiData(
    () => selectedSeason ? getExpenses({ seasonId: selectedSeason._id, limit: 5, sort: '-date' }) : Promise.resolve([]),
    [selectedSeason]
  );

  const { mutate: createExpenseMutation } = useApiMutation(createExpense);
  const { mutate: updateExpenseMutation } = useApiMutation(updateExpense);

  const handleSaveExpense = async (data) => {
    try {
      if (editingExpense) {
        await updateExpenseMutation(editingExpense._id, data);
      } else {
        await createExpenseMutation(data);
      }
      refetchSummary();
      refetchExpenses();
      setOpenForm(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Failed to save expense', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (summaryLoading || expensesLoading) {
    return <CircularProgress />;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenForm(true)}>
          Add Expense
        </Button>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" color="primary">Total Expenses</Typography>
          <Typography variant="h4">{summary?.totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2, height: 300 }}>
          <Typography variant="h6" color="primary">Expense Distribution</Typography>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={summary?.summaryByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="totalAmount"
                nameKey="category"
              >
                {summary?.summaryByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}/>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" color="primary">Recent Expenses</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentExpenses?.map((expense) => (
                  <TableRow key={expense._id}>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell align="right">{expense.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
      <ExpenseForm 
        open={openForm} 
        onClose={() => setOpenForm(false)} 
        onSave={handleSaveExpense} 
        expense={editingExpense}
      />
    </Grid>
  );
};

export default ExpenseDashboard;
