const mongoose = require('mongoose');

const healthLogSchema = new mongoose.Schema({
  pondId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pond',
    required: true
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  symptoms: {
    type: String,
    required: true
  },
  diagnosis: {
    type: String,
    required: false
  },
  treatment: {
    type: String,
    required: false
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  status: {
    type: String,
    enum: ['Open', 'In Treatment', 'Resolved'],
    default: 'Open'
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('HealthLog', healthLogSchema);
