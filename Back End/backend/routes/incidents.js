import express from 'express';
import {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  getIncidentStats,
} from '../controllers/incidentController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create incident (students/staff)
router.post('/', createIncident);

// Get incidents (filtered by role)
router.get('/', getIncidents);

// Get single incident
router.get('/:id', getIncidentById);

// Update incident (admin only)
router.patch('/:id', adminMiddleware, updateIncident);

// Get statistics
router.get('/stats', getIncidentStats);

export default router;
