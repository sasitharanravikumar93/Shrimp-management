const mongoose = require('mongoose');

const feedInputSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Feed input date is required'],
    validate: {
      validator: function (date) {
        // Don't allow future dates beyond tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date <= tomorrow;
      },
      message: 'Feed input date cannot be in the future (beyond tomorrow)'
    },
    index: true
  },
  time: {
    type: String,
    required: [true, 'Feed input time is required'],
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
  inventoryItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: [true, 'Inventory item ID is required'],
    index: true
  },
  quantity: {
    type: Number,
    required: [true, 'Feed quantity is required'],
    min: [0.001, 'Feed quantity must be greater than 0'],
    max: [10000, 'Feed quantity cannot exceed 10,000 kg per input'],
    validate: {
      validator: function (quantity) {
        // Round to 3 decimal places
        return Number(quantity.toFixed(3)) === quantity;
      },
      message: 'Quantity must not have more than 3 decimal places'
    }
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
    required: [true, 'Season ID is required'],
    index: true
  },
  feedType: {
    type: String,
    enum: {
      values: ['Starter', 'Grower', 'Finisher', 'Supplement', 'Medication', 'Other'],
      message: '{VALUE} is not a valid feed type'
    },
    default: 'Other'
  },
  feedingMethod: {
    type: String,
    enum: ['Manual', 'Automatic', 'Broadcast', 'Targeted'],
    default: 'Manual'
  },
  waterTemperature: {
    type: Number,
    min: [0, 'Water temperature cannot be negative'],
    max: [50, 'Water temperature cannot exceed 50°C']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // Cost tracking
  unitCost: {
    type: Number,
    min: [0, 'Unit cost cannot be negative']
  },
  totalCost: {
    type: Number,
    min: [0, 'Total cost cannot be negative']
  },
  // GPS coordinates where feeding occurred
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
  // Reference to the feeding event if created through events
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating cost if not provided
feedInputSchema.virtual('calculatedTotalCost').get(function () {
  if (this.totalCost) {
    return this.totalCost;
  }
  if (this.unitCost && this.quantity) {
    return Number((this.unitCost * this.quantity).toFixed(2));
  }
  return null;
});

// Virtual for feed efficiency tracking
feedInputSchema.virtual('feedingWindow').get(function () {
  const hour = parseInt(this.time.split(':')[0], 10);
  if (hour >= 6 && hour < 12) { return 'Morning'; }
  if (hour >= 12 && hour < 18) { return 'Afternoon'; }
  if (hour >= 18 && hour < 22) { return 'Evening'; }
  return 'Night';
});

// Compound indexes for common query patterns
feedInputSchema.index({ pondId: 1, date: -1, time: -1 });
feedInputSchema.index({ seasonId: 1, date: -1 });
feedInputSchema.index({ pondId: 1, seasonId: 1, date: -1 });
feedInputSchema.index({ inventoryItemId: 1, date: -1 });
feedInputSchema.index({ seasonId: 1, feedType: 1, date: -1 });
feedInputSchema.index({ date: -1, feedType: 1 });
feedInputSchema.index({ pondId: 1, inventoryItemId: 1, date: -1 });

// Performance indexes
feedInputSchema.index({ createdAt: -1 });
feedInputSchema.index({ updatedAt: -1 });

// Geospatial index
feedInputSchema.index({ 'location.coordinates': '2dsphere' });

// Text search index
feedInputSchema.index({ notes: 'text' });

// Unique constraint to prevent duplicate entries
feedInputSchema.index(
  { pondId: 1, date: 1, time: 1, inventoryItemId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      pondId: { $exists: true },
      date: { $exists: true },
      time: { $exists: true },
      inventoryItemId: { $exists: true }
    }
  }
);

// Pre-save middleware
feedInputSchema.pre('save', function (next) {
  // Auto-calculate total cost if unit cost is provided
  if (this.unitCost && this.quantity && !this.totalCost) {
    this.totalCost = Number((this.unitCost * this.quantity).toFixed(2));
  }

  // Validate date is not too far in the past (more than 1 year)
  if (this.date) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    if (this.date < oneYearAgo) {
      return next(new Error('Feed input date cannot be more than 1 year in the past'));
    }
  }

  next();
});

// Instance methods
feedInputSchema.methods.getFormattedDateTime = function () {
  return {
    date: this.date.toISOString().split('T')[0],
    time: this.time,
    datetime: `${this.date.toISOString().split('T')[0]} ${this.time}`
  };
};

// Static methods
feedInputSchema.statics.findByPondAndDateRange = function (pondId, startDate, endDate) {
  return this.find({
    pondId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: -1, time: -1 });
};

feedInputSchema.statics.getTotalFeedByPond = function (pondId, seasonId) {
  return this.aggregate([
    {
      $match: {
        pondId: mongoose.Types.ObjectId(pondId),
        ...(seasonId && { seasonId: mongoose.Types.ObjectId(seasonId) })
      }
    },
    {
      $group: {
        _id: '$pondId',
        totalQuantity: { $sum: '$quantity' },
        totalCost: { $sum: '$calculatedTotalCost' },
        feedingCount: { $sum: 1 },
        lastFeedingDate: { $max: '$date' }
      }
    }
  ]);
};

feedInputSchema.statics.getFeedConsumptionTrends = function (seasonId, groupBy = 'day') {
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
          date: { $dateToString: { format: groupByFormat[groupBy], date: '$date' } },
          feedType: '$feedType'
        },
        totalQuantity: { $sum: '$quantity' },
        totalCost: { $sum: '$totalCost' },
        feedingCount: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

module.exports = mongoose.model('FeedInput', feedInputSchema);