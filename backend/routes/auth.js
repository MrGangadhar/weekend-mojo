const express = require('express');
const router = express.Router();
const { 
  internalLogin, 
  getProfile, 
  updateProfile,
  updateFCMToken 
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/internal-login', internalLogin);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/fcm-token', auth, updateFCMToken);

// Debug route: List all users (remove in production!)
router.get('/debug/list-users', async (req, res) => {
  try {
    const users = await require('../models/User').find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;