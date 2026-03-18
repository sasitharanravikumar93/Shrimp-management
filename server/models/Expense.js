const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Labor', 'Electricity', 'Fuel', 'Maintenance', 'Equipment', 'Other']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  pondId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pond',
    required: false // Optional, can be season-wide
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
