const axios = require('axios');

const demonstrateQRFix = async () => {
  try {
    console.log('📱 DEMONSTRATING QR CODE FIX');
    console.log('='.repeat(60));

    // Get a certificate ID to test with
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@demo.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    const certsRes = await axios.get('http://localhost:5000/api/certificates', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const certificates = certsRes.data.certificates || [];
    if (certificates.length === 0) {
      console.log('No certificates found');
      return;
    }

    const testCert = certificates[0];
    console.log(`📜 Testing with certificate: ${testCert.studentName} - ${testCert.courseName}`);
    console.log(`   Certificate ID: ${testCert._id}`);

    console.log('\n' + '='.repeat(60));
    console.log('❌ OLD QR CODE EXPERIENCE (What you\'re currently seeing):');
    console.log('='.repeat(60));
    
    const oldQRUrl = `http://localhost:3000/verify/${testCert._id}`;
    console.log(`🔗 OLD QR URL: ${oldQRUrl}`);
    console.log('📱 When scanned on mobile, user sees:');
    
    // Test old verification endpoint
    const oldRes = await axios.get(`http://localhost:5000/api/certificates/${testCert._id}/verify`);
    console.log('   ⚠️  Only verification status page');
    console.log('   ⚠️  Minimal information');
    console.log(`   ⚠️  Status: ${oldRes.data.verificationResult}`);
    console.log('   ⚠️  No complete certificate details');
    console.log('   ⚠️  User has to navigate to see full info');

    console.log('\n' + '='.repeat(60));
    console.log('✅ NEW QR CODE EXPERIENCE (After regenerating QR):');
    console.log('='.repeat(60));
    
    const newQRUrl = `http://localhost:3000/certificate/${testCert._id}`;
    console.log(`🔗 NEW QR URL: ${newQRUrl}`);
    console.log('📱 When scanned on mobile, user sees:');
    
    // Test new public certificate endpoint
    const newRes = await axios.get(`http://localhost:5000/api/certificates/public/${testCert._id}`);
    const cert = newRes.data.certificate;
    
    console.log('   ✅ Complete certificate details immediately');
    console.log(`   ✅ Student Name: ${cert.studentName}`);
    console.log(`   ✅ Course Name: ${cert.courseName}`);
    console.log(`   ✅ Institution: ${cert.institutionName}`);
    console.log(`   ✅ Issue Date: ${new Date(cert.issueDate).toLocaleDateString()}`);
    console.log(`   ✅ Grade: ${cert.grade || 'N/A'}`);
    console.log(`   ✅ Verification Status: ${cert.isVerified ? 'Verified' : 'Pending'}`);
    console.log('   ✅ Mobile-optimized summary card');
    console.log('   ✅ Share functionality built-in');

    console.log('\n' + '='.repeat(60));
    console.log('🔧 HOW TO FIX YOUR QR CODES:');
    console.log('='.repeat(60));
    console.log('');
    console.log('1. 🌐 Open your certificate platform in browser');
    console.log('2. 🔐 Login as institution');
    console.log('3. 📋 Go to Institution Dashboard');
    console.log('4. 📜 Find the certificate you want to create QR for');
    console.log('5. 🔗 Click "Generate QR Code" button');
    console.log('6. 📱 Download the NEW QR code');
    console.log('7. 🔄 Replace old QR code with new one');
    console.log('8. ✅ New QR code will show complete certificate details!');
    console.log('');
    console.log('🎯 RESULT: Mobile users will now see complete certificate');
    console.log('   information immediately when scanning QR codes!');

  } catch (error) {
    console.error('❌ Demonstration failed:', error.response?.data || error.message);
  }
};

demonstrateQRFix();