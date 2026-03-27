require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function unlockAccount() {
  console.log('🔓 UNLOCKING LOCKED ACCOUNT');
  console.log('==========================');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    const email = 'institution@demo.com';
    
    // Find the locked account
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }
    
    console.log(`📋 Current account status for: ${email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Is Verified: ${user.isVerified}`);
    console.log(`   Login Attempts: ${user.loginAttempts || 0}`);
    console.log(`   Lock Until: ${user.lockUntil || 'Not locked'}`);
    
    // Reset login attempts and unlock account
    const updateData = {
      $unset: {
        loginAttempts: 1,
        lockUntil: 1
      }
    };
    
    await User.findByIdAndUpdate(user._id, updateData);
    
    console.log('\n🔓 ACCOUNT UNLOCKED SUCCESSFULLY!');
    console.log('================================');
    console.log(`✅ Account: ${email}`);
    console.log('✅ Login attempts reset to 0');
    console.log('✅ Lock removed');
    console.log('✅ Account is now accessible');
    
    // Verify the unlock
    const updatedUser = await User.findOne({ email: email });
    console.log('\n📋 Updated account status:');
    console.log(`   Login Attempts: ${updatedUser.loginAttempts || 0}`);
    console.log(`   Lock Until: ${updatedUser.lockUntil || 'Not locked'}`);
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Try logging in with the correct password');
    console.log('2. If you forgot the password, use password reset');
    console.log('3. Account should now accept login attempts');
    
  } catch (error) {
    console.error('❌ Error unlocking account:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from database');
  }
}

unlockAccount().catch(console.error);