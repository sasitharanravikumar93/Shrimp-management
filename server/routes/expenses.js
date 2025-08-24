
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

// GET all expenses
router.get('/', expenseController.getAllExpenses);

// GET expense summary
router.get('/summary', expenseController.getExpenseSummary);

// POST a new expense
router.post('/', expenseController.createExpense);

// GET a single expense
router.get('/:id', expenseController.getExpenseById);

// PATCH to update an expense
router.patch('/:id', expenseController.updateExpense);

// DELETE an expense
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
