import { sequelize, User, Incident, Alert, Message } from './models/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  try {
    console.log(' Starting database seeding...\n');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection verified\n');

    // Sync models
    await sequelize.sync({ force: false });
    console.log('✅ Models synchronized\n');

    // Check if users already exist
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log('⚠️  Database already has users. Skipping seed.\n');
      return;
    }

    // Create users
    console.log('📝 Creating users...');
    
    const superAdmin = await User.create({
      full_name: 'Chief Security Officer',
      institutional_email: 'superadmin@kwasu.edu.ng',
      password_hash: 'safe-super-admin',
      role: 'super_admin',
      phone: '+2348000000001',
      matric_or_staff_id: 'SEC/001',
      email_verified: true,
    });

    const securityAdmin = await User.create({
      full_name: 'Inspector Musa Aliyu',
      institutional_email: 'security@kwasu.edu.ng',
      password_hash: 'safe-admin',
      role: 'security_admin',
      phone: '+2348098765432',
      matric_or_staff_id: 'SEC/005',
      email_verified: true,
    });

    const officer = await User.create({
      full_name: 'Officer James Bello',
      institutional_email: 'james.bello@kwasu.edu.ng',
      password_hash: 'safe-officer',
      role: 'security_admin',
      phone: '+2348012345678',
      matric_or_staff_id: 'SEC/008',
      email_verified: true,
    });

    const student1 = await User.create({
      full_name: 'Adewale Olatunji',
      institutional_email: 'adewale@kwasu.edu.ng',
      password_hash: 'password',
      role: 'standard_user',
      phone: '+2348012345678',
      matric_or_staff_id: 'CSC/2021/001',
      email_verified: true,
    });

    const student2 = await User.create({
      full_name: 'Fatima Suleiman',
      institutional_email: 'fatima@kwasu.edu.ng',
      password_hash: 'password',
      role: 'standard_user',
      phone: '+2348023456789',
      matric_or_staff_id: 'CSC/2022/045',
    });

    console.log('✅ Users created:\n');
    console.log(`   Super Admin: ${superAdmin.institutional_email} / safe-super-admin`);
    console.log(`   Security Admin: ${securityAdmin.institutional_email} / safe-admin`);
    console.log(`   Officer: ${officer.institutional_email} / safe-officer`);
    console.log(`   Student 1: ${student1.institutional_email} / password`);
    console.log(`   Student 2: ${student2.institutional_email} / password\n`);

    // Create sample incidents
    console.log('📝 Creating sample incidents...');

    const incidents = await Incident.bulkCreate([
      {
        reporter_id: student1.id,
        category: 'Theft',
        description: 'My laptop was stolen from the library second floor. A suspicious individual was seen near my table before I noticed it missing.',
        latitude: 8.6762,
        longitude: 4.1680,
        status: 'in_progress',
        ai_severity_score: 78,
        ai_category_suggestion: 'Theft',
        assigned_officer_id: securityAdmin.id,
        assigned_officer_name: 'Inspector Musa Aliyu',
      },
      {
        reporter_id: student2.id,
        category: 'Harassment',
        description: 'A group of individuals near the female hostel have been verbally harassing female students returning from evening lectures.',
        latitude: 8.6748,
        longitude: 4.1665,
        status: 'received',
        ai_severity_score: 65,
        ai_category_suggestion: 'Harassment',
      },
      {
        reporter_id: student1.id,
        category: 'Vandalism',
        description: 'Several classroom windows in Block C of the Faculty of ICT have been broken. Looks like intentional damage.',
        latitude: 8.6770,
        longitude: 4.1690,
        status: 'resolved',
        ai_severity_score: 42,
        ai_category_suggestion: 'Vandalism',
        assigned_officer_id: officer.id,
        assigned_officer_name: 'Officer James Bello',
        resolved_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        reporter_id: student2.id,
        category: 'Suspicious Activity',
        description: 'Unknown persons loitering around the administrative building after closing hours. They seem to be surveying the area.',
        latitude: 8.6755,
        longitude: 4.1672,
        status: 'received',
        ai_severity_score: 55,
        ai_category_suggestion: 'Suspicious Activity',
      },
      {
        reporter_id: student1.id,
        category: 'Assault',
        description: 'Physical altercation observed near the student union building. Two students involved, one appears injured.',
        latitude: 8.6758,
        longitude: 4.1678,
        status: 'in_progress',
        ai_severity_score: 88,
        ai_category_suggestion: 'Assault',
        assigned_officer_id: securityAdmin.id,
        assigned_officer_name: 'Inspector Musa Aliyu',
      },
      {
        reporter_id: student2.id,
        category: 'Theft',
        description: 'Mobile phone stolen from the cafeteria. Last seen on the table while eating.',
        latitude: 8.6742,
        longitude: 4.1660,
        status: 'resolved',
        ai_severity_score: 60,
        ai_category_suggestion: 'Theft',
        assigned_officer_id: officer.id,
        assigned_officer_name: 'Officer James Bello',
        resolved_at: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    ]);

    console.log(`✅ ${incidents.length} incidents created\n`);

    // Create sample alerts
    console.log('📝 Creating sample alerts...');

    const alerts = await Alert.bulkCreate([
      {
        user_id: student2.id,
        latitude: 8.6748,
        longitude: 4.1665,
        transmission_mode: 'https',
        acknowledged: true,
        acknowledged_by: securityAdmin.id,
        acknowledged_at: new Date(Date.now() - 8 * 60 * 1000),
        resolved: false,
      },
      {
        user_id: student1.id,
        latitude: 8.6762,
        longitude: 4.1680,
        transmission_mode: 'mesh',
        acknowledged: false,
        resolved: false,
      },
    ]);

    console.log(`✅ ${alerts.length} alerts created\n`);

    // Create sample messages
    console.log(' Creating sample messages...');

    const messages = await Message.bulkCreate([
      {
        incident_id: incidents[0].id,
        sender_id: student1.id,
        content: 'The laptop is a Dell Inspiron, silver colour. Serial number is on the sticker at the bottom.',
      },
      {
        incident_id: incidents[0].id,
        sender_id: securityAdmin.id,
        content: 'Noted. We have reviewed CCTV footage from the library. A suspect has been identified and is being tracked. Please remain available for further questioning.',
      },
      {
        incident_id: incidents[0].id,
        sender_id: student1.id,
        content: 'Thank you. I will be available. Should I come to the security post?',
      },
      {
        incident_id: incidents[0].id,
        sender_id: securityAdmin.id,
        content: 'Yes, please come to the security post by 3PM today.',
      },
    ]);

    console.log(`✅ ${messages.length} messages created\n`);

    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║   ✅ Database seeding completed successfully!            ║');
    console.log('║                                                           ║');
    console.log('║   You can now login with the credentials above.          ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
