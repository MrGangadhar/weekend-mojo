const express = require('express');
const router = express.Router();
const { 
  getSeatMap,
  initiateBooking, 
  confirmPayment, 
  getUserBookings, 
  getBookingDetails,
  cancelBooking
} = require('../controllers/bookingController');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.post('/initiate', auth, initiateBooking);
router.post('/confirm-payment', auth, confirmPayment);
router.get('/my-bookings', auth, getUserBookings);
router.get('/seat-map/:tripId', auth, getSeatMap);
router.get('/:id', auth, getBookingDetails);
router.post('/:id/cancel', auth, cancelBooking);

// Management routes
router.get('/admin/all', auth, authorize('management'), getUserBookings);

module.exports = router;