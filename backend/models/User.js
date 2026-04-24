const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ['user', 'management', 'conductor', 'editor'],
    default: 'user'
  },
  password: {
    type: String,
    select: false // Don't return password by default
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profile: {
    avatar: {
      type: String,
      default: null
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'kn'],
      default: 'en'
    },
    dateOfBirth: Date,
    address: String
  },
  fcmToken: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});

// Hash password before saving (for internal roles)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);