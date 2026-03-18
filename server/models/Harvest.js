const mongoose = require('mongoose');

const harvestSchema = new mongoose.Schema({
  pondId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pond',
    required: true
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  totalBiomass: {
    type: Number, // in kg
    required: true
  },
  finalABW: {
    type: Number, // in grams
    required: true
  },
  survivalRate: {
    type: Number, // percentage, calculated automatically
    required: false
  },
  fcr: {
    type: Number, // Feed Conversion Ratio, calculated automatically
    required: false
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Harvest', harvestSchema);
