const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Alert', 'Info', 'Task', 'Health'],
    default: 'Info'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String // Optional link to related entity
  },
  pondId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pond'
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
