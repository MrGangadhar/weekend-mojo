const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const Bus = require('../models/Bus');
const User = require('../models/User');
const { sendNotification, sendSMS } = require('../utils/notifications');

exports.getAssignedTrips = async (req, res) => {
  try {
    const conductorId = req.user._id;
    
    // Find buses where this conductor is assigned
    const buses = await Bus.find({ 'conductorDetails.employeeId': conductorId.toString() })
      .populate('assignedTrips.tripId');
    
    const currentDate = new Date();
    const upcomingTrips = [];
    const activeTrips = [];
    
    buses.forEach(bus => {
      bus.assignedTrips.forEach(assignment => {
        const tripData = {
          busId: bus._id,
          busNumber: bus.busNumber,
          tripId: assignment.tripId._id,
          tripName: assignment.tripId.title,
          schedule: assignment.schedule,
          boardingPoints: assignment.boardingPoints
        };
        
        if (assignment.schedule > currentDate) {
          upcomingTrips.push(tripData);
        } else {
          activeTrips.push(tripData);
        }
      });
    });
    
    res.json({
      upcomingTrips,
      activeTrips
    });
  } catch (error) {
    console.error('Get assigned trips error:', error);
    res.status(500).json({ error: 'Failed to fetch assigned trips' });
  }
};

exports.getPassengerList = async (req, res) => {
  try {
    const { tripId, busId, scheduleDate } = req.query;
    
    const startOfDay = new Date(scheduleDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(scheduleDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const bookings = await Booking.find({
      tripId,
      busId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: 'confirmed'
    }).populate('userId', 'name mobile email');
    
    const passengerList = bookings.map(booking => ({
      bookingId: booking.bookingId,
      passengerName: booking.userId.name,
      mobile: booking.userId.mobile,
      seats: booking.selectedSeats,
      checkinStatus: booking.checkinStatus || {},
      passengers: booking.passengers
    }));
    
    res.json(passengerList);
  } catch (error) {
    console.error('Get passenger list error:', error);
    res.status(500).json({ error: 'Failed to fetch passenger list' });
  }
};

exports.updateCheckinStatus = async (req, res) => {
  try {
    const { bookingId, seatNumber, checkedIn } = req.body;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (!booking.checkinStatus) {
      booking.checkinStatus = new Map();
    }
    
    booking.checkinStatus.set(seatNumber, checkedIn);
    await booking.save();
    
    // If passenger checked in, send confirmation
    if (checkedIn) {
      await sendNotification(booking.userId, {
        title: 'Check-in Successful',
        body: `You have been checked in for seat ${seatNumber}. Enjoy your trip!`
      });
    }
    
    res.json({ success: true, checkinStatus: Object.fromEntries(booking.checkinStatus) });
  } catch (error) {
    console.error('Update checkin status error:', error);
    res.status(500).json({ error: 'Failed to update check-in status' });
  }
};

exports.sendReminder = async (req, res) => {
  try {
    const { bookingId, userId, mobile } = req.body;
    
    const message = "Reminder: Your Weekend Mojo bus is about to depart. Please board immediately.";
    
    // Send SMS
    await sendSMS(mobile, message);
    
    // Send push notification if user has FCM token
    const user = await User.findById(userId);
    if (user && user.fcmToken) {
      await sendNotification(user.fcmToken, {
        title: 'Boarding Reminder',
        body: message,
        data: { bookingId }
      });
    }
    
    res.json({ success: true, message: 'Reminder sent successfully' });
  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({ error: 'Failed to send reminder' });
  }
};

exports.updateBusLocation = async (req, res) => {
  try {
    const { busId, location, speed, heading } = req.body;
    
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
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit(`bus-${busId}-location`, {
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

exports.getTripSummary = async (req, res) => {
  try {
    const { tripId, busId, scheduleDate } = req.query;
    
    const startOfDay = new Date(scheduleDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(scheduleDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const bookings = await Booking.find({
      tripId,
      busId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: 'confirmed'
    });
    
    const totalPassengers = bookings.reduce((sum, b) => sum + b.selectedSeats.length, 0);
    let checkedInCount = 0;
    
    bookings.forEach(booking => {
      if (booking.checkinStatus) {
        const checkedInSeats = Array.from(booking.checkinStatus.values()).filter(v => v === true).length;
        checkedInCount += checkedInSeats;
      }
    });
    
    res.json({
      totalBookings: bookings.length,
      totalPassengers,
      checkedInCount,
      pendingCount: totalPassengers - checkedInCount,
      completionRate: totalPassengers > 0 ? (checkedInCount / totalPassengers) * 100 : 0
    });
  } catch (error) {
    console.error('Get trip summary error:', error);
    res.status(500).json({ error: 'Failed to fetch trip summary' });
  }
};