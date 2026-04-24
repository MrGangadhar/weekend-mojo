const Waitlist = require('../models/Waitlist');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const { sendNotification } = require('../utils/notifications');

exports.addToWaitlist = async (req, res) => {
  try {
    const { tripId, busId, preferredSeats, numberOfSeats } = req.body;
    
    // Get current waitlist count
    const waitlistCount = await Waitlist.countDocuments({
      tripId,
      busId,
      status: 'waiting'
    });
    
    const waitlist = new Waitlist({
      tripId,
      busId,
      userId: req.user._id,
      preferredSeats,
      numberOfSeats,
      position: waitlistCount + 1,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    
    await waitlist.save();
    
    res.status(201).json({
      success: true,
      position: waitlist.position,
      message: `Added to waitlist at position ${waitlist.position}`
    });
  } catch (error) {
    console.error('Add to waitlist error:', error);
    res.status(500).json({ error: 'Failed to add to waitlist' });
  }
};

exports.getWaitlistStatus = async (req, res) => {
  try {
    const { tripId, busId } = req.params;
    
    const waitlistEntry = await Waitlist.findOne({
      tripId,
      busId,
      userId: req.user._id,
      status: 'waiting'
    });
    
    if (!waitlistEntry) {
      return res.json({ inWaitlist: false });
    }
    
    // Get current position (accounting for confirmed entries ahead)
    const aheadCount = await Waitlist.countDocuments({
      tripId,
      busId,
      status: 'waiting',
      position: { $lt: waitlistEntry.position }
    });
    
    res.json({
      inWaitlist: true,
      position: aheadCount + 1,
      originalPosition: waitlistEntry.position,
      expiresAt: waitlistEntry.expiresAt
    });
  } catch (error) {
    console.error('Get waitlist status error:', error);
    res.status(500).json({ error: 'Failed to get waitlist status' });
  }
};

exports.processWaitlist = async (tripId, busId, availableSeats) => {
  try {
    const waitlistEntries = await Waitlist.find({
      tripId,
      busId,
      status: 'waiting',
      expiresAt: { $gt: new Date() }
    }).sort({ position: 1 });
    
    let seatsToAllocate = availableSeats;
    const confirmedEntries = [];
    
    for (const entry of waitlistEntries) {
      if (entry.numberOfSeats <= seatsToAllocate) {
        entry.status = 'confirmed';
        entry.confirmedAt = new Date();
        await entry.save();
        
        seatsToAllocate -= entry.numberOfSeats;
        confirmedEntries.push(entry);
        
        // Notify user
        await sendNotification(entry.userId, {
          title: 'Waitlist Confirmed!',
          body: `Your booking for ${entry.numberOfSeats} seat(s) has been confirmed. Please complete payment within 2 hours.`
        });
      } else {
        break;
      }
    }
    
    // Update positions for remaining waitlist entries
    const remainingEntries = await Waitlist.find({
      tripId,
      busId,
      status: 'waiting'
    }).sort({ position: 1 });
    
    for (let i = 0; i < remainingEntries.length; i++) {
      remainingEntries[i].position = i + 1;
      await remainingEntries[i].save();
    }
    
    return confirmedEntries;
  } catch (error) {
    console.error('Process waitlist error:', error);
    throw error;
  }
};

exports.cancelWaitlist = async (req, res) => {
  try {
    const { waitlistId } = req.params;
    
    const waitlist = await Waitlist.findOneAndUpdate(
      { _id: waitlistId, userId: req.user._id, status: 'waiting' },
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!waitlist) {
      return res.status(404).json({ error: 'Waitlist entry not found' });
    }
    
    res.json({ message: 'Removed from waitlist successfully' });
  } catch (error) {
    console.error('Cancel waitlist error:', error);
    res.status(500).json({ error: 'Failed to cancel waitlist' });
  }
};