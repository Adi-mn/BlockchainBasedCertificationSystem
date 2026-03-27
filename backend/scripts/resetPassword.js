require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  console.log('🔑 RESETTING PASSWORD FOR LOCKED ACCOUNT');
  console.log('========================================');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    const email = 'institution@demo.com';
    const newPassword = 'password123'; // Default password
    
    // Find the user
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }
    
    console.log(`📋 Resetting password for: ${email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password and unlock account
    const updateData = {
      password: hashedPassword,
      $unset: {
        loginAttempts: 1,
        lockUntil: 1
      }
    };
    
    await User.findByIdAndUpdate(user._id, updateData);
    
    console.log('\n🔑 PASSWORD RESET SUCCESSFULLY!');
    console.log('==============================');
    console.log(`✅ Account: ${email}`);
    console.log(`✅ New Password: ${newPassword}`);
    console.log('✅ Account unlocked');
    console.log('✅ Login attempts reset');
    
    console.log('\n🎯 LOGIN CREDENTIALS:');
    console.log('====================');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${newPassword}`);
    console.log('🏢 Role: Institution');
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Go to your frontend login page');
    console.log('2. Use the credentials above to login');
    console.log('3. Change password after successful login');
    console.log('4. Account should work normally now');
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from database');
  }
}

resetPassword().catch(console.error);