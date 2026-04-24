const Tracking = require('../models/Tracking');
const Bus = require('../models/Bus');
const Booking = require('../models/Booking');

exports.updateBusLocation = async (req, res) => {
  try {
    const { busId, tripId, location, speed, heading, accuracy } = req.body;
    
    const tracking = new Tracking({
      busId,
      tripId,
      location,
      speed,
      heading,
      accuracy,
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
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`trip-${tripId}`).emit('location-update', {
        busId,
        location,
        speed,
        heading,
        timestamp: new Date()
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update bus location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

exports.getBusLocation = async (req, res) => {
  try {
    const { busId } = req.params;
    
    const latestTracking = await Tracking.findOne({ busId })
      .sort({ createdAt: -1 });
    
    if (!latestTracking) {
      return res.status(404).json({ error: 'No tracking data found' });
    }
    
    res.json(latestTracking);
  } catch (error) {
    console.error('Get bus location error:', error);
    res.status(500).json({ error: 'Failed to get bus location' });
  }
};

exports.getTripTracking = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { busId } = req.query;
    
    const query = { tripId };
    if (busId) query.busId = busId;
    
    const trackingHistory = await Tracking.find(query)
      .sort({ createdAt: -1 })
      .limit(100);
    
    // Get latest location for each bus
    const busLocations = {};
    trackingHistory.forEach(record => {
      if (!busLocations[record.busId]) {
        busLocations[record.busId] = record;
      }
    });
    
    res.json({
      buses: Object.values(busLocations),
      history: trackingHistory
    });
  } catch (error) {
    console.error('Get trip tracking error:', error);
    res.status(500).json({ error: 'Failed to get tracking data' });
  }
};

exports.getBookingTracking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId)
      .populate('tripId busId');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const latestTracking = await Tracking.findOne({ 
      busId: booking.busId._id,
      tripId: booking.tripId._id
    }).sort({ createdAt: -1 });
    
    // Calculate ETA (simplified)
    let eta = null;
    if (latestTracking && booking.boardingPoint.coordinates) {
      // Use Google Maps Distance Matrix API for accurate ETA
      // This is a placeholder
      eta = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    }
    
    res.json({
      busLocation: latestTracking,
      eta,
      busDetails: {
        number: booking.busId.busNumber,
        type: booking.busId.type,
        operator: booking.busId.operatorName
      }
    });
  } catch (error) {
    console.error('Get booking tracking error:', error);
    res.status(500).json({ error: 'Failed to get tracking data' });
  }
};

exports.getRouteETA = async (req, res) => {
  try {
    const { origin, destination, busId } = req.query;
    
    // Use Google Maps Distance Matrix API
    // This is a placeholder implementation
    const axios = require('axios');
    
    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins: origin,
        destinations: destination,
        key: process.env.GOOGLE_MAPS_API_KEY,
        mode: 'driving',
        traffic_model: 'best_guess',
        departure_time: 'now'
      }
    });
    
    if (response.data.status === 'OK') {
      const element = response.data.rows[0].elements[0];
      res.json({
        distance: element.distance,
        duration: element.duration,
        durationInTraffic: element.duration_in_traffic
      });
    } else {
      throw new Error('Google Maps API error');
    }
  } catch (error) {
    console.error('Get route ETA error:', error);
    res.status(500).json({ error: 'Failed to calculate ETA' });
  }
};