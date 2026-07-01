import crypto from 'crypto';
import { Alert, MeshPacket, User, Notification } from '../models/index.js';
import { Op, Sequelize } from 'sequelize';

const MESH_ENCRYPTION_KEY = process.env.MESH_ENCRYPTION_KEY || 'SAFE_MESH_KEY_32_CHARACTERS_LONG';

// Decrypt mesh payload
function decryptPayload(encryptedPayload) {
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', MESH_ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    let decrypted = decipher.update(encryptedPayload, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error.message);
    throw new Error('Invalid encrypted payload');
  }
}

export const syncMeshPacket = async (req, res) => {
  try {
    const { encrypted_payload, ttl, origin_device_id, relay_device_id, hop_count = 1 } = req.body;

    if (!encrypted_payload || !origin_device_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Encrypted payload and origin device ID are required.' 
      });
    }

    // Decrypt payload
    let decrypted;
    try {
      decrypted = decryptPayload(encrypted_payload);
    } catch {
      return res.status(400).json({ 
        success: false, 
        error: 'Failed to decrypt payload. Invalid encryption.' 
      });
    }

    const { user_id, latitude, longitude, timestamp } = decrypted;

    if (!user_id || !latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid payload structure.' 
      });
    }

    // Verify user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found.' 
      });
    }

    // Create alert
    const alert = await Alert.create({
      user_id,
      latitude,
      longitude,
      transmission_mode: 'mesh',
    });

    // Create mesh packet record
    const meshPacket = await MeshPacket.create({
      alert_id: alert.id,
      payload_encrypted: encrypted_payload,
      ttl,
      origin_device_id,
      relay_device_id: relay_device_id || null,
      hop_count,
      synced_to_server: true,
      synced_at: new Date(),
    });

    // Get all admin users
    const admins = await User.findAll({
      where: { role: { [Op.in]: ['security_admin', 'super_admin'] } },
      attributes: ['id'],
    });

    // Create notifications
    await Notification.bulkCreate(
      admins.map(admin => ({
        recipient_id: admin.id,
        type: 'emergency_alert',
        title: '🚨 MESH EMERGENCY ALERT',
        content: `${user.full_name} triggered emergency via Mesh Network at GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        related_entity_type: 'alert',
        related_entity_id: alert.id,
      }))
    );

    // Emit socket event
    req.io?.emit('mesh_alert_synced', {
      alertId: alert.id,
      userId: user_id,
      user_name: user.full_name,
      location: { latitude, longitude },
      transmission_mode: 'mesh',
      origin_device: origin_device_id,
      relay_device: relay_device_id,
      hop_count,
      timestamp: timestamp || new Date().toISOString(),
      synced_at: new Date().toISOString(),
    });

    // Schedule SMS fallback
    const smsTimeout = setTimeout(async () => {
      try {
        const freshAlert = await Alert.findByPk(alert.id);
        if (freshAlert && !freshAlert.acknowledged) {
          const { sendSMS } = await import('../services/smsService.js');
          const securityPhone = process.env.SECURITY_PHONE;
          if (securityPhone) {
            await sendSMS(
              securityPhone,
              ` MESH ALERT: ${user.full_name} triggered emergency (offline mode) at GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}.`
            );
            await freshAlert.update({ sms_sent: true, sms_sent_at: new Date() });
          }
        }
      } catch (smsError) {
        console.error('SMS fallback failed:', smsError.message);
      }
    }, 15000);

    alert.smsTimeout = smsTimeout;

    res.status(201).json({
      success: true,
      message: 'Mesh alert synced successfully.',
      data: {
        alert: {
          id: alert.id,
          transmission_mode: 'mesh',
          user_name: user.full_name,
          location: { latitude, longitude },
        },
        mesh_packet: {
          id: meshPacket.id,
          hop_count,
          origin_device: origin_device_id,
        },
      },
    });
  } catch (error) {
    console.error('Sync mesh packet error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to sync mesh packet.' 
    });
  }
};

export const getMeshPackets = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { count, rows } = await MeshPacket.findAndCountAll({
      include: [{ association: 'alert', include: [{ association: 'user', attributes: ['full_name'] }] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        packets: rows.map(p => ({
          ...p.toJSON(),
          alert_user_name: p.alert?.user?.full_name,
        })),
        total: count,
      },
    });
  } catch (error) {
    console.error('Get mesh packets error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch mesh packets.' 
    });
  }
};

export const getMeshStats = async (req, res) => {
  try {
    const total = await MeshPacket.count();
    const synced = await MeshPacket.count({ where: { synced_to_server: true } });
    const avgHops = await MeshPacket.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('hop_count')), 'avg_hops']],
    });

    res.json({
      success: true,
      data: {
        total,
        synced,
        avgHops: Math.round((avgHops?.dataValues?.avg_hops || 0) * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Get mesh stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch mesh statistics.' 
    });
  }
};
