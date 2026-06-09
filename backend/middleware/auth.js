const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'weekend-mojo-demo-secret';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    try {
      const user = await User.findById(decoded.id).select('+password');

      if (user && user.isActive) {
        req.user = user;
        req.token = token;
        return next();
      }
    } catch (dbError) {
      if (decoded.role && decoded.mobile) {
        req.user = {
          _id: decoded.id,
          id: decoded.id,
          role: decoded.role,
          mobile: decoded.mobile,
          name: decoded.name,
          email: decoded.email,
          profile: decoded.profile,
          isActive: true,
        };
        req.token = token;
        return next();
      }
      throw dbError;
    }

    if (decoded.role && decoded.mobile) {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        role: decoded.role,
        mobile: decoded.mobile,
        name: decoded.name,
        email: decoded.email,
        profile: decoded.profile,
        isActive: true,
      };
      req.token = token;
      return next();
    }

    throw new Error();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      } else if (decoded.role && decoded.mobile) {
        req.user = {
          _id: decoded.id,
          id: decoded.id,
          role: decoded.role,
          mobile: decoded.mobile,
          name: decoded.name,
          email: decoded.email,
          profile: decoded.profile,
          isActive: true,
        };
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { auth, optionalAuth };