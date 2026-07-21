import dotenv from 'dotenv';
dotenv.config();

import { testConnection } from './config/database.js';
import { User } from './models/index.js';

async function verify() {
  const email = 'abeladigun11@gmail.com';
  console.log(`Connecting to database to verify user: ${email}...`);
  
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('❌ Failed to connect to the database. Check your DATABASE_URL.');
    process.exit(1);
  }

  try {
    const user = await User.findOne({ where: { institutional_email: email } });
    
    if (!user) {
      console.error(`❌ User with email ${email} not found in this database.`);
    } else {
      user.email_verified = true;
      user.verification_token = null;
      await user.save();
      console.log(`✅ Success! User ${email} has been manually verified.`);
      console.log(`You can now log in to the web dashboard.`);
    }
  } catch (err) {
    console.error('Error updating user:', err);
  }
  
  process.exit(0);
}

verify();
