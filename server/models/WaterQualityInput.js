const mongoose = require('mongoose');

const waterQualityInputSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  pondId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pond',
    required: true
  },
  pH: {
    type: Number,
    required: true
  },
  dissolvedOxygen: {
    type: Number, // DO
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  salinity: {
    type: Number,
    required: true
  },
  ammonia: {
    type: Number // Optional
  },
  nitrite: {
    type: Number // Optional
  },
  alkalinity: {
    type: Number // Optional
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
    required: true
  },
  chemicalUsed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: false // Optional
  },
  chemicalQuantityUsed: {
    type: Number,
    required: false // Optional
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
waterQualityInputSchema.index({ pondId: 1 });
waterQualityInputSchema.index({ seasonId: 1 });
waterQualityInputSchema.index({ date: -1 });
waterQualityInputSchema.index({ pondId: 1, date: -1 });

module.exports = mongoose.model('WaterQualityInput', waterQualityInputSchema);