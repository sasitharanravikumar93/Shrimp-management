
import React, { useState } from 'react';
import { 
  Typography, 
  Paper, 
  Button, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useApiData, useApiMutation } from '../hooks/useApi';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../services/api';
import { useSeason } from '../context/SeasonContext';
import ExpenseForm from './ExpenseForm';

const ExpenseList = ({ category }) => {
  const { selectedSeason } = useSeason();
  const [openForm, setOpenForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const { data: expenses, loading, refetch } = useApiData(
    () => selectedSeason ? getExpenses({ seasonId: selectedSeason._id, mainCategory: category }) : Promise.resolve([]),
    [selectedSeason, category]
  );

  const { mutate: createExpenseMutation } = useApiMutation(createExpense);
  const { mutate: updateExpenseMutation } = useApiMutation(updateExpense);
  const { mutate: deleteExpenseMutation } = useApiMutation(deleteExpense);

  const handleSaveExpense = async (data) => {
    try {
      if (editingExpense) {
        await updateExpenseMutation(editingExpense._id, data);
      } else {
        await createExpenseMutation({ ...data, mainCategory: category });
      }
      refetch();
      setOpenForm(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Failed to save expense', error);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpenseMutation(id);
        refetch();
      } catch (error) {
        console.error('Failed to delete expense', error);
      }
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setOpenForm(true);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{category} Expenses</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenForm(true)}>
          Add {category} Expense
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Sub Category</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses?.map((expense) => (
              <TableRow key={expense._id}>
                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{expense.subCategory}</TableCell>
                <TableCell align="right">{expense.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditExpense(expense)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDeleteExpense(expense._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ExpenseForm 
        open={openForm} 
        onClose={() => setOpenForm(false)} 
        onSave={handleSaveExpense} 
        expense={editingExpense}
      />
    </Paper>
  );
};

export default ExpenseList;
