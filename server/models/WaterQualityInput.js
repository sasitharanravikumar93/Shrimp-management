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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WaterQualityInput', waterQualityInputSchema);