const Expense = require('../models/Expense');
const Season = require('../models/Season');
const Pond = require('../models/Pond');

// Create a new expense
exports.createExpense = async (req, res) => {
  try {
    const { date, category, amount, description, pondId, seasonId } = req.body;
    
    if (!date || !category || amount === undefined || !seasonId) {
      return res.status(400).json({ message: 'Date, category, amount, and seasonId are required' });
    }

    // Check if season exists
    const season = await Season.findById(seasonId);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    if (pondId) {
      const pond = await Pond.findById(pondId);
      if (!pond) {
        return res.status(404).json({ message: 'Pond not found' });
      }
    }

    const expense = new Expense({ date, category, amount, description, pondId, seasonId });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error creating expense', error: error.message });
  }
};

// Get all expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const { seasonId, pondId } = req.query;
    let query = {};
    if (seasonId) query.seasonId = seasonId;
    if (pondId) query.pondId = pondId;
    
    const expenses = await Expense.find(query)
      .populate('pondId', 'name')
      .populate('seasonId', 'name')
      .sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
};

// Get single expense
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('pondId', 'name')
      .populate('seasonId', 'name');
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expense', error: error.message });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Error updating expense', error: error.message });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting expense', error: error.message });
  }
};
