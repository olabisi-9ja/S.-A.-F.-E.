import express from 'express';
import {
  getDashboardStats,
  getHotspots,
  getIncidentTrend,
  getAIBriefing,
  getPredictiveRisk,
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

// AI Security Briefing
router.get('/ai-briefing', getAIBriefing);

// AI Predictive Risk Mapping
router.get('/predictive-risk', getPredictiveRisk);

export default router;
