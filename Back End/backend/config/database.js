import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dialect = process.env.DB_DIALECT || 'mysql';

let sequelize;

// DATABASE_URL takes top priority — this is the production path (Supabase / Render)
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else if (dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'safe_dev.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'safe_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

// Test connection
export async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('\n\n--- RAW DATABASE ERROR ---');
    console.error(error);
    console.error('--------------------------\n\n');
    logger.error('❌ Unable to connect to the database: ' + error.message);
    return false;
  }
}

// Sync models
export async function syncModels() {
  try {
    const alter = process.env.NODE_ENV !== 'production';
    await sequelize.sync({ alter });
    logger.info('✅ Database models synchronized.');
  } catch (error) {
    logger.error('❌ Error syncing models:', error.message);
  }
}

export default sequelize;
