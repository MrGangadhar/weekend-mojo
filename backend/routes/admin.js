const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const Bus = require('../models/Bus');
const { getFinancialSummary, getDailyRevenue, generateFinancialReport } = require('../controllers/financeController');

// Apply auth and management role to all admin routes
router.use(auth, authorize('management'));

// Dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [totalUsers, totalBookings, totalBuses, totalTrips, activeTrips] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Bus.countDocuments({ status: 'active' }),
      Trip.countDocuments(),
      Trip.countDocuments({ status: 'active' })
    ]);
    
    res.json({
      totalUsers,
      totalBookings,
      totalBuses,
      totalTrips,
      activeTrips
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Financial routes
router.get('/finance/summary', getFinancialSummary);
router.get('/finance/daily-revenue', getDailyRevenue);
router.get('/finance/report', generateFinancialReport);

// Bus management
router.get('/buses', async (req, res) => {
  try {
    const buses = await Bus.find().populate('assignedTrips.tripId');
    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/buses', async (req, res) => {
  try {
    const bus = new Bus(req.body);
    await bus.save();
    res.status(201).json(bus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/buses/:id', async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(bus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;