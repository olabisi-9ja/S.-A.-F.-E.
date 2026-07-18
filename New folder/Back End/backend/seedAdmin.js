import { sequelize, User } from './models/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedAdmin() {
  try {
    const adminEmail = 'security@kwasu.edu.ng';
    const existingAdmin = await User.findOne({ where: { institutional_email: adminEmail } });
    
    if (!existingAdmin) {
      await User.create({
        full_name: 'Inspector Musa Aliyu',
        institutional_email: adminEmail,
        password_hash: 'safe-admin',
        role: 'security_admin',
        phone: '+2348098765432',
        matric_or_staff_id: 'SEC/005',
        email_verified: true,
      });
      console.log('✅ Admin user security@kwasu.edu.ng created automatically!');
    } else {
      console.log('✅ Admin user already exists, skipping.');
    }
  } catch (error) {
    console.error('❌ Failed to seed admin:', error);
  }
}

seedAdmin();
