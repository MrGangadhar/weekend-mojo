const mongoose = require('mongoose');

const boardingPointSchema = new mongoose.Schema({
  name: String,
  address: String,
  time: String,
  landmark: String,
  coordinates: {
    lat: Number,
    lng: Number
  }
});

const busSchema = new mongoose.Schema({
  operatorName: {
    type: String,
    required: true
  },
  busNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['AC', 'Non-AC', 'Sleeper', 'Seater', 'Luxury'],
    required: true
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1
  },
  amenities: [{
    type: String,
    enum: ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket', 'Entertainment', 'Snacks']
  }],
  seatLayout: {
    type: String, // URL to seat layout image
    default: null
  },
  assignedTrips: [{
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip'
    },
    schedule: Date,
    price: Number,
    boardingPoints: [boardingPointSchema],
    droppingPoints: [boardingPointSchema]
  }],
  currentLocation: {
    lat: {
      type: Number,
      default: null
    },
    lng: {
      type: Number,
      default: null
    },
    updatedAt: Date,
    speed: Number,
    heading: Number
  },
  driverDetails: {
    name: String,
    phone: String,
    licenseNumber: String
  },
  conductorDetails: {
    name: String,
    phone: String,
    employeeId: String
  },
  documents: [{
    name: String,
    type: String, // 'insurance', 'permit', 'fitness'
    url: String,
    expiryDate: Date
  }],
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active'
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

busSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Bus', busSchema);