const Review = require('../models/Review');
const Trip = require('../models/Trip');
const Booking = require('../models/Booking');

exports.createReview = async (req, res) => {
  try {
    const { tripId, bookingId, rating, title, comment } = req.body;
    
    // Check if user has completed booking for this trip
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user._id,
      tripId,
      status: 'completed'
    });
    
    if (!booking) {
      return res.status(403).json({ error: 'You can only review trips you have completed' });
    }
    
    // Check if already reviewed
    const existingReview = await Review.findOne({ userId: req.user._id, tripId });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this trip' });
    }
    
    const review = new Review({
      userId: req.user._id,
      tripId,
      bookingId,
      rating,
      title,
      comment,
      isVerified: true
    });
    
    await review.save();
    
    // Update trip rating
    const reviews = await Review.find({ tripId, status: 'approved' });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Trip.findByIdAndUpdate(tripId, {
      rating: averageRating,
      totalReviews: reviews.length
    });
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

exports.getTripReviews = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const reviews = await Review.find({ tripId, status: 'approved' })
      .populate('userId', 'name profile.avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Review.countDocuments({ tripId, status: 'approved' });
    
    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get trip reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

exports.moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, response } = req.body;
    
    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        status,
        response: response ? {
          text: response,
          respondedBy: req.user._id,
          respondedAt: new Date()
        } : undefined,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    // Update trip rating if review approved/rejected
    if (status === 'approved') {
      const reviews = await Review.find({ tripId: review.tripId, status: 'approved' });
      const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Trip.findByIdAndUpdate(review.tripId, {
        rating: averageRating,
        totalReviews: reviews.length
      });
    }
    
    res.json(review);
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({ error: 'Failed to moderate review' });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate('tripId', 'title thumbnail location')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};