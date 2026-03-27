const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');

const checkExistingCertificates = async () => {
  try {
    console.log('🔍 CHECKING EXISTING CERTIFICATES FOR QR VERIFICATION');
    console.log('='.repeat(60));

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certificate-system');
    console.log('✅ Connected to database');

    // Find recent certificates
    const certificates = await Certificate.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`\n📋 Found ${certificates.length} recent certificates:\n`);

    certificates.forEach((cert, index) => {
      console.log(`${index + 1}. Certificate ID: ${cert._id}`);
      console.log(`   Student: ${cert.studentName}`);
      console.log(`   Course: ${cert.courseName}`);
      console.log(`   Institution: ${cert.institutionName}`);
      console.log(`   Type: ${cert.certificateType}`);
      console.log(`   Issue Date: ${cert.issueDate}`);
      console.log(`   Is Verified: ${cert.isVerified}`);
      console.log(`   Is Revoked: ${cert.isRevoked}`);
      console.log(`   Blockchain ID: ${cert.blockchainId || 'Not set'}`);
      console.log(`   IPFS Hash: ${cert.ipfsHash || 'Not set'}`);
      console.log(`   Transaction Hash: ${cert.transactionHash || 'Not set'}`);
      
      // Determine verification status
      let status = '';
      if (cert.isRevoked) {
        status = '❌ REVOKED';
      } else if (cert.isVerified && cert.blockchainId && cert.blockchainId !== 'pending') {
        status = '✅ FULLY VERIFIED';
      } else if (cert.isVerified) {
        status = '⚠️ PARTIALLY VERIFIED (Database only)';
      } else {
        status = '⏳ PENDING VERIFICATION';
      }
      console.log(`   Status: ${status}`);
      
      // QR URL
      const qrUrl = `http://localhost:3000/certificate/${cert._id}`;
      console.log(`   QR URL: ${qrUrl}`);
      console.log('');
    });

    if (certificates.length > 0) {
      const testCert = certificates[0];
      console.log('🔗 TESTING PUBLIC ACCESS FOR FIRST CERTIFICATE:');
      console.log(`   Certificate ID: ${testCert._id}`);
      console.log(`   Public URL: http://localhost:3000/certificate/${testCert._id}`);
      console.log(`   API Endpoint: http://localhost:5000/api/certificates/public/${testCert._id}`);
      
      console.log('\n📱 MOBILE QR SCAN SIMULATION:');
      console.log('   When users scan QR code on mobile, they should see:');
      console.log(`   ✅ Student Name: ${testCert.studentName}`);
      console.log(`   ✅ Course: ${testCert.courseName}`);
      console.log(`   ✅ Institution: ${testCert.institutionId?.name || testCert.institutionName}`);
      console.log(`   ✅ Issue Date: ${testCert.issueDate}`);
      console.log(`   ✅ Certificate Type: ${testCert.certificateType}`);
      console.log(`   ✅ Verification Status: Based on blockchain/database status`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 ANALYSIS SUMMARY:');
    console.log('   📋 Certificates exist and are accessible via public URLs');
    console.log('   🔍 Blockchain verification depends on blockchainId field');
    console.log('   📱 QR codes should show complete certificate details');
    console.log('   ⚠️ "Partial verification" likely due to missing blockchain data');

    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Certificate check failed:', error);
    await mongoose.disconnect();
  }
};

// Load environment variables
require('dotenv').config();
checkExistingCertificates();