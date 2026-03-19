const mongoose = require('mongoose');

const inventoryAdjustmentSchema = new mongoose.Schema({
  inventoryItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true
  },
  adjustmentType: {
    type: String,
    required: true,
    enum: ['Purchase', 'Usage', 'Correction', 'Spoilage', 'Initial Entry Error', 'initial']
  },
  quantityChange: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  relatedDocument: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    refPath: 'relatedDocumentModel'
  },
  relatedDocumentModel: {
    type: String,
    required: false,
    enum: ['FeedInput', 'WaterQualityInput', 'GrowthSampling', 'Event', 'NurseryBatch'] // Add other models as needed
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InventoryAdjustment', inventoryAdjustmentSchema);