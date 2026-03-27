const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createStudentAccount = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certificate-verification');
    console.log('✅ Connected to MongoDB');

    const studentEmail = 'ughkkhhk@gmail.com';
    const defaultPassword = 'password123';

    // Check if user already exists
    const existingUser = await User.findOne({ email: studentEmail });
    
    if (existingUser) {
      console.log(`✅ Student account already exists for ${studentEmail}`);
      console.log(`📧 Email: ${studentEmail}`);
      console.log(`🔑 Password: ${defaultPassword}`);
      console.log(`👤 Role: ${existingUser.role}`);
      console.log(`✅ Verified: ${existingUser.isVerified}`);
    } else {
      // Create new student account
      console.log(`👤 Creating new student account for ${studentEmail}...`);
      
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      const newStudent = await User.create({
        name: 'Student User',
        email: studentEmail,
        password: hashedPassword,
        role: 'student',
        isVerified: true
      });

      console.log('✅ Student account created successfully!');
      console.log(`📧 Email: ${studentEmail}`);
      console.log(`🔑 Password: ${defaultPassword}`);
      console.log(`👤 Role: student`);
      console.log(`🆔 User ID: ${newStudent._id}`);
    }

    console.log('\n🎉 Student account is ready!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log(`Email: ${studentEmail}`);
    console.log(`Password: ${defaultPassword}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createStudentAccount();