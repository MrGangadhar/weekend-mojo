const Tracking = require('../models/Tracking');
const Bus = require('../models/Bus');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Join trip room for live tracking
    socket.on('join-trip', (tripId) => {
      socket.join(`trip-${tripId}`);
      console.log(`Socket ${socket.id} joined trip-${tripId}`);
    });
    
    // Join bus room for specific bus updates
    socket.on('join-bus', (busId) => {
      socket.join(`bus-${busId}`);
      console.log(`Socket ${socket.id} joined bus-${busId}`);
    });
    
    // Leave rooms
    socket.on('leave-trip', (tripId) => {
      socket.leave(`trip-${tripId}`);
    });
    
    socket.on('leave-bus', (busId) => {
      socket.leave(`bus-${busId}`);
    });
    
    // Bus location update (from conductor app)
    socket.on('bus-location-update', async (data) => {
      const { busId, tripId, location, speed, heading } = data;
      
      // Save to database
      const tracking = new Tracking({
        busId,
        tripId,
        location,
        speed,
        heading,
        isLive: true
      });
      await tracking.save();
      
      // Update bus current location
      await Bus.findByIdAndUpdate(busId, {
        'currentLocation': {
          lat: location.lat,
          lng: location.lng,
          updatedAt: new Date(),
          speed,
          heading
        }
      });
      
      // Broadcast to all clients in the trip room
      io.to(`trip-${tripId}`).emit('location-update', {
        busId,
        location,
        speed,
        heading,
        timestamp: new Date()
      });
      
      // Also broadcast to bus-specific room
      io.to(`bus-${busId}`).emit('location-update', {
        location,
        speed,
        heading,
        timestamp: new Date()
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};