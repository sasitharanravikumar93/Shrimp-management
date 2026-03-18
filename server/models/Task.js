const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['Routine', 'Maintenance', 'Health', 'General'],
    default: 'General'
  },
  frequency: {
    type: String,
    enum: ['Once', 'Daily', 'Weekly', 'Monthly'],
    default: 'Once'
  },
  dueDate: {
    type: Date,
    required: true
  },
  assignedTo: {
    type: String, // Or ObjectId ref to User if Auth is added
    required: false
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season'
  },
  pondId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pond'
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
