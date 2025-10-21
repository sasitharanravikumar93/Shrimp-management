const mongoose = require('mongoose');

const waterQualityInputSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Water quality test date is required'],
    validate: {
      validator: function (date) {
        // Don't allow future dates beyond tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date <= tomorrow;
      },
      message: 'Water quality test date cannot be in the future (beyond tomorrow)'
    },
    index: true
  },
  time: {
    type: String,
    required: [true, 'Water quality test time is required'],
    validate: {
      validator: function (time) {
        // Validate HH:MM format
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
      },
      message: 'Time must be in HH:MM format (24-hour)'
    }
  },
  pondId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pond',
    required: [true, 'Pond ID is required'],
    index: true
  },
  // Core water quality parameters
  pH: {
    type: Number,
    required: [true, 'pH value is required'],
    min: [0, 'pH cannot be negative'],
    max: [14, 'pH cannot exceed 14'],
    validate: {
      validator: function (pH) {
        // Round to 2 decimal places
        return Number(pH.toFixed(2)) === pH;
      },
      message: 'pH must not have more than 2 decimal places'
    }
  },
  dissolvedOxygen: {
    type: Number,
    required: [true, 'Dissolved oxygen value is required'],
    min: [0, 'Dissolved oxygen cannot be negative'],
    max: [50, 'Dissolved oxygen cannot exceed 50 mg/L'],
    validate: {
      validator: function (DO) {
        return Number(DO.toFixed(2)) === DO;
      },
      message: 'Dissolved oxygen must not have more than 2 decimal places'
    }
  },
  temperature: {
    type: Number,
    required: [true, 'Temperature value is required'],
    min: [-10, 'Temperature cannot be below -10°C'],
    max: [60, 'Temperature cannot exceed 60°C'],
    validate: {
      validator: function (temp) {
        return Number(temp.toFixed(1)) === temp;
      },
      message: 'Temperature must not have more than 1 decimal place'
    }
  },
  salinity: {
    type: Number,
    required: [true, 'Salinity value is required'],
    min: [0, 'Salinity cannot be negative'],
    max: [100, 'Salinity cannot exceed 100 ppt'],
    validate: {
      validator: function (salinity) {
        return Number(salinity.toFixed(2)) === salinity;
      },
      message: 'Salinity must not have more than 2 decimal places'
    }
  },
  // Optional parameters
  ammonia: {
    type: Number,
    min: [0, 'Ammonia cannot be negative'],
    max: [100, 'Ammonia cannot exceed 100 mg/L'],
    validate: {
      validator: function (ammonia) {
        return !ammonia || Number(ammonia.toFixed(3)) === ammonia;
      },
      message: 'Ammonia must not have more than 3 decimal places'
    }
  },
  nitrite: {
    type: Number,
    min: [0, 'Nitrite cannot be negative'],
    max: [100, 'Nitrite cannot exceed 100 mg/L'],
    validate: {
      validator: function (nitrite) {
        return !nitrite || Number(nitrite.toFixed(3)) === nitrite;
      },
      message: 'Nitrite must not have more than 3 decimal places'
    }
  },
  nitrate: {
    type: Number,
    min: [0, 'Nitrate cannot be negative'],
    max: [200, 'Nitrate cannot exceed 200 mg/L']
  },
  alkalinity: {
    type: Number,
    min: [0, 'Alkalinity cannot be negative'],
    max: [500, 'Alkalinity cannot exceed 500 mg/L']
  },
  hardness: {
    type: Number,
    min: [0, 'Water hardness cannot be negative'],
    max: [1000, 'Water hardness cannot exceed 1000 mg/L']
  },
  turbidity: {
    type: Number,
    min: [0, 'Turbidity cannot be negative'],
    max: [1000, 'Turbidity cannot exceed 1000 NTU']
  },
  // Chemical treatment tracking
  chemicalUsed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem'
  },
  chemicalQuantityUsed: {
    type: Number,
    min: [0, 'Chemical quantity cannot be negative'],
    validate: {
      validator: function (quantity) {
        // If chemical is used, quantity must be provided
        if (this.chemicalUsed && !quantity) {
          return false;
        }
        return true;
      },
      message: 'Chemical quantity is required when chemical is specified'
    }
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
    required: [true, 'Season ID is required'],
    index: true
  },
  // Additional metadata
  testingMethod: {
    type: String,
    enum: ['Digital Meter', 'Test Kit', 'Laboratory', 'Probe', 'Other'],
    default: 'Digital Meter'
  },
  testingDepth: {
    type: Number, // depth in meters where test was taken
    min: [0, 'Testing depth cannot be negative'],
    max: [50, 'Testing depth cannot exceed 50 meters']
  },
  weatherCondition: {
    type: String,
    enum: ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Foggy', 'Other']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  // Quality assessment
  overallQuality: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
    default: function () {
      // Auto-calculate based on parameters
      return this.calculateQualityRating();
    }
  },
  // GPS coordinates where test was taken
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
    }
  },
  // Reference to related event
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for quality score calculation
waterQualityInputSchema.virtual('qualityScore').get(function () {
  let score = 0;
  let factors = 0;

  // pH scoring (optimal range: 7.5-8.5)
  if (this.pH >= 7.5 && this.pH <= 8.5) {
    score += 25;
  } else if (this.pH >= 7.0 && this.pH <= 9.0) {
    score += 15;
  } else {
    score += 5;
  }
  factors++;

  // DO scoring (optimal: >5 mg/L)
  if (this.dissolvedOxygen >= 5) {
    score += 25;
  } else if (this.dissolvedOxygen >= 3) {
    score += 15;
  } else {
    score += 5;
  }
  factors++;

  // Temperature scoring (optimal range: 26-32°C for shrimp)
  if (this.temperature >= 26 && this.temperature <= 32) {
    score += 25;
  } else if (this.temperature >= 20 && this.temperature <= 35) {
    score += 15;
  } else {
    score += 5;
  }
  factors++;

  // Salinity scoring (depends on species, assuming 15-25 ppt for many species)
  if (this.salinity >= 15 && this.salinity <= 25) {
    score += 25;
  } else if (this.salinity >= 10 && this.salinity <= 30) {
    score += 15;
  } else {
    score += 5;
  }
  factors++;

  return Math.round(score / factors);
});

