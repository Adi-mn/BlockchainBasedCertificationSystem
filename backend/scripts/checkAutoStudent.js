const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const checkAutoStudent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certificate-verification');
    
    // Find the most recent auto-created student (include password field)
    const students = await User.find({ role: 'student' }).select('+password').sort({ createdAt: -1 }).limit(5);
    
    console.log('📋 Recent student accounts:');
    
    for (const student of students) {
      console.log(`\n👤 Student: ${student.name}`);
      console.log(`📧 Email: ${student.email}`);
      console.log(`🔑 Password Hash: ${student.password ? student.password.substring(0, 20) + '...' : 'NO PASSWORD!'}`);
      console.log(`📅 Created: ${student.createdAt}`);
      
      // Test password verification
      if (student.password) {
        const isPasswordValid = await bcrypt.compare('password123', student.password);
        console.log(`🔐 Password 'password123' valid: ${isPasswordValid ? 'YES ✅' : 'NO ❌'}`);
      } else {
        console.log(`🔐 Password: MISSING! ❌`);
      }
      
      if (student.email.includes('autotest')) {
        console.log('🎯 This is our test student!');
      }
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkAutoStudent();