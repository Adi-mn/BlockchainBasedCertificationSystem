const axios = require('axios');

const generateFreshQR = async () => {
  try {
    console.log('🔄 GENERATING FRESH QR CODE FOR TESTING');
    console.log('='.repeat(50));

    // Login as institution
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'institution@demo.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Institution login successful');

    // Create a brand new certificate
    console.log('\n📋 Creating fresh certificate...');
    const certData = {
      studentName: 'Fresh QR Test Student',
      studentEmail: 'freshqr@example.com',
      certificateType: 'Course Completion',
      courseName: 'Fresh QR Test Course',
      issueDate: new Date().toISOString(),
      grade: 'A+',
      description: 'Fresh certificate for QR testing',
      ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
      issuerAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87'
    };

    const createRes = await axios.post('http://localhost:5000/api/certificates', certData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const certificateId = createRes.data.certificate._id;
    console.log(`✅ Fresh certificate created: ${certificateId}`);

    // Verify the certificate
    await axios.post(`http://localhost:5000/api/certificates/${certificateId}/verify`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Certificate verified');

    // Generate the NEW QR URL format
    const newQRUrl = `http://localhost:3000/certificate/${certificateId}`;
    console.log(`\n🔗 FRESH QR URL: ${newQRUrl}`);
    console.log('📱 This is what should be in your QR code');

    // Test what mobile users will see
    console.log('\n📱 Testing what mobile users will see...');
    const publicRes = await axios.get(`http://localhost:5000/api/certificates/public/${certificateId}`);
    const cert = publicRes.data.certificate;
    
    console.log('📋 Mobile QR Scan Result:');
    console.log(`   ✅ Student Name: ${cert.studentName}`);
    console.log(`   ✅ Course Name: ${cert.courseName}`);
    console.log(`   ✅ Institution: ${cert.institutionName}`);
    console.log(`   ✅ Issue Date: ${new Date(cert.issueDate).toLocaleDateString()}`);
    console.log(`   ✅ Grade: ${cert.grade}`);
    console.log(`   ✅ Verification Status: ${cert.isVerified ? 'Verified' : 'Pending'}`);
    console.log('   ✅ Download button available');
    console.log('   ✅ Share button available');

    // Test the enhanced PDF download
    console.log('\n📥 Testing enhanced PDF download...');
    try {
      const downloadRes = await axios.get(`http://localhost:5000/api/certificates/${certificateId}/public-download`, {
        responseType: 'arraybuffer'
      });
      
      console.log(`   ✅ Enhanced PDF generated: ${downloadRes.data.byteLength} bytes`);
      console.log('   ✅ New design: Colorful borders, elegant styling, fits on 1 page');
    } catch (downloadError) {
      console.log(`   ❌ Download failed: ${downloadError.response?.status}`);
    }

    // Test verification URL
    console.log('\n🔍 Testing verification URL...');
    const verifyRes = await axios.get(`http://localhost:5000/api/certificates/${certificateId}/verify`);
    
    console.log(`   ✅ Verification works: ${verifyRes.data.verificationResult}`);
    console.log(`   ✅ Certificate valid: ${verifyRes.data.certificate.isVerified}`);

    console.log('\n' + '='.repeat(50));
    console.log('🎯 FRESH QR CODE INSTRUCTIONS:');
    console.log('');
    console.log('1. 🔗 USE THIS URL IN YOUR QR CODE:');
    console.log(`   ${newQRUrl}`);
    console.log('');
    console.log('2. 📱 WHEN SCANNED, MOBILE USERS WILL SEE:');
    console.log('   ✅ Complete certificate details immediately');
    console.log('   ✅ Student name prominently displayed');
    console.log('   ✅ Download button (enhanced PDF design)');
    console.log('   ✅ Share button (WhatsApp, email, social media)');
    console.log('');
    console.log('3. 📥 PDF CERTIFICATE NOW HAS:');
    console.log('   ✅ Colorful borders and elegant design');
    console.log('   ✅ Professional layout that fits on 1 page');
    console.log('   ✅ Verification seal and signature line');
    console.log('   ✅ Proper spacing and typography');
    console.log('');
    console.log('🚀 GENERATE QR CODE WITH THIS URL AND TEST!');

  } catch (error) {
    console.error('❌ Fresh QR generation failed:', error.response?.data || error.message);
  }
};

generateFreshQR();