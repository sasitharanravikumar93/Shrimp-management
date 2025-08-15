const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  
  date: {
    type: Date,
    required: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['PondPreparation', 'Stocking', 'ChemicalApplication', 'PartialHarvest', 'FullHarvest', 'Sampling']
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Flexible field for type-specific parameters
    required: true
  },
  pondId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pond',
    required: true // Now required
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
    required: true // Now required
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);