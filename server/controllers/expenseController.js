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
exports.createExpense = async (req, res) => {
  const expense = new Expense({
    date: req.body.date,
    amount: req.body.amount,
    mainCategory: req.body.mainCategory,
    subCategory: req.body.subCategory,
    description: req.body.description,
    seasonId: req.body.seasonId,
    pondId: req.body.pondId,
    receiptUrl: req.body.receiptUrl,
    employeeId: req.body.employeeId
  });

  try {
    const newExpense = await expense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    logger.error('Error creating expense:', error);
    return res.status(400).json({ message: error.message });
  }
};

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
      query.seasonId = req.query.seasonId;
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
