const mongoose = require('mongoose');

const alertRuleSchema = new mongoose.Schema({
  metric: {
    type: String,
    required: true,
    enum: ['pH', 'dissolvedOxygen', 'temperature', 'salinity', 'ammonia', 'feedNotLogged', 'inventoryLevel']
  },
  condition: {
    type: String,
    required: true,
    enum: ['<', '>', '<=', '>=', '==']
  },
  threshold: {
    type: Number,
    required: true
  },
  priority: {
    type: String,
    enum: ['Info', 'Warning', 'Critical'],
    default: 'Warning'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('AlertRule', alertRuleSchema);
