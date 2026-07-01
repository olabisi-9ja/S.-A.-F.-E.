import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
  },
  transmission_mode: {
    type: DataTypes.ENUM('https', 'mesh'),
    defaultValue: 'https',
  },
  acknowledged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  acknowledged_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  acknowledged_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  resolved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  sms_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sms_sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'alerts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['resolved'] },
    { fields: ['acknowledged'] },
    { fields: ['created_at'] },
    { fields: ['user_id'] },
  ],
});

export default Alert;
