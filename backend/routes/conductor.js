const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { 
  getAssignedTrips, 
  getPassengerList, 
  updateCheckinStatus,
  sendReminder,
  updateBusLocation,
  getTripSummary
} = require('../controllers/conductorController');

// All conductor routes require authentication and conductor role
router.use(auth, authorize('conductor'));

router.get('/assigned-trips', getAssignedTrips);
router.get('/passenger-list', getPassengerList);
router.post('/checkin', updateCheckinStatus);
router.post('/send-reminder', sendReminder);
router.post('/update-location', updateBusLocation);
router.get('/trip-summary', getTripSummary);

module.exports = router;