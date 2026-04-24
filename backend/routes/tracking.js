const express = require('express');
const router = express.Router();
const { 
  updateBusLocation, 
  getBusLocation, 
  getTripTracking,
  getBookingTracking,
  getRouteETA
} = require('../controllers/trackingController');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.post('/location', auth, authorize('conductor', 'management'), updateBusLocation);
router.get('/bus/:busId', auth, getBusLocation);
router.get('/trip/:tripId', auth, getTripTracking);
router.get('/booking/:bookingId', auth, getBookingTracking);
router.get('/eta', auth, getRouteETA);

module.exports = router;