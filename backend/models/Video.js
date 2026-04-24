const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  url: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  cloudinaryId: String,
  duration: Number,
  caption: String,
  hashtags: [String],
  location: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'ready_to_publish', 'published'],
    default: 'pending'
  },
  rejectionReason: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    createdAt: Date
  }],
  instagramQueue: {
    type: Boolean,
    default: false
  },
  instagramPosted: {
    type: Boolean,
    default: false
  },
  instagramPostId: String,
  publishScheduledAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

videoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Video', videoSchema);