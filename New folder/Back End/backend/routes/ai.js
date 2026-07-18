import express from 'express';
import { chatWithAI } from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Protected AI chat route
router.post('/chat', authMiddleware, chatWithAI);

export default router;
