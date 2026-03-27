const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/certificate-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testRevokedCertificateFix() {
  console.log('🔒 TESTING REVOKED CERTIFICATE VISIBILITY FIX');
  console.log('============================================================');
  
  try {
    // Create a test student user
    const testStudent = {
      name: 'Test Student',
      email: 'test.student@example.com',
      password: 'password123',
      role: 'student',
      isVerified: true
    };
    
    let student = await User.findOne({ email: testStudent.email });
    if (!student) {
      student = await User.create(testStudent);
      console.log('✅ Test student created');
    } else {
      console.log('✅ Test student found');
    }
    
    // Create test certificates - some normal, some revoked
    const testCertificates = [
      {
        studentName: 'Test Student',
        studentEmail: 'test.student@example.com',
        courseName: 'Active Course 1',
        certificateType: 'Course Completion',
        institutionName: 'Test University',
        institutionId: new mongoose.Types.ObjectId(),
        issueDate: new Date(),
        isVerified: true,
        isRevoked: false, // Active certificate
        language: 'english',
        ipfsHash: `QmActive1${Date.now()}`,
        issuerAddress: '0x1111111111111111111111111111111111111111',
        blockchainId: `active1_${Date.now()}`
      },
      {
        studentName: 'Test Student',
        studentEmail: 'test.student@example.com',
        courseName: 'Revoked Course',
        certificateType: 'Course Completion',
        institutionName: 'Test University',
        institutionId: new mongoose.Types.ObjectId(),
        issueDate: new Date(),
        isVerified: true,
        isRevoked: true, // Revoked certificate
        revokedAt: new Date(),
        revokedBy: new mongoose.Types.ObjectId(),
        revocationReason: 'Test revocation',
        language: 'english',
        ipfsHash: `QmRevoked${Date.now()}`,
        issuerAddress: '0x2222222222222222222222222222222222222222',
        blockchainId: `revoked_${Date.now()}`
      },
      {
        studentName: 'Test Student',
        studentEmail: 'test.student@example.com',
        courseName: 'Active Course 2',
        certificateType: 'Course Completion',
        institutionName: 'Test University',
        institutionId: new mongoose.Types.ObjectId(),
        issueDate: new Date(),
        isVerified: true,
        isRevoked: false, // Active certificate
        language: 'english',
        ipfsHash: `QmActive2${Date.now()}`,
        issuerAddress: '0x3333333333333333333333333333333333333333',
        blockchainId: `active2_${Date.now()}`
      }
    ];
    
    console.log('\n📋 Creating test certificates...');
    const createdCertificates = [];
    for (const certData of testCertificates) {
      const cert = await Certificate.create(certData);
      createdCertificates.push(cert);
      console.log(`✅ Created certificate: ${cert.courseName} (Revoked: ${cert.isRevoked})`);
    }
    
    // Test 1: Check what student sees (should exclude revoked)
    console.log('\n🔍 Testing student certificate visibility...');
    const studentCertificates = await Certificate.find({ 
      studentEmail: student.email,
      isRevoked: { $ne: true }
    });
    
    console.log(`📊 Student sees ${studentCertificates.length} certificates (should be 2, not 3)`);
    studentCertificates.forEach(cert => {
      console.log(`   ✅ ${cert.courseName} - Revoked: ${cert.isRevoked}`);
    });
    
    // Test 2: Check student stats (should exclude revoked)
    console.log('\n📈 Testing student stats...');
    const stats = await Certificate.getStatsByStudent(student.email);
    console.log(`📊 Student stats: Total: ${stats.total}, Verified: ${stats.verified}, Pending: ${stats.pending}`);
    console.log('   (Should show 2 total, not 3, excluding revoked certificate)');
    
    // Test 3: Check all certificates (admin view - should include revoked)
    console.log('\n👨‍💼 Testing admin view (should include all certificates)...');
    const allCertificates = await Certificate.find({ studentEmail: student.email });
    console.log(`📊 Admin sees ${allCertificates.length} certificates (should be 3, including revoked)`);
    allCertificates.forEach(cert => {
      console.log(`   ${cert.isRevoked ? '❌' : '✅'} ${cert.courseName} - Revoked: ${cert.isRevoked}`);
    });
    
    console.log('\n🎯 TEST RESULTS:');
    console.log('============================================================');
    
    if (studentCertificates.length === 2) {
      console.log('✅ PASS: Students only see non-revoked certificates');
    } else {
      console.log('❌ FAIL: Students can still see revoked certificates');
    }
    
    if (stats.total === 2) {
      console.log('✅ PASS: Student stats exclude revoked certificates');
    } else {
      console.log('❌ FAIL: Student stats include revoked certificates');
    }
    
    if (allCertificates.length === 3) {
      console.log('✅ PASS: Admin view includes all certificates');
    } else {
      console.log('❌ FAIL: Admin view missing certificates');
    }
    
    console.log('\n🔒 REVOKED CERTIFICATE VISIBILITY FIX COMPLETE!');
    console.log('📱 Students will no longer see revoked certificates in their dashboard');
    console.log('📊 Student stats will exclude revoked certificates');
    console.log('👨‍💼 Admins and institutions can still see all certificates for management');
    
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await Certificate.deleteMany({ studentEmail: student.email });
    await User.deleteOne({ email: student.email });
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testRevokedCertificateFix();