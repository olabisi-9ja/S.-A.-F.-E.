import sequelize from '../config/database.js';
import User from './User.js';
import Incident from './Incident.js';
import Alert from './Alert.js';
import MeshPacket from './MeshPacket.js';
import Message from './Message.js';
import Notification from './Notification.js';

// User associations
User.hasMany(Incident, { foreignKey: 'reporter_id', as: 'reportedIncidents' });
User.hasMany(Alert, { foreignKey: 'user_id', as: 'alerts' });
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Notification, { foreignKey: 'recipient_id', as: 'notifications' });

// Incident associations
Incident.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });
Incident.belongsTo(User, { foreignKey: 'assigned_officer_id', as: 'assignedOfficer' });
Incident.hasMany(Message, { foreignKey: 'incident_id', as: 'messages', onDelete: 'CASCADE' });

// Alert associations
Alert.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Alert.belongsTo(User, { foreignKey: 'acknowledged_by', as: 'acknowledgedBy' });
Alert.belongsTo(User, { foreignKey: 'resolved_by', as: 'resolvedBy' });
Alert.hasMany(MeshPacket, { foreignKey: 'alert_id', as: 'meshPackets' });

// MeshPacket associations
MeshPacket.belongsTo(Alert, { foreignKey: 'alert_id', as: 'alert' });

// Message associations
Message.belongsTo(Incident, { foreignKey: 'incident_id', as: 'incident' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

export {
  sequelize,
  User,
  Incident,
  Alert,
  MeshPacket,
  Message,
  Notification,
};
