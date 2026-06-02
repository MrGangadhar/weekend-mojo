const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true
  },
  title: String,
  places: [String],
  activities: [String],
  dining: {
    breakfast: String,
    lunch: String,
    dinner: String
  },
  stay: {
    type: { type: String },
    name: String,
    address: String
  }
});

const tripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: String,
  duration: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    url: String,
    caption: String
  }],
  thumbnail: String,
  itinerary: [itinerarySchema],
  inclusions: [String],
  exclusions: [String],
  dynamicPricing: {
    basePrice: Number,
    weekendMultiplier: {
      type: Number,
      default: 1.2
    },
    seasonMultiplier: {
      type: Number,
      default: 1.0
    },
    lastMinuteDiscount: {
      type: Number,
      default: 0
    }
  },
  availableDates: [Date],
  status: {
    type: String,
    enum: ['active', 'inactive', 'upcoming'],
    default: 'active'
  },
  maxCapacity: {
    type: Number,
    default: 50
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

tripSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Trip', tripSchema);