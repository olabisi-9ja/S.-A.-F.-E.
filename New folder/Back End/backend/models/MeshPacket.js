import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MeshPacket = sequelize.define('MeshPacket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  alert_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'alerts',
      key: 'id',
    },
  },
  payload_encrypted: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  ttl: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  origin_device_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  relay_device_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  hop_count: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  synced_to_server: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  synced_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'mesh_packets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default MeshPacket;
