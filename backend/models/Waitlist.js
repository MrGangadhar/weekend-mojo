const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  preferredSeats: [String],
  numberOfSeats: {
    type: Number,
    required: true,
    min: 1
  },
  position: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'confirmed', 'expired', 'cancelled'],
    default: 'waiting'
  },
  notifiedAt: Date,
  confirmedAt: Date,
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

waitlistSchema.index({ tripId: 1, busId: 1, position: 1 });
waitlistSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Waitlist', waitlistSchema);