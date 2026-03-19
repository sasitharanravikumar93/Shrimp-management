const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  mainCategory: {
    type: String,
    required: true,
    enum: ['Culture', 'Farm', 'Operational', 'Salary']
  },
  subCategory: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  pondId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pond',
    required: false
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
    required: true
  },
  receiptUrl: {
    type: String
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
