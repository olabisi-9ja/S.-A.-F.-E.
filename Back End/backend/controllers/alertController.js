import { Op } from 'sequelize';
import { Alert, User, Notification, MeshPacket } from '../models/index.js';
import { sendSMS } from '../services/smsService.js';
import { pushToAdmins, pushToUser } from '../services/pushService.js';
import logger from '../utils/logger.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const rawApiKey = process.env.GEMINI_API_KEY || 'dummy_key_if_not_provided';
const ai = new GoogleGenAI({
  apiKey: rawApiKey.replace(/^"|"$/g, '')
});

async function getAlertUrgency(user, latitude, longitude) {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder') {
      return { timeout_ms: 15000, escalate_immediately: false, rating: 'Medium' };
    }

    const timeOfDay = new Date().toLocaleTimeString();
    const systemPrompt = `Analyze the urgency of a campus emergency panic alert:
User: ${user.full_name}
Location: GPS (${latitude.toFixed(6)}, ${longitude.toFixed(6)})
Time of trigger: ${timeOfDay}

Respond ONLY with a JSON object in this format:
{
  "rating": "one of: High, Medium, Low",
  "timeout_ms": <number of milliseconds to wait before triggering SMS fallback: e.g., 0 for high-risk/immediate alert, 15000 for normal, 30000 for low risk>,
  "escalate_immediately": <true if rating is High, false otherwise>
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] }
      ]
    });

    const parsed = JSON.parse(response.text.trim().replace(/```json|```/g, '').trim());
    return {
      timeout_ms: parsed.timeout_ms !== undefined ? parseInt(parsed.timeout_ms) : 15000,
      escalate_immediately: !!parsed.escalate_immediately,
      rating: parsed.rating || 'Medium'
    };
  } catch (error) {
    logger.warn('AI alert escalation calculation failed, using defaults:', error.message);
    return { timeout_ms: 15000, escalate_immediately: false, rating: 'Medium' };
  }
}

export const smsTimeouts = new Map();

export const triggerAlert = async (req, res) => {
  try {
    const { latitude, longitude, transmission_mode = 'https' } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        error: 'Location coordinates are required.' 
      });
    }

    // Create alert
    const alert = await Alert.create({
      user_id: req.userId,
      latitude,
      longitude,
      transmission_mode,
    });

    // Get user info
    const user = await User.findByPk(req.userId, {
      attributes: ['full_name', 'phone'],
    });

    // Get all admin users
    const admins = await User.findAll({
      where: { role: { [Op.in]: ['security_admin', 'super_admin'] } },
      attributes: ['id', 'full_name'],
    });

    // Create notifications for admins
    await Notification.bulkCreate(
      admins.map(admin => ({
        recipient_id: admin.id,
        type: 'emergency_alert',
        title: '🚨 EMERGENCY ALERT',
        content: `${user.full_name} triggered an emergency alert at GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        related_entity_type: 'alert',
        related_entity_id: alert.id,
      }))
    );

    // Emit socket event to all connected admins
    req.io?.emit('emergency_alert', {
      alertId: alert.id,
      userId: req.userId,
      user_name: user.full_name,
      location: { latitude, longitude },
      transmission_mode,
      timestamp: alert.created_at,
    });

    // Push notification to security personnel (fire-and-forget)
    pushToAdmins({
      title: '🚨 EMERGENCY ALERT',
      body: `${user.full_name} triggered an emergency alert nearby.`,
      data: { type: 'alert', alertId: alert.id },
    });

    // Calculate urgency asynchronously
    getAlertUrgency(user, latitude, longitude).then(async (urgency) => {
      logger.info(`🚨 Alert ${alert.id} Urgency Class: ${urgency.rating} (Immediate: ${urgency.escalate_immediately}, Timeout: ${urgency.timeout_ms}ms)`);
      
      const sendSMSFallback = async () => {
        try {
          const freshAlert = await Alert.findByPk(alert.id);
          if (freshAlert && !freshAlert.acknowledged) {
            const securityPhone = process.env.SECURITY_PHONE;
            if (securityPhone) {
              await sendSMS(
                securityPhone,
                `🚨 [URGENCY: ${urgency.rating}] SAFE ALERT: ${user.full_name} triggered emergency at GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}. Action required.`
              );
              await freshAlert.update({
                sms_sent: true,
                sms_sent_at: new Date(),
              });
            }
          }
        } catch (smsError) {
          logger.error('SMS fallback failed:', smsError.message);
        }
      };

      if (urgency.escalate_immediately) {
        await sendSMSFallback();
      } else {
        const smsTimeout = setTimeout(sendSMSFallback, urgency.timeout_ms);
        smsTimeouts.set(alert.id, smsTimeout);
      }
    });

    res.status(201).json({
      success: true,
      message: 'Emergency alert triggered successfully.',
      data: {
        alert: {
          ...alert.toJSON(),
          user_name: user.full_name,
        },
      },
    });
  } catch (error) {
    logger.error('Trigger alert error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to trigger emergency alert.' 
    });
  }
};

