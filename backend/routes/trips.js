const express = require('express');
const router = express.Router();
const { 
  getTrips, 
  getTripById, 
  createTrip, 
  updateTrip, 
  deleteTrip,
  getPopularTrips,
  searchTrips
} = require('../controllers/tripController');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Public routes
router.get('/', getTrips);
router.get('/popular', getPopularTrips);
router.get('/search', searchTrips);
router.get('/:id', getTripById);

// Protected routes (Management only)
router.post('/', auth, authorize('management'), createTrip);
router.put('/:id', auth, authorize('management'), updateTrip);
router.delete('/:id', auth, authorize('management'), deleteTrip);

module.exports = router;