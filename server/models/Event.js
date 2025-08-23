const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  
  date: {
    type: Date,
    required: true
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'PondPreparation', 
      'Stocking', 
      'ChemicalApplication', 
      'PartialHarvest', 
      'FullHarvest', 
      'Sampling',
      // Nursery-specific events
      'NurseryPreparation',
      'WaterQualityTesting',
      'GrowthSampling',
      'Feeding',
      'Inspection'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Flexible field for type-specific parameters
    required: true
  },
  // Either pondId or nurseryBatchId is required (but not both)
  pondId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pond'
  },
  nurseryBatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NurseryBatch'
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
    required: true
  },
  // For inspection events with media
  media: [{
    type: {
      type: String,
      enum: ['image', 'video']
    },
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add validation to ensure either pondId or nurseryBatchId is provided
eventSchema.pre('validate', function(next) {
  if (!this.pondId && !this.nurseryBatchId) {
    next(new Error('Either pondId or nurseryBatchId is required'));
  } else if (this.pondId && this.nurseryBatchId) {
    next(new Error('Only one of pondId or nurseryBatchId should be provided'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Event', eventSchema);