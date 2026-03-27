const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const fixUsers = async () => {
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

    // Create demo users using the User model (which will auto-hash passwords)
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

    // Create users one by one (this will trigger the pre-save hook for password hashing)
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }

    console.log('🎉 Demo users created successfully!');
    
    // Test login for admin user
    const adminUser = await User.findOne({ email: 'admin@demo.com' }).select('+password');
    const isMatch = await adminUser.matchPassword('password123');
    console.log('🔍 Admin password test:', isMatch ? '✅ PASS' : '❌ FAIL');

    console.log('\n📋 Demo Accounts:');
    console.log('Admin:      admin@demo.com / password123');
    console.log('Institution: institution@demo.com / password123');
    console.log('Student:    student@demo.com / password123');
    console.log('Verifier:   verifier@demo.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing users:', error);
    process.exit(1);
  }
};

fixUsers();