import express from 'express';
import {
  sendMessage,
  getMessages,
  markMessageRead,
} from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Send message
router.post('/', sendMessage);

// Get messages for incident
router.get('/incident/:incident_id', getMessages);

// Mark message as read
router.patch('/:id/read', markMessageRead);

export default router;
