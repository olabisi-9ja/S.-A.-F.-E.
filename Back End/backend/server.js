import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cron from 'node-cron';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is missing.');
  process.exit(1);
}

import { Op } from 'sequelize';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import logger from './utils/logger.js';

// Import database and models
import { testConnection, syncModels } from './config/database.js';
import { User, Incident, Alert, Message, MeshPacket, Notification } from './models/index.js';

// Import routes
import authRoutes from './routes/auth.js';
import incidentRoutes from './routes/incidents.js';
import alertRoutes from './routes/alerts.js';
import meshRoutes from './routes/mesh.js';
import messageRoutes from './routes/messages.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';
import userRoutes from './routes/users.js';

// Initialize Express app
const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000', 'https://safe-kwasu.vercel.app'];
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Trust proxy since app is deployed behind a reverse proxy (e.g., Render)
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development, adjust for prod as needed
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests from this IP, please try again later.' }
});

app.use('/api', globalLimiter);

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'S.A.F.E. KWASU Backend API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Strict Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login/register requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts, please try again later.' }
});

// API Routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/mesh', meshRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);

// Socket.io JWT Authentication Middleware
import jwt from 'jsonwebtoken';

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    return next(new Error('Authentication error: Token missing'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(` Client connected: ${socket.id} (User ID: ${socket.user?.id})`);

  // Join incident room for real-time chat
  socket.on('join_incident', (incidentId) => {
    socket.join(`incident_${incidentId}`);
    logger.info(`User ${socket.id} joined incident_${incidentId}`);
  });

  // Leave incident room
  socket.on('leave_incident', (incidentId) => {
    socket.leave(`incident_${incidentId}`);
    logger.info(`User ${socket.id} left incident_${incidentId}`);
  });

  // Typing indicator
  socket.on('typing', ({ incidentId, userId }) => {
    socket.to(`incident_${incidentId}`).emit('user_typing', { userId });
  });

  // Stop typing
  socket.on('stop_typing', ({ incidentId, userId }) => {
    socket.to(`incident_${incidentId}`).emit('user_stop_typing', { userId });
  });

  // Disconnect
  socket.on('disconnect', () => {
    logger.info(` Client disconnected: ${socket.id}`);
  });

  // Error handling
  socket.on('error', (error) => {
    logger.error(`Socket error for ${socket.id}:`, error);
  });
});

// Scheduled tasks (cron jobs)

// Daily cleanup: Mark old unread notifications as read (30 days)
cron.schedule('0 2 * * *', async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { is_read: false, created_at: { [Op.lt]: thirtyDaysAgo } } }
    );
    logger.info(`📅 Cleaned up ${result[0]} old notifications`);
  } catch (error) {
    logger.error('Cron job failed (notification cleanup):', error);
  }
});

// Hourly: Check for unacknowledged alerts older than 1 hour
cron.schedule('0 * * * *', async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const unackAlerts = await Alert.findAll({
      where: {
        acknowledged: false,
        created_at: { [Op.lt]: oneHourAgo },
        sms_sent: false,
      },
      include: [{ association: 'user', attributes: ['full_name', 'phone'] }],
    });

    for (const alert of unackAlerts) {
      const { sendSMS } = await import('./services/smsService.js');
      const securityPhone = process.env.SECURITY_PHONE;
      if (securityPhone) {
        await sendSMS(
          securityPhone,
          `⚠️ UNACKNOWLEDGED ALERT: ${alert.user?.full_name || 'Unknown'} - ${alert.created_at.toLocaleString()}. Check dashboard.`
        );
        await alert.update({ sms_sent: true, sms_sent_at: new Date() });
      }
    }

    if (unackAlerts.length > 0) {
      logger.info(` Sent ${unackAlerts.length} overdue alert SMS notifications`);
    }
  } catch (error) {
    logger.error('Cron job failed (alert check):', error);
  }
});

// Removed hoisted imports to the top of the file

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('❌ Cannot start server without database connection');
      process.exit(1);
    }

    // Sync models
    await syncModels();

    // Setup Redis Adapter for Socket.io scaling
    if (process.env.REDIS_URL) {
      try {
        const pubClient = createClient({ url: process.env.REDIS_URL });
        const subClient = pubClient.duplicate();
        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        logger.info('✅ Socket.io Redis Adapter configured successfully.');
      } catch (redisError) {
        logger.error('❌ Failed to configure Socket.io Redis Adapter:', redisError);
      }
    }

    // Start server
    server.listen(PORT, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ️  S.A.F.E. KWASU Backend Server                      ║
║                                                           ║
║   📍 Running on: http://localhost:${PORT}                   ║
║   📊 Environment: ${process.env.NODE_ENV || 'development'}                           ║
║   🔌 Socket.io: Enabled                                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

startServer();

export { app, io, server };
