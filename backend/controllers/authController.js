const User = require('../models/User');
const jwt = require('jsonwebtoken');

const DEMO_JWT_SECRET = process.env.JWT_SECRET || 'weekend-mojo-demo-secret';

const DEMO_USERS = [
  {
    username: 'management01',
    mobile: '9000000001',
    name: 'Demo Management',
    email: 'management@demo.com',
    role: 'management',
    password: 'demo1234',
  },
  {
    username: 'conductor01',
    mobile: '9000000002',
    name: 'Demo Conductor',
    email: 'conductor@demo.com',
    role: 'conductor',
    password: 'demo1234',
  },
  {
    username: 'editor01',
    mobile: '9000000003',
    name: 'Demo Editor',
    email: 'editor@demo.com',
    role: 'editor',
    password: 'demo1234',
  },
  {
    username: 'user01',
    mobile: '9000000004',
    name: 'Demo User',
    email: 'user@demo.com',
    role: 'user',
    password: 'demo1234',
  },
];

const normalize = (value) => value.trim().toLowerCase();

const buildUserPayload = (user) => ({
  id: user._id || user.id,
  name: user.name,
  mobile: user.mobile,
  email: user.email,
  role: user.role,
  profile: user.profile,
});

const findDemoUser = ({ username, password, role }) => {
  const loginValue = username.trim();
  const normalizedUsername = normalize(loginValue);

  return DEMO_USERS.find((demoUser) => {
    return (
      demoUser.role === role &&
      demoUser.password === password &&
      (demoUser.username === normalizedUsername ||
        demoUser.email === normalizedUsername ||
        demoUser.mobile === loginValue)
    );
  });
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, role: user.role, mobile: user.mobile, name: user.name, email: user.email },
    DEMO_JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

exports.internalLogin = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password, and role are required' });
    }

    const loginValue = username.trim();
    const normalizedUsername = loginValue.toLowerCase();
    
    let user = null;

    try {
      user = await User.findOne({
        $or: [
          { username: normalizedUsername },
          { mobile: loginValue },
          { email: normalizedUsername },
        ],
        role: role,
        isActive: true
      }).select('+password');
    } catch (dbError) {
      console.warn('Auth DB lookup failed, using demo fallback when possible:', dbError.message);
    }

    if (user) {
      const isValidPassword = await user.comparePassword(password);

      if (isValidPassword) {
        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user);

        return res.json({
          success: true,
          token,
          user: buildUserPayload(user)
        });
      }
    }

    const demoUser = findDemoUser({ username, password, role });

    if (demoUser) {
      const token = generateToken(demoUser);

      return res.json({
        success: true,
        token,
        user: buildUserPayload(demoUser)
      });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Internal login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.json(req.user);
    }

    const user = await User.findById(req.user._id).select('-password');
    res.json(user || req.user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.json(req.user);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = ['name', 'email', 'profile'];
    const updateData = {};
    
    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

exports.updateFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    
    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    
    res.json({ success: true, message: 'FCM token updated' });
  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(500).json({ error: 'Failed to update FCM token' });
  }
};