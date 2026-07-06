import express from 'express';
import {
  triggerAlert,
  acknowledgeAlert,
  resolveAlert,
  getAlerts,
  getActiveAlerts,
  getAlertById,
  updateAlertLocation,
} from '../controllers/alertController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get single alert (public access for shared links, no auth middleware needed here)
router.get('/track/:id', getAlertById);

// All routes below require authentication
router.use(authMiddleware);

// Trigger emergency alert (all users)
router.post('/', triggerAlert);

// Update alert location (requires auth)
router.patch('/:id/location', updateAlertLocation);

// Get alerts (filtered by role)
router.get('/', getAlerts);

// Get active alerts (admin only)
router.get('/active', adminMiddleware, getActiveAlerts);

// Acknowledge alert (admin only)
router.post('/:id/acknowledge', adminMiddleware, acknowledgeAlert);

// Resolve alert (admin only)
router.post('/:id/resolve', adminMiddleware, resolveAlert);

export default router;
