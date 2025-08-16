const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  itemName: {
    type: Map,
    of: String,
    required: true
  },
  itemType: {
    type: String,
    required: true,
    enum: ['Feed', 'Chemical', 'Probiotic', 'Other']
  },
  supplier: {
    type: String,
    trim: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'litre', 'ml', 'bag', 'bottle']
  },
  costPerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  lowStockThreshold: {
    type: Number,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);