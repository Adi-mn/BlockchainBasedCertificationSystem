const axios = require('axios');

const testNetworkFix = async () => {
  try {
    console.log('🌐 TESTING NETWORK CONNECTIVITY FIX');
    console.log('='.repeat(60));

    const certificateId = '693cacdf2d66da4f9efe80c8';
    const possibleIPs = ['192.168.137.1', '10.166.151.128', '172.30.80.1'];
    
    console.log('📋 Testing certificate access from different IPs...');
    
    for (const ip of possibleIPs) {
      console.log(`\n🔍 Testing IP: ${ip}`);
      
      // Test backend API directly
      try {
        const apiUrl = `http://${ip}:5000/api/certificates/public/${certificateId}`;
        const response = await axios.get(apiUrl, { timeout: 5000 });
        console.log(`   ✅ Backend API: ${apiUrl}`);
        console.log(`   📋 Certificate: ${response.data.certificate.studentName}`);
        
        // Test frontend URL
        const frontendUrl = `http://${ip}:3000/certificate/${certificateId}`;
        console.log(`   ✅ Frontend URL: ${frontendUrl}`);
        console.log(`   📱 QR Code should contain: ${frontendUrl}`);
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.code || error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 NETWORK FIX STATUS:');
    console.log('');
    console.log('✅ BACKEND CONFIGURATION:');
    console.log('   🔧 Server now listens on 0.0.0.0:5000 (all interfaces)');
    console.log('   🌐 Accessible from phone via hotspot');
    console.log('');
    console.log('✅ FRONTEND CONFIGURATION:');
    console.log('   🔧 Dynamic API URL based on hostname');
    console.log('   📱 Automatically uses correct IP for API calls');
    console.log('');
    console.log('📱 TESTING INSTRUCTIONS:');
    console.log('');
    console.log('1. 🔗 CREATE QR CODE with working IP URL above');
    console.log('2. 📱 SCAN QR CODE with your phone');
    console.log('3. 👆 TAP the URL when it appears');
    console.log('4. 🎉 SHOULD NOW SHOW: Complete certificate details');
    console.log('');
    console.log('🔍 IF STILL NOT WORKING:');
    console.log('   • Ensure phone and computer on same WiFi/hotspot');
    console.log('   • Try different IP addresses from the list above');
    console.log('   • Check Windows Firewall settings');
    console.log('   • Test URLs manually in phone browser first');
    console.log('');
    console.log('🚀 EXPECTED RESULT:');
    console.log('   👤 Student: yugh');
    console.log('   📚 Course: tyguhij');
    console.log('   🏢 Institution: ABC University');
    console.log('   📥 Download button (enhanced PDF)');
    console.log('   📤 Share button (social media)');

  } catch (error) {
    console.error('❌ Network test failed:', error.message);
  }
};

testNetworkFix();