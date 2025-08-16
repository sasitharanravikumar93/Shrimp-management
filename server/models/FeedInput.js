const mongoose = require('mongoose');

const feedInputSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String, // Could also be Date if including time
    required: true
  },
  pondId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pond',
    required: true
  },
  inventoryItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true
  },
  quantity: {
    type: Number, // e.g., kg
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

// Add indexes for better query performance
feedInputSchema.index({ pondId: 1 });
feedInputSchema.index({ seasonId: 1 });
feedInputSchema.index({ date: -1 });
feedInputSchema.index({ pondId: 1, date: -1 });

module.exports = mongoose.model('FeedInput', feedInputSchema);