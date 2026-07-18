import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'full_name', 'institutional_email', 'role', 'is_active'],
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token or user inactive.' 
      });
    }

    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid or expired token.' 
      });
    }
    next(error);
  }
};

export const adminMiddleware = (req, res, next) => {
  if (req.userRole !== 'security_admin' && req.userRole !== 'super_admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

export const superAdminMiddleware = (req, res, next) => {
  if (req.userRole !== 'super_admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Access denied. Super admin privileges required.' 
    });
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId, {
        attributes: ['id', 'full_name', 'institutional_email', 'role'],
      });
      if (user && user.is_active) {
        req.user = user;
        req.userId = user.id;
        req.userRole = user.role;
      }
    }
    next();
  } catch {
    next();
  }
};
