const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certificate-verification', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');

    // Create demo users
    const demoUsers = [
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: 'password123',
        role: 'admin',
        isActive: true,
        isVerified: true
      },
      {
        name: 'Demo Institution',
        email: 'institution@demo.com',
        password: 'password123',
        role: 'institution',
        organization: 'Demo University',
        isActive: true,
        isVerified: true
      },
      {
        name: 'Demo Student',
        email: 'student@demo.com',
        password: 'password123',
        role: 'student',
        isActive: true,
        isVerified: true
      },
      {
        name: 'Demo Verifier',
        email: 'verifier@demo.com',
        password: 'password123',
        role: 'verifier',
        organization: 'Demo Verification Company',
        isActive: true,
        isVerified: true
      }
    ];

    // Create users (pre-save hook will handle hashing)
    for (const userData of demoUsers) {
      const user = await User.create(userData);
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }

    console.log('🎉 Demo users created successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('Admin:      admin@demo.com / password123');
    console.log('Institution: institution@demo.com / password123');
    console.log('Student:    student@demo.com / password123');
    console.log('Verifier:   verifier@demo.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();