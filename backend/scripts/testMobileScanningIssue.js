const axios = require('axios');

const testMobileScanningIssue = async () => {
  try {
    console.log('📱 TESTING MOBILE SCANNING ISSUE');
    console.log('='.repeat(60));

    const certificateId = '693cacdf2d66da4f9efe80c8';
    const qrUrl = `http://localhost:3000/certificate/${certificateId}`;
    
    console.log(`📋 Certificate ID: ${certificateId}`);
    console.log(`🔗 QR URL: ${qrUrl}`);

    // Test the certificate data
    console.log('\n📋 Testing certificate data...');
    const publicRes = await axios.get(`http://localhost:5000/api/certificates/public/${certificateId}`);
    const cert = publicRes.data.certificate;
    
    console.log('✅ Certificate data available:');
    console.log(`   👤 Student: ${cert.studentName}`);
    console.log(`   📚 Course: ${cert.courseName}`);
    console.log(`   🏢 Institution: ${cert.institutionName}`);
    console.log(`   📅 Date: ${new Date(cert.issueDate).toLocaleDateString()}`);
    console.log(`   ✅ Verified: ${cert.isVerified ? 'Yes' : 'No'}`);

    console.log('\n' + '='.repeat(60));
    console.log('🎯 MOBILE SCANNING ISSUE DIAGNOSIS:');
    console.log('');
    console.log('❌ PROBLEM: Mobile scanner shows URL instead of certificate details');
    console.log('');
    console.log('🔍 POSSIBLE CAUSES:');
    console.log('   1. Phone camera app shows URL preview instead of opening it');
    console.log('   2. URL points to localhost (only works on same device)');
    console.log('   3. QR scanner app doesn\'t auto-open web links');
    console.log('');
    console.log('✅ SOLUTIONS:');
    console.log('');
    console.log('📱 SOLUTION 1: Manual Browser Opening');
    console.log('   1. Scan QR code with phone camera');
    console.log('   2. When URL appears, TAP on it to open in browser');
    console.log('   3. Browser will load complete certificate details');
    console.log('');
    console.log('🌐 SOLUTION 2: Use Public URL (Production)');
    console.log('   1. Deploy your app to a public server');
    console.log('   2. Replace localhost with your domain');
    console.log('   3. QR codes will work from any device');
    console.log('');
    console.log('📲 SOLUTION 3: Use QR Scanner App');
    console.log('   1. Download a QR scanner app (not camera)');
    console.log('   2. Apps like "QR Code Reader" auto-open links');
    console.log('   3. Will show certificate details directly');
    console.log('');
    console.log('🔧 SOLUTION 4: Test on Same Device');
    console.log('   1. Generate QR code on your computer');
    console.log('   2. Scan with phone connected to same WiFi');
    console.log('   3. Should work if both devices on same network');
    console.log('');
    console.log('📋 WHAT SHOULD HAPPEN WHEN URL OPENS:');
    console.log(`   🔗 URL: ${qrUrl}`);
    console.log('   📱 Mobile page loads with:');
    console.log(`      👤 Student Name: ${cert.studentName}`);
    console.log(`      📚 Course: ${cert.courseName}`);
    console.log(`      🏢 Institution: ${cert.institutionName}`);
    console.log('      📥 Download button (green)');
    console.log('      📤 Share button (blue)');
    console.log('      📱 Mobile-optimized layout');
    console.log('');
    console.log('🚀 IMMEDIATE TEST:');
    console.log('   1. Copy this URL to your phone browser:');
    console.log(`      ${qrUrl}`);
    console.log('   2. Open it manually to see certificate details');
    console.log('   3. Verify you see complete information');
    console.log('');
    console.log('⚠️  NOTE: localhost URLs only work on same device/network');
    console.log('   For external access, deploy to public server');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testMobileScanningIssue();