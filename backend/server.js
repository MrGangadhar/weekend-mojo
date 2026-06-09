
// Load environment variables as early as possible.
// Render and other hosted environments inject env vars directly, so a missing
// local .env file should not be treated as a startup failure.
try {
  require('dotenv').config();
} catch (error) {
  if (error.code !== 'ENOENT') {
    console.warn('⚠️ Could not load .env file:', error.message);
  }
}

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const bookingRoutes = require('./routes/bookings');
const trackingRoutes = require('./routes/tracking');
const videoRoutes = require('./routes/videos');
const adminRoutes = require('./routes/admin');
const conductorRoutes = require('./routes/conductor');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Database connection with fallback across configured URIs.
const mongoCandidates = [process.env.MONGO_URI, process.env.MONGODB_URI].filter(Boolean);

if (mongoCandidates.length === 0) {
  console.warn('⚠️ Neither MONGO_URI nor MONGODB_URI is set. Starting without a database connection.');
}

async function connectMongoWithFallback() {
  if (mongoCandidates.length === 0) {
    return;
  }

  let lastError = null;

  for (const candidate of mongoCandidates) {
    try {
      await mongoose.connect(candidate, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ MongoDB connected successfully');
      return;
    } catch (err) {
      lastError = err;
      console.warn('⚠️ MongoDB connection attempt failed, trying next configured URI...');
    }
  }

  console.warn('⚠️ MongoDB connection error, starting without database connection:', lastError?.message || lastError);
}

connectMongoWithFallback();


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/conductor', conductorRoutes);

// Debug route: List all users (remove in production!)
app.get('/api/auth/debug/list-users', async (req, res) => {
  try {
    const users = await require('./models/User').find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Socket.io for real-time tracking
require('./sockets/index')(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
});

module.exports = { app, server, io };