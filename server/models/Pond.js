const mongoose = require('mongoose');

const pondSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pond', pondSchema);