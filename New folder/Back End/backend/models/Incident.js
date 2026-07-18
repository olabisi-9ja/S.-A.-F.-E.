import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Incident = sequelize.define('Incident', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  reporter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('received', 'in_progress', 'resolved'),
    defaultValue: 'received',
  },
  ai_severity_score: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    validate: {
      min: 0,
      max: 100,
    },
  },
  ai_category_suggestion: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  ai_is_suspicious: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  assigned_officer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  assigned_officer_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  media_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  resolution_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'incidents',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['status'] },
    { fields: ['created_at'] },
    { fields: ['ai_severity_score'] },
    { fields: ['reporter_id'] },
  ],
});

export default Incident;
