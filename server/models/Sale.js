const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  harvestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Harvest',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  buyerName: {
    type: String,
    required: true,
    trim: true
  },
  quantitySold: {
    type: Number, // in kg
    required: true
  },
  pricePerKg: {
    type: Number,
    required: true
  },
  totalRevenue: {
    type: Number, // calculated field
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

saleSchema.pre('validate', function(next) {
  if (this.quantitySold && this.pricePerKg && !this.totalRevenue) {
    this.totalRevenue = this.quantitySold * this.pricePerKg;
  }
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
