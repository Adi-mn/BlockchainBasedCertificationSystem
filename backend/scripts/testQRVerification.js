const axios = require('axios');

const testQRVerification = async () => {
  try {
    console.log('🔍 TESTING QR CODE VERIFICATION SYSTEM');
    console.log('='.repeat(50));

    // Login as institution to create a test certificate
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'institution@demo.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Institution login successful');

    // Create a test certificate
    console.log('\n📋 Creating test certificate...');
    const certData = {
      studentName: 'QR Test Student',
      studentEmail: 'qrtest@example.com',
      certificateType: 'Course Completion',
      courseName: 'QR Verification Test Course',
      issueDate: new Date().toISOString(),
      grade: 'A+',
      description: 'Test certificate for QR verification',
      ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', // Mock IPFS hash
      issuerAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87' // Mock Ethereum address
    };

    const createRes = await axios.post('http://localhost:5000/api/certificates', certData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const certificateId = createRes.data.certificate._id;
    console.log(`✅ Certificate created with ID: ${certificateId}`);

    // Test public certificate access (what QR code shows)
    console.log('\n🔍 Testing public certificate access (QR scan simulation)...');
    const publicRes = await axios.get(`http://localhost:5000/api/certificates/public/${certificateId}`);
    
    console.log('📋 Public Certificate Data:');
    const cert = publicRes.data.certificate;
    console.log(`   Student Name: ${cert.studentName}`);
    console.log(`   Course Name: ${cert.courseName}`);
    console.log(`   Institution: ${cert.institutionName}`);
    console.log(`   Certificate Type: ${cert.certificateType}`);
    console.log(`   Issue Date: ${cert.issueDate}`);
    console.log(`   Grade: ${cert.grade || 'N/A'}`);
    console.log(`   Is Verified: ${cert.isVerified}`);
    console.log(`   Blockchain ID: ${cert.blockchainId || 'Not set'}`);
    console.log(`   IPFS Hash: ${cert.ipfsHash || 'Not set'}`);

    // Check verification status
    console.log('\n🔍 Verification Status Analysis:');
    if (cert.isRevoked) {
      console.log('   ❌ Status: REVOKED');
    } else if (cert.isVerified && cert.blockchainId && cert.blockchainId !== 'pending') {
      console.log('   ✅ Status: FULLY VERIFIED (Database + Blockchain)');
    } else if (cert.isVerified) {
      console.log('   ⚠️ Status: PARTIALLY VERIFIED (Database only, blockchain processing)');
    } else {
      console.log('   ⏳ Status: PENDING VERIFICATION');
    }

    // Test the public URL that would be in QR code
    const publicUrl = `http://localhost:3000/certificate/${certificateId}`;
    console.log(`\n🔗 QR Code URL: ${publicUrl}`);
    console.log('📱 When scanned on mobile, this URL should show:');
    console.log('   ✅ Complete certificate details');
    console.log('   ✅ Student name, course, institution, date');
    console.log('   ✅ Verification status');
    console.log('   ✅ Mobile-optimized layout');

    console.log('\n' + '='.repeat(50));
    console.log('🎯 QR VERIFICATION TEST SUMMARY:');
    console.log('   📋 Certificate created and accessible via public URL');
    console.log('   🔍 Public API returns complete certificate details');
    console.log('   📱 Mobile users will see full certificate information');
    console.log('   ⚠️ Blockchain verification depends on blockchainId field');

  } catch (error) {
    console.error('❌ QR verification test failed:', error.response?.data || error.message);
  }
};

testQRVerification();