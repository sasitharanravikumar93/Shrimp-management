const mongoose = require('mongoose');

const pondSchema = new mongoose.Schema({
  name: {
    type: Map,
    of: String,
    required: true
  },
  size: {
    type: Number, // e.g., area in sq meters or acres
    required: true
  },
  capacity: {
    type: Number, // e.g., max shrimp count or volume
    required: true
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
    required: true
  },
  status: {
    type: String,
    enum: ['Planning', 'Active', 'Inactive', 'Completed'],
    default: 'Planning'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pond', pondSchema);