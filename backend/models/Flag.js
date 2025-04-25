// backend/models/Flag.js
const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    default: '#FF0000',
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Optional fields for future expansion
  createdBy: {
    type: String,
    default: 'anonymous'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 7*24*60*60*1000) // 7 days from now
  }
});

// Index for geospatial queries
flagSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('Flag', flagSchema);