const Expense = require('../models/Expense');
const { logger } = require('../utils/logger');

// Get all expenses with filtering
exports.getAllExpenses = async (req, res) => {
  try {
    const query = {};
    if (req.query.seasonId) {
      query.seasonId = req.query.seasonId;
    }
    if (req.query.pondId) {
      query.pondId = req.query.pondId;
    }
    if (req.query.mainCategory) {
      query.mainCategory = req.query.mainCategory;
    }
    const expenses = await Expense.find(query).populate('seasonId').populate('pondId').populate('employeeId');
    res.json(expenses);
  } catch (error) {
    logger.error('Error getting all expenses:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new expense
  try {
    const { date, amount, mainCategory, subCategory, description, seasonId, pondId, receiptUrl, employeeId } = req.body;
    
    // Basic validation
    if (!date || !amount || !mainCategory || !subCategory || !seasonId) {
      return res.status(400).json({ message: 'Missing required fields: date, amount, mainCategory, subCategory, and seasonId are required.' });
    }

    const expense = new Expense({
      date,
      amount,
      mainCategory,
      subCategory,
      description,
      seasonId,
      pondId,
      receiptUrl,
      employeeId
    });

    const newExpense = await expense.save();
    const populatedExpense = await Expense.findById(newExpense._id)
      .populate('seasonId')
      .populate('pondId')
      .populate('employeeId');
      
    res.status(201).json(populatedExpense);
  } catch (error) {
    logger.error('Error creating expense:', error);
    return res.status(400).json({ message: error.message });
  }

// Get a single expense
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('seasonId').populate('pondId').populate('employeeId');
    if (expense === null) {
      return res.status(404).json({ message: 'Cannot find expense' });
    }
    res.json(expense);
  } catch (error) {
    logger.error('Error getting expense by ID:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (expense === null) {
      return res.status(404).json({ message: 'Cannot find expense' });
    }

    const { date, amount, mainCategory, subCategory, description, seasonId, pondId, receiptUrl, employeeId } = req.body;
    if (date !== undefined) { expense.date = date; }
    if (amount !== undefined) { expense.amount = amount; }
    if (mainCategory !== undefined) { expense.mainCategory = mainCategory; }
    if (subCategory !== undefined) { expense.subCategory = subCategory; }
    if (description !== undefined) { expense.description = description; }
    if (seasonId !== undefined) { expense.seasonId = seasonId; }
    if (pondId !== undefined) { expense.pondId = pondId; }
    if (receiptUrl !== undefined) { expense.receiptUrl = receiptUrl; }
    if (employeeId !== undefined) { expense.employeeId = employeeId; }

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    logger.error('Error updating expense:', error);
    return res.status(400).json({ message: error.message });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (expense === null) {
      return res.status(404).json({ message: 'Cannot find expense' });
    }

    await expense.deleteOne();
    res.json({ message: 'Deleted Expense' });
  } catch (error) {
    logger.error('Error deleting expense:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get expense summary
exports.getExpenseSummary = async (req, res) => {
  try {
    const query = {};
    if (req.query.seasonId) {
      try {
        const { ObjectId } = require('mongoose').Types;
        query.seasonId = new ObjectId(req.query.seasonId);
      } catch (err) {
        logger.error('Invalid seasonId format:', req.query.seasonId);
        return res.status(400).json({ message: 'Invalid seasonId format' });
      }
    }

    const summary = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$mainCategory',
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalExpenses = summary.reduce((acc, item) => acc + item.totalAmount, 0);

    const summaryByCategory = summary.map(item => ({
      category: item._id,
      totalAmount: item.totalAmount,
      percentage: totalExpenses > 0 ? (item.totalAmount / totalExpenses) * 100 : 0
    }));

    res.json({ totalExpenses, summaryByCategory });

  } catch (error) {
    logger.error('Error getting expense summary:', error);
    return res.status(500).json({ message: error.message });
  }
};
