const Trip = require('../models/Trip');
const Bus = require('../models/Bus');
const Booking = require('../models/Booking');

exports.getTrips = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      location, 
      minPrice, 
      maxPrice, 
      duration,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;
    
    const query = { status: 'active' };
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (duration) {
      query.duration = duration;
    }
    
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };
    
    const trips = await Trip.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Trip.countDocuments(query);
    
    res.json({
      trips,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Get available buses for this trip
    const buses = await Bus.find({
      'assignedTrips.tripId': trip._id,
      status: 'active'
    });
    
    res.json({ trip, availableBuses: buses });
  } catch (error) {
    console.error('Get trip by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
};

exports.createTrip = async (req, res) => {
  try {
    const tripData = req.body;
    const trip = new Trip(tripData);
    await trip.save();
    
    res.status(201).json(trip);
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  }
};

exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    res.json(trip);
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Check if there are any bookings for this trip
    const bookings = await Booking.findOne({ tripId: trip._id, status: { $ne: 'cancelled' } });
    
    if (bookings) {
      return res.status(400).json({ error: 'Cannot delete trip with existing bookings' });
    }
    
    await trip.deleteOne();
    
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
};

exports.getPopularTrips = async (req, res) => {
  try {
    const popularTrips = await Trip.find({ status: 'active' })
      .sort({ totalReviews: -1, rating: -1 })
      .limit(6);
    
    res.json(popularTrips);
  } catch (error) {
    console.error('Get popular trips error:', error);
    res.status(500).json({ error: 'Failed to fetch popular trips' });
  }
};

exports.searchTrips = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const trips = await Trip.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ],
      status: 'active'
    }).limit(20);
    
    res.json(trips);
  } catch (error) {
    console.error('Search trips error:', error);
    res.status(500).json({ error: 'Failed to search trips' });
  }
};