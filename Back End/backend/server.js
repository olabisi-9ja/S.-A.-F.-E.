import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cron from 'node-cron';

// Load environment variables
dotenv.config();

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

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/mesh', meshRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(` Client connected: ${socket.id}`);

  // Join incident room for real-time chat
  socket.on('join_incident', (incidentId) => {
    socket.join(`incident_${incidentId}`);
    console.log(`User ${socket.id} joined incident_${incidentId}`);
  });

  // Leave incident room
  socket.on('leave_incident', (incidentId) => {
    socket.leave(`incident_${incidentId}`);
    console.log(`User ${socket.id} left incident_${incidentId}`);
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
    console.log(` Client disconnected: ${socket.id}`);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
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
    console.log(`📅 Cleaned up ${result[0]} old notifications`);
  } catch (error) {
    console.error('Cron job failed (notification cleanup):', error);
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
      console.log(` Sent ${unackAlerts.length} overdue alert SMS notifications`);
    }
  } catch (error) {
    console.error('Cron job failed (alert check):', error);
  }
});

// Import Op for cron jobs
import { Op } from 'sequelize';

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
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
      console.error('❌ Cannot start server without database connection');
      process.exit(1);
    }

    // Sync models
    await syncModels();

    // Start server
    server.listen(PORT, () => {
      console.log(`
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
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

startServer();

export { app, io, server };
