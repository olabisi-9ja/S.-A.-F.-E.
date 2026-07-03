import express from 'express';
import { getAllUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Admin only middleware
const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'security_admin' && req.userRole !== 'super_admin') {
    return res.status(403).json({ success: false, error: 'Access denied. Admin role required.' });
  }
  next();
};

router.use(requireAdmin);

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
