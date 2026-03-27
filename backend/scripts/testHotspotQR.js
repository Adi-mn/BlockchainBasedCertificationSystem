const axios = require('axios');

const testHotspotQR = async () => {
  try {
    console.log('📱 TESTING QR CODE WITH PHONE HOTSPOT');
    console.log('='.repeat(60));

    const certificateId = '693cacdf2d66da4f9efe80c8';
    
    // Possible IP addresses from your computer
    const possibleIPs = [
      '192.168.137.1',  // Most common hotspot IP
      '10.166.151.128', // Your current IP
      '172.30.80.1'     // Alternative IP
    ];

    console.log('🔍 Your computer\'s IP addresses:');
    possibleIPs.forEach((ip, index) => {
      console.log(`   ${index + 1}. ${ip}`);
    });

    // Test certificate data first
    console.log('\n📋 Testing certificate data...');
    const publicRes = await axios.get(`http://localhost:5000/api/certificates/public/${certificateId}`);
    const cert = publicRes.data.certificate;
    
    console.log('✅ Certificate found:');
    console.log(`   👤 Student: ${cert.studentName}`);
    console.log(`   📚 Course: ${cert.courseName}`);
    console.log(`   🏢 Institution: ${cert.institutionName}`);

    console.log('\n' + '='.repeat(60));
    console.log('📱 HOTSPOT QR CODE URLS:');
    console.log('');
    
    possibleIPs.forEach((ip, index) => {
      const qrUrl = `http://${ip}:3000/certificate/${certificateId}`;
      console.log(`${index + 1}. QR URL with IP ${ip}:`);
      console.log(`   ${qrUrl}`);
      console.log('');
    });

    console.log('🔧 HOW TO TEST WITH HOTSPOT:');
    console.log('');
    console.log('1. 📱 SETUP:');
    console.log('   • Enable hotspot on your phone');
    console.log('   • Connect your computer to phone\'s WiFi hotspot');
    console.log('   • Make sure both servers are running (backend & frontend)');
    console.log('');
    console.log('2. 🔗 CREATE QR CODE:');
    console.log('   • Use one of the IP URLs above');
    console.log('   • Most likely: http://192.168.137.1:3000/certificate/693cacdf2d66da4f9efe80c8');
    console.log('   • Generate QR code with this URL');
    console.log('');
    console.log('3. 📱 TEST SCANNING:');
    console.log('   • Scan QR code with your phone camera');
    console.log('   • TAP on the URL when it appears');
    console.log('   • Browser should open with complete certificate details');
    console.log('');
    console.log('4. ✅ EXPECTED RESULT:');
    console.log(`   • Student Name: ${cert.studentName}`);
    console.log(`   • Course: ${cert.courseName}`);
    console.log(`   • Institution: ${cert.institutionName}`);
    console.log('   • Download button (green) - enhanced PDF');
    console.log('   • Share button (blue) - social sharing');
    console.log('   • Mobile-optimized layout');
    console.log('');
    console.log('🌐 ONLINE QR GENERATORS:');
    console.log('   • qr-code-generator.com');
    console.log('   • qrcode.com');
    console.log('   • Google "QR code generator"');
    console.log('');
    console.log('🚀 HOTSPOT IS PERFECT FOR TESTING!');
    console.log('   ✅ Same network access');
    console.log('   ✅ Real mobile testing');
    console.log('   ✅ No external deployment needed');
    console.log('   ✅ Complete certificate experience');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testHotspotQR();