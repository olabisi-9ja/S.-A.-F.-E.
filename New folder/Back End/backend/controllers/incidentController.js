import { Op, Sequelize } from 'sequelize';
import axios from 'axios';
import { Incident, User, Message, Notification } from '../models/index.js';
import { sendSMS } from '../services/smsService.js';
import logger from '../utils/logger.js';
import { generateUploadURL } from '../services/s3Service.js';
import { pushToAdmins, pushToUser } from '../services/pushService.js';
import validator from 'validator';

export const reportTimeouts = new Map();

export const getUploadUrl = async (req, res) => {
  try {
    const { fileType } = req.query;
    if (!fileType) {
      return res.status(400).json({ success: false, error: 'fileType query param is required.' });
    }
    
    const { uploadUrl, publicUrl, key } = await generateUploadURL(fileType);
    
    res.json({
      success: true,
      data: { uploadUrl, publicUrl, key }
    });
  } catch (error) {
    logger.error('Error getting upload URL:', error);
    res.status(500).json({ success: false, error: 'Failed to generate upload URL.' });
  }
};

// AI Classification Service
async function classifyIncident(description) {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${aiServiceUrl}/classify`, {
      text: description,
    }, { timeout: 5000 });

    return {
      ai_category_suggestion: response.data.category,
      ai_severity_score: response.data.severity_score,
      ai_is_suspicious: response.data.is_suspicious || false,
    };
  } catch (error) {
    logger.info('AI service unavailable, using defaults:', error.message);
    // Default classification based on keywords
    const lowerDesc = description.toLowerCase();
    let category = 'General';
    let severity = 50;

    if (lowerDesc.includes('assault') || lowerDesc.includes('attack') || lowerDesc.includes('fight')) {
      category = 'Assault';
      severity = 85;
    } else if (lowerDesc.includes('theft') || lowerDesc.includes('stolen') || lowerDesc.includes('robbery')) {
      category = 'Theft';
      severity = 75;
    } else if (lowerDesc.includes('harass') || lowerDesc.includes('threaten')) {
      category = 'Harassment';
      severity = 70;
    } else if (lowerDesc.includes('fire') || lowerDesc.includes('burn')) {
      category = 'Fire';
      severity = 95;
    } else if (lowerDesc.includes('medical') || lowerDesc.includes('injury') || lowerDesc.includes('emergency')) {
      category = 'Emergency / Medical';
      severity = 90;
    }

    return {
      ai_category_suggestion: category,
      ai_severity_score: severity,
      ai_is_suspicious: false,
    };
  }
}

// Lets the mobile app show the AI's suggested category/severity BEFORE the
// user submits, so they can confirm or override it (FR: AI-assisted
// classification with human-in-the-loop confirmation).
export const previewClassification = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || description.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'A description of at least 5 characters is required.',
      });
    }

    const aiResult = await classifyIncident(description);
    res.json({ success: true, data: { ai_classification: aiResult } });
  } catch (error) {
    logger.error('Preview classification error:', error);
    res.status(500).json({ success: false, error: 'Failed to classify description.' });
  }
};

export const createIncident = async (req, res) => {
  try {
    const { category, description, latitude, longitude, media_url } = req.body;

    if (!category || !description || !latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        error: 'Category, description, and location are required.' 
      });
    }

    // AI Classification
    const aiResult = await classifyIncident(description);

    const safeDescription = validator.escape(description);

    // The user has already seen the AI suggestion via /incidents/classify and
    // may confirm or override it, so their chosen category wins here.
    const incident = await Incident.create({
      reporter_id: req.userId,
      category: category || aiResult.ai_category_suggestion,
      description: safeDescription,
      latitude,
      longitude,
      media_url: media_url || null,
      ...aiResult,
    });

    // Populate reporter info
    const reporter = await User.findByPk(req.userId, {
      attributes: ['full_name', 'institutional_email'],
    });

    // Get all admin users for notification
    const admins = await User.findAll({
      where: { role: { [Op.in]: ['security_admin', 'super_admin'] } },
      attributes: ['id'],
    });

    // Create notifications for admins
    await Notification.bulkCreate(
      admins.map(admin => ({
        recipient_id: admin.id,
        type: 'new_incident',
        title: 'New Incident Reported',
        content: `${reporter.full_name} reported a ${incident.category} incident.`,
        related_entity_type: 'incident',
        related_entity_id: incident.id,
      }))
    );

    // Emit socket event (will be handled by socket.io middleware)
    req.io?.emit('new_incident', {
      id: incident.id,
      category: incident.category,
      severity: incident.ai_severity_score,
      reporter_name: reporter.full_name,
      location: { latitude, longitude },
      timestamp: incident.created_at,
      is_suspicious: incident.ai_is_suspicious,
    });

    // Push notification to security personnel (fire-and-forget)
    pushToAdmins({
      title: 'New Incident Reported',
      body: `${reporter.full_name} reported a ${incident.category} incident.`,
      data: { type: 'incident', incidentId: incident.id },
    });

    // Schedule SMS fallback for 15 minutes if not acknowledged
    const fallbackTimeout = setTimeout(async () => {
      try {
        const freshIncident = await Incident.findByPk(incident.id);
        if (freshIncident && freshIncident.status === 'received') {
          const securityPhone = process.env.SECURITY_PHONE;
          if (securityPhone) {
            await sendSMS(
              securityPhone,
              `🚨 SAFE REPORT: Unacknowledged ${incident.category} report from ${reporter.full_name}. Action required.`
            );
          }
        }
      } catch (err) {
        logger.error('Report SMS fallback failed:', err.message);
      }
    }, 15 * 60 * 1000);
    
    reportTimeouts.set(incident.id, fallbackTimeout);

    res.status(201).json({
      success: true,
      message: 'Incident reported successfully.',
      data: {
        incident: {
          ...incident.toJSON(),
          reporter_name: reporter.full_name,
        },
        ai_classification: aiResult,
      },
    });
  } catch (error) {
    logger.error('Create incident error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create incident.' 
    });
  }
};

export const getIncidents = async (req, res) => {
  try {
    const { status, category, limit = 50, offset = 0 } = req.query;
    const where = {};

    if (status) where.status = status;
    if (category) where.category = category;

    // If not admin, only show own incidents
    if (req.userRole === 'standard_user') {
      where.reporter_id = req.userId;
    }

    const { count, rows } = await Incident.findAndCountAll({
      where,
      include: [
        { association: 'reporter', attributes: ['full_name', 'institutional_email'] },
        { association: 'assignedOfficer', attributes: ['full_name'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        incidents: rows.map(inc => ({
          ...inc.toJSON(),
          reporter_name: inc.reporter?.full_name,
        })),
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    logger.error('Get incidents error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch incidents.' 
    });
  }
};

export const getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;

    const incident = await Incident.findByPk(id, {
      include: [
        { association: 'reporter', attributes: ['full_name', 'institutional_email', 'phone'] },
        { association: 'assignedOfficer', attributes: ['full_name'] },
        { association: 'messages', include: [{ association: 'sender', attributes: ['full_name', 'role'] }] },
      ],
    });

    if (!incident) {
      return res.status(404).json({ 
        success: false, 
        error: 'Incident not found.' 
      });
    }

    // Check permission
    if (req.userRole === 'standard_user' && incident.reporter_id !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied.' 
      });
    }

    res.json({
      success: true,
      data: {
        incident: {
          ...incident.toJSON(),
          reporter_name: incident.reporter?.full_name,
        },
      },
    });
  } catch (error) {
    logger.error('Get incident error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch incident.' 
    });
  }
};

export const updateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_officer_id, assigned_officer_name, resolution_notes } = req.body;

    const incident = await Incident.findByPk(id);
    if (!incident) {
      return res.status(404).json({ 
        success: false, 
        error: 'Incident not found.' 
      });
    }

    // Only admins can update
    if (req.userRole === 'standard_user') {
      return res.status(403).json({ 
        success: false, 
        error: 'Only security personnel can update incidents.' 
      });
    }

    if (status) {
      incident.status = status;
      if (status === 'resolved') {
        incident.resolved_at = new Date();
      }
      // If status is changed from received, clear timeout
      if (status !== 'received' && reportTimeouts.has(incident.id)) {
        clearTimeout(reportTimeouts.get(incident.id));
        reportTimeouts.delete(incident.id);
      }
    }
    if (assigned_officer_id) {
      incident.assigned_officer_id = assigned_officer_id;
      // Also clear timeout if assigned
      if (reportTimeouts.has(incident.id)) {
        clearTimeout(reportTimeouts.get(incident.id));
        reportTimeouts.delete(incident.id);
      }
    }
    if (assigned_officer_name) incident.assigned_officer_name = assigned_officer_name;
    if (resolution_notes) incident.resolution_notes = resolution_notes;

    await incident.save();

    // Notify reporter of status change
    const reporter = await User.findByPk(incident.reporter_id);
    if (reporter) {
      await Notification.create({
        recipient_id: reporter.id,
        type: 'status_update',
        title: 'Incident Status Updated',
        content: `Your incident #${id} status is now: ${status}`,
        related_entity_type: 'incident',
        related_entity_id: incident.id,
      });

      pushToUser(reporter.id, {
        title: 'Incident Status Updated',
        body: `Your incident #${id} status is now: ${status}`,
        data: { type: 'incident', incidentId: incident.id },
      });
    }

    // Emit socket event
    req.io?.emit('status_update', {
      incidentId: id,
      status: incident.status,
      assigned_officer: incident.assigned_officer_name,
    });

    res.json({
      success: true,
      message: 'Incident updated successfully.',
      data: { incident },
    });
  } catch (error) {
    logger.error('Update incident error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update incident.' 
    });
  }
};

export const getIncidentStats = async (req, res) => {
  try {
    const { period = '7' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const where = { created_at: { [Op.gte]: daysAgo } };
    if (req.userRole === 'standard_user') {
      where.reporter_id = req.userId;
    }

    const total = await Incident.count({ where });
    const byStatus = await Incident.findAll({
      where,
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    });
    const byCategory = await Incident.findAll({
      where,
      attributes: ['category', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['category'],
      raw: true,
    });
    const avgSeverity = await Incident.findOne({
      where,
      attributes: [[Sequelize.fn('AVG', Sequelize.col('ai_severity_score')), 'avg_severity']],
    });

    res.json({
      success: true,
      data: {
        total,
        byStatus: Object.fromEntries(byStatus.map(s => [s.status, s.count])),
        byCategory: Object.fromEntries(byCategory.map(c => [c.category, c.count])),
        avgSeverity: Math.round(avgSeverity?.dataValues?.avg_severity || 0),
      },
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics.' 
    });
  }
};
