const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const testLogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certificate-verification', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Find the admin user
    const user = await User.findOne({ email: 'admin@demo.com' }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ User found:', user.email);
    console.log('🔐 Stored password hash:', user.password.substring(0, 20) + '...');

    // Test password comparison
    const isMatch = await user.matchPassword('password123');
    console.log('🔍 Password match result:', isMatch);

    if (isMatch) {
      console.log('✅ Login test successful!');
    } else {
      console.log('❌ Password does not match');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing login:', error);
    process.exit(1);
  }
};

testLogin();