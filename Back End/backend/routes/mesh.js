import express from 'express';
import {
  syncMeshPacket,
  getMeshPackets,
  getMeshStats,
} from '../controllers/meshController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Sync mesh packet (authenticated - gateway node)
router.post('/sync', authMiddleware, syncMeshPacket);

// Get mesh packets (admin only)
router.get('/packets', authMiddleware, adminMiddleware, getMeshPackets);

// Get mesh statistics (admin only)
router.get('/stats', authMiddleware, adminMiddleware, getMeshStats);

export default router;
