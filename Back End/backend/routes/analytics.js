import express from 'express';
import {
  getDashboardStats,
  getHotspots,
  getIncidentTrend,
} from '../controllers/analyticsController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard statistics
router.get('/dashboard', getDashboardStats);

// DBSCAN hotspot data
router.get('/hotspots', getHotspots);

// Incident trend data
router.get('/trend', getIncidentTrend);

export default router;
