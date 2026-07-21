import dotenv from 'dotenv';
dotenv.config();

import sequelize from './config/database.js';
import './models/index.js'; // Import models to register them with sequelize

async function sync() {
  console.log('Running schema sync with alter: true on the production database...');
  try {
    await sequelize.authenticate();
    console.log('✅ Connection established.');
    
    // Run alter sync
    await sequelize.sync({ alter: true });
    console.log('✅ Production database schemas synchronized successfully (altered columns added).');
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
  process.exit(0);
}

sync();
