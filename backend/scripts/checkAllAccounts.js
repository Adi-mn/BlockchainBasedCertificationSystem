require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function checkAllAccounts() {
  console.log('👥 CHECKING ALL USER ACCOUNTS');
  console.log('=============================');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Get all users
    const users = await User.find({}).select('name email role isVerified loginAttempts lockUntil createdAt');
    
    console.log(`\n📊 TOTAL ACCOUNTS: ${users.length}`);
    console.log('================================');
    
    let lockedCount = 0;
    let institutionCount = 0;
    let studentCount = 0;
    let adminCount = 0;
    
    users.forEach((user, index) => {
      const isLocked = user.lockUntil && user.lockUntil > new Date();
      const loginAttempts = user.loginAttempts || 0;
      
      console.log(`\n${index + 1}. 👤 ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🏷️  Role: ${user.role}`);
      console.log(`   ✅ Verified: ${user.isVerified ? 'Yes' : 'No'}`);
      console.log(`   🔑 Login Attempts: ${loginAttempts}`);
      console.log(`   🔒 Status: ${isLocked ? '🚫 LOCKED' : '✅ Active'}`);
      
      if (isLocked) {
        console.log(`   ⏰ Lock Until: ${user.lockUntil}`);
        lockedCount++;
      }
      
      // Count by role
      switch (user.role) {
        case 'institution':
          institutionCount++;
          break;
        case 'student':
          studentCount++;
          break;
        case 'admin':
          adminCount++;
          break;
      }
    });
    
    console.log('\n📊 ACCOUNT SUMMARY');
    console.log('==================');
    console.log(`👥 Total Accounts: ${users.length}`);
    console.log(`🏢 Institutions: ${institutionCount}`);
    console.log(`🎓 Students: ${studentCount}`);
    console.log(`👑 Admins: ${adminCount}`);
    console.log(`🚫 Locked Accounts: ${lockedCount}`);
    console.log(`✅ Active Accounts: ${users.length - lockedCount}`);
    
    if (lockedCount > 0) {
      console.log('\n🔓 TO UNLOCK ACCOUNTS:');
      console.log('======================');
      console.log('Run: node scripts/unlockAccount.js');
      console.log('Or: node scripts/resetPassword.js');
    }
    
    console.log('\n🎯 DEMO ACCOUNT STATUS:');
    console.log('=======================');
    const demoInstitution = users.find(u => u.email === 'institution@demo.com');
    if (demoInstitution) {
      const isLocked = demoInstitution.lockUntil && demoInstitution.lockUntil > new Date();
      console.log(`📧 institution@demo.com: ${isLocked ? '🚫 LOCKED' : '✅ UNLOCKED'}`);
      console.log(`🔑 Password: password123 (after reset)`);
      console.log(`🏢 Role: Institution`);
    } else {
      console.log('❌ Demo institution account not found');
    }
    
  } catch (error) {
    console.error('❌ Error checking accounts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from database');
  }
}

checkAllAccounts().catch(console.error);