const axios = require('axios');

const checkExistingQRUrls = async () => {
  try {
    console.log('🔍 CHECKING EXISTING QR CODE URLS');
    console.log('='.repeat(50));

    // Login as admin to access all certificates
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@demo.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Institution login successful');

    // Get all certificates
    console.log('\n📋 Fetching all certificates...');
    const certsRes = await axios.get('http://localhost:5000/api/certificates', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const certificates = certsRes.data.certificates || [];
    console.log(`Found ${certificates.length} certificates`);

    if (certificates.length === 0) {
      console.log('No certificates found to check');
      return;
    }

    // Check first few certificates to see what URLs they would generate
    console.log('\n🔗 Checking QR URL formats...');
    
    for (let i = 0; i < Math.min(5, certificates.length); i++) {
      const cert = certificates[i];
      console.log(`\n📜 Certificate ${i + 1}: ${cert.studentName} - ${cert.courseName}`);
      console.log(`   ID: ${cert._id}`);
      
      // What the OLD QR generator would create
      const oldQRUrl = `http://localhost:3000/verify/${cert._id}`;
      console.log(`   OLD QR URL: ${oldQRUrl}`);
      console.log(`   └─ Shows: Verification status only`);
      
      // What the NEW QR generator creates
      const newQRUrl = `http://localhost:3000/certificate/${cert._id}`;
      console.log(`   NEW QR URL: ${newQRUrl}`);
      console.log(`   └─ Shows: Complete certificate details`);
      
      // Test both URLs
      try {
        // Test old URL (verification page)
        const oldRes = await axios.get(`http://localhost:5000/api/certificates/${cert._id}/verify`);
        console.log(`   OLD URL Result: ${oldRes.data.verificationResult} (minimal info)`);
      } catch (error) {
        console.log(`   OLD URL Result: Error - ${error.response?.status}`);
      }
      
      try {
        // Test new URL (public certificate)
        const newRes = await axios.get(`http://localhost:5000/api/certificates/public/${cert._id}`);
        console.log(`   NEW URL Result: Complete certificate data available ✅`);
      } catch (error) {
        console.log(`   NEW URL Result: Error - ${error.response?.status}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎯 QR URL ANALYSIS SUMMARY:');
    console.log('');
    console.log('❌ PROBLEM IDENTIFIED:');
    console.log('   📱 Existing QR codes may still use OLD format: /verify/:id');
    console.log('   📱 OLD format shows only verification status');
    console.log('   📱 Users scanning old QR codes see minimal information');
    console.log('');
    console.log('✅ SOLUTION:');
    console.log('   🔧 All NEW QR codes use format: /certificate/:id');
    console.log('   🔧 NEW format shows complete certificate details');
    console.log('   🔧 Mobile users see full information immediately');
    console.log('');
    console.log('📋 RECOMMENDATIONS:');
    console.log('   1. Regenerate QR codes for existing certificates');
    console.log('   2. Use QR Generator page to create new QR codes');
    console.log('   3. New QR codes will automatically use mobile-friendly format');
    console.log('   4. Share new QR codes with users');

  } catch (error) {
    console.error('❌ QR URL check failed:', error.response?.data || error.message);
  }
};

checkExistingQRUrls();