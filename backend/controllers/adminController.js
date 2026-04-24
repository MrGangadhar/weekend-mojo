const User = require('../models/User');
const Trip = require('../models/Trip');
const Bus = require('../models/Bus');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Vendor = require('../models/Vendor');
const Video = require('../models/Video');
const Finance = require('../models/Finance');

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const [
      totalUsers,
      totalBookings,
      totalBuses,
      totalTrips,
      activeTrips,
      monthlyBookings,
      weeklyBookings,
      totalRevenue,
      monthlyRevenue,
      pendingVendors,
      pendingVideos
    ] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Bus.countDocuments({ status: 'active' }),
      Trip.countDocuments(),
      Trip.countDocuments({ status: 'active' }),
      Booking.countDocuments({ createdAt: { $gte: startOfMonth }, status: 'confirmed' }),
      Booking.countDocuments({ createdAt: { $gte: startOfWeek }, status: 'confirmed' }),
      Payment.aggregate([{ $match: { status: 'captured' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { status: 'captured', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Vendor.countDocuments({ status: 'pending' }),
      Video.countDocuments({ status: 'pending' })
    ]);

    res.json({
      totalUsers,
      totalBookings,
      totalBuses,
      totalTrips,
      activeTrips,
      monthlyBookings,
      weeklyBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      pendingVendors,
      pendingVideos
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

exports.getRecentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name mobile')
      .populate('tripId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json(bookings);
  } catch (error) {
    console.error('Get recent bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch recent bookings' });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate;
    const now = new Date();
    
    switch(period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    
    const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    const activeUsers = await Booking.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'confirmed' } },
      { $group: { _id: '$userId' } },
      { $count: 'count' }
    ]);
    
    const repeatCustomers = await Booking.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $count: 'count' }
    ]);
    
    res.json({
      newUsers,
      activeUsers: activeUsers[0]?.count || 0,
      repeatCustomers: repeatCustomers[0]?.count || 0,
      totalUsers: await User.countDocuments()
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
};

exports.getTripAnalytics = async (req, res) => {
  try {
    const popularTrips = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: '$tripId', bookings: { $sum: 1 }, revenue: { $sum: '$finalAmount' } } },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'trips', localField: '_id', foreignField: '_id', as: 'trip' } }
    ]);
    
    const revenueByTrip = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: '$tripId', revenue: { $sum: '$finalAmount' } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'trips', localField: '_id', foreignField: '_id', as: 'trip' } }
    ]);
    
    res.json({ popularTrips, revenueByTrip });
  } catch (error) {
    console.error('Get trip analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch trip analytics' });
  }
};

exports.manageVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status, paymentTerms, rating } = req.body;
    
    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { status, paymentTerms, rating, updatedAt: new Date() },
      { new: true }
    );
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    res.json(vendor);
  } catch (error) {
    console.error('Manage vendor error:', error);
    res.status(500).json({ error: 'Failed to update vendor' });
  }
};

exports.getSystemLogs = async (req, res) => {
  try {
    const { type, startDate, endDate, limit = 100 } = req.query;
    
    // This would typically query a logs collection
    // For now, return recent activity from various collections
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(20);
    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(20);
    const recentPayments = await Payment.find().sort({ createdAt: -1 }).limit(20);
    
    res.json({
      users: recentUsers,
      bookings: recentBookings,
      payments: recentPayments
    });
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({ error: 'Failed to fetch system logs' });
  }
};