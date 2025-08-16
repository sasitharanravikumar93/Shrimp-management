const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi', 'ta']
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
