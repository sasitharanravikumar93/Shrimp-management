const mongoose = require('mongoose');

const growthSamplingSchema = new mongoose.Schema({
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
  totalWeight: {
    type: Number, // e.g., kg or grams
    required: true
  },
  totalCount: {
    type: Number,
    required: true
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
    required: true
  }
  // averageWeight can be calculated on the fly: totalWeight / totalCount
}, {
  timestamps: true
});

// Virtual for averageWeight
growthSamplingSchema.virtual('averageWeight').get(function() {
  if (this.totalCount > 0) {
    return this.totalWeight / this.totalCount;
  }
  return 0;
});

// Ensure virtual fields are serialized
growthSamplingSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('GrowthSampling', growthSamplingSchema);