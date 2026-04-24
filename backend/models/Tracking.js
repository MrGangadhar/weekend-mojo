const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  speed: {
    type: Number,
    default: 0
  },
  heading: {
    type: Number,
    default: 0
  },
  accuracy: Number,
  altitude: Number,
  eta: Date, // Estimated time of arrival at next stop
  nextStop: String,
  routeProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isLive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
trackingSchema.index({ busId: 1, createdAt: -1 });
trackingSchema.index({ tripId: 1, createdAt: -1 });

module.exports = mongoose.model('Tracking', trackingSchema);