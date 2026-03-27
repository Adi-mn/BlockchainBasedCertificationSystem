const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
require('dotenv').config();

const approveCertificate = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certificate-verification');
    console.log('✅ Connected to MongoDB');

    const studentEmail = 'ughkkhhk@gmail.com';

    // Find certificates for this student
    console.log(`🔍 Looking for certificates for ${studentEmail}...`);
    const certificates = await Certificate.find({ studentEmail: studentEmail });

    if (certificates.length === 0) {
      console.log('❌ No certificates found for this student email');
      return;
    }

    console.log(`📜 Found ${certificates.length} certificate(s) for ${studentEmail}:`);

    // Find admin user to use as verifier
    const adminUser = await User.findOne({ role: 'admin' });
    
    for (let i = 0; i < certificates.length; i++) {
      const cert = certificates[i];
      console.log(`\n📄 Certificate ${i + 1}:`);
      console.log(`   Student: ${cert.studentName}`);
      console.log(`   Course: ${cert.courseName}`);
      console.log(`   Current Status: ${cert.isVerified ? 'Verified' : 'Pending'}`);
      console.log(`   Certificate ID: ${cert._id}`);

      if (!cert.isVerified) {
        console.log('   🔄 Approving certificate...');
        
        // Update certificate to verified
        cert.isVerified = true;
        cert.verifiedBy = adminUser._id;
        cert.verifiedAt = new Date();
        cert.status = 'verified';
        
        await cert.save();
        
        console.log('   ✅ Certificate approved and verified!');
      } else {
        console.log('   ✅ Certificate already verified');
      }
    }

    console.log('\n🎉 Certificate approval process completed!');
    console.log('\n📋 SUMMARY:');
    console.log(`Student Email: ${studentEmail}`);
    console.log(`Student Password: password123`);
    console.log(`Total Certificates: ${certificates.length}`);
    console.log(`All certificates are now VERIFIED ✅`);

    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Student can now login with:');
    console.log(`   Email: ${studentEmail}`);
    console.log(`   Password: password123`);
    console.log('2. Student will see their verified certificates in the dashboard');
    console.log('3. Student can download their certificates');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

approveCertificate();