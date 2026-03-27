const axios = require('axios');

const testVerificationURLs = async () => {
  try {
    console.log('🔍 TESTING VERIFICATION URL FORMATS');
    console.log('='.repeat(50));

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
    console.log(`📜 Testing with certificate: ${testCert.studentName}`);
    console.log(`   Certificate ID: ${testCert._id}`);

    // Test different URL formats
    console.log('\n🔗 URL FORMAT TESTING:');
    
    // 1. Correct QR URL (complete certificate view)
    const qrUrl = `http://localhost:3000/certificate/${testCert._id}`;
    console.log(`\n1. ✅ QR CODE URL (Mobile-friendly):`)
    console.log(`   ${qrUrl}`);
    console.log('   📱 Shows: Complete certificate details with download/share');
    
    // 2. Correct verification URL (verification status)
    const verifyUrl = `http://localhost:3000/verify/${testCert._id}`;
    console.log(`\n2. ✅ VERIFICATION URL (Status check):`)
    console.log(`   ${verifyUrl}`);
    console.log('   🔍 Shows: Verification status and blockchain details');
    
    // 3. Test backend verification endpoint
    console.log(`\n3. 🔧 BACKEND VERIFICATION ENDPOINT:`);
    try {
      const backendVerifyRes = await axios.get(`http://localhost:5000/api/certificates/${testCert._id}/verify`);
      console.log(`   ✅ Backend endpoint works: ${backendVerifyRes.data.verificationResult}`);
    } catch (backendError) {
      console.log(`   ❌ Backend endpoint failed: ${backendError.response?.status} - ${backendError.message}`);
    }
    
    // 4. Test public certificate endpoint
    console.log(`\n4. 📱 PUBLIC CERTIFICATE ENDPOINT:`);
    try {
      const publicRes = await axios.get(`http://localhost:5000/api/certificates/public/${testCert._id}`);
      console.log(`   ✅ Public endpoint works: Certificate data available`);
    } catch (publicError) {
      console.log(`   ❌ Public endpoint failed: ${publicError.response?.status} - ${publicError.message}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎯 URL FORMAT GUIDE:');
    console.log('');
    console.log('📱 FOR QR CODES (Mobile users):');
    console.log(`   http://localhost:3000/certificate/{CERTIFICATE_ID}`);
    console.log('   └─ Shows complete certificate with download/share');
    console.log('');
    console.log('🔍 FOR VERIFICATION (Manual check):');
    console.log(`   http://localhost:3000/verify/{CERTIFICATE_ID}`);
    console.log('   └─ Shows verification status and blockchain details');
    console.log('');
    console.log('⚠️  COMMON ERRORS:');
    console.log('   ❌ Wrong: /verify/certificate/{ID}');
    console.log('   ❌ Wrong: /certificate/verify/{ID}');
    console.log('   ❌ Wrong: Using invalid certificate ID format');
    console.log('');
    console.log('✅ CERTIFICATE ID FORMAT:');
    console.log('   - Must be 24 character MongoDB ObjectId');
    console.log('   - Example: 693caa572d66da4f9efe7f8d');
    console.log('   - No spaces, special characters, or extra text');

  } catch (error) {
    console.error('❌ URL testing failed:', error.response?.data || error.message);
  }
};

testVerificationURLs();