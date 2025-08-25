const mongoose = require('mongoose');

const pondSchema = new mongoose.Schema({
  name: {
    type: Map,
    of: String,
    required: [true, 'Pond name is required'],
    validate: {
      validator: function (nameMap) {
        // Ensure at least one language is provided
        return nameMap && nameMap.size > 0;
      },
      message: 'At least one language name must be provided'
    }
  },
  size: {
    type: Number, // area in square meters
    required: [true, 'Pond size is required'],
    min: [1, 'Pond size must be greater than 0'],
    max: [1000000, 'Pond size cannot exceed 1,000,000 sq meters']
  },
  capacity: {
    type: Number, // max stocking capacity
    required: [true, 'Pond capacity is required'],
    min: [1, 'Pond capacity must be greater than 0'],
    max: [10000000, 'Pond capacity cannot exceed 10,000,000']
  },
  depth: {
    type: Number, // average depth in meters
    min: [0.1, 'Pond depth must be at least 0.1 meters'],
    max: [10, 'Pond depth cannot exceed 10 meters']
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
    required: [true, 'Season ID is required'],
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['Planning', 'Active', 'Inactive', 'Completed', 'Maintenance'],
      message: '{VALUE} is not a valid pond status'
    },
    default: 'Planning',
    index: true
  },
  location: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      validate: {
        validator: function (coords) {
          return !coords || (coords.length === 2 &&
            coords[0] >= -180 && coords[0] <= 180 && // longitude
            coords[1] >= -90 && coords[1] <= 90);    // latitude
        },
        message: 'Invalid coordinates format. Must be [longitude, latitude]'
      }
    },
    address: {
      type: String,
      maxlength: [500, 'Address cannot exceed 500 characters']
    }
  },
  waterSource: {
    type: String,
    enum: ['Well', 'River', 'Canal', 'Municipal', 'Other'],
    default: 'Other'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  // Add virtuals to JSON output
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for pond utilization percentage
pondSchema.virtual('utilizationPercentage').get(function () {
  if (this.status === 'Active' && this.capacity > 0) {
    // This would need to be calculated based on current stocking
    return null; // Placeholder - would calculate from current stocking events
  }
  return 0;
});

// Compound indexes for common query patterns
pondSchema.index({ seasonId: 1, status: 1 });
pondSchema.index({ seasonId: 1, status: 1, 'name.en': 1 });
pondSchema.index({ seasonId: 1, size: 1 });
pondSchema.index({ status: 1, createdAt: -1 });
pondSchema.index({ seasonId: 1, createdAt: -1 });

// Single field indexes
pondSchema.index({ 'location.coordinates': '2dsphere' }); // Geospatial index
pondSchema.index({ capacity: 1 });
pondSchema.index({ size: 1 });

// Text index for search functionality
pondSchema.index({
  'name.en': 'text',
  'name.ta': 'text',
  'name.si': 'text',
  notes: 'text'
});

// Pre-save middleware for validation
pondSchema.pre('save', function (next) {
  // Ensure capacity doesn't exceed what's reasonable for the size
  if (this.size && this.capacity) {
    const maxCapacityPerSqMeter = 50; // conservative estimate
    const suggestedMaxCapacity = this.size * maxCapacityPerSqMeter;

    if (this.capacity > suggestedMaxCapacity * 2) {
      return next(new Error(`Capacity (${this.capacity}) seems too high for pond size (${this.size} sq meters). Consider reviewing the values.`));
    }
  }

  next();
});

// Instance method to get display name
pondSchema.methods.getDisplayName = function (language = 'en') {
  return this.name.get(language) || this.name.get('en') || 'Unnamed Pond';
};

// Static method to find ponds by status and season
pondSchema.statics.findBySeasonAndStatus = function (seasonId, status) {
  const query = { seasonId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method for geospatial queries
pondSchema.statics.findNearby = function (longitude, latitude, maxDistance = 1000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

module.exports = mongoose.model('Pond', pondSchema);