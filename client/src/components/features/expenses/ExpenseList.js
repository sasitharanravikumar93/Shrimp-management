import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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
import PropTypes from 'prop-types';
import React, { useState, memo } from 'react';

import { useSeason } from '../../../context/SeasonContext';
import { useApiData, useApiMutation } from '../../../hooks/useApi';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../../../services/api';
import { useStableCallback, useStableMemo } from '../../../utils/performanceOptimization';
import { InlineError } from '../shared/error-handling/ErrorDisplay';
import { SkeletonTable, SpinnerLoader } from '../shared/loading/LoadingComponents';

import ExpenseForm from './ExpenseForm';

// Memoized ExpenseRow component to prevent unnecessary re-renders
const ExpenseRow = memo(({ expense, onEdit, onDelete, isDeleting }) => {
  const handleEdit = useStableCallback(() => onEdit(expense), [onEdit, expense]);
  const handleDelete = useStableCallback(() => onDelete(expense._id), [onDelete, expense._id]);

  const formattedDate = useStableMemo(
    () => new Date(expense.date).toLocaleDateString(),
    [expense.date]
  );

  const formattedAmount = useStableMemo(
    () => expense.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    [expense.amount]
  );

  return (
    <TableRow key={expense._id}>
      <TableCell>{formattedDate}</TableCell>
      <TableCell>{expense.description}</TableCell>
      <TableCell>{expense.subCategory}</TableCell>
      <TableCell align='right'>{formattedAmount}</TableCell>
      <TableCell>
        <IconButton onClick={handleEdit} disabled={isDeleting}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? <SpinnerLoader size={20} centered={false} /> : <DeleteIcon />}
        </IconButton>
      </TableCell>
    </TableRow>
  );
});

ExpenseRow.displayName = 'ExpenseRow';

const ExpenseList = memo(({ category }) => {
  const { selectedSeason } = useSeason();
  const [openForm, setOpenForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [actionError, setActionError] = useState(null);

  // Memoize API function to prevent unnecessary re-fetching
  const getExpensesForCategory = useStableCallback(() => {
    return selectedSeason
      ? getExpenses({ seasonId: selectedSeason._id, mainCategory: category })
      : Promise.resolve([]);
  }, [selectedSeason, category]);

  const {
    data: expenses,
    loading,
    error,
    refetch
  } = useApiData(getExpensesForCategory, [selectedSeason, category]);

  // Stable mutation functions with caching invalidation
  const { mutate: createExpenseMutation } = useApiMutation(createExpense, {
    invalidatePatterns: ['/expenses'],
    onSuccess: () => refetch()
  });
  const { mutate: updateExpenseMutation } = useApiMutation(updateExpense, {
    invalidatePatterns: ['/expenses'],
    onSuccess: () => refetch()
  });
  const { mutate: deleteExpenseMutation } = useApiMutation(deleteExpense, {
    invalidatePatterns: ['/expenses'],
    onSuccess: () => refetch()
  });

  // Memoized event handlers to prevent child re-renders
  const handleSaveExpense = useStableCallback(
    async data => {
      setActionLoading(prev => ({ ...prev, save: true }));
      setActionError(null);

      try {
        if (editingExpense) {
          await updateExpenseMutation(editingExpense._id, data);
        } else {
          await createExpenseMutation({ ...data, mainCategory: category });
        }
        setOpenForm(false);
        setEditingExpense(null);
      } catch (error) {
        console.error('Failed to save expense', error);
        setActionError(error);
      } finally {
        setActionLoading(prev => ({ ...prev, save: false }));
      }
    },
    [editingExpense, updateExpenseMutation, createExpenseMutation, category]
  );

  const handleDeleteExpense = useStableCallback(
    async id => {
      if (window.confirm('Are you sure you want to delete this expense?')) {
        setActionLoading(prev => ({ ...prev, [`delete_${id}`]: true }));
        setActionError(null);

        try {
          await deleteExpenseMutation(id);
        } catch (error) {
          console.error('Failed to delete expense', error);
          setActionError(error);
        } finally {
          setActionLoading(prev => ({ ...prev, [`delete_${id}`]: false }));
        }
      }
    },
    [deleteExpenseMutation]
  );

  const handleEditExpense = useStableCallback(expense => {
    setEditingExpense(expense);
    setOpenForm(true);
  }, []);

  const handleAddExpense = useStableCallback(() => {
    setOpenForm(true);
  }, []);

  const handleCloseForm = useStableCallback(() => {
    setOpenForm(false);
    setEditingExpense(null);
  }, []);

  const handleClearError = useStableCallback(() => {
    setActionError(null);
  }, []);

  // Memoized expense rows to prevent unnecessary re-renders
  const expenseRows = useStableMemo(() => {
    return (
      expenses?.map(expense => (
        <ExpenseRow
          key={expense._id}
          expense={expense}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
          isDeleting={actionLoading[`delete_${expense._id}`]}
        />
      )) || []
    );
  }, [expenses, handleEditExpense, handleDeleteExpense, actionLoading]);

  // Memoized empty state
  const emptyState = useStableMemo(() => {
    if (!expenses || expenses.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} align='center'>
            <Typography color='text.secondary'>
              No {category.toLowerCase()} expenses found.
            </Typography>
          </TableCell>
        </TableRow>
      );
    }
    return null;
  }, [expenses, category]);

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant='h6'>{category} Expenses</Typography>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={handleAddExpense}
          disabled={loading}
        >
          Add {category} Expense
        </Button>
      </Box>

      {/* Action Error Display */}
      {actionError && <InlineError error={actionError} onRetry={handleClearError} sx={{ mb: 2 }} />}

      {/* Loading State */}
      {loading ? (
        <SkeletonTable rows={5} columns={5} />
      ) : error ? (
        <InlineError error={error} onRetry={refetch} sx={{ my: 2 }} />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Sub Category</TableCell>
                <TableCell align='right'>Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenseRows}
              {emptyState}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ExpenseForm
        open={openForm}
        onClose={handleCloseForm}
        onSave={handleSaveExpense}
        expense={editingExpense}
        loading={actionLoading.save}
      />
    </Paper>
  );
});

// Add display name for better debugging
ExpenseList.displayName = 'ExpenseList';

// PropTypes for runtime type checking
ExpenseRow.propTypes = {
  expense: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    subCategory: PropTypes.string.isRequired,
    mainCategory: PropTypes.string
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool
};

ExpenseRow.defaultProps = {
  isDeleting: false
};

ExpenseList.propTypes = {
  category: PropTypes.oneOf(['Culture', 'Farm', 'Operational']).isRequired
};

export default ExpenseList;
