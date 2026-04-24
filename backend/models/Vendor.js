const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['hotel', 'resort', 'bus_operator', 'travel_partner', 'restaurant'],
    required: true
  },
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  phone: String,
  email: String,
  website: String,
  gstNumber: String,
  panNumber: String,
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  agreements: [{
    documentUrl: String,
    signedDate: Date,
    expiryDate: Date
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  paymentTerms: {
    type: String,
    enum: ['advance', 'upon_delivery', 'net_15', 'net_30'],
    default: 'net_15'
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

vendorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Vendor', vendorSchema);