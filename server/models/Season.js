const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  name: {
    type: Map,
    of: String,
    required: [true, 'Season name is required'],
    validate: {
      validator: function (nameMap) {
        // Ensure at least one language is provided
        return nameMap && nameMap.size > 0;
      },
      message: 'At least one language name must be provided'
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Season start date is required'],
    validate: {
      validator: function (startDate) {
        // Start date should not be more than 2 years in the past
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        return startDate >= twoYearsAgo;
      },
      message: 'Season start date cannot be more than 2 years in the past'
    },
    index: true
  },
  endDate: {
    type: Date,
    required: [true, 'Season end date is required'],
    validate: {
      validator: function (endDate) {
        // End date should not be more than 5 years in the future
        const fiveYearsFromNow = new Date();
        fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);
        return endDate <= fiveYearsFromNow;
      },
      message: 'Season end date cannot be more than 5 years in the future'
    },
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['Planning', 'Active', 'Completed', 'Suspended', 'Cancelled'],
      message: '{VALUE} is not a valid season status'
    },
    default: 'Planning',
    index: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  targetProduction: {
    type: Number, // in kg
    min: [0, 'Target production cannot be negative'],
    max: [1000000, 'Target production cannot exceed 1,000,000 kg']
  },
  budgetAllocation: {
    feeds: {
      type: Number,
      min: [0, 'Feed budget cannot be negative']
    },
    chemicals: {
      type: Number,
      min: [0, 'Chemical budget cannot be negative']
    },
    labor: {
      type: Number,
      min: [0, 'Labor budget cannot be negative']
    },
    equipment: {
      type: Number,
      min: [0, 'Equipment budget cannot be negative']
    },
    other: {
      type: Number,
      min: [0, 'Other budget cannot be negative']
    }
  },
  // Environmental conditions
  climate: {
    expectedTemperatureRange: {
      min: {
        type: Number,
        min: [-10, 'Minimum temperature cannot be below -10°C'],
        max: [60, 'Minimum temperature cannot exceed 60°C']
      },
      max: {
        type: Number,
        min: [-10, 'Maximum temperature cannot be below -10°C'],
        max: [60, 'Maximum temperature cannot exceed 60°C']
      }
    },
    rainySeasonPeriod: {
      start: Date,
      end: Date
    },
    notes: {
      type: String,
      maxlength: [500, 'Climate notes cannot exceed 500 characters']
    }
  },
  // Species information
  primarySpecies: {
    type: String,
    enum: ['Whiteleg Shrimp', 'Giant Tiger Prawn', 'Blue Shrimp', 'Other'],
    default: 'Whiteleg Shrimp'
  },
  stockingDensity: {
    target: {
      type: Number, // per sq meter
      min: [0, 'Target stocking density cannot be negative'],
      max: [1000, 'Target stocking density cannot exceed 1000 per sq meter']
    },
    unit: {
      type: String,
      enum: ['per_sqm', 'per_hectare', 'total_count'],
      default: 'per_sqm'
    }
  },
  // Performance tracking
  kpis: {
    targetFCR: {
      type: Number, // Feed Conversion Ratio
      min: [0.5, 'Target FCR cannot be below 0.5'],
      max: [5, 'Target FCR cannot exceed 5']
    },
    targetSurvivalRate: {
      type: Number, // percentage
      min: [0, 'Target survival rate cannot be negative'],
      max: [100, 'Target survival rate cannot exceed 100%']
    },
    targetGrowthRate: {
      type: Number, // grams per week
      min: [0, 'Target growth rate cannot be negative']
    }
  },
  // Operational settings
  settings: {
    allowOverlappingSeasons: {
      type: Boolean,
      default: false
    },
    autoCalculateKPIs: {
      type: Boolean,
      default: true
    },
    enableAlerts: {
      type: Boolean,
      default: true
    }
  },
  // Season metrics (calculated fields)
  metrics: {
    totalPonds: {
      type: Number,
      default: 0
    },
    activePonds: {
      type: Number,
      default: 0
    },
    totalStocked: {
      type: Number,
      default: 0
    },
    totalHarvested: {
      type: Number,
      default: 0
    },
    actualProduction: {
      type: Number,
      default: 0
    },
    actualFCR: {
      type: Number
    },
    actualSurvivalRate: {
      type: Number
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual properties
seasonSchema.virtual('duration').get(function () {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

seasonSchema.virtual('progress').get(function () {
  if (this.startDate && this.endDate) {
    const now = new Date();
    const total = this.endDate - this.startDate;
    const elapsed = now - this.startDate;
    const progress = Math.max(0, Math.min(100, (elapsed / total) * 100));
    return Math.round(progress);
  }
  return 0;
});

seasonSchema.virtual('totalBudget').get(function () {
  if (this.budgetAllocation) {
    return Object.values(this.budgetAllocation).reduce((sum, amount) => sum + (amount || 0), 0);
  }
  return 0;
});

seasonSchema.virtual('isActive').get(function () {
  const now = new Date();
  return this.status === 'Active' &&
    this.startDate <= now &&
    this.endDate >= now;
});

// Indexes for better query performance
seasonSchema.index({ status: 1, startDate: -1 });
seasonSchema.index({ status: 1, endDate: -1 });
seasonSchema.index({ startDate: 1, endDate: 1 });
seasonSchema.index({ createdAt: -1 });
seasonSchema.index({ 'name.en': 1 });
seasonSchema.index({ 'name.ta': 1 });
seasonSchema.index({ 'name.si': 1 });

// Text search index
seasonSchema.index({
  'name.en': 'text',
  'name.ta': 'text',
  'name.si': 'text',
  description: 'text'
});

// Compound indexes for performance
seasonSchema.index({ status: 1, primarySpecies: 1, startDate: -1 });

// Pre-save validation
seasonSchema.pre('save', function (next) {
  // Ensure endDate is after startDate
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }

  // Validate temperature range
  if (this.climate && this.climate.expectedTemperatureRange) {
    const tempRange = this.climate.expectedTemperatureRange;
    if (tempRange.min && tempRange.max && tempRange.min >= tempRange.max) {
      return next(new Error('Maximum temperature must be higher than minimum temperature'));
    }
  }

  // Validate rainy season period
  if (this.climate && this.climate.rainySeasonPeriod) {
    const rainyPeriod = this.climate.rainySeasonPeriod;
    if (rainyPeriod.start && rainyPeriod.end && rainyPeriod.start >= rainyPeriod.end) {
      return next(new Error('Rainy season end date must be after start date'));
    }
  }

  // Auto-update status based on dates if not manually set
  if (this.status === 'Planning') {
    const now = new Date();
    if (now >= this.startDate && now <= this.endDate) {
      this.status = 'Active';
    } else if (now > this.endDate) {
      this.status = 'Completed';
    }
  }

  next();
});

// Instance methods
seasonSchema.methods.getDisplayName = function (language = 'en') {
  return this.name.get(language) || this.name.get('en') || 'Unnamed Season';
};

seasonSchema.methods.updateMetrics = async function () {
  // This would be called periodically to update calculated metrics
  const Pond = mongoose.model('Pond');
  const Event = mongoose.model('Event');
  const FeedInput = mongoose.model('FeedInput');

  try {
    // Update pond counts
    this.metrics.totalPonds = await Pond.countDocuments({ seasonId: this._id });
    this.metrics.activePonds = await Pond.countDocuments({ seasonId: this._id, status: 'Active' });

    // Update stocking data
    const stockingEvents = await Event.aggregate([
      { $match: { seasonId: this._id, eventType: 'Stocking' } },
      { $group: { _id: null, totalStocked: { $sum: '$details.quantity' } } }
    ]);
    this.metrics.totalStocked = stockingEvents[0]?.totalStocked || 0;

    // Update harvest data
    const harvestEvents = await Event.aggregate([
      { $match: { seasonId: this._id, eventType: { $in: ['PartialHarvest', 'FullHarvest'] } } },
      { $group: { _id: null, totalHarvested: { $sum: '$details.harvestWeight' } } }
    ]);
    this.metrics.totalHarvested = harvestEvents[0]?.totalHarvested || 0;
    this.metrics.actualProduction = this.metrics.totalHarvested;

    // Calculate FCR
    const feedData = await FeedInput.aggregate([
      { $match: { seasonId: this._id } },
      { $group: { _id: null, totalFeed: { $sum: '$quantity' } } }
    ]);
    const totalFeed = feedData[0]?.totalFeed || 0;
    if (this.metrics.totalHarvested > 0 && totalFeed > 0) {
      this.metrics.actualFCR = Number((totalFeed / this.metrics.totalHarvested).toFixed(2));
    }

    // Calculate survival rate (simplified)
    if (this.metrics.totalStocked > 0 && this.metrics.totalHarvested > 0) {
      // This is a simplified calculation - actual calculation would need growth data
      this.metrics.actualSurvivalRate = Math.min(100,
        Number(((this.metrics.totalHarvested / this.metrics.totalStocked) * 100).toFixed(1))
      );
    }

    this.metrics.lastUpdated = new Date();
    await this.save();

  } catch (error) {
    console.error('Error updating season metrics:', error);
  }
};

seasonSchema.methods.getPerformanceReport = function () {
  const report = {
    basicInfo: {
      name: this.getDisplayName(),
      duration: this.duration,
      progress: this.progress,
      status: this.status
    },
    production: {
      target: this.targetProduction,
      actual: this.metrics.actualProduction,
      variance: this.targetProduction ?
        ((this.metrics.actualProduction - this.targetProduction) / this.targetProduction * 100).toFixed(1) : null
    },
    kpis: {
      fcr: {
        target: this.kpis?.targetFCR,
        actual: this.metrics.actualFCR,
        status: this.kpis?.targetFCR && this.metrics.actualFCR ?
          (this.metrics.actualFCR <= this.kpis.targetFCR ? 'Good' : 'Needs Improvement') : 'N/A'
      },
      survivalRate: {
        target: this.kpis?.targetSurvivalRate,
        actual: this.metrics.actualSurvivalRate,
        status: this.kpis?.targetSurvivalRate && this.metrics.actualSurvivalRate ?
          (this.metrics.actualSurvivalRate >= this.kpis.targetSurvivalRate ? 'Good' : 'Needs Improvement') : 'N/A'
      }
    },
    pondUtilization: {
      total: this.metrics.totalPonds,
      active: this.metrics.activePonds,
      utilizationRate: this.metrics.totalPonds > 0 ?
        ((this.metrics.activePonds / this.metrics.totalPonds) * 100).toFixed(1) : 0
    }
  };

  return report;
};

// Static methods
seasonSchema.statics.findActive = function () {
  const now = new Date();
  return this.find({
    status: 'Active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ startDate: -1 });
};

seasonSchema.statics.findOverlapping = function (startDate, endDate, excludeId = null) {
  const query = {
    $or: [
      {
        startDate: { $lte: endDate },
        endDate: { $gte: startDate }
      }
    ],
    status: { $nin: ['Cancelled', 'Completed'] }
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return this.find(query);
};

seasonSchema.statics.getSeasonStatistics = function (year) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);

  return this.aggregate([
    {
      $match: {
        startDate: { $gte: startOfYear, $lte: endOfYear }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalProduction: { $sum: '$metrics.actualProduction' },
        averageFCR: { $avg: '$metrics.actualFCR' },
        averageSurvival: { $avg: '$metrics.actualSurvivalRate' }
      }
    }
  ]);
};

module.exports = mongoose.model('Season', seasonSchema);