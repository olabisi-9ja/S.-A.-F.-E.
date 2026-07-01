import { Message, Incident, User, Notification } from '../models/index.js';
import { Op } from 'sequelize';

export const sendMessage = async (req, res) => {
  try {
    const { incident_id, content } = req.body;

    if (!incident_id || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Incident ID and message content are required.' 
      });
    }

    // Verify incident exists and user has access
    const incident = await Incident.findByPk(incident_id);
    if (!incident) {
      return res.status(404).json({ 
        success: false, 
        error: 'Incident not found.' 
      });
    }

    // Check permission: reporter or assigned officer or admin
    const isReporter = incident.reporter_id === req.userId;
    const isAssignedOfficer = incident.assigned_officer_id === req.userId;
    const isAdmin = req.userRole === 'security_admin' || req.userRole === 'super_admin';

    if (!isReporter && !isAssignedOfficer && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied. You can only message incidents you reported or are assigned to.' 
      });
    }

    // Create message
    const message = await Message.create({
      incident_id,
      sender_id: req.userId,
      content,
    });

    // Get sender info
    const sender = await User.findByPk(req.userId, {
      attributes: ['full_name', 'role'],
    });

    // Notify other party
    const otherUserId = isReporter ? incident.assigned_officer_id : incident.reporter_id;
    if (otherUserId) {
      await Notification.create({
        recipient_id: otherUserId,
        type: 'message',
        title: 'New Message',
        content: `${sender.full_name}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
        related_entity_type: 'message',
        related_entity_id: message.id,
      });
    }

    // Emit socket event to incident room
    req.io?.to(`incident_${incident_id}`).emit('new_message', {
      id: message.id,
      incident_id,
      sender_id: req.userId,
      sender_name: sender.full_name,
      sender_role: sender.role,
      content,
      created_at: message.created_at,
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: {
        message: {
          ...message.toJSON(),
          sender_name: sender.full_name,
          sender_role: sender.role,
        },
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send message.' 
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { incident_id } = req.params;

    const incident = await Incident.findByPk(incident_id);
    if (!incident) {
      return res.status(404).json({ 
        success: false, 
        error: 'Incident not found.' 
      });
    }

    // Check permission
    const isReporter = incident.reporter_id === req.userId;
    const isAssignedOfficer = incident.assigned_officer_id === req.userId;
    const isAdmin = req.userRole === 'security_admin' || req.userRole === 'super_admin';

    if (!isReporter && !isAssignedOfficer && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied.' 
      });
    }

    const messages = await Message.findAll({
      where: { incident_id },
      include: [{ association: 'sender', attributes: ['full_name', 'role'] }],
      order: [['created_at', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        messages: messages.map(msg => ({
          ...msg.toJSON(),
          sender_name: msg.sender?.full_name,
          sender_role: msg.sender?.role,
        })),
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch messages.' 
    });
  }
};

export const markMessageRead = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        error: 'Message not found.' 
      });
    }

    await message.update({
      is_read: true,
      read_at: new Date(),
    });

    res.json({
      success: true,
      message: 'Message marked as read.',
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to mark message as read.' 
    });
  }
};
