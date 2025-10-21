const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(date) {
        // Allow future dates for planning, but not more than 2 years ahead
        const twoYearsFromNow = new Date();
        twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
        
        // Allow past dates, but not more than 5 years ago
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
        
        return date >= fiveYearsAgo && date <= twoYearsFromNow;
      },
      message: 'Event date must be within 5 years ago to 2 years from now'
    },
    index: true
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: {
      values: [
        // Pond events
        'PondPreparation', 
        'Stocking', 
        'ChemicalApplication', 
        'PartialHarvest', 
        'FullHarvest', 
        'Sampling',
        'WaterExchange',
        'Cleaning',
        'Maintenance',
        'Inspection',
        // Nursery-specific events
        'NurseryPreparation',
        'WaterQualityTesting',
        'GrowthSampling',
        'Feeding',
        'NurseryInspection',
        'Transfer',
        // Emergency events
        'Disease',
        'Mortality',
        'Emergency'
      ],
      message: '{VALUE} is not a valid event type'
    },
    index: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Event details are required'],
    validate: {
      validator: function(details) {
        // Basic validation based on event type
        switch (this.eventType) {
        case 'Stocking':
          return details.quantity && details.quantity > 0;
        case 'PartialHarvest':
        case 'FullHarvest':
          return details.harvestWeight && details.harvestWeight > 0;
        case 'ChemicalApplication':
          return details.chemical && details.quantity;
        default:
          return details && typeof details === 'object';
        }
      },
      message: 'Event details must be valid for the event type'
    }
  },
  // Either pondId or nurseryBatchId is required (but not both)
  pondId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pond',
    index: true
  },
  nurseryBatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NurseryBatch',
    index: true
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
    required: [true, 'Season ID is required'],
    index: true
  },
  // Enhanced media support
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document'],
      required: true
    },
    url: {
      type: String,
      required: true,
      validate: {
        validator: function(url) {
          // Basic URL validation
          return /^https?:\/\/.+/.test(url) || /^\//.test(url); // Allow relative paths
        },
        message: 'Invalid media URL format'
      }
    },
    filename: {
      type: String,
      maxlength: [255, 'Filename cannot exceed 255 characters']
    },
    caption: {
      type: String,
      maxlength: [500, 'Caption cannot exceed 500 characters']
    },
    size: {
      type: Number, // file size in bytes
      min: [0, 'File size cannot be negative']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Cost and resource tracking
  cost: {
    labor: {
      type: Number,
      min: [0, 'Labor cost cannot be negative']
    },
    materials: {
      type: Number,
      min: [0, 'Material cost cannot be negative']
    },
    equipment: {
      type: Number,
      min: [0, 'Equipment cost cannot be negative']
    },
    other: {
      type: Number,
      min: [0, 'Other cost cannot be negative']
    },
    currency: {
      type: String,
      enum: ['USD', 'LKR', 'EUR', 'INR'],
      default: 'LKR'
    }
  },
  // Personnel involved
  personnel: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['Supervisor', 'Worker', 'Technician', 'Observer', 'Other'],
      default: 'Worker'
    },
    hoursWorked: {
      type: Number,
      min: [0, 'Hours worked cannot be negative'],
      max: [24, 'Hours worked cannot exceed 24 in a day']
    }
  }],
  // Environmental conditions
  environmentalConditions: {
    temperature: {
      type: Number,
      min: [-10, 'Temperature cannot be below -10°C'],
      max: [60, 'Temperature cannot exceed 60°C']
    },
    humidity: {
      type: Number,
      min: [0, 'Humidity cannot be negative'],
      max: [100, 'Humidity cannot exceed 100%']
    },
    windSpeed: {
      type: Number,
      min: [0, 'Wind speed cannot be negative']
    },
    weather: {
      type: String,
      enum: ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Foggy']
    }
  },
  // Status and workflow
  status: {
    type: String,
    enum: ['Planned', 'InProgress', 'Completed', 'Cancelled', 'OnHold'],
    default: 'Planned',
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
    index: true
  },
  // Quality control
  qualityCheck: {
    passed: {
      type: Boolean
    },
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    checkedAt: {
      type: Date
    },
    notes: {
      type: String,
      maxlength: [1000, 'Quality check notes cannot exceed 1000 characters']
    }
  },
  // Location tracking
  location: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      validate: {
        validator: function(coords) {
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
  // Notes and observations
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  observations: {
    type: String,
    maxlength: [2000, 'Observations cannot exceed 2000 characters']
  },
  // Follow-up and related events
  parentEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event' // For tracking related events
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date,
    validate: {
      validator: function(followUpDate) {
        // Follow-up date should be in the future if required
        return !this.followUpRequired || !followUpDate || followUpDate > new Date();
      },
      message: 'Follow-up date must be in the future'
    }
  },
  // Approval workflow
  approval: {
    required: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    approvalStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    rejectionReason: {
      type: String,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters']
    }
  },
  // Audit trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual properties
eventSchema.virtual('totalCost').get(function() {
  if (this.cost) {
    return Object.values(this.cost)
      .filter(val => typeof val === 'number')
      .reduce((sum, val) => sum + val, 0);
  }
  return 0;
});

eventSchema.virtual('isOverdue').get(function() {
  if (this.status === 'Planned' && this.date) {
    return new Date() > this.date;
  }
  return false;
});

eventSchema.virtual('daysUntilDue').get(function() {
  if (this.status === 'Planned' && this.date) {
    const diffTime = this.date - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

// Compound indexes for common query patterns
eventSchema.index({ pondId: 1, eventType: 1, date: -1 });
eventSchema.index({ seasonId: 1, eventType: 1, date: -1 });
eventSchema.index({ pondId: 1, seasonId: 1, date: -1 });
eventSchema.index({ nurseryBatchId: 1, eventType: 1, date: -1 });
eventSchema.index({ status: 1, priority: 1, date: 1 });
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ eventType: 1, status: 1, date: -1 });
eventSchema.index({ followUpRequired: 1, followUpDate: 1 });
eventSchema.index({ createdBy: 1, createdAt: -1 });

// Performance indexes
eventSchema.index({ createdAt: -1 });
eventSchema.index({ updatedAt: -1 });

// Geospatial index
eventSchema.index({ 'location.coordinates': '2dsphere' });

// Text search index
eventSchema.index({
  notes: 'text',
  observations: 'text',
  'details.description': 'text'
});

// Validation middleware
eventSchema.pre('validate', function(next) {
  // Ensure either pondId or nurseryBatchId is provided
  if (!this.pondId && !this.nurseryBatchId) {
    next(new Error('Either pondId or nurseryBatchId is required'));
  } else if (this.pondId && this.nurseryBatchId) {
    next(new Error('Only one of pondId or nurseryBatchId should be provided'));
  } else {
    next();
  }
});

// Pre-save middleware
eventSchema.pre('save', function(next) {
  // Auto-set completion status for harvest events
  if ((this.eventType === 'PartialHarvest' || this.eventType === 'FullHarvest') && 
      this.status === 'Planned' && 
      this.details.harvestWeight) {
    this.status = 'Completed';
  }
  
  // Validate approval workflow
  if (this.approval.required && this.status === 'Completed' && this.approval.approvalStatus !== 'Approved') {
    return next(new Error('Event requires approval before completion'));
  }
  
  // Set quality check status for critical events
  if (['Stocking', 'FullHarvest', 'ChemicalApplication'].includes(this.eventType) && 
      this.status === 'Completed' && 
      !this.qualityCheck.passed && 
      this.qualityCheck.passed !== false) {
    this.qualityCheck.passed = true; // Default to passed if not explicitly set
  }
  
  next();
});

// Instance methods
eventSchema.methods.getEventSummary = function() {
  return {
    id: this._id,
    type: this.eventType,
    date: this.date,
    status: this.status,
    priority: this.priority,
    location: this.pondId ? `Pond ${this.pondId}` : `Nursery ${this.nurseryBatchId}`,
    cost: this.totalCost,
    isOverdue: this.isOverdue,
    daysUntilDue: this.daysUntilDue
  };
};

eventSchema.methods.canBeModified = function(userId) {
  // Check if event can be modified by the user
  if (this.status === 'Completed') {
    return false; // Completed events cannot be modified
  }
  
  if (this.approval.required && this.approval.approvalStatus === 'Approved') {
    return false; // Approved events cannot be modified
  }
  
  if (this.createdBy && this.createdBy.toString() === userId.toString()) {
    return true; // Creator can always modify
  }
  
  // Additional role-based checks would be implemented here
  return true;
};

eventSchema.methods.addMedia = function(mediaData) {
  this.media.push({
    type: mediaData.type,
    url: mediaData.url,
    filename: mediaData.filename,
    caption: mediaData.caption,
    size: mediaData.size,
    uploadedBy: mediaData.uploadedBy
  });
  return this.save();
};

// Static methods
eventSchema.statics.findUpcoming = function(days = 7) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return this.find({
    status: 'Planned',
    date: { $gte: now, $lte: futureDate }
  }).sort({ date: 1 });
};

eventSchema.statics.findOverdue = function() {
  return this.find({
    status: 'Planned',
    date: { $lt: new Date() }
  }).sort({ date: 1 });
};

eventSchema.statics.getEventStatistics = function(seasonId, startDate, endDate) {
  const matchConditions = {};
  if (seasonId) {matchConditions.seasonId = mongoose.Types.ObjectId(seasonId);}
  if (startDate && endDate) {
    matchConditions.date = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: {
          eventType: '$eventType',
          status: '$status'
        },
        count: { $sum: 1 },
        totalCost: { $sum: '$cost.total' },
        avgCost: { $avg: '$cost.total' }
      }
    },
    {
      $group: {
        _id: '$_id.eventType',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count',
            totalCost: '$totalCost',
            avgCost: '$avgCost'
          }
        },
        totalCount: { $sum: '$count' }
      }
    },
    { $sort: { totalCount: -1 } }
  ]);
};

eventSchema.statics.findRequiringFollowUp = function() {
  const now = new Date();
  return this.find({
    followUpRequired: true,
    followUpDate: { $lte: now },
    status: { $ne: 'Completed' }
  }).sort({ followUpDate: 1 });
};

eventSchema.statics.getProductionTimeline = function(pondId, seasonId) {
  const matchConditions = {};
  if (pondId) {matchConditions.pondId = mongoose.Types.ObjectId(pondId);}
  if (seasonId) {matchConditions.seasonId = mongoose.Types.ObjectId(seasonId);}
  
  return this.find({
    ...matchConditions,
    eventType: { $in: ['Stocking', 'PartialHarvest', 'FullHarvest', 'Sampling'] }
  })
    .sort({ date: 1 })
    .populate('pondId', 'name')
    .populate('seasonId', 'name');
};

module.exports = mongoose.model('Event', eventSchema);