export const acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findByPk(id);
    if (!alert) {
      return res.status(404).json({ 
        success: false, 
        error: 'Alert not found.' 
      });
    }

    if (alert.acknowledged) {
      return res.status(400).json({ 
        success: false, 
        error: 'Alert already acknowledged.' 
      });
    }

    // Clear SMS timeout if exists
    if (smsTimeouts.has(alert.id)) {
      clearTimeout(smsTimeouts.get(alert.id));
      smsTimeouts.delete(alert.id);
    }

    await alert.update({
      acknowledged: true,
      acknowledged_by: req.userId,
      acknowledged_at: new Date(),
    });

    // Notify the user who triggered the alert
    const user = await User.findByPk(alert.user_id);
    if (user) {
      await Notification.create({
        recipient_id: user.id,
        type: 'status_update',
        title: 'Alert Acknowledged',
        content: `Security has acknowledged your emergency alert.`,
        related_entity_type: 'alert',
        related_entity_id: alert.id,
      });
      pushToUser(user.id, {
        title: 'Alert Acknowledged',
        body: 'Security has acknowledged your emergency alert.',
        data: { type: 'alert', alertId: alert.id },
      });
    }

    // Emit socket event
    req.io?.emit('alert_acknowledged', {
      alertId: id,
      acknowledged_by: req.user?.full_name || 'Admin',
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: 'Alert acknowledged successfully.',
    });
  } catch (error) {
    logger.error('Acknowledge alert error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to acknowledge alert.' 
    });
  }
};

export const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findByPk(id);
    if (!alert) {
      return res.status(404).json({ 
        success: false, 
        error: 'Alert not found.' 
      });
    }

    // Clear SMS timeout if exists
    if (smsTimeouts.has(alert.id)) {
      clearTimeout(smsTimeouts.get(alert.id));
      smsTimeouts.delete(alert.id);
    }

    await alert.update({
      resolved: true,
      acknowledged: true,
      resolved_by: req.userId,
      acknowledged_by: alert.acknowledged_by || req.userId,
      resolved_at: new Date(),
      acknowledged_at: alert.acknowledged_at || new Date(),
    });

    // Notify the user
    const user = await User.findByPk(alert.user_id);
    if (user) {
      await Notification.create({
        recipient_id: user.id,
        type: 'status_update',
        title: 'Alert Resolved',
        content: `Your emergency alert has been resolved by security personnel.`,
        related_entity_type: 'alert',
        related_entity_id: alert.id,
      });
      pushToUser(user.id, {
        title: 'Alert Resolved',
        body: 'Your emergency alert has been resolved by security personnel.',
        data: { type: 'alert', alertId: alert.id },
      });
    }

    // Emit socket event
    req.io?.emit('alert_resolved', {
      alertId: id,
      resolved_by: req.user?.full_name || 'Admin',
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: 'Alert resolved successfully.',
    });
  } catch (error) {
    logger.error('Resolve alert error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to resolve alert.' 
    });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const { resolved, acknowledged, limit = 50, offset = 0 } = req.query;
    const where = {};

    if (resolved !== undefined) where.resolved = resolved === 'true';
    if (acknowledged !== undefined) where.acknowledged = acknowledged === 'true';

    // If not admin, only show own alerts
    if (req.userRole === 'standard_user') {
      where.user_id = req.userId;
    }

    const { count, rows } = await Alert.findAndCountAll({
      where,
      include: [
        { association: 'user', attributes: ['full_name', 'institutional_email', 'phone'] },
        { association: 'acknowledgedBy', attributes: ['full_name'] },
        { association: 'resolvedBy', attributes: ['full_name'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        alerts: rows.map(alert => ({
          ...alert.toJSON(),
          user_name: alert.user?.full_name,
        })),
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    logger.error('Get alerts error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch alerts.' 
    });
  }
};

export const getActiveAlerts = async (req, res) => {
  try {
    const alerts = await Alert.findAll({
      where: { resolved: false },
      include: [
        { association: 'user', attributes: ['full_name', 'phone'] },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        alerts: alerts.map(a => ({
          ...a.toJSON(),
          user_name: a.user?.full_name,
        })),
        count: alerts.length,
      },
    });
  } catch (error) {
    logger.error('Get active alerts error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch active alerts.' 
    });
  }
};

export const getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id, {
      include: [{ association: 'user', attributes: ['full_name', 'phone'] }]
    });
    if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });
    res.json({ success: true, data: { alert } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch alert' });
  }
};

export const updateAlertLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });
    
    // Only the user who created it can update it
    if (alert.user_id !== req.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await alert.update({ latitude, longitude });
    
    // Broadcast update to admins
    req.io?.emit('alert_location_update', { alertId: alert.id, latitude, longitude });
    
    res.json({ success: true, data: { alert } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update location' });
  }
};
