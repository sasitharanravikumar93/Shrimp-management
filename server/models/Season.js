const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Planning', 'Active', 'Completed'],
    default: 'Planning'
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Ensure endDate is after startDate
seasonSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

module.exports = mongoose.model('Season', seasonSchema);