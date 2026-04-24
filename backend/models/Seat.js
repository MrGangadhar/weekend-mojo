const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
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
  seatNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'blocked', 'selected'],
    default: 'available'
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  blockedUntil: {
    type: Date,
    default: null
  },
  price: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique seat per bus per trip
seatSchema.index({ busId: 1, tripId: 1, seatNumber: 1 }, { unique: true });

seatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Seat', seatSchema);