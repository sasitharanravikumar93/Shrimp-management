const mongoose = require('mongoose');

const nurseryBatchSchema = new mongoose.Schema({
  batchName: {
    type: Map,
    of: String,
    required: true
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
  },
  size: {
    type: Number, // e.g., area in sq meters or liters
    required: true
  },
  capacity: {
    type: Number, // e.g., max shrimp count
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

// Add indexes for better query performance
nurseryBatchSchema.index({ seasonId: 1 });
nurseryBatchSchema.index({ status: 1 });
nurseryBatchSchema.index({ seasonId: 1, status: 1 });

module.exports = mongoose.model('NurseryBatch', nurseryBatchSchema);