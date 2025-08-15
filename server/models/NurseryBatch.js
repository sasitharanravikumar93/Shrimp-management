const mongoose = require('mongoose');

const nurseryBatchSchema = new mongoose.Schema({
  batchName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  initialCount: {
    type: Number,
    required: true
  },
  species: {
    type: String,
    required: true,
    trim: true
  },
  source: {
    type: String, // e.g., Hatchery Name
    required: true,
    trim: true
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NurseryBatch', nurseryBatchSchema);