// Virtual for testing window
waterQualityInputSchema.virtual('testingWindow').get(function () {
  const hour = parseInt(this.time.split(':')[0], 10);
  if (hour >= 6 && hour < 12) { return 'Morning'; }
  if (hour >= 12 && hour < 18) { return 'Afternoon'; }
  if (hour >= 18 && hour < 22) { return 'Evening'; }
  return 'Night';
});

// Compound indexes for common query patterns
waterQualityInputSchema.index({ pondId: 1, date: -1, time: -1 });
waterQualityInputSchema.index({ seasonId: 1, date: -1 });
waterQualityInputSchema.index({ pondId: 1, seasonId: 1, date: -1 });
waterQualityInputSchema.index({ date: -1, overallQuality: 1 });
waterQualityInputSchema.index({ seasonId: 1, overallQuality: 1, date: -1 });
waterQualityInputSchema.index({ pondId: 1, pH: 1, date: -1 });
waterQualityInputSchema.index({ pondId: 1, dissolvedOxygen: 1, date: -1 });

// Performance indexes
waterQualityInputSchema.index({ createdAt: -1 });
waterQualityInputSchema.index({ updatedAt: -1 });

// Geospatial index
waterQualityInputSchema.index({ 'location.coordinates': '2dsphere' });

// Text search index
waterQualityInputSchema.index({ notes: 'text' });

// Unique constraint to prevent duplicate readings
waterQualityInputSchema.index(
  { pondId: 1, date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: {
      pondId: { $exists: true },
      date: { $exists: true },
      time: { $exists: true }
    }
  }
);

// Instance methods
waterQualityInputSchema.methods.calculateQualityRating = function () {
  const score = this.qualityScore;
  if (score >= 20) { return 'Excellent'; }
  if (score >= 15) { return 'Good'; }
  if (score >= 10) { return 'Fair'; }
  if (score >= 5) { return 'Poor'; }
  return 'Critical';
};

waterQualityInputSchema.methods.getParameterAlerts = function () {
  const alerts = [];

  if (this.pH < 6.5 || this.pH > 9.0) {
    alerts.push({ parameter: 'pH', value: this.pH, severity: 'high', message: 'pH is outside safe range' });
  }

  if (this.dissolvedOxygen < 3) {
    alerts.push({ parameter: 'dissolvedOxygen', value: this.dissolvedOxygen, severity: 'high', message: 'Dissolved oxygen is critically low' });
  }

  if (this.temperature < 15 || this.temperature > 35) {
    alerts.push({ parameter: 'temperature', value: this.temperature, severity: 'medium', message: 'Temperature is outside optimal range' });
  }

  if (this.ammonia && this.ammonia > 0.5) {
    alerts.push({ parameter: 'ammonia', value: this.ammonia, severity: 'high', message: 'Ammonia levels are too high' });
  }

  if (this.nitrite && this.nitrite > 1.0) {
    alerts.push({ parameter: 'nitrite', value: this.nitrite, severity: 'medium', message: 'Nitrite levels are elevated' });
  }

  return alerts;
};

// Static methods
waterQualityInputSchema.statics.findByPondAndDateRange = function (pondId, startDate, endDate) {
  return this.find({
    pondId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: -1, time: -1 });
};

waterQualityInputSchema.statics.getQualityTrends = function (seasonId, groupBy = 'day') {
  const groupByFormat = {
    day: '%Y-%m-%d',
    week: '%Y-%U',
    month: '%Y-%m'
  };

  return this.aggregate([
    {
      $match: {
        seasonId: mongoose.Types.ObjectId(seasonId)
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: groupByFormat[groupBy], date: '$date' } }
        },
        avgPH: { $avg: '$pH' },
        avgDO: { $avg: '$dissolvedOxygen' },
        avgTemperature: { $avg: '$temperature' },
        avgSalinity: { $avg: '$salinity' },
        minPH: { $min: '$pH' },
        maxPH: { $max: '$pH' },
        minDO: { $min: '$dissolvedOxygen' },
        maxDO: { $max: '$dissolvedOxygen' },
        readingCount: { $sum: 1 },
        qualityIssues: {
          $sum: {
            $cond: [{ $in: ['$overallQuality', ['Poor', 'Critical']] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

waterQualityInputSchema.statics.getParameterStatistics = function (pondId, seasonId, parameter) {
  const matchConditions = {};
  if (pondId) { matchConditions.pondId = mongoose.Types.ObjectId(pondId); }
  if (seasonId) { matchConditions.seasonId = mongoose.Types.ObjectId(seasonId); }

  return this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: null,
        avg: { $avg: `$${parameter}` },
        min: { $min: `$${parameter}` },
        max: { $max: `$${parameter}` },
        stdDev: { $stdDevPop: `$${parameter}` },
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('WaterQualityInput', waterQualityInputSchema);