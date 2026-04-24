const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }
    
    next();
  };
};

const checkOwnership = (model, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idParam];
      const resource = await model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      
      // Allow if user is owner or has management role
      if (resource.userId?.toString() === req.user._id.toString() || 
          req.user.role === 'management') {
        req.resource = resource;
        return next();
      }
      
      res.status(403).json({ error: 'Access denied. Not the resource owner' });
    } catch (error) {
      res.status(500).json({ error: 'Error checking ownership' });
    }
  };
};

module.exports = { authorize, checkOwnership };